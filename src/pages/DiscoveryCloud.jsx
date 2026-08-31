import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Compass, ArrowRight } from 'lucide-react';
import { fetchServerAtlases } from '../services/api';
import './DiscoveryCloud.css';

// Mathematical 3D Golden Spiral / Fibonacci Sphere distribution for N points
function calculateSpherePositions(rawAtlases) {
  const list = Array.isArray(rawAtlases) && rawAtlases.length > 0
    ? rawAtlases
    : [{ id: 'myatlas', title: 'My Atlas', description: 'Default main atlas archive', accentColor: '#CC5A01', itemCount: 0 }];

  const n = list.length;
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const radius = n === 1 ? 0 : Math.min(450, 180 + n * 25);

  return list.map((atlas, i) => {
    let x = 0, y = 0, z = 0;

    if (n > 1) {
      // Fibonacci sphere distribution formula
      const theta = 2 * Math.PI * i / phi;
      const yNorm = 1 - (i / (n - 1)) * 2; // from 1 to -1
      const radiusAtY = Math.sqrt(1 - yNorm * yNorm);

      x = Math.cos(theta) * radiusAtY * radius;
      y = yNorm * (radius * 0.75);
      z = Math.sin(theta) * radiusAtY * radius;
    }

    const slug = (atlas.id || 'myatlas').toLowerCase();
    const title = atlas.title || atlas.id || 'Untitled Atlas';
    const postCount = atlas.itemCount || atlas.postCount || 0;
    const clusterLabel = atlas.category || atlas.domain || 'Unassigned';
    const accentColor = atlas.accentColor || '#CC5A01';

    // Derive tags dynamically from slug and title without hardcoded maps
    const derivedTags = Array.isArray(atlas.tags) && atlas.tags.length > 0
      ? atlas.tags
      : [slug, ...title.toLowerCase().split(/\s+/).filter(w => w.length > 2)];

    return {
      id: slug,
      slug,
      title,
      clusterLabel,
      accentColor,
      postCount,
      tags: Array.from(new Set(derivedTags)),
      x, y, z,
      baseRadius: Math.max(8.0, Math.min(24.0, 10 + Math.log10(postCount + 1) * 4))
    };
  });
}

export default function DiscoveryCloud({ atlases: propAtlases, onSelectAtlas }) {
  const [liveAtlases, setLiveAtlases] = useState(propAtlases || []);
  const [query, setQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  // Load sub-atlases directly if not passed via props
  useEffect(() => {
    async function load() {
      if (Array.isArray(propAtlases) && propAtlases.length > 0) {
        setLiveAtlases(propAtlases);
        return;
      }
      try {
        const serverAtlases = await fetchServerAtlases();
        if (Array.isArray(serverAtlases) && serverAtlases.length > 0) {
          setLiveAtlases(serverAtlases);
        } else {
          const saved = JSON.parse(localStorage.getItem('myatlas_sub_atlases') || '[]');
          const fallback = [{ id: 'myatlas', title: 'My Atlas', accentColor: '#CC5A01', itemCount: 0 }];
          saved.forEach(a => {
            if (!fallback.some(f => f.id.toLowerCase() === a.id.toLowerCase())) fallback.push(a);
          });
          setLiveAtlases(fallback);
        }
      } catch (err) {
        console.warn('Error loading live sub-atlases for DiscoveryCloud:', err);
      }
    }
    load();
  }, [propAtlases]);

  // Compute 3D node positions dynamically from live atlas data
  const nodes = useMemo(() => calculateSpherePositions(liveAtlases), [liveAtlases]);

  // Extract unique categories dynamically from loaded nodes
  const availableClusters = useMemo(() => {
    const set = new Set();
    nodes.forEach(n => set.add(n.clusterLabel));
    return Array.from(set);
  }, [nodes]);

  // Camera 3D controls state
  const cameraRef = useRef({
    rotX: 0.2,
    rotY: 0.5,
    distance: 850,
    targetRotX: 0.2,
    targetRotY: 0.5,
    targetDistance: 850,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  const cleanQuery = query.trim().toLowerCase();

  // Filter matching calculations
  const { matchedCount, totalCount } = useMemo(() => {
    const total = nodes.length;
    if (!cleanQuery && selectedCluster === 'all') {
      return { matchedCount: total, totalCount: total };
    }
    let match = 0;
    nodes.forEach(node => {
      const matchCluster = selectedCluster === 'all' || node.clusterLabel === selectedCluster;
      const matchSearch = !cleanQuery || 
        node.slug.toLowerCase().includes(cleanQuery) ||
        node.title.toLowerCase().includes(cleanQuery) ||
        node.tags.some(t => t.toLowerCase().includes(cleanQuery));

      if (matchCluster && matchSearch) match++;
    });
    return { matchedCount: match, totalCount: total };
  }, [nodes, cleanQuery, selectedCluster]);

  // Main 3D WebGL / Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const cam = cameraRef.current;

      // Smooth camera interpolation
      cam.rotX += (cam.targetRotX - cam.rotX) * 0.08;
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.08;
      cam.distance += (cam.targetDistance - cam.distance) * 0.08;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const fov = 650;

      ctx.clearRect(0, 0, width, height);

      // Deep space canvas backdrop
      ctx.fillStyle = '#0B0A08';
      ctx.fillRect(0, 0, width, height);

      const cosX = Math.cos(cam.rotX);
      const sinX = Math.sin(cam.rotX);
      const cosY = Math.cos(cam.rotY);
      const sinY = Math.sin(cam.rotY);

      const projectedNodes = [];

      nodes.forEach(node => {
        // 3D Matrix Rotation
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;
        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        const pz = z2 + cam.distance;
        if (pz <= 10) return;

        const scale = fov / pz;
        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        const matchCluster = selectedCluster === 'all' || node.clusterLabel === selectedCluster;
        const matchSearch = !cleanQuery || 
          node.slug.toLowerCase().includes(cleanQuery) ||
          node.title.toLowerCase().includes(cleanQuery) ||
          node.tags.some(t => t.toLowerCase().includes(cleanQuery));

        const isMatch = matchCluster && matchSearch;
        const isDimmed = (cleanQuery || selectedCluster !== 'all') && !isMatch;

        projectedNodes.push({
          node,
          screenX,
          screenY,
          pz,
          scale,
          isMatch,
          isDimmed
        });
      });

      projectedNodes.sort((a, b) => b.pz - a.pz);

      let closestHoverNode = null;
      let minHoverDist = 28;

      projectedNodes.forEach(item => {
        const { node, screenX, screenY, scale, isMatch, isDimmed } = item;

        let alpha = isDimmed ? 0.08 : (isMatch ? 0.95 : 0.7);
        let radius = (node.baseRadius * scale) * (isMatch && cleanQuery ? 1.3 : 1.0);
        radius = Math.max(3, Math.min(36, radius));

        ctx.save();
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);

        if (isDimmed) {
          ctx.fillStyle = `rgba(100, 95, 88, ${alpha})`;
        } else {
          ctx.fillStyle = node.accentColor || '#CC5A01';
          ctx.globalAlpha = alpha;

          if (isMatch) {
            ctx.shadowColor = node.accentColor || '#CC5A01';
            ctx.shadowBlur = radius * 2.5;
          }
        }
        ctx.fill();

        // Render slug label below node
        if (!isDimmed) {
          ctx.fillStyle = '#E6E1D7';
          ctx.globalAlpha = alpha * 0.9;
          ctx.font = `${Math.max(10, Math.min(14, 12 * scale))}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(node.slug, screenX, screenY + radius + 14);
        }

        ctx.restore();

        const cssX = screenX / window.devicePixelRatio;
        const cssY = screenY / window.devicePixelRatio;
        if (cam.hoverMouseX !== undefined && cam.hoverMouseY !== undefined) {
          const dx = cssX - cam.hoverMouseX;
          const dy = cssY - cam.hoverMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minHoverDist) {
            minHoverDist = dist;
            closestHoverNode = { node, cssX, cssY };
          }
        }
      });

      if (closestHoverNode) {
        setHoveredNode(closestHoverNode.node);
        setHoverPos({ x: closestHoverNode.cssX, y: closestHoverNode.cssY });
      } else if (cam.hoverMouseX !== undefined) {
        setHoveredNode(null);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleNativeWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cam = cameraRef.current;
      cam.targetDistance += e.deltaY * 0.8;
      cam.targetDistance = Math.max(150, Math.min(2200, cam.targetDistance));
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [nodes, cleanQuery, selectedCluster]);

  const handleMouseDown = (e) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.lastMouseX = e.clientX;
    cameraRef.current.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e) => {
    const cam = cameraRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    cam.hoverMouseX = e.clientX - rect.left;
    cam.hoverMouseY = e.clientY - rect.top;

    if (!cam.isDragging) return;

    const deltaX = e.clientX - cam.lastMouseX;
    const deltaY = e.clientY - cam.lastMouseY;

    cam.targetRotY += deltaX * 0.005;
    cam.targetRotX += deltaY * 0.005;

    cam.targetRotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cam.targetRotX));

    cam.lastMouseX = e.clientX;
    cam.lastMouseY = e.clientY;
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  return (
    <div className="discovery-cloud-container">
      <canvas
        ref={canvasRef}
        className="dc-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Header Controls Overlay */}
      <div className="dc-top-overlay">
        <div className="dc-search-box">
          <Search size={18} className="dc-search-icon" />
          <input
            type="text"
            className="dc-search-input"
            placeholder="Type atlas slug or tag query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="dc-clear-btn" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Live Match Counter Bar */}
        <div className="dc-stats-bar">
          <div className="dc-stat-item">
            <Compass size={14} style={{ color: 'var(--accent-color, #CC5A01)' }} />
            <span>Active Sub-Atlases:</span>
            <strong>{matchedCount.toLocaleString()}</strong> / {totalCount.toLocaleString()}
          </div>
          <div className="dc-stat-divider" />
          <div className="dc-stat-item">
            <span>Dimmed:</span>
            <strong>{Math.round((1 - (matchedCount / (totalCount || 1))) * 100)}%</strong>
          </div>
        </div>

        {/* Dynamic Category Cluster Pills */}
        {availableClusters.length > 1 && (
          <div className="dc-cluster-pills">
            <button
              className={`dc-cluster-pill ${selectedCluster === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCluster('all')}
            >
              All Archives
            </button>
            {availableClusters.map(cat => (
              <button
                key={cat}
                className={`dc-cluster-pill ${selectedCluster === cat ? 'active' : ''}`}
                onClick={() => setSelectedCluster(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Controls Legend */}
      <div className="dc-bottom-controls">
        <div className="dc-control-hint">
          <kbd>Drag</kbd> Rotate 3D Cosmos
        </div>
        <div className="dc-control-hint">
          <kbd>Scroll</kbd> Zoom Depth
        </div>
        <div className="dc-control-hint">
          <kbd>Hover</kbd> Inspect Atlas Node
        </div>
      </div>

      {/* Hover Inspection Popover Card */}
      {hoveredNode && (
        <div
          className="dc-hover-card"
          style={{
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y}px`,
            '--card-accent': hoveredNode.accentColor || '#CC5A01'
          }}
        >
          <div className="dc-card-header">
            <span
              className="dc-card-dot"
              style={{ backgroundColor: hoveredNode.accentColor || '#CC5A01' }}
            />
            <h3 className="dc-card-title">{hoveredNode.title}</h3>
          </div>
          <div className="dc-card-slug">atlasnetwork.org/{hoveredNode.slug}</div>

          <div className="dc-card-meta">
            <span>Category: <b>{hoveredNode.clusterLabel}</b></span>
            <span><b>{hoveredNode.postCount.toLocaleString()}</b> posts</span>
          </div>

          <div className="dc-card-tags">
            {hoveredNode.tags.map(t => (
              <span key={t} className="dc-card-tag">#{t}</span>
            ))}
          </div>

          <button
            className="dc-card-enter-btn"
            onClick={() => onSelectAtlas && onSelectAtlas(hoveredNode.slug)}
          >
            Enter Sub-Atlas <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

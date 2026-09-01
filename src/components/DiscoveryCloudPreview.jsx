import React, { useEffect, useRef, useMemo } from 'react';
import './DiscoveryCloudPreview.css';

// Fixed-scale 3D particle swarm math
function generateSwarmDots(count = 150) {
  const dots = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  const radius = 230;

  for (let i = 0; i < count; i++) {
    // 3D Fibonacci sphere distribution + spatial noise
    const theta = 2 * Math.PI * i / phi;
    const yNorm = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - yNorm * yNorm);

    const jitter = (Math.random() - 0.5) * 40;
    const x = Math.cos(theta) * radiusAtY * (radius + jitter);
    const y = yNorm * (radius * 0.6 + jitter * 0.6);
    const z = Math.sin(theta) * radiusAtY * (radius + jitter);

    const dotRadius = 1.8 + Math.random() * 2.2;

    dots.push({
      x, y, z,
      baseRadius: dotRadius,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  return dots;
}

export default function DiscoveryCloudPreview() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const dots = useMemo(() => generateSwarmDots(150), []);

  const cameraRef = useRef({
    rotX: 0.18,
    rotY: 0.1,
    distance: 580
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      time += 0.012;
      const cam = cameraRef.current;

      // Continuous low-overhead slow 3D rotation
      cam.rotY += 0.001;
      cam.rotX += 0.0003;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const fov = 480;

      // Transparent clear - rendering directly over top of page background
      ctx.clearRect(0, 0, width, height);

      const cosX = Math.cos(cam.rotX);
      const sinX = Math.sin(cam.rotX);
      const cosY = Math.cos(cam.rotY);
      const sinY = Math.sin(cam.rotY);

      const projected = [];

      dots.forEach(dot => {
        const floatY = dot.y + Math.sin(time + dot.pulseOffset) * 2.8;

        // 3D Matrix Rotation
        const x1 = dot.x * cosY - dot.z * sinY;
        const z1 = dot.z * cosY + dot.x * sinY;
        const y1 = floatY * cosX - z1 * sinX;
        const z2 = z1 * cosX + floatY * sinX;

        const pz = z2 + cam.distance;
        if (pz <= 10) return;

        const scale = fov / pz;
        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        projected.push({
          screenX,
          screenY,
          pz,
          scale,
          dot
        });
      });

      // Sort by depth
      projected.sort((a, b) => b.pz - a.pz);

      // Draw subtle constellation web lines between nearby dots
      ctx.lineWidth = 0.5 * window.devicePixelRatio;
      const maxConnectDist = 70 * window.devicePixelRatio;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j += 4) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.screenX - p2.screenX;
          const dy = p1.screenY - p2.screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.08 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.strokeStyle = `rgba(204, 90, 1, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw same-colored dots (Claude warm amber #CC5A01)
      projected.forEach(item => {
        const { screenX, screenY, scale, dot } = item;
        let radius = (dot.baseRadius * scale) * window.devicePixelRatio;
        radius = Math.max(1.2, Math.min(9, radius));

        ctx.save();
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);

        const alpha = Math.min(0.68, Math.max(0.15, (scale * 0.72)));
        ctx.fillStyle = `rgba(204, 90, 1, ${alpha})`;

        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [dots]);

  return (
    <div className="discovery-preview-wrapper" ref={containerRef}>
      <canvas ref={canvasRef} className="discovery-preview-canvas" />
    </div>
  );
}

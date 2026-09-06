import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, RefreshCw, Move, Download, Upload, Search, FileText } from 'lucide-react';
import { fetchFoldersSummary, relocateFolder, exportFolderManifest, importFolderManifest } from '../services/api';
import './Folders.css';

function buildDirectoryTree(folderItems) {
  const rootNodes = [];

  folderItems.forEach(item => {
    const rawPath = item.folderPath || '';
    const normalized = rawPath.replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);

    let currentLevel = rootNodes;
    let accumulatedPath = '';

    parts.forEach((part, index) => {
      if (index === 0 && rawPath.includes(':')) {
        accumulatedPath = part.endsWith(':') ? part : `${part}:`;
      } else {
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      }

      const isLast = index === parts.length - 1;
      let existingNode = currentLevel.find(n => n.name.toLowerCase() === part.toLowerCase());

      if (!existingNode) {
        existingNode = {
          name: part,
          fullPath: isLast ? rawPath : accumulatedPath,
          isLeaf: isLast,
          itemCount: isLast ? item.itemCount : 0,
          exists: isLast ? item.exists : true,
          hasManifest: isLast ? item.hasManifest : false,
          children: [],
          rawItem: isLast ? item : null
        };
        currentLevel.push(existingNode);
      } else if (isLast) {
        existingNode.isLeaf = true;
        existingNode.itemCount = item.itemCount;
        existingNode.exists = item.exists;
        existingNode.hasManifest = item.hasManifest;
        existingNode.rawItem = item;
        existingNode.fullPath = rawPath;
      }

      currentLevel = existingNode.children;
    });
  });

  return rootNodes;
}

function TreeNode({ node, onRelocate, onExportManifest, onImportManifest, actionProcessing, isReadOnly }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div className="tree-node-row">
        {hasChildren ? (
          <button className="tree-toggle-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span style={{ width: 16, display: 'inline-block' }} />
        )}

        <span className={`tree-node-icon ${node.isLeaf ? (node.exists ? 'leaf' : 'missing') : ''}`}>
          {node.isLeaf ? <Folder size={15} /> : <FolderOpen size={15} />}
        </span>

        <span className={`tree-node-label ${node.isLeaf && !node.exists ? 'missing' : ''}`}>
          {node.name}
        </span>

        {node.isLeaf && (
          <>
            <span className="tree-node-count">({node.itemCount} items)</span>
            <span className={`tree-status-dot ${node.exists ? 'connected' : 'missing'}`} title={node.exists ? 'Connected' : 'Path Moved / Missing'} />
            {node.hasManifest && <span className="tree-manifest-tag">.myatlas_manifest.json</span>}
          </>
        )}

        {node.isLeaf && (
          <div className="tree-actions-group">
            <button 
              className={`nested-trigger-btn ${!node.exists ? 'danger' : ''}`}
              onClick={() => onRelocate(node.rawItem || { folderPath: node.fullPath, itemCount: node.itemCount })}
              disabled={actionProcessing || isReadOnly}
              title="Re-bind database path to new hard drive folder location"
            >
              <Move size={12} /> [ relocate ]
            </button>

            {node.exists && (
              <button 
                className="nested-trigger-btn"
                onClick={() => onExportManifest(node.fullPath)}
                disabled={actionProcessing || isReadOnly}
                title="Export .myatlas_manifest.json to this folder on disk"
              >
                <Download size={12} /> [ export manifest ]
              </button>
            )}

            {node.exists && node.hasManifest && (
              <button 
                className="nested-trigger-btn"
                onClick={() => onImportManifest(node.fullPath)}
                disabled={actionProcessing || isReadOnly}
                title="Reload tags from .myatlas_manifest.json sidecar into SQLite"
              >
                <Upload size={12} /> [ reload manifest ]
              </button>
            )}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="tree-children-container">
          {node.children.map((child, idx) => (
            <TreeNode
              key={idx}
              node={child}
              onRelocate={onRelocate}
              onExportManifest={onExportManifest}
              onImportManifest={onImportManifest}
              actionProcessing={actionProcessing}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Folders({ currentAtlas = 'myatlas', isReadOnly = false }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [relocateModal, setRelocateModal] = useState({ open: false, folder: null, newPath: '' });
  const [actionProcessing, setActionProcessing] = useState(false);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const data = await fetchFoldersSummary();
      setFolders(data || []);
    } catch (err) {
      console.error('Error loading folders summary:', err);
      setFeedback({ message: 'Failed to load folders summary.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleExportManifest = async (folderPath) => {
    setActionProcessing(true);
    setFeedback({ message: '', type: '' });
    try {
      const result = await exportFolderManifest(folderPath);
      if (result && result.success) {
        setFeedback({
          message: `Exported .myatlas_manifest.json (${result.exportedCount} items) to '${folderPath}'`,
          type: 'success'
        });
        await loadFolders();
      }
    } catch (err) {
      setFeedback({ message: `Export manifest failed: ${err.message}`, type: 'error' });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleImportManifest = async (folderPath) => {
    setActionProcessing(true);
    setFeedback({ message: '', type: '' });
    try {
      const result = await importFolderManifest(folderPath);
      if (result && result.success) {
        setFeedback({
          message: `Reloaded .myatlas_manifest.json (${result.syncedCount} items synced) for '${folderPath}'`,
          type: 'success'
        });
        await loadFolders();
      }
    } catch (err) {
      setFeedback({ message: `Reload manifest failed: ${err.message}`, type: 'error' });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleOpenRelocate = (folder) => {
    setRelocateModal({
      open: true,
      folder,
      newPath: folder.folderPath
    });
  };

  const handleConfirmRelocate = async () => {
    if (!relocateModal.folder || !relocateModal.newPath) return;
    setActionProcessing(true);
    setFeedback({ message: '', type: '' });
    try {
      const result = await relocateFolder(relocateModal.folder.folderPath, relocateModal.newPath);
      if (result && result.success) {
        setFeedback({
          message: `Re-bound ${result.updatedCount} items from '${result.oldPath}' to '${result.newPath}'`,
          type: 'success'
        });
        setRelocateModal({ open: false, folder: null, newPath: '' });
        await loadFolders();
      }
    } catch (err) {
      setFeedback({ message: `Relocate folder failed: ${err.message}`, type: 'error' });
    } finally {
      setActionProcessing(false);
    }
  };

  const filteredFolders = folders.filter(f => 
    (f.folderPath || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (f.folderName || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const treeNodes = buildDirectoryTree(filteredFolders);
  const connectedCount = folders.filter(f => f.exists).length;
  const missingCount = folders.filter(f => !f.exists).length;

  return (
    <div className="folders-page">
      <div className="folders-header">
        <div className="folders-title-row">
          <div>
            <h1>
              <Folder size={22} /> Folders & Library Health
            </h1>
            <p className="folders-subtitle">
              Hyper-minimalist directory tree. Re-bind hard drive paths in 1 millisecond and spawn sidecar manifests on-demand.
            </p>
          </div>

          <div className="folders-top-actions">
            <button 
              className="nested-trigger-btn" 
              onClick={loadFolders} 
              disabled={loading || actionProcessing}
              title="Refresh Folder Health Status"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> [ refresh tree ]
            </button>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`folders-feedback-banner ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
            onClick={() => setFeedback({ message: '', type: '' })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Control / Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', color: '#7A736E' }}>
          <span>
            <span className="tree-status-dot connected" /> {connectedCount} connected
          </span>
          {missingCount > 0 && (
            <span style={{ color: '#C5221F' }}>
              <span className="tree-status-dot missing" /> {missingCount} moved/missing
            </span>
          )}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#7A736E' }} />
          <input 
            type="text"
            placeholder="Filter directory tree..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.35rem 0.65rem 0.35rem 2rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono, monospace)',
              borderRadius: '5px',
              border: '1px solid rgba(0,0,0,0.12)',
              background: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Nested Tree List View */}
      <div className="nested-tree-container">
        {loading ? (
          <div style={{ padding: '2rem 0', color: '#7A736E', fontSize: '0.85rem', fontFamily: 'var(--font-mono, monospace)' }}>
            [ loading directory tree... ]
          </div>
        ) : treeNodes.length === 0 ? (
          <div style={{ padding: '2rem 0', color: '#7A736E', fontSize: '0.85rem', fontFamily: 'var(--font-mono, monospace)' }}>
            {searchFilter ? '[ no folders match filter ]' : '[ no source folders indexed ]'}
          </div>
        ) : (
          <div className="nested-tree-root">
            {treeNodes.map((node, idx) => (
              <TreeNode
                key={idx}
                node={node}
                onRelocate={handleOpenRelocate}
                onExportManifest={handleExportManifest}
                onImportManifest={handleImportManifest}
                actionProcessing={actionProcessing}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* Relocate Folder Modal */}
      {relocateModal.open && (
        <div className="relocate-modal-backdrop" onClick={() => setRelocateModal({ open: false, folder: null, newPath: '' })}>
          <div className="relocate-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <Move size={17} style={{ color: 'var(--accent-color, #CC5A01)' }} /> Relocate Folder Path
            </h3>
            <p>
              Re-bind <strong>{relocateModal.folder?.itemCount}</strong> media items in SQLite to a new hard drive location.
            </p>

            <div className="relocate-field">
              <label>Current Path</label>
              <input 
                type="text" 
                className="relocate-input" 
                value={relocateModal.folder?.folderPath || ''} 
                disabled 
                style={{ background: '#F5F2EB', opacity: 0.8 }}
              />
            </div>

            <div className="relocate-field">
              <label>New Directory Path</label>
              <input 
                type="text" 
                className="relocate-input" 
                placeholder="e.g. D:\Archive\SciFi"
                value={relocateModal.newPath} 
                onChange={(e) => setRelocateModal(prev => ({ ...prev, newPath: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="relocate-modal-footer">
              <button 
                className="nested-trigger-btn" 
                onClick={() => setRelocateModal({ open: false, folder: null, newPath: '' })}
                disabled={actionProcessing}
              >
                [ cancel ]
              </button>
              <button 
                className="nested-trigger-btn" 
                style={{ color: 'var(--accent-color, #CC5A01)', fontWeight: 600 }}
                onClick={handleConfirmRelocate}
                disabled={actionProcessing || !relocateModal.newPath || relocateModal.newPath === relocateModal.folder?.folderPath}
              >
                {actionProcessing ? '[ re-binding... ]' : '[ re-bind path ]'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

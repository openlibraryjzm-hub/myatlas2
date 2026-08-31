import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ArrowRight, Check, Sparkles, Folder, Layers, Compass } from 'lucide-react';
import { fetchServerAtlases } from '../services/api';
import './AtlasSwitcher.css';

export default function AtlasSwitcher({
  currentAtlas,
  onSelectAtlas,
  onCreateAtlas,
  isModal = false,
  onClose
}) {
  const [slugQuery, setSlugQuery] = useState('');
  const [atlases, setAtlases] = useState([
    { id: 'myatlas', title: 'My Atlas', description: 'Default main atlas archive', accentColor: '#CC5A01', itemCount: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Load existing sub-atlases
  const loadAtlases = async () => {
    setLoading(true);
    try {
      const serverAtlases = await fetchServerAtlases();
      if (Array.isArray(serverAtlases) && serverAtlases.length > 0) {
        setAtlases(serverAtlases);
      } else {
        const saved = JSON.parse(localStorage.getItem('myatlas_sub_atlases') || '[]');
        if (saved.length > 0) {
          const merged = [{ id: 'myatlas', title: 'My Atlas', description: 'Default main atlas archive', accentColor: '#CC5A01', itemCount: 0 }];
          saved.forEach(a => {
            if (!merged.some(m => m.id === a.id)) merged.push(a);
          });
          setAtlases(merged);
        }
      }
    } catch (e) {
      console.warn('Error loading atlases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAtlases();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const cleanSlug = slugQuery.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
  const matchedAtlas = atlases.find(a => a.id.toLowerCase() === cleanSlug);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!cleanSlug) return;

      if (matchedAtlas) {
        onSelectAtlas(matchedAtlas.id);
        if (onClose) onClose();
      } else {
        onCreateAtlas(cleanSlug);
        if (onClose) onClose();
      }
    } else if (e.key === 'Escape' && isModal && onClose) {
      onClose();
    }
  };

  return (
    <div className={`atlas-switcher-container ${isModal ? 'as-modal-overlay' : 'as-page'}`}>
      <div className="as-card">
        {isModal && onClose && (
          <button className="as-modal-close" onClick={onClose} aria-label="Close switcher">
            &times;
          </button>
        )}

        <div className="as-header">
          <div className="as-brand-icon">
            <Compass size={28} className="as-compass" />
          </div>
          <h1 className="as-title">ATLAS NETWORK</h1>
          <p className="as-subtitle">Navigate, discover, and curate booru archives</p>
        </div>

        {/* Hyperminimalist Terminal Switcher Input */}
        <div className={`as-prompt-box ${matchedAtlas ? 'has-match' : cleanSlug ? 'no-match' : ''}`}>
          <span className="as-domain-prefix">atlasnetwork.org/</span>
          <input
            ref={inputRef}
            type="text"
            className="as-prompt-input"
            placeholder="type slug (e.g. space, military)..."
            value={slugQuery}
            onChange={(e) => setSlugQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {matchedAtlas ? (
            <button 
              className="as-action-btn enter-btn"
              onClick={() => { onSelectAtlas(matchedAtlas.id); if (onClose) onClose(); }}
            >
              Enter <ArrowRight size={14} />
            </button>
          ) : cleanSlug ? (
            <button 
              className="as-action-btn create-btn"
              onClick={() => { onCreateAtlas(cleanSlug); if (onClose) onClose(); }}
            >
              Create <Plus size={14} />
            </button>
          ) : null}
        </div>

        {/* Dynamic Lookup Status Indicator */}
        <div className="as-status-bar">
          {!cleanSlug ? (
            <span className="as-hint-text">
              Type any sub-atlas slug to jump directly to it or press Enter to launch.
            </span>
          ) : matchedAtlas ? (
            <div className="as-match-indicator">
              <span className="as-badge-dot" style={{ backgroundColor: matchedAtlas.accentColor || '#CC5A01' }}></span>
              <Check size={14} className="as-match-icon" />
              <span className="as-match-title">{matchedAtlas.title}</span>
              {matchedAtlas.itemCount > 0 && (
                <span className="as-match-count">({matchedAtlas.itemCount.toLocaleString()} posts)</span>
              )}
              <span className="as-key-hint">Press <b>Enter ↵</b> to navigate</span>
            </div>
          ) : (
            <div className="as-no-match-indicator">
              <Plus size={14} className="as-new-icon" />
              <span>Sub-atlas <b>"atlasnetwork.org/{cleanSlug}"</b> doesn't exist yet.</span>
              <span className="as-key-hint">Press <b>Enter ↵</b> to create it now!</span>
            </div>
          )}
        </div>

        {/* Scalable Create New Atlas Action */}
        <div className="as-quick-access">
          <div className="as-actions-row" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="as-badge-pill create-new-pill"
              onClick={() => { onCreateAtlas(''); if (onClose) onClose(); }}
            >
              <Plus size={13} />
              <span>+ Create New Atlas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

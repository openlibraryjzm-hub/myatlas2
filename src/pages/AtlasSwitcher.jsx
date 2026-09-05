import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Check, Compass, Lock } from 'lucide-react';
import { fetchServerAtlases } from '../services/api';
import { BUILTIN_ATLASES } from '../utils/subAtlasUtils';
import './AtlasSwitcher.css';

export default function AtlasSwitcher({
  currentAtlas,
  onSelectAtlas,
  isModal = false,
  onClose
}) {
  const [slugQuery, setSlugQuery] = useState('');
  const [atlases, setAtlases] = useState(BUILTIN_ATLASES);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Load existing sub-atlases
  const loadAtlases = async () => {
    setLoading(true);
    try {
      const serverAtlases = await fetchServerAtlases();
      const combined = [...BUILTIN_ATLASES];
      const toMerge = Array.isArray(serverAtlases) && serverAtlases.length > 0
        ? serverAtlases
        : JSON.parse(localStorage.getItem('myatlas_sub_atlases') || '[]');
      
      toMerge.forEach(a => {
        if (!combined.some(m => m.id.toLowerCase() === a.id.toLowerCase())) {
          combined.push(a);
        }
      });
      setAtlases(combined);
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
      if (matchedAtlas) {
        onSelectAtlas(matchedAtlas.id);
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
          <h1 className="as-title">ATLAS SWITCHER</h1>
          <p className="as-subtitle">Select an Atlas archive to browse</p>
        </div>

        {/* Terminal Switcher Input */}
        <div className={`as-prompt-box ${matchedAtlas ? 'has-match' : cleanSlug ? 'no-match' : ''}`}>
          <span className="as-domain-prefix">atlas/</span>
          <input
            ref={inputRef}
            type="text"
            className="as-prompt-input"
            placeholder="type atlas name (e.g. myatlas)..."
            value={slugQuery}
            onChange={(e) => setSlugQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {matchedAtlas && (
            <button 
              className="as-action-btn enter-btn"
              onClick={() => { onSelectAtlas(matchedAtlas.id); if (onClose) onClose(); }}
            >
              Enter <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Lookup Status Indicator */}
        <div className="as-status-bar">
          {!cleanSlug ? (
            <span className="as-hint-text">
              Type an atlas name to jump directly to it or select below.
            </span>
          ) : matchedAtlas ? (
            <div className="as-match-indicator">
              <span className="as-badge-dot" style={{ backgroundColor: matchedAtlas.accentColor || '#CC5A01' }}></span>
              <Check size={14} className="as-match-icon" />
              <span className="as-match-title">{matchedAtlas.title}</span>
              {matchedAtlas.id === 'myatlas' ? (
                <span className="as-match-owner">✏️ Personal Workspace</span>
              ) : (
                <span className="as-match-owner"><Lock size={12} /> Curated Read-Only Archive</span>
              )}
              <span className="as-key-hint">Press <b>Enter ↵</b> to navigate</span>
            </div>
          ) : (
            <div className="as-no-match-indicator">
              <span>Atlas <b>"{cleanSlug}"</b> not found in list.</span>
            </div>
          )}
        </div>

        {/* Atlas List */}
        <div className="as-quick-access" style={{ marginTop: '1rem' }}>
          <div className="as-actions-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {atlases.map((a) => (
              <button
                key={a.id}
                className={`as-badge-pill ${currentAtlas === a.id ? 'active' : ''}`}
                onClick={() => { onSelectAtlas(a.id); if (onClose) onClose(); }}
                style={{
                  borderLeft: `3px solid ${a.accentColor || '#CC5A01'}`
                }}
              >
                <span>{a.title || a.id}</span>
                {a.id === 'myatlas' ? (
                  <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>(editable)</span>
                ) : (
                  <Lock size={11} style={{ opacity: 0.6 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

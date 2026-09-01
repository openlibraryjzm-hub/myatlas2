import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, ArrowLeft, Check, Palette, Shield, Eye } from 'lucide-react';
import { createServerAtlas } from '../services/api';
import { renderDynamicTitle } from '../utils/subAtlasUtils';
import './CreateAtlas.css';

const PALETTE_OPTIONS = [
  { name: 'Warm Amber', hex: '#CC5A01' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Forest Green', hex: '#16a34a' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Hot Pink', hex: '#db2777' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Burnt Orange', hex: '#ea580c' }
];

export default function CreateAtlas({ initialSlug = '', currentUser, onAtlasCreated, onCancel }) {
  const [slug, setSlug] = useState(initialSlug);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('#CC5A01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialSlug && !title) {
      // Auto-capitalize initial title from slug
      const autoTitle = initialSlug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setTitle(autoTitle);
    }
  }, [initialSlug]);

  const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cleanSlug) {
      setError('Sub-atlas slug is required (e.g. space, military)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const finalTitle = title.trim() || cleanSlug;
      const atlasData = {
        id: cleanSlug,
        title: finalTitle,
        description: description.trim(),
        accentColor,
        ownerUserId: currentUser?.id || 'usr_curator',
        ownerUsername: currentUser?.username || 'curator'
      };

      // 1. Sync to C# Backend if online
      await createServerAtlas(atlasData);

      // 2. Persist locally to localStorage
      const saved = JSON.parse(localStorage.getItem('myatlas_sub_atlases') || '[]');
      const updated = saved.filter(a => a.id !== cleanSlug);
      updated.push(atlasData);
      localStorage.setItem('myatlas_sub_atlases', JSON.stringify(updated));

      onAtlasCreated(cleanSlug);
    } catch (err) {
      console.error('Error creating sub-atlas:', err);
      setError(err.message || 'Failed to create sub-atlas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-atlas-page">
      <div className="ca-card">
        <button className="ca-back-btn" onClick={onCancel}>
          <ArrowLeft size={16} /> Back to Switcher
        </button>

        <div className="ca-header">
          <div className="ca-icon-wrap" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
            <Compass size={28} />
          </div>
          <h1 className="ca-title">Create New Sub-Atlas</h1>
          <p className="ca-subtitle">
            Establish a sovereign booru archive for any domain (e.g. space, military, game assets).
          </p>
        </div>

        {/* Live Option A Header Logo Preview Banner */}
        <div className="ca-preview-banner" style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}0a` }}>
          <div className="ca-preview-header">
            <Eye size={14} style={{ color: accentColor }} />
            <span>LIVE LOGO & ACCENT PREVIEW</span>
          </div>
          <div className="ca-preview-title-box">
            {renderDynamicTitle(title.trim() || cleanSlug || 'Space Archive', accentColor)}
          </div>
        </div>

        {error && <div className="ca-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="ca-form">
          {/* Sub-Atlas Slug */}
          <div className="ca-field">
            <label className="ca-label">
              Sub-Atlas Slug <span className="req">*</span>
            </label>
            <div className="ca-input-prefix-box">
              <span className="ca-prefix">atlasnetwork.org/</span>
              <input
                type="text"
                className="ca-input mono"
                placeholder="space"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <span className="ca-help">Lowercase identifier used in routes & tag namespaces.</span>
          </div>

          {/* Title */}
          <div className="ca-field">
            <label className="ca-label">Display Title</label>
            <input
              type="text"
              className="ca-input"
              placeholder="e.g. Space & Astronomy Archive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="ca-field">
            <label className="ca-label">Description / Purpose</label>
            <textarea
              className="ca-textarea"
              placeholder="Brief overview of what media & booru tags belong in this atlas..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Accent Color Palette */}
          <div className="ca-field">
            <label className="ca-label">
              <Palette size={14} /> Theme Accent Color
            </label>
            <div className="ca-palette-grid">
              {PALETTE_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  className={`ca-color-pill ${accentColor === c.hex ? 'selected' : ''}`}
                  onClick={() => setAccentColor(c.hex)}
                  style={{ '--color-hex': c.hex }}
                >
                  <span className="ca-color-dot" style={{ backgroundColor: c.hex }}></span>
                  <span className="ca-color-name">{c.name}</span>
                  {accentColor === c.hex && <Check size={12} className="ca-color-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="ca-actions">
            <button type="button" className="ca-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="ca-submit-btn"
              disabled={loading || !cleanSlug}
              style={{ backgroundColor: accentColor }}
            >
              {loading ? 'Creating Atlas...' : `Launch atlasnetwork.org/${cleanSlug || 'atlas'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

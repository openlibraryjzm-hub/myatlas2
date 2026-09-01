import React, { useState, useEffect } from 'react';
import { Compass, ArrowLeft, Check, Palette, ShieldCheck, ShieldAlert, Lock, Save, Globe } from 'lucide-react';
import { createServerAtlas } from '../services/api';
import { renderDynamicTitle } from '../utils/subAtlasUtils';
import './AtlasSettings.css';

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

export default function AtlasSettings({
  currentAtlas = 'myatlas',
  activeAtlasDetails,
  currentUser,
  onUpdateAtlas,
  onNavigateBack
}) {
  const [title, setTitle] = useState(activeAtlasDetails?.title || currentAtlas);
  const [description, setDescription] = useState(activeAtlasDetails?.description || '');
  const [accentColor, setAccentColor] = useState(activeAtlasDetails?.accentColor || '#CC5A01');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (activeAtlasDetails) {
      setTitle(activeAtlasDetails.title || currentAtlas);
      setDescription(activeAtlasDetails.description || '');
      setAccentColor(activeAtlasDetails.accentColor || '#CC5A01');
    }
  }, [activeAtlasDetails, currentAtlas]);

  // Determine if logged in user is the Owner / Natural Moderator of this Atlas
  const ownerUsername = activeAtlasDetails?.ownerUsername || 'curator';
  const isOwner = !!(currentUser && (
    (activeAtlasDetails?.ownerUserId && currentUser.id === activeAtlasDetails.ownerUserId) ||
    (currentUser.username && currentUser.username.toLowerCase() === ownerUsername.toLowerCase()) ||
    (currentAtlas === 'myatlas' && currentUser.username === 'curator')
  ));

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isOwner) return;

    setSaving(true);
    setSuccessMsg('');

    try {
      const updatedData = {
        id: currentAtlas,
        title: title.trim() || currentAtlas,
        description: description.trim(),
        accentColor,
        ownerUserId: activeAtlasDetails?.ownerUserId || currentUser.id
      };

      await createServerAtlas(updatedData);

      // Persist to local storage
      const saved = JSON.parse(localStorage.getItem('myatlas_sub_atlases') || '[]');
      const updated = saved.filter(a => a.id !== currentAtlas);
      updated.push(updatedData);
      localStorage.setItem('myatlas_sub_atlases', JSON.stringify(updated));

      if (onUpdateAtlas) onUpdateAtlas(updatedData);
      setSuccessMsg('Sub-atlas settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update atlas settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="atlas-settings-page">
      <div className="as-settings-card">
        <button className="as-settings-back-btn" onClick={onNavigateBack}>
          <ArrowLeft size={16} /> Back to Browse
        </button>

        <div className="as-settings-header">
          <div className="as-settings-icon-wrap" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
            <Compass size={28} />
          </div>
          <h1 className="as-settings-title">Atlas Settings & Moderation</h1>
          <p className="as-settings-subtitle">
            Manage settings and verify moderator ownership for <span className="mono-slug">atlasnetwork.org/{currentAtlas}</span>
          </p>
        </div>

        {/* OWNER LITMUS TEST RECOGNITION CARD */}
        <div className={`as-litmus-card ${isOwner ? 'is-owner' : 'is-member'}`}>
          <div className="litmus-card-badge">
            {isOwner ? (
              <>
                <ShieldCheck size={20} className="litmus-icon" />
                <span className="litmus-status-title">👑 Owner & Primary Moderator</span>
              </>
            ) : (
              <>
                <ShieldAlert size={20} className="litmus-icon" />
                <span className="litmus-status-title">👤 Member Access Only</span>
              </>
            )}
          </div>
          <p className="litmus-card-desc">
            {isOwner ? (
              <>
                You are recognized as the <b>Creator & Owner</b> of <code>atlasnetwork.org/{currentAtlas}</code>. You have full moderation rights to edit settings, customize palettes, and manage metadata.
              </>
            ) : (
              <>
                This Sub-Atlas is owned and moderated by <b>@{ownerUsername}</b>. You are currently browsing as <b>@{currentUser ? currentUser.username : 'guest'}</b>. Management settings are read-only.
              </>
            )}
          </p>
        </div>

        {/* LIVE LOGO & ACCENT PREVIEW */}
        <div className="as-preview-banner" style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}0a` }}>
          <div className="as-preview-header">
            <Globe size={14} style={{ color: accentColor }} />
            <span>LIVE LOGO PREVIEW</span>
          </div>
          <div className="as-preview-title-box">
            {renderDynamicTitle(title || currentAtlas, accentColor)}
          </div>
        </div>

        {successMsg && (
          <div className="as-success-banner">
            <Check size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="as-settings-form">
          {/* Display Title */}
          <div className="as-field">
            <label className="as-label">
              Display Title {!isOwner && <Lock size={12} className="lock-icon" />}
            </label>
            <input
              type="text"
              className="as-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isOwner}
              required
            />
          </div>

          {/* Description */}
          <div className="as-field">
            <label className="as-label">
              Overview & Curation Scope {!isOwner && <Lock size={12} className="lock-icon" />}
            </label>
            <textarea
              className="as-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isOwner}
              placeholder="Describe what media belongs in this sub-atlas..."
            />
          </div>

          {/* Theme Accent Color Palette */}
          <div className="as-field">
            <label className="as-label">
              <Palette size={14} /> Theme Accent Color {!isOwner && <Lock size={12} className="lock-icon" />}
            </label>
            <div className="as-palette-grid">
              {PALETTE_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  className={`as-color-pill ${accentColor === c.hex ? 'selected' : ''}`}
                  onClick={() => isOwner && setAccentColor(c.hex)}
                  disabled={!isOwner}
                  style={{ '--color-hex': c.hex }}
                >
                  <span className="as-color-dot" style={{ backgroundColor: c.hex }}></span>
                  <span className="as-color-name">{c.name}</span>
                  {accentColor === c.hex && <Check size={12} className="as-color-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="as-actions">
            <button type="button" className="as-cancel-btn" onClick={onNavigateBack}>
              Cancel
            </button>
            {isOwner && (
              <button
                type="submit"
                className="as-save-btn"
                disabled={saving}
                style={{ backgroundColor: accentColor }}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Upload, RotateCcw, Check, Sparkles, SlidersHorizontal, Image as ImageIcon, Sliders, Palette } from 'lucide-react';
import PopOutAvatar from './PopOutAvatar';
import { DEFAULT_AVATAR_CONFIG, getAvatarConfig, saveAvatarConfig } from '../utils/avatarStorage';
import './PopOutAvatarConfigModal.css';

import keysImg from '/aesthetic-value-of-vintage-keys-free-png.webp';
import amberImg from '/bernstein-261133_1280.png';
import tvImg from '/pngtree-a-straight-shot-of-a-realistic-eighties-crt-television-set-png-image_19729924.webp';

const PRESET_IMAGES = [
  { name: 'Amber Amberlyn', url: amberImg },
  { name: 'Vintage Keys', url: keysImg },
  { name: 'CRT Television', url: tvImg },
];

const PRESET_COLORS = [
  '#CC5A01', // Claude Warm Amber
  '#EF4444', // Crimson Red
  '#8B5CF6', // Purple Accent
  '#10B981', // Emerald Green
  '#3B82F6', // Royal Blue
  '#D97706', // Gold Amber
  '#EC4899', // Hot Pink
];

export default function PopOutAvatarConfigModal({ isOpen, onClose, onSaved }) {
  const [config, setConfig] = useState(() => getAvatarConfig());

  if (!isOpen) return null;

  const handleQuadrantToggle = (quadrantKey) => {
    setConfig((prev) => ({
      ...prev,
      quadrants: {
        ...prev.quadrants,
        [quadrantKey]: !prev.quadrants[quadrantKey]
      }
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setConfig((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const saved = saveAvatarConfig(config);
    if (onSaved) onSaved(saved);
    onClose();
  };

  const handleReset = () => {
    setConfig(DEFAULT_AVATAR_CONFIG);
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="avatar-modal-header">
          <div className="modal-title-group">
            <Sparkles size={20} className="modal-title-icon" />
            <h3 className="avatar-modal-title">2.5D Pop-Out Avatar Configurator</h3>
          </div>
          <button className="avatar-modal-close-btn" onClick={onClose} title="Close Configurator">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="avatar-modal-body">
          
          {/* Left Column: Live Interactive PopOutAvatar Stage */}
          <div className="avatar-preview-column">
            <div className="preview-stage-box">
              <PopOutAvatar size={340} config={config} />
              <span className="preview-badge">Live Avatar Preview</span>
            </div>

            {/* 4-Quadrant Pop-Out Controller */}
            <div className="quadrant-controller-section">
              <label className="section-label">
                <SlidersHorizontal size={15} /> 4-Quadrant Pop-Out Toggle
              </label>
              <p className="quadrant-hint">
                Click any quadrant to poke artwork <strong>OUT</strong> over the ring stroke or stay <strong>CLIPPED</strong> inside.
              </p>

              <div className="quadrant-grid-2x2">
                {[
                  { key: 'topLeft', label: 'Top-Left' },
                  { key: 'topRight', label: 'Top-Right' },
                  { key: 'bottomLeft', label: 'Bottom-Left' },
                  { key: 'bottomRight', label: 'Bottom-Right' },
                ].map((q) => {
                  const isActive = config.quadrants[q.key];
                  return (
                    <button
                      key={q.key}
                      className={`quadrant-toggle-btn ${isActive ? 'popout-active' : 'clipped-active'}`}
                      onClick={() => handleQuadrantToggle(q.key)}
                      type="button"
                    >
                      <span className="quadrant-btn-label">{q.label}</span>
                      <span className="quadrant-btn-status">
                        {isActive ? 'POP-OUT 💥' : 'CLIPPED ⭕'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Image Source, Scale, Offsets, Orb Color & Stroke Controls */}
          <div className="avatar-controls-column">
            
            {/* Image Selection */}
            <div className="control-group">
              <label className="control-label">
                <ImageIcon size={14} /> Avatar Image Source
              </label>

              <div className="image-input-row">
                <input
                  type="text"
                  className="avatar-url-input"
                  placeholder="Paste transparent PNG image URL..."
                  value={config.imageUrl}
                  onChange={(e) => setConfig((prev) => ({ ...prev, imageUrl: e.target.value }))}
                />
                <label className="avatar-file-upload-btn">
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Presets */}
              <div className="preset-images-row">
                <span className="preset-label">Presets:</span>
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    className={`preset-thumb-btn ${config.imageUrl === img.url ? 'selected' : ''}`}
                    onClick={() => setConfig((prev) => ({ ...prev, imageUrl: img.url }))}
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} />
                  </button>
                ))}
              </div>
            </div>

            {/* Image Scale & Pop-Out Magnification */}
            <div className="control-group">
              <div className="control-label-with-value">
                <label className="control-label">
                  Image Scale ({Math.round((config.imageScale ?? 1.2) * 100)}%)
                </label>
                <div className="scale-quick-presets">
                  {[
                    { label: '1.0x', val: 1.0 },
                    { label: '1.3x', val: 1.3 },
                    { label: '1.8x', val: 1.8 }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className={`scale-preset-btn ${(config.imageScale ?? 1.2) === p.val ? 'active' : ''}`}
                      onClick={() => setConfig((prev) => ({ ...prev, imageScale: p.val }))}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                className="config-slider"
                min="0.5"
                max="2.5"
                step="0.05"
                value={config.imageScale ?? 1.2}
                onChange={(e) => setConfig((prev) => ({ ...prev, imageScale: Number(e.target.value) }))}
              />
            </div>

            {/* Image Fit Mode (Contain vs Cover) */}
            <div className="control-group">
              <label className="control-label">Image Aspect Ratio Fit</label>
              <div className="fit-mode-toggle-row">
                <button
                  type="button"
                  className={`fit-mode-btn ${(config.objectFit ?? 'contain') === 'contain' ? 'active' : ''}`}
                  onClick={() => setConfig((prev) => ({ ...prev, objectFit: 'contain' }))}
                >
                  Full Image (Contain - No Crop)
                </button>
                <button
                  type="button"
                  className={`fit-mode-btn ${(config.objectFit ?? 'contain') === 'cover' ? 'active' : ''}`}
                  onClick={() => setConfig((prev) => ({ ...prev, objectFit: 'cover' }))}
                >
                  Crop Fill (Cover)
                </button>
              </div>
            </div>

            {/* Position Offsets (Vertical Nudge / Horizontal Nudge) */}
            <div className="control-group inline-controls">
              <div className="slider-control">
                <label className="control-label">Vertical Shift ({config.imageOffsetY ?? -5}%)</label>
                <input
                  type="range"
                  className="config-slider"
                  min="-40"
                  max="40"
                  step="1"
                  value={config.imageOffsetY ?? -5}
                  onChange={(e) => setConfig((prev) => ({ ...prev, imageOffsetY: Number(e.target.value) }))}
                />
              </div>

              <div className="slider-control">
                <label className="control-label">Horizontal Shift ({config.imageOffsetX ?? 0}%)</label>
                <input
                  type="range"
                  className="config-slider"
                  min="-40"
                  max="40"
                  step="1"
                  value={config.imageOffsetX ?? 0}
                  onChange={(e) => setConfig((prev) => ({ ...prev, imageOffsetX: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Orb Ring Color */}
            <div className="control-group">
              <label className="control-label">
                <Palette size={14} /> Orb Accent Color
              </label>
              <div className="color-swatches-row">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch-btn ${config.orbColor === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setConfig((prev) => ({ ...prev, orbColor: c }))}
                  >
                    {config.orbColor === c && <Check size={12} color="#FFFFFF" />}
                  </button>
                ))}
                <input
                  type="color"
                  className="custom-color-picker"
                  value={config.orbColor || '#CC5A01'}
                  onChange={(e) => setConfig((prev) => ({ ...prev, orbColor: e.target.value }))}
                  title="Choose custom color"
                />
              </div>
            </div>

            {/* Ring Stroke & Glow Controls */}
            <div className="control-group inline-controls">
              <div className="slider-control">
                <label className="control-label">Ring Border ({config.strokeWidth ?? 4}px)</label>
                <input
                  type="range"
                  className="config-slider"
                  min="2"
                  max="12"
                  value={config.strokeWidth ?? 4}
                  onChange={(e) => setConfig((prev) => ({ ...prev, strokeWidth: Number(e.target.value) }))}
                />
              </div>

              <div className="checkbox-control">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.showGlow ?? true}
                    onChange={(e) => setConfig((prev) => ({ ...prev, showGlow: e.target.checked }))}
                  />
                  <span>Orb Glow Effect</span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="avatar-modal-footer">
          <button type="button" className="btn-reset" onClick={handleReset}>
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <div className="footer-right-btns">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-save" onClick={handleSave}>
              Save Avatar Config
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

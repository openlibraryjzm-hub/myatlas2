import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Plus, RotateCcw } from 'lucide-react';
import { 
  getTagCategories, 
  addTagCategory, 
  removeTagCategory, 
  resetTagCategories 
} from '../data/mockData';
import './SlotCategoryManagerModal.css';

export default function SlotCategoryManagerModal({ 
  isOpen, 
  onClose, 
  onSaveConfig 
}) {
  const [categories, setCategories] = useState(getTagCategories());
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategories(getTagCategories());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCategory = (e) => {
    if (e) e.preventDefault();
    if (!newCategoryInput.trim()) return;

    const updated = addTagCategory(newCategoryInput);
    setCategories(updated);
    setNewCategoryInput('');
    if (onSaveConfig) {
      onSaveConfig(updated);
    }
  };

  const handleRemoveCategory = (prefix) => {
    const updated = removeTagCategory(prefix);
    setCategories(updated);
    if (onSaveConfig) {
      onSaveConfig(updated);
    }
  };

  const handleReset = () => {
    if (confirm('Reset tag categories back to default schema?')) {
      const defaultCats = resetTagCategories();
      setCategories(defaultCats);
      if (onSaveConfig) {
        onSaveConfig(defaultCats);
      }
    }
  };

  return (
    <div className="slot-manager-overlay" onClick={onClose}>
      <div className="slot-manager-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="slot-manager-header">
          <h3 className="slot-manager-title">
            <SlidersHorizontal size={18} style={{ color: 'var(--accent-color)' }} />
            Tag Category Creator & Manager
          </h3>
          <button 
            className="slot-manager-close-btn" 
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="slot-manager-body">
          {/* Quick Add Bar */}
          <form className="slot-manager-command-box" onSubmit={handleAddCategory}>
            <div className="slot-manager-command-label">
              <span>Add New Tag Category</span>
              <span className="slot-manager-command-hint">Format: country:, location:, or camera:</span>
            </div>
            <div className="slot-manager-command-row">
              <input 
                type="text"
                className="slot-manager-command-input"
                placeholder="Type tag category prefix (e.g. country:, location:, camera:)"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="slot-manager-command-btn">
                <Plus size={14} /> Add Category
              </button>
            </div>
          </form>

          {/* Active Registered Categories List */}
          <div className="category-manager-section">
            <div className="category-manager-section-title">
              Active Registered Tag Categories ({categories.length})
            </div>

            <div className="category-manager-pills-grid">
              {categories.map((cat) => (
                <div 
                  key={cat.prefix || cat.key}
                  className="category-manager-badge-card"
                  style={{
                    backgroundColor: cat.bg || 'var(--bg-secondary)',
                    borderColor: `${cat.color}35`
                  }}
                >
                  <span 
                    className="category-color-dot"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="category-badge-info">
                    <span className="category-badge-label" style={{ color: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="category-badge-prefix">
                      {cat.prefix || 'general (fallback)'}
                    </span>
                  </div>

                  {!cat.isDefault && (
                    <button
                      type="button"
                      className="category-badge-remove-btn"
                      onClick={() => handleRemoveCategory(cat.prefix)}
                      title={`Remove ${cat.label} category`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="slot-manager-footer">
          <button 
            type="button"
            className="sidebar-reset-btn"
            onClick={handleReset}
            title="Reset to Default Taxonomy Schema"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>

          <button 
            type="button"
            className="slot-manager-save-btn" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

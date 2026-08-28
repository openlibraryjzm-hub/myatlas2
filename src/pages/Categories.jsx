import React, { useState, useEffect } from 'react';
import { Tag, Hash, Layers, RefreshCw, Filter, Search, Check, Folder, Plus, Trash2, ChevronDown, ChevronUp, X, AlertTriangle } from 'lucide-react';
import { getAllItems } from '../services/localDb';
import { getTagCategories, getTagCategory, getCategoryObj, getDisplayTagName, addTagCategory, removeTagCategory } from '../data/mockData';
import './Categories.css';

const MAX_INITIAL_TAGS = 16;

export default function Categories({ onTagClick }) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('all');

  // Interactive Expand/Collapse states for large categories
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Category creation & removal modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [addError, setAddError] = useState('');
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      const allPosts = await getAllItems({ forceRefresh: true });
      setPosts(allPosts);

      const registeredCategories = getTagCategories();
      const categoryMap = new Map();

      // Initialize category map entries
      registeredCategories.forEach(cat => {
        categoryMap.set(cat.key, {
          ...cat,
          tagsMap: new Map(), // tag -> count
          matchingPostIds: new Set()
        });
      });

      // Also support fallback for any unexpected unmapped prefix
      if (!categoryMap.has('general')) {
        categoryMap.set('general', {
          key: 'general',
          prefix: '',
          label: 'General Tags',
          color: '#cc5a01',
          bg: '#fdf5e6',
          isDefault: true,
          tagsMap: new Map(),
          matchingPostIds: new Set()
        });
      }

      // Process all post tags
      allPosts.forEach(post => {
        const postTags = Array.isArray(post.tags) ? post.tags : [];
        postTags.forEach(tag => {
          const catKey = getTagCategory(tag);
          let entry = categoryMap.get(catKey);

          if (!entry) {
            // Dynamic category entry for unregistered custom prefix
            const catObj = getCategoryObj(catKey);
            entry = {
              ...catObj,
              tagsMap: new Map(),
              matchingPostIds: new Set()
            };
            categoryMap.set(catKey, entry);
          }

          entry.matchingPostIds.add(post.id);
          const currentCount = entry.tagsMap.get(tag) || 0;
          entry.tagsMap.set(tag, currentCount + 1);
        });
      });

      // Format category statistics array
      const result = [];
      categoryMap.forEach((data, key) => {
        const tagsArray = Array.from(data.tagsMap.entries()).map(([tag, count]) => ({
          tag,
          cleanName: getDisplayTagName(tag),
          count
        })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

        result.push({
          key: data.key,
          label: data.label || key,
          prefix: data.prefix !== undefined ? data.prefix : `${key}:`,
          color: data.color || '#cc5a01',
          bg: data.bg || '#fdf5e6',
          isDefault: data.isDefault || false,
          uniqueTagCount: tagsArray.length,
          totalUsageCount: tagsArray.reduce((sum, item) => sum + item.count, 0),
          postCount: data.matchingPostIds.size,
          tags: tagsArray
        });
      });

      // Sort categories: active categories with tags first, then defaults
      result.sort((a, b) => {
        if (a.uniqueTagCount > 0 && b.uniqueTagCount === 0) return -1;
        if (a.uniqueTagCount === 0 && b.uniqueTagCount > 0) return 1;
        return b.totalUsageCount - a.totalUsageCount || a.label.localeCompare(b.label);
      });

      setCategoriesData(result);
    } catch (err) {
      console.error('Error building category taxonomy stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, []);

  const toggleExpand = (catKey) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    setAddError('');
    const input = newCategoryInput.trim();
    if (!input) {
      setAddError('Category name or prefix cannot be empty.');
      return;
    }

    try {
      addTagCategory(input);
      setNewCategoryInput('');
      setIsAddModalOpen(false);
      loadCategoryData();
    } catch (err) {
      setAddError(err.message || 'Failed to add tag category.');
    }
  };

  const handleDeleteCategory = (cat) => {
    if (!cat) return;
    try {
      removeTagCategory(cat.prefix || cat.key);
      setConfirmDeleteCat(null);
      loadCategoryData();
    } catch (err) {
      console.error('Error removing category:', err);
    }
  };

  // Filtered categories & tags based on search query
  const filteredCategories = categoriesData.filter(cat => {
    if (selectedCategoryKey !== 'all' && cat.key !== selectedCategoryKey) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();

    const matchesName = cat.label.toLowerCase().includes(query) || 
                        cat.key.toLowerCase().includes(query) || 
                        cat.prefix.toLowerCase().includes(query);

    const matchesAnyTag = cat.tags.some(t => t.tag.toLowerCase().includes(query) || t.cleanName.toLowerCase().includes(query));

    return matchesName || matchesAnyTag;
  });

  const totalUniqueTagsCount = categoriesData.reduce((sum, c) => sum + c.uniqueTagCount, 0);
  const activeCategoriesCount = categoriesData.filter(c => c.uniqueTagCount > 0).length;

  return (
    <div className="categories-container">
      {/* Header Bar */}
      <div className="categories-header">
        <div className="categories-title-row">
          <div>
            <h2 className="categories-title">Tag Categories Directory</h2>
            <p className="categories-subtitle">
              Inspect booru namespace categories, manage tag prefixes, and inspect usage distributions across your media library.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => { setIsAddModalOpen(true); setAddError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0.55rem 1rem' }}
            >
              <Plus size={15} /> Add Category
            </button>

            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={loadCategoryData}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0.55rem 1rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Categories
            </button>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="categories-stats-summary">
          <div className="categories-stat-card">
            <div className="stat-value">{activeCategoriesCount} / {categoriesData.length}</div>
            <div className="stat-label">Active Categories</div>
          </div>
          <div className="categories-stat-card">
            <div className="stat-value">{totalUniqueTagsCount}</div>
            <div className="stat-label">Unique Namespace Tags</div>
          </div>
          <div className="categories-stat-card">
            <div className="stat-value">{posts.length}</div>
            <div className="stat-label">Total Posts Indexed</div>
          </div>
        </div>

        {/* Controls Bar: Filter & Search */}
        <div className="categories-controls-bar">
          <div className="categories-filter-chips">
            <button
              type="button"
              className={`filter-chip ${selectedCategoryKey === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategoryKey('all')}
            >
              All Categories ({categoriesData.length})
            </button>
            {categoriesData.map(cat => (
              <button
                key={cat.key}
                type="button"
                className={`filter-chip ${selectedCategoryKey === cat.key ? 'active' : ''}`}
                onClick={() => setSelectedCategoryKey(cat.key)}
                style={{
                  borderColor: selectedCategoryKey === cat.key ? cat.color : 'transparent',
                  backgroundColor: selectedCategoryKey === cat.key ? cat.bg : 'var(--bg-secondary)',
                  color: selectedCategoryKey === cat.key ? cat.color : 'var(--text-secondary)'
                }}
              >
                <span className="chip-dot" style={{ backgroundColor: cat.color }} />
                {cat.label} ({cat.uniqueTagCount})
              </button>
            ))}
          </div>

          <div className="categories-search-input-wrapper">
            <Search size={15} className="categories-search-icon" />
            <input
              type="text"
              className="categories-search-input"
              placeholder="Search category or tag name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Categories Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Analyzing database namespace taxonomy...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          No namespace categories matched your search criteria.
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map(cat => {
            const displayTags = searchQuery.trim()
              ? cat.tags.filter(t => t.tag.toLowerCase().includes(searchQuery.toLowerCase()) || t.cleanName.toLowerCase().includes(searchQuery.toLowerCase()))
              : cat.tags;

            const isExpanded = expandedCategories.has(cat.key);
            const hasTruncatedTags = !isExpanded && !searchQuery.trim() && displayTags.length > MAX_INITIAL_TAGS;
            const visibleTags = hasTruncatedTags ? displayTags.slice(0, MAX_INITIAL_TAGS) : displayTags;

            return (
              <div key={cat.key} className="category-card" style={{ borderTop: `4px solid ${cat.color}` }}>
                {/* Category Header */}
                <div className="category-card-header">
                  <div className="category-title-group">
                    <span className="category-color-badge" style={{ backgroundColor: cat.color }} />
                    <h3 className="category-card-label">{cat.label}</h3>
                    <span className="category-prefix-badge" style={{ backgroundColor: cat.bg, color: cat.color }}>
                      {cat.prefix || 'unnamespaced'}
                    </span>
                  </div>

                  <div className="category-header-actions">
                    <div className="category-counts-group">
                      <span className="category-tag-count">{cat.uniqueTagCount} tag{cat.uniqueTagCount !== 1 ? 's' : ''}</span>
                      <span className="category-post-count">{cat.postCount} post{cat.postCount !== 1 ? 's' : ''}</span>
                    </div>

                    {!cat.isDefault && (
                      <button
                        type="button"
                        className="category-delete-icon-btn"
                        onClick={() => setConfirmDeleteCat(cat)}
                        title={`Remove custom category: ${cat.label}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags List / Scalable Pill Cloud */}
                <div className="category-tags-box">
                  {displayTags.length === 0 ? (
                    <div className="category-empty-state">
                      {cat.uniqueTagCount === 0 ? 'No tags currently indexed under this category.' : 'No matching tags found.'}
                    </div>
                  ) : (
                    <>
                      <div className="category-tags-cloud">
                        {visibleTags.map(item => (
                          <button
                            key={item.tag}
                            type="button"
                            className="category-tag-pill"
                            style={{ backgroundColor: cat.bg, color: cat.color, borderColor: `${cat.color}33` }}
                            onClick={() => onTagClick && onTagClick(item.tag)}
                            title={`Click to filter grid by tag: ${item.tag}`}
                          >
                            <span className="tag-pill-name">{item.cleanName}</span>
                            <span className="tag-pill-count" style={{ backgroundColor: `${cat.color}22` }}>{item.count}</span>
                          </button>
                        ))}
                      </div>

                      {/* Expand / Collapse Button for Large Tag Lists */}
                      {displayTags.length > MAX_INITIAL_TAGS && !searchQuery.trim() && (
                        <div className="category-expand-bar">
                          <button
                            type="button"
                            className="category-expand-btn"
                            onClick={() => toggleExpand(cat.key)}
                          >
                            {isExpanded ? (
                              <>
                                <span>Show top {MAX_INITIAL_TAGS} tags</span>
                                <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                <span>Show all {displayTags.length} tags (+{displayTags.length - MAX_INITIAL_TAGS} more)</span>
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create New Namespace Category */}
      {isAddModalOpen && (
        <div className="categories-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="categories-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="categories-modal-header">
              <h3 className="categories-modal-title">
                <Tag size={18} /> Add New Tag Category Prefix
              </h3>
              <button type="button" className="close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Category Name or Prefix (e.g. <code>medium:</code>, <code>genre:</code>, <code>location:</code>):
                </label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. medium, camera, game, location"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  autoFocus
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', display: 'block' }}>
                  Prefixes ending with a colon (like <code>medium:</code>) automatically format tags as <code>medium:digital_art</code>.
                </span>
              </div>

              {addError && (
                <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} /> {addError}
                </div>
              )}

              <div className="categories-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Remove Custom Category */}
      {confirmDeleteCat && (
        <div className="categories-modal-overlay" onClick={() => setConfirmDeleteCat(null)}>
          <div className="categories-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="categories-modal-title" style={{ color: '#dc2626' }}>
              <AlertTriangle size={18} /> Remove Category "{confirmDeleteCat.label}"?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: '1rem 0' }}>
              Are you sure you want to remove the custom category prefix <strong>{confirmDeleteCat.prefix || confirmDeleteCat.key}</strong>?
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Note: This removes the namespace category definition. Existing post tags will revert to General classification.
            </p>

            <div className="categories-modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmDeleteCat(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
                onClick={() => handleDeleteCategory(confirmDeleteCat)}
              >
                Remove Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

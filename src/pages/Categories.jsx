import React, { useState, useEffect } from 'react';
import { Tag, RefreshCw, Plus, Trash2, X, AlertTriangle, ArrowLeft, Globe } from 'lucide-react';
import { getAllItems } from '../services/localDb';
import { getTagCategories, getTagCategory, getCategoryObj, getDisplayTagName, parseTagsArray, addTagCategory, removeTagCategory } from '../data/mockData';
import './Categories.css';

export default function Categories({ onTagClick }) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [domainScopeQuery, setDomainScopeQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null); // null = on namespaces tab
  const [activeTab, setActiveTab] = useState('namespaces'); // 'namespaces' | 'values'

  // Category creation & removal modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [addError, setAddError] = useState('');
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      const allPosts = await getAllItems({ forceRefresh: true });
      
      // Apply domain scope filter if specified (e.g. atlas:rockets, folder:wallpapers, etc.)
      const scopeFilter = domainScopeQuery.trim().toLowerCase();
      const scopedPosts = scopeFilter 
        ? allPosts.filter(post => {
            const tags = parseTagsArray(post.tags);
            return tags.some(t => typeof t === 'string' && t.toLowerCase().includes(scopeFilter));
          })
        : allPosts;

      setPosts(scopedPosts);

      const registeredCategories = getTagCategories();
      const categoryMap = new Map();

      // Initialize category map entries cleanly
      registeredCategories.forEach(cat => {
        if (!cat || !cat.key) return;
        categoryMap.set(cat.key.toLowerCase(), {
          ...cat,
          tagsMap: new Map(), // tag -> count
          matchingPostIds: new Set()
        });
      });

      // Fallback for general unnamespaced tags
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

      // Process post tags in scoped posts
      scopedPosts.forEach(post => {
        const postTags = parseTagsArray(post.tags);
        postTags.forEach(tag => {
          if (typeof tag !== 'string' || !tag.trim()) return;
          const catKey = getTagCategory(tag).toLowerCase();
          let entry = categoryMap.get(catKey);

          if (!entry) {
            // Dynamic category entry for custom prefix
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

      // Sort categories: active with tags first, then by usage count
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
  }, [domainScopeQuery]);

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

  // Drill down to Tab 2 filtered specifically by clicked category
  const handleDrillDownCategory = (catKey) => {
    setSelectedCategoryKey(catKey);
    setActiveTab('values');
  };

  // Return from Tab 2 back to Tab 1
  const handleBackToNamespaces = () => {
    setSelectedCategoryKey(null);
    setActiveTab('namespaces');
  };

  // Selected category object when in values tab
  const activeSelectedCategory = categoriesData.find(c => c.key === selectedCategoryKey);

  // Tag values list when in values tab (specifically for selected category)
  const categoryTagValues = (activeSelectedCategory ? activeSelectedCategory.tags : [])
    .sort((a, b) => b.count - a.count || a.cleanName.localeCompare(b.cleanName));

  return (
    <div className="categories-container">
      {/* Header Controls Section */}
      <div className="categories-header">
        <div className="categories-title-row">
          <div>
            {activeTab === 'values' && activeSelectedCategory ? (
              <div className="breadcrumb-nav-row">
                <button 
                  type="button" 
                  className="btn-back-link" 
                  onClick={handleBackToNamespaces}
                >
                  <ArrowLeft size={15} /> Back to Namespaces
                </button>
                <span className="breadcrumb-slash">/</span>
                <span className="breadcrumb-current" style={{ color: activeSelectedCategory.color }}>
                  {activeSelectedCategory.label} ({activeSelectedCategory.prefix || 'unnamespaced'})
                </span>
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => { setIsAddModalOpen(true); setAddError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0.45rem 0.85rem' }}
            >
              <Plus size={14} /> Add Prefix
            </button>

            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={loadCategoryData}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '0.45rem 0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Domain Scope Filter Bar */}
        <div className="domain-scope-bar">
          <div className="scope-input-wrapper">
            <Globe size={15} className="scope-icon" />
            <input
              type="text"
              className="scope-input"
              placeholder="Filter domain scope by tag (e.g. atlas:rockets, folder:wallpapers)..."
              value={domainScopeQuery}
              onChange={(e) => setDomainScopeQuery(e.target.value)}
            />
            {domainScopeQuery && (
              <button 
                type="button" 
                className="scope-clear-btn" 
                onClick={() => setDomainScopeQuery('')}
                title="Clear domain scope filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {domainScopeQuery.trim() && (
            <span className="scope-active-pill">
              Scoped to: <strong>{domainScopeQuery.trim()}</strong> ({posts.length} post{posts.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Main View Content */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Analyzing namespace taxonomy...
        </div>
      ) : activeTab === 'namespaces' ? (
        /* TAB 1: ONE CONTINUOUS SHARED LINE OF NAMESPACE CATEGORIES SEPARATED BY COMMAS */
        <div className="namespaces-continuous-container">
          {categoriesData.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
              No categories found.
            </div>
          ) : (
            <div className="comma-tag-flow-container">
              {categoriesData.map((cat, idx) => (
                <span key={cat.key} className="comma-tag-item-wrapper">
                  <button
                    type="button"
                    className="comma-tag-btn namespace-inline-btn"
                    style={{ backgroundColor: cat.bg, color: cat.color, borderColor: `${cat.color}44` }}
                    onClick={() => handleDrillDownCategory(cat.key)}
                    title={`Click to drill down into ${cat.label} tag values`}
                  >
                    <span className="chip-dot" style={{ backgroundColor: cat.color }} />
                    <span className="comma-tag-name">{cat.label}</span>
                    <span className="namespace-prefix-inline" style={{ color: cat.color }}>
                      {cat.prefix || 'unnamespaced'}
                    </span>
                    <span className="comma-tag-count" style={{ backgroundColor: `${cat.color}22` }}>
                      {cat.uniqueTagCount}
                    </span>
                  </button>
                  {!cat.isDefault && (
                    <button
                      type="button"
                      className="inline-cat-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteCat(cat);
                      }}
                      title={`Remove custom prefix: ${cat.label}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                  {idx < categoriesData.length - 1 && <span className="comma-separator">,</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: DRILL-DOWN TAG VALUES (ACCESSIBLE ONLY FROM A NAMESPACE CLICK) */
        <div className="values-tab-content">
          {categoryTagValues.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
              No tag values indexed under <strong>{activeSelectedCategory?.label}</strong>.
            </div>
          ) : (
            <div className="comma-tag-flow-container">
              {categoryTagValues.map((item, idx) => (
                <span key={item.tag} className="comma-tag-item-wrapper">
                  <button
                    type="button"
                    className="comma-tag-btn"
                    style={{ 
                      backgroundColor: activeSelectedCategory?.bg || '#fdf5e6', 
                      color: activeSelectedCategory?.color || '#cc5a01', 
                      borderColor: `${activeSelectedCategory?.color || '#cc5a01'}33` 
                    }}
                    onClick={() => onTagClick && onTagClick(item.tag)}
                    title={`Click to filter posts by tag: ${item.tag}`}
                  >
                    <span className="comma-tag-name">{item.cleanName}</span>
                    <span className="comma-tag-count" style={{ backgroundColor: `${activeSelectedCategory?.color || '#cc5a01'}22` }}>
                      {item.count}
                    </span>
                  </button>
                  {idx < categoryTagValues.length - 1 && <span className="comma-separator">,</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create New Namespace Category Prefix */}
      {isAddModalOpen && (
        <div className="categories-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="categories-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="categories-modal-header">
              <h3 className="categories-modal-title">
                <Tag size={18} /> Add Tag Category Prefix
              </h3>
              <button type="button" className="close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Category Name or Prefix (e.g. <code>medium:</code>, <code>genre:</code>, <code>atlas:</code>):
                </label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. medium, camera, game, location, atlas"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  autoFocus
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', display: 'block' }}>
                  Prefixes ending with a colon format tags as <code>prefix:value</code>.
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
              Note: Existing post tags will revert to General classification.
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

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, X, Image as ImageIcon, Glasses, Trash2, Feather, Star, Tag } from 'lucide-react';
import PostCard from '../components/PostCard';
import QueueTimeline from '../components/QueueTimeline';
import MorphingTaggerPanel from '../components/MorphingTaggerPanel';
import './Posts.css';
import { getTagCategory, getDisplayTagName, getCategoryObj } from '../data/mockData';
import Tagger from './Tagger';

import { getLocalScrapes, getLocalMediaFiles, importScrapedJsonArray, addLocalMediaFile } from '../services/localDb';
import { selectLocalFiles, selectLocalDirectory, isDesktopApp, formatLocalAssetUrl } from '../utils/localFiles';

function AddToPoolIcon({ size = 17, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      {...props}
    >
      {/* Base pool rim */}
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 7v6l10 5 10-5V7" />
      <path d="M12 12l5-2.5" />
      <path d="M7 9.5L12 12" />
      {/* Plus badge on top right */}
      <path d="M16 3h5" strokeWidth="2.5" />
      <path d="M18.5 0.5v5" strokeWidth="2.5" />
    </svg>
  );
}

const ITEMS_PER_PAGE = 40;

export default function Posts({ 
  activeFilters, 
  onTagClick, 
  onClearFilters,
  viewMode = 'all',
  savedPostIds = [],
  onToggleSave,
  currentAtlas = 'redditbooru'
}) {
  const [posts, setPosts] = useState([]);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [inspectMode, setInspectMode] = useState(false);
  const [viewerMode, setViewerMode] = useState('none'); // 'none' | 'image' | 'tagger'
  const [sidebarMode, setSidebarMode] = useState(0); // 0: Subreddits, 1: General Tags, 2: Copyright/Characters/Artists/Flairs, 3: Metadata
  const [isFullscreenMedia, setIsFullscreenMedia] = useState(false);
  const [hoveredPostTags, setHoveredPostTags] = useState(null);
  const [modalImageError, setModalImageError] = useState(false);
  const [pendingPostSelect, setPendingPostSelect] = useState(null); // 'first' | 'last'

  // Close post modal helper
  const handleCloseModal = () => {
    setSelectedPost(null);
    setViewerMode('none');
    setIsFullscreenMedia(false);
  };

  // Reset modal image error state when active post changes
  useEffect(() => {
    setModalImageError(false);
  }, [selectedPost]);

  // Index of currently selected post in active page's posts array
  const currentPostIndex = useMemo(() => {
    if (!selectedPost) return -1;
    return posts.findIndex(p => p.id === selectedPost.id);
  }, [selectedPost, posts]);

  // Navigate to Previous Post (<) on current page
  const handlePrevPost = () => {
    if (currentPostIndex > 0) {
      setSelectedPost(posts[currentPostIndex - 1]);
    }
  };

  // Navigate to Next Post (>) on current page
  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setSelectedPost(posts[currentPostIndex + 1]);
    }
  };

  // Keyboard shortcut listener for Esc, Tab, F, and Arrow keys when viewing media
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input element
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        if (viewerMode !== 'none') {
          handleCloseModal();
        }
      } else if (e.key === 'Tab' || e.key === 'f' || e.key === 'F') {
        if (viewerMode === 'image') {
          e.preventDefault();
          setViewerMode('tagger');
        } else if (viewerMode === 'tagger') {
          e.preventDefault();
          setViewerMode('image');
        }
      } else if (viewerMode === 'image') {
        if (e.key === 'ArrowLeft') {
          handlePrevPost();
        } else if (e.key === 'ArrowRight') {
          handleNextPost();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerMode, selectedPost, currentPostIndex, posts]);

  // Exit viewer mode if filters change
  useEffect(() => {
    setViewerMode('none');
  }, [activeFilters, viewMode]);

  const inspectTimerRef = React.useRef(null);
  const activeInspectTargetRef = React.useRef(null);

  // Direct DOM hover handlers for sidebar tags (250ms threshold)
  const handleTagMouseEnter = React.useCallback((e, tagName) => {
    if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
    activeInspectTargetRef.current = tagName;

    inspectTimerRef.current = setTimeout(() => {
      if (activeInspectTargetRef.current !== tagName) return;
      const cards = document.querySelectorAll('.post-card-minimal');
      cards.forEach(card => {
        const cardTags = card.getAttribute('data-tags')?.split(' ') || [];
        if (!cardTags.includes(tagName)) {
          card.classList.add('dimmed');
        } else {
          card.classList.remove('dimmed');
        }
      });
    }, 250);
  }, []);

  const handleTagMouseLeave = React.useCallback(() => {
    if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
    activeInspectTargetRef.current = null;
    const cards = document.querySelectorAll('.post-card-minimal');
    cards.forEach(card => {
      card.classList.remove('dimmed');
    });
  }, []);

  // Direct DOM hover handlers for category group headers (250ms threshold)
  const handleCategoryMouseEnter = React.useCallback((e, categoryKey, groupTags = []) => {
    if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
    const targetKey = `cat_${categoryKey}`;
    activeInspectTargetRef.current = targetKey;

    inspectTimerRef.current = setTimeout(() => {
      if (activeInspectTargetRef.current !== targetKey) return;
      const validTagNames = new Set((groupTags || []).map(t => t.name));
      const catObj = getCategoryObj(categoryKey);
      const prefix = catObj?.prefix?.toLowerCase() || `${categoryKey.toLowerCase()}:`;

      const cards = document.querySelectorAll('.post-card-minimal');
      cards.forEach(card => {
        const cardTags = card.getAttribute('data-tags')?.split(' ') || [];
        const hasMatchingCategoryTag = cardTags.some(t => {
          if (validTagNames.has(t)) return true;
          const lower = t.toLowerCase();
          if (prefix && lower.startsWith(prefix)) return true;
          return getTagCategory(t) === categoryKey;
        });

        if (!hasMatchingCategoryTag) {
          card.classList.add('dimmed');
        } else {
          card.classList.remove('dimmed');
        }
      });
    }, 250);
  }, []);

  // Event delegation hover handlers for the grid container (250ms threshold)
  const handleGridMouseOver = React.useCallback((e) => {
    const card = e.target.closest('.post-card-minimal');
    if (!card) return;
    const postId = card.getAttribute('data-post-id');
    if (activeInspectTargetRef.current === postId) return;

    if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
    activeInspectTargetRef.current = postId;

    inspectTimerRef.current = setTimeout(() => {
      if (activeInspectTargetRef.current !== postId) return;
      const tagsAttr = card.getAttribute('data-tags') || '';
      const postTags = tagsAttr ? tagsAttr.split(' ').filter(Boolean) : [];
      setHoveredPostTags(postTags);
    }, 250);
  }, [setHoveredPostTags]);

  const handleGridMouseOut = React.useCallback((e) => {
    const toElement = e.relatedTarget;
    const card = toElement?.closest('.post-card-minimal');
    if (!card) {
      if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
      activeInspectTargetRef.current = null;
      setHoveredPostTags(null);
      document.querySelectorAll('.post-card-minimal').forEach(el => el.classList.remove('dimmed'));
      document.querySelectorAll('.sidebar-tag-item-dense').forEach(el => el.classList.remove('dimmed'));
    }
  }, [setHoveredPostTags]);

  const toggleSection = (categoryClass) => {
    setCollapsedSections(prev => ({
      ...prev,
      [categoryClass]: !prev[categoryClass]
    }));
  };

  const ensureTagsArray = (rawTags) => {
    if (!rawTags) return [];
    if (Array.isArray(rawTags)) return rawTags;
    if (typeof rawTags === 'string') {
      try {
        const parsed = JSON.parse(rawTags);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return rawTags.split(/[,;\s]+/).filter(Boolean);
      }
    }
    return [];
  };

  // Set of all tags present on the posts of the current active page
  const activePageTagsSet = useMemo(() => {
    const set = new Set();
    posts.forEach(post => {
      const postTags = ensureTagsArray(post.tags);
      postTags.forEach(tag => {
        if (tag && typeof tag === 'string') set.add(tag);
      });
    });
    return set;
  }, [posts]);

  // Group tags by the 8 taxonomy categories (excluding stats), filtered to show only tags present on the active page
  const subreddits = useMemo(() => tags.filter(t => t.category === 'subreddit' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);
  const copyrights = useMemo(() => tags.filter(t => t.category === 'copyright' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);
  const characters = useMemo(() => tags.filter(t => t.category === 'character' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);
  const artists = useMemo(() => tags.filter(t => t.category === 'artist' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);
  const flairs = useMemo(() => tags.filter(t => t.category === 'flair' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);
  const metas = useMemo(() => tags.filter(t => t.category === 'meta' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);
  const generalTags = useMemo(() => tags.filter(t => t.category === 'general' && activePageTagsSet.has(t.name)), [tags, activePageTagsSet]);

  // Map hovered post tag strings to tag objects with count & category details
  const hoveredPostTagsList = useMemo(() => {
    if (!hoveredPostTags) return [];
    
    const mapped = hoveredPostTags.map(tagName => {
      const existing = tags.find(t => t.name === tagName);
      if (existing) return existing;
      return {
        name: tagName,
        count: 0,
        category: getTagCategory(tagName)
      };
    });

    // Sort by taxonomy group: Subreddits -> Copyrights -> Characters -> Artists -> Flairs -> General -> Metas
    return [...mapped].sort((a, b) => {
      const order = { 
        subreddit: 0, 
        copyright: 1, 
        character: 2, 
        artist: 3, 
        flair: 4, 
        general: 5, 
        meta: 6 
      };
      const catA = a.category || 'general';
      const catB = b.category || 'general';
      return (order[catA] ?? 5) - (order[catB] ?? 5);
    });
  }, [hoveredPostTags, tags]);

  // Categorized tags for selected post detail modal
  const modalCategorizedTags = useMemo(() => {
    if (!selectedPost) return [];
    const postTags = ensureTagsArray(selectedPost.tags);
    if (postTags.length === 0) return [];

    const categoryOrder = [
      { key: 'subreddit', label: 'Subreddits' },
      { key: 'copyright', label: 'Copyrights / IP' },
      { key: 'character', label: 'Characters' },
      { key: 'artist', label: 'Artists / Creators' },
      { key: 'flair', label: 'Flairs' },
      { key: 'general', label: 'General Tags' },
      { key: 'meta', label: 'Metadata' }
    ];

    const grouped = {};
    categoryOrder.forEach(cat => { grouped[cat.key] = []; });

    postTags.forEach(tag => {
      const cat = getTagCategory(tag);
      if (grouped[cat]) {
        grouped[cat].push(tag);
      } else {
        grouped.general.push(tag);
      }
    });

    return categoryOrder
      .map(cat => ({
        label: cat.label,
        key: cat.key,
        tags: grouped[cat.key]
      }))
      .filter(group => group.tags.length > 0);
  }, [selectedPost]);

  // Derive active tags dynamically from current page posts
  useEffect(() => {
    if (!posts || posts.length === 0) {
      setTags([]);
      setLoadingTags(false);
      return;
    }

    const counts = {};
    posts.forEach(post => {
      const postTags = ensureTagsArray(post.tags);
      postTags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    const formatted = Object.keys(counts).map(tagName => ({
      name: tagName,
      count: counts[tagName],
      category: getTagCategory(tagName)
    })).sort((a, b) => b.count - a.count);

    setTags(formatted);
    setLoadingTags(false);
  }, [posts]);


  // Instant 0ms cached post fetching & background server sync
  const fetchPosts = async () => {
    if (!posts || posts.length === 0) {
      setLoadingPosts(true);
    }
    try {
      const { getPaginatedItems, getAllItems } = await import('../services/localDb');

      // 1. INSTANT 0ms In-Memory / Local SQLite Render
      const localResult = await getPaginatedItems({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        tags: activeFilters
      });

      if (localResult && localResult.posts) {
        setPosts(localResult.posts);
        setTotalFilteredCount(localResult.total);
        setLoadingPosts(false);
      }

      // 2. Silent Background Server Sync (0ms UI blocking, no state overwrite)
      const { checkServerHealth, fetchServerPosts, importServerPostsBatch } = await import('../services/api');
      checkServerHealth().then(async (isServerOnline) => {
        if (!isServerOnline) return;
        const allLocal = await getAllItems();
        if (allLocal && allLocal.length > 0) {
          const serverCheck = await fetchServerPosts({ page: 1, limit: 1 });
          if (!serverCheck || serverCheck.total < allLocal.length) {
            importServerPostsBatch(allLocal).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch (err) {
      console.error('Error fetching posts:', err);
      setLoadingPosts(false);
    }
  };



  const handleImportJsonFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const items = Array.isArray(json) ? json : (json.posts || []);
      const count = await importScrapedJsonArray(items);
      alert(`Successfully imported ${count} scraped posts into myatlas!`);
      fetchPosts();
    } catch (err) {
      console.error('Error parsing scraped JSON:', err);
      alert('Failed to parse JSON file. Ensure it is a valid array of scraped Reddit posts.');
    }
  };

  const handleIndexLocalDiskFiles = async () => {
    if (isDesktopApp()) {
      const selected = await selectLocalFiles({ multiple: true, title: 'Select Local Files' });
      if (selected) {
        const filePaths = Array.isArray(selected) ? selected : [selected];
        for (const fp of filePaths) {
          const fileName = fp.split(/[\\/]/).pop();
          const ext = fileName.split('.').pop().toLowerCase();
          await addLocalMediaFile({
            filePath: fp,
            fileName: fileName,
            format: ext,
            thumbnailUrl: fp
          });
        }
        alert(`Indexed ${filePaths.length} local file(s) into localatlas!`);
        fetchPosts();
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        for (const file of files) {
          const objectUrl = URL.createObjectURL(file);
          await addLocalMediaFile({
            filePath: file.name,
            fileName: file.name,
            format: file.name.split('.').pop().toLowerCase(),
            sizeBytes: file.size,
            thumbnailUrl: objectUrl
          });
        }
        alert(`Indexed ${files.length} local file(s) into localatlas!`);
        fetchPosts();
      };
      input.click();
    }
  };

  // Reset page index on active filter changes
  useEffect(() => {
    setCurrentPage(1);
    setHoveredPostTags(null);
  }, [activeFilters, currentAtlas]);

  // Fetch posts when filters, page indexes, saves, or currentAtlas update
  useEffect(() => {
    fetchPosts();
  }, [activeFilters, currentPage, savedPostIds, viewMode, currentAtlas]);


  const totalPages = Math.ceil(totalFilteredCount / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setHoveredPostTags(null);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // If near the end, adjust start page to show 5 pages if available
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // Sidebar Category Expand/Collapse state
  const [expandedSidebarCats, setExpandedSidebarCats] = useState(new Set());

  const toggleSidebarCat = (catKey) => {
    setExpandedSidebarCats(prev => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  // Render 1-click drill-down sidebar category tree
  const renderCategorizedSidebarTags = (tagList, isInspectMode = false) => {
    if (!tagList || tagList.length === 0) {
      return (
        <ul className="sidebar-tag-list-dense">
          <li className="sidebar-tag-item-dense empty-tag-placeholder" style={{ opacity: 0.5, fontStyle: 'italic', paddingLeft: '4px', pointerEvents: 'none' }}>
            {isInspectMode ? 'Hover over a post card to inspect tags' : 'No active tags on page'}
          </li>
        </ul>
      );
    }

    // Group active tags by Category Object (meta, atlas, r, artist, character, etc.)
    const categoryGroupsMap = new Map();
    tagList.forEach(tag => {
      const catObj = getCategoryObj(tag.name || tag.category);
      const groupKey = catObj.key || 'general';
      if (!categoryGroupsMap.has(groupKey)) {
        categoryGroupsMap.set(groupKey, {
          catObj,
          tags: []
        });
      }
      categoryGroupsMap.get(groupKey).tags.push(tag);
    });

    // Convert map to sorted array
    const categoryGroups = Array.from(categoryGroupsMap.values()).sort((a, b) => {
      return b.tags.length - a.tags.length || a.catObj.label.localeCompare(b.catObj.label);
    });

    return (
      <div className="sidebar-categories-tree">
        {categoryGroups.map((group, groupIdx) => {
          const { catObj, tags: groupTags } = group;
          const groupKey = (catObj && catObj.key) ? String(catObj.key).toLowerCase() : `group_${groupIdx}`;
          const hasActiveFilter = groupTags.some(t => activeFilters.includes(t.name));
          // In inspect mode on hover, auto-expand all categories applying to the hovered post!
          const isExpanded = isInspectMode || expandedSidebarCats.has(catObj.key) || hasActiveFilter;

          return (
            <div key={`${groupKey}_${groupIdx}`} className="sidebar-category-group">
              {/* Category Header Row */}
              <div 
                className={`sidebar-tag-item-dense category-header-row ${hasActiveFilter ? 'active' : ''}`}
                onClick={() => toggleSidebarCat(catObj.key)}
                onMouseEnter={(e) => handleCategoryMouseEnter(e, catObj.key, groupTags)}
                onMouseLeave={handleTagMouseLeave}
                style={{ 
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  backgroundColor: isExpanded ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                  marginBottom: '2px'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isExpanded ? (
                    <ChevronDown size={12} style={{ color: catObj.color }} />
                  ) : (
                    <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                  )}
                  <span 
                    style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: catObj.color,
                      flexShrink: 0,
                      display: 'inline-block' 
                    }} 
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {catObj.label}
                  </span>
                </span>
                <span className="sidebar-tag-count-dense" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  ({groupTags.length})
                </span>
              </div>

              {/* Drill-down Sub-tags List */}
              {isExpanded && (
                <ul className="sidebar-tag-list-dense" style={{ paddingLeft: '1rem', marginBottom: '6px', borderLeft: `2px solid ${catObj.color}35` }}>
                  {groupTags.map(tag => {
                    const isActive = activeFilters.includes(tag.name);
                    const displayName = getDisplayTagName(tag.name);

                    return (
                      <li 
                        key={tag.name} 
                        className={`sidebar-tag-item-dense ${isActive ? 'active' : ''}`}
                        data-tag={tag.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick(tag.name);
                        }}
                        onMouseEnter={(e) => handleTagMouseEnter(e, tag.name)}
                        onMouseLeave={handleTagMouseLeave}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span 
                            style={{ 
                              width: '4px', 
                              height: '4px', 
                              borderRadius: '50%', 
                              backgroundColor: catObj.color,
                              flexShrink: 0,
                              display: 'inline-block',
                              opacity: 0.7 
                            }} 
                          />
                          <span 
                            className={`sidebar-tag-link-dense ${isActive ? 'active' : ''}`}
                            style={isActive ? { color: catObj.color, fontWeight: 700 } : {}}
                          >
                            {isActive ? '✓ ' : ''}{displayName}
                          </span>
                        </span>
                        <span className="sidebar-tag-count-dense">({tag.count})</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  const hasActiveFiltersInMode = (modeIndex) => {
    return activeFilters.some(filter => {
      const cat = getTagCategory(filter);
      if (currentAtlas === 'toolatlas' || currentAtlas === 'wikiatlas') {
        if (modeIndex === 0) return cat === 'artist';
        if (modeIndex === 1) return cat === 'general';
        if (modeIndex === 2) return cat === 'flair' || cat === 'copyright';
        if (modeIndex === 3) return cat === 'meta';
      }
      if (modeIndex === 0) return cat === 'subreddit';
      if (modeIndex === 1) return cat === 'general';
      if (modeIndex === 2) return ['copyright', 'character', 'artist', 'flair'].includes(cat);
      if (modeIndex === 3) return cat === 'meta';
      return false;
    });
  };

  return (
    <div className="posts-layout">
      {/* Left Sidebar for tags (Classic Booru High Density) */}
      <aside className="sidebar-container-dense">
        {/* Stats and Reset */}
        <div className="sidebar-stats-panel">
          <div className="sidebar-stats-row">
            <span>
              {loadingPosts ? '···' : `${totalFilteredCount} posts`}
            </span>
            <button
              className="sidebar-reset-btn"
              onClick={onClearFilters}
              disabled={activeFilters.length === 0}
              title="Clear all filters"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {loadingTags ? (
          <div className="sidebar-tag-count-dense">Loading tags...</div>
        ) : (
          <>
            {hoveredPostTags ? (
              renderCategorizedSidebarTags(hoveredPostTagsList, true)
            ) : (
              renderCategorizedSidebarTags(tags.filter(t => activePageTagsSet.has(t.name)), false)
            )}
          </>
        )}

      </aside>

      <main className="gallery-container">
        {activeFilters.length > 0 && (
          <header className="gallery-header-minimal" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
            <div className="active-filters-row-minimal">
              {activeFilters.map(filter => {
                const catObj = getCategoryObj(filter);
                return (
                  <span 
                    key={filter} 
                    className="tag-badge-minimal"
                    style={{
                      backgroundColor: catObj.bg,
                      color: catObj.color,
                      borderColor: `${catObj.color}44`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => onTagClick(filter)}
                    title="Click to remove filter"
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: catObj.color }} />
                    {getDisplayTagName(filter)} 
                    <X size={10} style={{ marginLeft: '2px' }} />
                  </span>
                );
              })}
              <button className="clear-filters-btn-minimal" onClick={onClearFilters}>
                Clear
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Grid of Thumbnails */}
        {loadingPosts ? (
          <div className="gallery-grid-dense">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
              <div key={idx} className="post-card-skeleton">
                <div className="post-card-skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div 
              className="gallery-grid-dense"
              onMouseOver={handleGridMouseOver}
              onMouseOut={handleGridMouseOut}
            >
              {posts.map((post, idx) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  index={idx}
                  onPostClick={(selected) => {
                    setSelectedPost(selected);
                    setViewerMode('image');
                  }}
                  onRightClick={(selected) => {
                    setSelectedPost(selected);
                    setViewerMode('image');
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container-minimal">
                <button 
                  className="pagination-btn-minimal"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  &lt;&lt;
                </button>
                <button 
                  className="pagination-btn-minimal"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  &lt;
                </button>
                
                {renderPaginationButtons()}
                
                <button 
                  className="pagination-btn-minimal"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  &gt;
                </button>
                <button 
                  className="pagination-btn-minimal"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last Page"
                >
                  &gt;&gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results-minimal">
            No posts found.
          </div>
        )}
      </main>

      {/* Seamless Morphing Overlay Viewer (Grid Stays 100% Mounted in Background) */}
      {selectedPost && viewerMode !== 'none' && (
        <div className="tagger-fullscreen-overlay" onClick={handleCloseModal}>
          <div 
            className="tagger-fullscreen-content" 
            style={{ maxWidth: '98vw', maxHeight: '100%', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.5rem' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Control Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 0.5rem', position: 'relative' }}>
              {/* Left Item Counter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontWeight: 600 }}>
                  Item {currentPostIndex >= 0 ? currentPostIndex + 1 : 1} of {posts.length}
                </span>
              </div>

              {/* Centered Mode Switcher: Media vs Tags */}
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.35rem' }}>
                <button
                  className="tagger-settings-trigger"
                  style={{ backgroundColor: viewerMode === 'image' ? 'var(--bg-secondary)' : 'transparent', color: viewerMode === 'image' ? 'var(--accent-color)' : 'var(--text-secondary)', border: '1px solid ' + (viewerMode === 'image' ? 'var(--border-color)' : 'transparent') }}
                  onClick={() => setViewerMode('image')}
                  title="Media View (Tab / F)"
                >
                  <ImageIcon size={14} /> Media
                </button>
                <button
                  className="tagger-settings-trigger"
                  style={{ backgroundColor: viewerMode === 'tagger' ? 'var(--bg-secondary)' : 'transparent', color: viewerMode === 'tagger' ? 'var(--accent-color)' : 'var(--text-secondary)', border: '1px solid ' + (viewerMode === 'tagger' ? 'var(--border-color)' : 'transparent') }}
                  onClick={() => setViewerMode('tagger')}
                  title="Tags View (Tab / F)"
                >
                  <Tag size={14} /> Tags
                </button>
              </div>

              {/* Right Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {selectedPost.permalink && (
                  <a
                    href={selectedPost.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="tagger-settings-trigger"
                    style={{ color: 'var(--accent-color)', textDecoration: 'none' }}
                  >
                    View on Reddit ↗
                  </a>
                )}
                <button
                  className="tagger-settings-trigger"
                  onClick={handleCloseModal}
                  title="Return to Browse Grid (Esc)"
                >
                  <X size={14} /> Exit to Grid
                </button>
              </div>
            </div>

            {/* Main Stage: Morphing Media Display & Dynamic Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative', overflow: 'hidden', padding: '0.25rem 0' }}>
              {/* Prev Arrow */}
              <button
                className="tagger-settings-trigger"
                onClick={handlePrevPost}
                disabled={currentPostIndex <= 0}
                style={{ position: 'absolute', left: '1rem', top: '45%', transform: 'translateY(-50%)', zIndex: 10, borderRadius: '50%', width: '42px', height: '42px', padding: 0, justifyContent: 'center', opacity: currentPostIndex <= 0 ? 0.25 : 0.85 }}
                title="Previous Item (ArrowLeft / `)"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Morphing Media Element */}
              {(() => {
                const allTags = Array.isArray(selectedPost.tags) ? selectedPost.tags : [];
                const isVideo = allTags.includes('meta:format:video') || 
                                allTags.includes('meta:extension:mp4') || 
                                allTags.includes('meta:extension:webm') || 
                                allTags.includes('meta:extension:mov') || 
                                (selectedPost.filePath && selectedPost.filePath.match(/\.(mp4|webm|mov|mkv|avi)$/i)) || 
                                (selectedPost.url && selectedPost.url.match(/\.(mp4|webm|mov|mkv|avi)$/i));

                const isTagger = viewerMode === 'tagger';
                const mediaStyle = {
                  maxHeight: isTagger ? '180px' : '60vh',
                  maxWidth: isTagger ? '240px' : '88vw',
                  objectFit: isTagger ? 'cover' : 'contain',
                  borderRadius: '8px',
                  boxShadow: isTagger ? '0 4px 16px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                };

                if (isVideo) {
                  const streamUrl = selectedPost.id ? `http://127.0.0.1:7171/api/stream/${encodeURIComponent(selectedPost.id)}` : formatLocalAssetUrl(selectedPost.filePath || selectedPost.url);
                  const fallbackUrl = formatLocalAssetUrl(selectedPost.filePath || selectedPost.url);
                  const activeSrc = modalImageError ? fallbackUrl : streamUrl;

                  return (
                    <video 
                      src={activeSrc} 
                      style={mediaStyle}
                      controls={!isTagger}
                      autoPlay
                      loop
                      muted={isTagger}
                      playsInline
                      onError={() => setModalImageError(true)}
                      onClick={() => setViewerMode(prev => prev === 'image' ? 'tagger' : 'image')}
                      title={isTagger ? "Click to expand to Full Image" : "Click to shrink to Speed Tagger"}
                    />
                  );
                }

                const fullImgSrc = modalImageError 
                  ? formatLocalAssetUrl(selectedPost.filePath || selectedPost.url || selectedPost.thumbnail) 
                  : (selectedPost.url || formatLocalAssetUrl(selectedPost.filePath || selectedPost.thumbnail));

                return (
                  <img 
                    src={fullImgSrc} 
                    alt={selectedPost.title || ''} 
                    style={mediaStyle} 
                    referrerPolicy="no-referrer"
                    onError={() => setModalImageError(true)}
                    onClick={() => setViewerMode(prev => prev === 'image' ? 'tagger' : 'image')}
                    title={isTagger ? "Click to expand to Full Image" : "Click to shrink to Speed Tagger"}
                  />
                );
              })()}

              {/* Next Arrow */}
              <button
                className="tagger-settings-trigger"
                onClick={handleNextPost}
                disabled={currentPostIndex >= posts.length - 1}
                style={{ position: 'absolute', right: '1rem', top: '45%', transform: 'translateY(-50%)', zIndex: 10, borderRadius: '50%', width: '42px', height: '42px', padding: 0, justifyContent: 'center', opacity: currentPostIndex >= posts.length - 1 ? 0.25 : 0.85 }}
                title="Next Item (ArrowRight / Enter)"
              >
                <ChevronRight size={22} />
              </button>

              {/* Dynamic Content Below Media */}
              {viewerMode === 'tagger' ? (
                <MorphingTaggerPanel
                  currentPost={selectedPost}
                  onTagsSaved={(postId, newTags) => {
                    if (postId && newTags) {
                      setPosts(prev => prev.map(p => p.id === postId ? { ...p, tags: newTags } : p));
                      setSelectedPost(prev => prev && prev.id === postId ? { ...prev, tags: newTags } : prev);
                    }
                    fetchPosts();
                  }}
                  onAdvanceNext={handleNextPost}
                  onRegressPrev={handlePrevPost}
                  onSkip={handleNextPost}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', textAlign: 'center', maxWidth: '850px', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {selectedPost.subreddit ? `r/${selectedPost.subreddit}` : 'Local Media'}
                  </span>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                    {selectedPost.title || selectedPost.fileName || ''}
                  </h3>
                </div>
              )}
            </div>

            {/* Bottom Integrated 40-Item Queue Timeline */}
            <div style={{ width: '100%', maxWidth: '1000px' }}>
              <QueueTimeline
                posts={posts}
                currentIndex={currentPostIndex >= 0 ? currentPostIndex : 0}
                onSelectIndex={(idx) => setSelectedPost(posts[idx])}
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

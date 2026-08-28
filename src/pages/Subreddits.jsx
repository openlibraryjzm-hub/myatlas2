import React, { useState, useEffect } from 'react';
import { Database, Trash2, Glasses, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalScrapes, getLocalMediaFiles } from '../services/localDb';
import './Subreddits.css';

export default function Subreddits({ onSubredditClick }) {
  const [subreddits, setSubreddits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarMode, setSidebarMode] = useState(0); // 0: Subreddits, 1: General Tags, 2: Copyright/Characters/Artists/Flairs, 3: Metadata
  const [inspectMode, setInspectMode] = useState(false);

  const ITEMS_PER_PAGE = 40;

  const placeholderTags = {
    subreddits: [
      { name: 'r/wallpaper', count: 124, category: 'subreddit' },
      { name: 'r/ImaginarySliceOfLife', count: 86, category: 'subreddit' },
      { name: 'r/digitalart', count: 52, category: 'subreddit' },
      { name: 'r/art', count: 31, category: 'subreddit' },
    ],
    general: [
      { name: 'scenery', count: 72, category: 'general' },
      { name: 'illustration', count: 45, category: 'general' },
      { name: 'cyberpunk', count: 31, category: 'general' },
      { name: 'isometric', count: 18, category: 'general' },
      { name: 'nature', count: 15, category: 'general' },
    ],
    mixed: [
      { name: 'copyright:original', count: 64, category: 'copyright' },
      { name: 'copyright:sekiro', count: 14, category: 'copyright' },
      { name: 'character:wolf', count: 14, category: 'character' },
      { name: 'artist:kyacchan', count: 21, category: 'artist' },
      { name: 'artist:mox', count: 12, category: 'artist' },
      { name: 'flair:digital', count: 98, category: 'flair' },
      { name: 'flair:oc', count: 47, category: 'flair' },
    ],
    meta: [
      { name: 'meta:format:image', count: 198, category: 'meta' },
      { name: 'meta:format:video', count: 12, category: 'meta' },
      { name: 'meta:extension:png', count: 142, category: 'meta' },
      { name: 'meta:extension:mp4', count: 12, category: 'meta' },
    ]
  };

  const fetchSubreddits = async () => {
    setLoading(true);
    try {
      const [scrapes, media] = await Promise.all([
        getLocalScrapes(),
        getLocalMediaFiles()
      ]);
      const allItems = [...scrapes, ...media];

      const subMap = {};
      allItems.forEach(item => {
        let sub = item.subreddit;
        if (!sub && Array.isArray(item.tags)) {
          const subTag = item.tags.find(t => typeof t === 'string' && t.startsWith('r/'));
          if (subTag) sub = subTag.replace(/^r\//, '');
        }
        if (sub) {
          if (!subMap[sub]) {
            subMap[sub] = { name: sub, count: 0, totalScore: 0, newestPost: null };
          }
          subMap[sub].count += 1;
          subMap[sub].totalScore += (item.score || 0);
        }
      });

      const list = Object.values(subMap).sort((a, b) => b.count - a.count);
      setSubreddits(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching local subreddits:', err);
      setSubreddits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubreddits();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedSubreddit(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalPages = Math.ceil(subreddits.length / ITEMS_PER_PAGE);
  const paginatedSubreddits = subreddits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

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

  const handleDeleteSubreddit = async (subredditName) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete all posts from r/${subredditName}? This action cannot be undone.`);
    if (!confirmed) return false;

    try {
      const { getLocalDb } = await import('../services/localDb');
      const db = await getLocalDb();
      if (db) {
        await db.execute('DELETE FROM local_scrapes WHERE subreddit = $1', [subredditName]);
      }
      fetchSubreddits();
      return true;
    } catch (err) {
      console.error('Error deleting local subreddit items:', err.message);
      alert(`Failed to delete subreddit: ${err.message}`);
      return false;
    }
  };

  const renderSimpleTagList = (tagList, categoryClass) => {
    return (
      <ul className="sidebar-tag-list-dense">
        {tagList.map(tag => {
          const itemClass = categoryClass || tag.category;
          let displayName = tag.name;
          if (tag.name.startsWith('r/')) {
            displayName = tag.name.substring(2);
          } else if (tag.name.includes(':')) {
            displayName = tag.name.split(':').pop();
          }
          return (
            <li 
              key={tag.name} 
              className="sidebar-tag-item-dense"
              style={{ cursor: 'default' }}
            >
              <span className={`sidebar-tag-link-dense ${itemClass}`}>
                {displayName}
              </span>
              <span className="sidebar-tag-count-dense">({tag.count})</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="posts-layout">
      {/* Left Sidebar with placeholder tags */}
      <aside className="sidebar-container-dense">
        {/* Inspector Mode */}
        <div className="sidebar-control-panel-compact">
          <div className="sidebar-control-group">
            <div className="sidebar-segmented-control" style={{ position: 'relative' }}>
              <Glasses 
                size={12} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: inspectMode ? 'var(--accent-color)' : 'var(--text-tertiary)',
                  transition: 'var(--transition-smooth)',
                  zIndex: 2
                }}
              />
              <button
                className={`sidebar-segmented-btn ${inspectMode ? 'active' : ''}`}
                onClick={() => setInspectMode(true)}
                style={{ paddingLeft: '14px' }}
              >
                on
              </button>
              <button
                className={`sidebar-segmented-btn ${!inspectMode ? 'active' : ''}`}
                onClick={() => setInspectMode(false)}
              >
                off
              </button>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="sidebar-mode-selector">
          <button 
            className="sidebar-mode-arrow"
            onClick={() => setSidebarMode(prev => (prev - 1 + 4) % 4)}
            aria-label="Previous Mode"
            title="Previous Mode"
          >
            <ChevronLeft size={12} />
          </button>
          <div className="sidebar-mode-dots" title="Switch Sidebar Mode">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="sidebar-mode-square-wrapper">
                <button
                  className={`sidebar-mode-square ${sidebarMode === idx ? 'active' : ''}`}
                  onClick={() => setSidebarMode(idx)}
                  aria-label={`Switch sidebar to mode ${idx + 1}`}
                  title={[
                    "Subreddits",
                    "Tags",
                    "Copyright, Characters, Artists, Flairs",
                    "Metadata"
                  ][idx]}
                />
              </div>
            ))}
          </div>
          <button 
            className="sidebar-mode-arrow"
            onClick={() => setSidebarMode(prev => (prev + 1) % 4)}
            aria-label="Next Mode"
            title="Next Mode"
          >
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Stats and Reset */}
        <div className="sidebar-stats-panel">
          <div className="sidebar-stats-row">
            <span>
              {loading ? '···' : `${subreddits.length} subs`}
            </span>
            <button
              className="sidebar-reset-btn"
              disabled={true}
              title="Clear all filters"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Render placeholder list */}
        {sidebarMode === 0 && renderSimpleTagList(placeholderTags.subreddits, "subreddit")}
        {sidebarMode === 1 && renderSimpleTagList(placeholderTags.general, "general")}
        {sidebarMode === 2 && renderSimpleTagList(placeholderTags.mixed)}
        {sidebarMode === 3 && renderSimpleTagList(placeholderTags.meta, "meta")}
      </aside>

      <main className="gallery-container">
        {loading ? (
          <div className="subreddits-loading">Loading subreddits list...</div>
        ) : subreddits.length === 0 ? (
          <div className="subreddits-empty">No subreddits indexed in the database.</div>
        ) : (
          <>
            <div className="gallery-grid-dense">
              {paginatedSubreddits.map(sub => {
                return (
                  <article 
                    key={sub.name} 
                    className="post-card-minimal subreddit-card-minimal"
                    onClick={() => setSelectedSubreddit(sub)}
                  >
                    <div className="post-card-preview-pattern" />
                    <div className="subreddit-card-content">
                      <div className="reddit-logo-container">
                        <RedditIcon size={32} />
                      </div>
                      <span className="subreddit-card-title">r/{sub.name}</span>
                    </div>
                    
                    {/* Elegant Hover Info Overlay */}
                    <div className="post-card-hover-overlay">
                      <span className="post-card-hover-id">{sub.count} posts</span>
                      <span className="post-card-hover-sub">View Details ↗</span>
                    </div>
                  </article>
                );
              })}
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
        )}
      </main>

      {/* Subreddit Details Modal */}
      {selectedSubreddit && (
        <div className="post-modal-backdrop" onClick={() => setSelectedSubreddit(null)}>
          <div className="post-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="post-modal-close-btn" onClick={() => setSelectedSubreddit(null)}>&times;</button>
            
            <div className="post-modal-content">
              {/* Media Preview Column */}
              <div className="post-modal-media-column">
                <div className="post-card-minimal subreddit-card-minimal preview-card">
                  <div className="post-card-preview-pattern" />
                  <div className="subreddit-card-content">
                    <div className="reddit-logo-container">
                      <RedditIcon size={32} />
                    </div>
                    <span className="subreddit-card-title">r/{selectedSubreddit.name}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Metadata Column */}
              <div className="post-modal-info-column">
                <h2 className="post-modal-title">r/{selectedSubreddit.name}</h2>
                
                {onSubredditClick && (
                  <button 
                    className="subreddit-modal-browse-btn"
                    onClick={() => {
                      onSubredditClick(`r/${selectedSubreddit.name}`);
                      setSelectedSubreddit(null);
                    }}
                  >
                    Browse Posts ↗
                  </button>
                )}
                
                <div className="post-modal-stats-section">
                  <h4 className="post-modal-section-title">Statistics</h4>
                  <div className="post-modal-stats-grid">
                    <div className="post-modal-stat-item">
                      <span className="stat-label">Total Posts</span>
                      <span className="stat-value">{selectedSubreddit.count}</span>
                    </div>
                    <div className="post-modal-stat-item">
                      <span className="stat-label">Avg Score</span>
                      <span className="stat-value">
                        {(selectedSubreddit.count > 0 
                          ? Math.round(selectedSubreddit.totalScore / selectedSubreddit.count) 
                          : 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="post-modal-stat-item" style={{ gridColumn: 'span 2' }}>
                      <span className="stat-label">Newest Post</span>
                      <span className="stat-value">
                        {selectedSubreddit.newestPost 
                          ? selectedSubreddit.newestPost.toLocaleDateString(undefined, { dateStyle: 'medium' })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="subreddit-modal-danger-section">
                  <h4 className="post-modal-section-title danger-title">Danger Zone</h4>
                  <p className="danger-text">Permanently delete all posts scraped from this subreddit.</p>
                  <button 
                    className="subreddit-modal-delete-btn"
                    onClick={async () => {
                      const success = await handleDeleteSubreddit(selectedSubreddit.name);
                      if (success) {
                        setSelectedSubreddit(null);
                      }
                    }}
                  >
                    Delete Subreddit Posts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RedditIcon({ size = 24, className, style }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      width={size} 
      height={size}
      className={className}
      style={style}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/>
    </svg>
  );
}


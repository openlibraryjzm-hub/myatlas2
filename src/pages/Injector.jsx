import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layers, PlusCircle, Search, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { getAllItems, bulkInjectTagToFilter, parseTagsList } from '../services/localDb';
import { formatLocalAssetUrl, getOptimizedThumbnailUrl } from '../utils/localFiles';
import { getCategoryObj, getDisplayTagName } from '../data/mockData';
import './Injector.css';

export default function Injector({ isReadOnly = false, onNavigatePosts }) {
  const [allPosts, setAllPosts] = useState([]);
  const [targetTag, setTargetTag] = useState('');
  const [tagToInject, setTagToInject] = useState('');
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);

  const targetInputRef = useRef(null);
  const injectInputRef = useRef(null);

  // Load all items & extract available tags dictionary
  const loadData = async () => {
    setLoading(true);
    try {
      const posts = await getAllItems(true);
      setAllPosts(posts);
    } catch (err) {
      console.error('Error loading items for Injector:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute tag dictionary for autocomplete
  const tagDictionary = useMemo(() => {
    const counts = {};
    allPosts.forEach(p => {
      parseTagsList(p.tags).forEach(t => {
        if (t) counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(t => ({
        name: t,
        display: getDisplayTagName(t),
        count: counts[t]
      }))
      .sort((a, b) => b.count - a.count);
  }, [allPosts]);

  // Autocomplete suggestions for target tag input
  const targetSuggestions = useMemo(() => {
    const query = targetTag.trim().toLowerCase();
    if (!query) return [];
    return tagDictionary
      .filter(t => t.name.toLowerCase().includes(query) || t.display.toLowerCase().includes(query))
      .slice(0, 7);
  }, [targetTag, tagDictionary]);

  // Compute matching posts for the target tag
  const matchingPosts = useMemo(() => {
    const query = targetTag.trim().toLowerCase();
    if (!query) return [];
    return allPosts.filter(p => {
      const tags = parseTagsList(p.tags);
      return tags.some(t => {
        const lower = String(t).toLowerCase();
        return lower === query || lower.startsWith(`${query}:`) || lower.startsWith(query);
      });
    });
  }, [targetTag, allPosts]);

  // Clean target selection helper
  const handleSelectTargetSuggestion = (tagObj) => {
    setTargetTag(tagObj.name);
    setShowTargetSuggestions(false);
    setSelectedSuggestionIndex(-1);
    if (injectInputRef.current) {
      injectInputRef.current.focus();
    }
  };

  // Keyboard navigation for target autocomplete
  const handleTargetKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (targetSuggestions.length > 0) {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % targetSuggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (targetSuggestions.length > 0) {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + targetSuggestions.length) % targetSuggestions.length);
      }
    } else if (e.key === 'Enter') {
      if (targetSuggestions.length > 0 && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSelectTargetSuggestion(targetSuggestions[selectedSuggestionIndex]);
      } else if (targetTag.trim() && injectInputRef.current) {
        e.preventDefault();
        injectInputRef.current.focus();
      }
    } else if (e.key === 'Escape') {
      setShowTargetSuggestions(false);
    }
  };

  // Execute bulk tag injection
  const handleExecuteInject = async (e) => {
    if (e) e.preventDefault();
    if (!targetTag.trim() || !tagToInject.trim() || matchingPosts.length === 0 || executing || isReadOnly) return;

    setExecuting(true);
    setStatusMessage(null);

    const cleanTarget = targetTag.trim();
    const cleanInject = tagToInject.trim().toLowerCase().replace(/\s+/g, '_');

    try {
      const count = await bulkInjectTagToFilter(cleanTarget, cleanInject);
      setStatusMessage({
        type: 'success',
        text: `Successfully injected tag "${cleanInject}" into ${count} item(s) matching "${cleanTarget}".`
      });
      setTagToInject('');
      await loadData();
    } catch (err) {
      console.error('Error injecting tag:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to inject tag: ${err.message}`
      });
    } finally {
      setExecuting(false);
    }
  };

  const injectCatObj = getCategoryObj(tagToInject);

  return (
    <div className="injector-container">
      {/* Centered Sleek Header */}
      <div className="injector-header">
        <div className="injector-icon-badge">
          <Layers size={22} style={{ color: 'var(--accent-color)' }} />
        </div>
        <h1 className="injector-title">bulk tag injector</h1>
        <p className="injector-subtitle">
          Filter target media items by tag and append a new namespace tag across all matches in 1 click.
        </p>
      </div>

      {/* Main Dual Form Box */}
      <div className="injector-card">
        <form onSubmit={handleExecuteInject}>
          {/* Input Row 1: Target Tag Query */}
          <div className="injector-field-group">
            <label className="injector-label">
              <span>1. Target Match Tag</span>
              {matchingPosts.length > 0 && (
                <span className="injector-match-badge">{matchingPosts.length} items found</span>
              )}
            </label>
            <div className="injector-input-wrapper">
              <Search size={16} className="injector-input-icon" />
              <input
                ref={targetInputRef}
                type="text"
                className="injector-input"
                placeholder="Type tag to match (e.g. navy_ship, r/wallpapers, folder:scifi)"
                value={targetTag}
                onChange={(e) => {
                  setTargetTag(e.target.value);
                  setShowTargetSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                  setStatusMessage(null);
                }}
                onFocus={() => setShowTargetSuggestions(true)}
                onKeyDown={handleTargetKeyDown}
                autoFocus
              />
              {targetTag && (
                <button
                  type="button"
                  className="injector-clear-btn"
                  onClick={() => {
                    setTargetTag('');
                    setTagToInject('');
                    setStatusMessage(null);
                  }}
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}

              {/* Target Autocomplete Suggestions */}
              {showTargetSuggestions && targetSuggestions.length > 0 && (
                <div className="injector-suggestions-popover">
                  {targetSuggestions.map((sug, idx) => (
                    <div
                      key={sug.name}
                      className={`injector-suggestion-item ${idx === selectedSuggestionIndex ? 'active' : ''}`}
                      onClick={() => handleSelectTargetSuggestion(sug)}
                    >
                      <span className="injector-sug-name">{sug.name}</span>
                      <span className="injector-sug-count">{sug.count} posts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Matching Media Preview Strip */}
          {targetTag.trim() && (
            <div className="injector-preview-section">
              {matchingPosts.length > 0 ? (
                <>
                  <div className="injector-preview-label">
                    Matching Preview ({Math.min(matchingPosts.length, 5)} of {matchingPosts.length}):
                  </div>
                  <div className="injector-preview-strip">
                    {matchingPosts.slice(0, 5).map((item) => {
                      const thumbUrl = getOptimizedThumbnailUrl(item) || formatLocalAssetUrl(item.mediaUrl || item.url || item.filePath);
                      return (
                        <div key={item.id} className="injector-preview-thumb-box" title={item.title || item.fileName || item.id}>
                          <img src={thumbUrl} alt="" className="injector-preview-thumb" />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="injector-no-matches">
                  No media items found matching "{targetTag.trim()}".
                </div>
              )}
            </div>
          )}

          {/* Input Row 2: Tag to Inject */}
          <div className="injector-field-group" style={{ marginTop: '1.25rem' }}>
            <label className="injector-label">
              <span>2. Tag to Inject / Append</span>
              {tagToInject.trim() && (
                <span
                  className="injector-cat-preview-pill"
                  style={{ color: injectCatObj.color, backgroundColor: injectCatObj.bg }}
                >
                  {injectCatObj.label}: {getDisplayTagName(tagToInject.trim())}
                </span>
              )}
            </label>
            <div className="injector-input-wrapper">
              <PlusCircle size={16} className="injector-input-icon" style={{ color: injectCatObj.color }} />
              <input
                ref={injectInputRef}
                type="text"
                className="injector-input"
                placeholder="Type tag to append (e.g. military, creator:artist, work:game)"
                value={tagToInject}
                onChange={(e) => {
                  setTagToInject(e.target.value);
                  setStatusMessage(null);
                }}
              />
              {tagToInject && (
                <button
                  type="button"
                  className="injector-clear-btn"
                  onClick={() => setTagToInject('')}
                  title="Clear tag input"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div className={`injector-status-banner ${statusMessage.type}`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="injector-action-row">
            <button
              type="submit"
              className="injector-submit-btn"
              disabled={!targetTag.trim() || !tagToInject.trim() || matchingPosts.length === 0 || executing || isReadOnly}
            >
              {executing ? (
                <>
                  <RefreshCw size={16} className="spin" /> Injecting Tags...
                </>
              ) : (
                <>
                  <PlusCircle size={16} /> Inject Tag to {matchingPosts.length} Items
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

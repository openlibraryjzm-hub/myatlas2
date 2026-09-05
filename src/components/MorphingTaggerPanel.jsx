import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, RefreshCw, AlertCircle, Pencil, Eye } from 'lucide-react';
import { getTagCategory, getDisplayTagName, getActiveCategories, getCategoryObj, parseTagsArray } from '../data/mockData';
import { getLocalScrapes, getLocalMediaFiles, getLocalDb, updateItemTags, invalidateItemsCache } from '../services/localDb';

export default function MorphingTaggerPanel({
  currentPost,
  onTagsSaved,
  onAdvanceNext,
  onRegressPrev,
  onSkip,
  onTagClick,
  isEditing: isEditingProp = false
}) {
  const namespaces = getActiveCategories();

  const [stagedTags, setStagedTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(isEditingProp);

  useEffect(() => {
    setIsEditing(isEditingProp);
  }, [isEditingProp]);

  // Command Mode States
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

  // Notification State
  const [saveStatus, setSaveStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef(null);

  // Autocomplete Suggestions States
  const [tagDictionary, setTagDictionary] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Load tag dictionary for instant in-memory autocomplete
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const db = await getLocalDb();
        if (!db) return;
        const [scrapes, media] = await Promise.all([getLocalScrapes(), getLocalMediaFiles()]);
        const allItems = [...scrapes, ...media];
        const counts = {};
        allItems.forEach(item => {
          const itemTags = parseTagsArray(item.tags);
          itemTags.forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
          });
        });
        const formatted = Object.keys(counts).map(tagName => ({
          name: tagName,
          display: getDisplayTagName(tagName),
          category: getTagCategory(tagName),
          count: counts[tagName]
        })).sort((a, b) => b.count - a.count);
        setTagDictionary(formatted);
      } catch (e) {
        console.error('Error loading tag dictionary for autocomplete:', e);
      }
    };
    loadDictionary();
  }, []);

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query || query.length < 1) return [];

    return tagDictionary
      .filter(t => {
        if (stagedTags.includes(t.name) || existingTags.includes(t.name)) return false;
        const rawLower = t.name.toLowerCase();
        const displayLower = (t.display || '').toLowerCase();
        return rawLower.includes(query) || displayLower.includes(query);
      })
      .slice(0, 8);
  }, [inputValue, tagDictionary, stagedTags, existingTags]);

  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [suggestions]);

  // Reset when post changes
  useEffect(() => {
    if (currentPost) {
      setExistingTags(parseTagsArray(currentPost.tags));
      setStagedTags([]);
      setInputValue('');
      setSaveStatus('idle');
      setSelectedTagIndex(0);
      setIsEditing(false);
    }
  }, [currentPost]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (inputRef.current && isEditing && !isCommandMode) {
      inputRef.current.focus();
    }
  }, [currentPost, isEditing, isCommandMode]);

  const normalizeTag = (tagStr, prefix) => {
    let clean = tagStr.trim().toLowerCase();
    if (!clean) return '';

    const registeredPrefixes = namespaces.map(n => n.prefix).filter(Boolean);
    const hasPrefix = registeredPrefixes.some(p => clean.startsWith(p)) || clean.startsWith('u/') || clean.startsWith('qid:');

    if (!hasPrefix && prefix) {
      clean = prefix + clean;
    }

    const colonIndex = clean.indexOf(':');
    const slashIndex = clean.indexOf('/');
    
    if (colonIndex !== -1) {
      const pref = clean.substring(0, colonIndex + 1);
      const name = clean.substring(colonIndex + 1);
      return pref + name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    } else if (slashIndex !== -1 && clean.startsWith('r/')) {
      const pref = 'r/';
      const name = clean.substring(2);
      return pref + name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    } else {
      return clean.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    }
  };

  const addStagedTag = (tagStr) => {
    const normalized = normalizeTag(tagStr, '');
    if (normalized && !stagedTags.includes(normalized) && !existingTags.includes(normalized)) {
      setStagedTags(prev => [...prev, normalized]);
    }
  };

  const selectSuggestion = (suggestion) => {
    if (!suggestion) return;
    addStagedTag(suggestion.name);
    setInputValue('');
    setSelectedSuggestionIndex(-1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/`/g, '');
    if (val.endsWith(',')) {
      const tagText = val.slice(0, -1).trim();
      if (tagText) {
        addStagedTag(tagText);
      }
      setInputValue('');
    } else {
      setInputValue(val);
    }
  };

  const removeStagedTag = (tagToRemove) => {
    setStagedTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const removeExistingTag = (tagToRemove) => {
    setExistingTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const saveAndNext = async () => {
    if (!currentPost) return;
    setSaveStatus('saving');
    
    const draftTags = [];
    const val = inputValue.trim();
    if (val) {
      const normalized = normalizeTag(val, '');
      if (normalized) draftTags.push(normalized);
    }

    const combinedStaged = [...stagedTags, ...draftTags];
    const finalTags = Array.from(new Set([...existingTags, ...combinedStaged]));
    
    try {
      await updateItemTags(currentPost.id, finalTags);
      invalidateItemsCache();

      setSaveStatus('success');
      setStagedTags([]);
      setInputValue('');

      if (onTagsSaved) onTagsSaved(currentPost.id, finalTags);

      setTimeout(() => {
        if (onAdvanceNext) onAdvanceNext();
      }, 250);
    } catch (err) {
      console.error('Error saving tags:', err.message);
      setErrorMessage(err.message);
      setSaveStatus('error');
    }
  };

  const getSortedTags = () => {
    const allTagsList = [
      ...existingTags.map(tag => ({ tag, type: 'existing' })),
      ...stagedTags.map(tag => ({ tag, type: 'staged' }))
    ];

    return allTagsList.sort((a, b) => {
      const catA = getTagCategory(a.tag);
      const catB = getTagCategory(b.tag);
      const indexA = namespaces.findIndex(ns => ns.key === catA);
      const indexB = namespaces.findIndex(ns => ns.key === catB);
      return indexA - indexB;
    });
  };

  // Keyboard navigation & typing handlers
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === '`' || e.code === 'Backquote') {
        e.preventDefault();
        if (onRegressPrev) onRegressPrev();
        return;
      }

      if (document.activeElement === inputRef.current) {
        if (e.key === 'ArrowDown') {
          if (suggestions.length > 0) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
          }
          return;
        }
        if (e.key === 'ArrowUp') {
          if (suggestions.length > 0) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          }
          return;
        }
        if (e.key === 'Tab') {
          if (suggestions.length > 0) {
            e.preventDefault();
            const targetIdx = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
            selectSuggestion(suggestions[targetIdx]);
            return;
          }
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (suggestions.length > 0 && selectedSuggestionIndex >= 0) {
            selectSuggestion(suggestions[selectedSuggestionIndex]);
          } else {
            saveAndNext();
          }
          return;
        }
        if (e.key === 'Escape') {
          if (inputValue.trim()) {
            e.preventDefault();
            setInputValue('');
            setSelectedSuggestionIndex(-1);
          } else if (onSkip) {
            onSkip();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inputValue, suggestions, selectedSuggestionIndex, currentPost]);

  if (!currentPost) return null;

  const currentCatObj = getCategoryObj(inputValue);
  const activeInputCategoryColor = currentCatObj ? currentCatObj.color : '#facc15';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', width: '100%', maxWidth: '750px', margin: '0.5rem auto 0 auto' }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--accent-color)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {currentPost.subreddit && currentPost.subreddit !== 'localatlas' ? (currentPost.subreddit.startsWith('r/') ? currentPost.subreddit : `r/${currentPost.subreddit}`) : 'Local File'}
        </span>
        <h3 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 600, margin: '2px 0 0 0' }}>
          {currentPost.title || currentPost.fileName || 'Untitled Item'}
        </h3>
      </div>

      {/* Comma Separated Tags Line & Caret Input */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.35rem 0.2rem', width: '100%', minHeight: '40px' }}>
        {getSortedTags().map(({ tag, type }) => {
          const catObj = getCategoryObj(tag);
          const isStaged = type === 'staged';
          return (
            <span key={tag} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: catObj.bg,
                  color: catObj.color,
                  borderColor: `${catObj.color}44`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: isStaged ? '1px dashed currentColor' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onClick={() => {
                  if (isEditing) {
                    isStaged ? removeStagedTag(tag) : removeExistingTag(tag);
                  } else if (onTagClick) {
                    onTagClick(tag);
                  }
                }}
                title={isEditing ? (isStaged ? 'Click to remove staged tag' : 'Click to delete tag') : 'Click to filter grid by this tag'}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: catObj.color }} />
                {getDisplayTagName(tag)}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', marginRight: '0.2rem', userSelect: 'none' }}>, </span>
            </span>
          );
        })}

        {/* Inline Caret Input & Autocomplete when in Edit Mode */}
        {isEditing && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={existingTags.length === 0 && stagedTags.length === 0 ? "type tag... (comma to stage)" : "add tag..."}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: activeInputCategoryColor,
                fontSize: '1.05rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                caretColor: '#facc15',
                padding: '2px 8px',
                borderRadius: '4px',
                width: `${Math.max(12, (inputValue.length || 10) * 1.15)}ch`,
                transition: 'color 0.15s ease'
              }}
            />

            {/* Autocomplete Popover */}
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e1d1b', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', minWidth: '220px', zIndex: 100, padding: '4px' }}>
                {suggestions.map((sugg, sIdx) => {
                  const suggCat = getCategoryObj(sugg.name);
                  const isHighlight = sIdx === selectedSuggestionIndex;
                  return (
                    <div
                      key={sugg.name}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', backgroundColor: isHighlight ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
                      onClick={() => selectSuggestion(sugg)}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: suggCat.color }} />
                      <span style={{ flex: 1, color: suggCat.color, textAlign: 'left' }}>{sugg.display}</span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)' }}>({sugg.count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hints & Save Status */}
      {isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>,</kbd> Stage</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>ENTER</kbd> Save & Next</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>ESC</kbd> Skip</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>`</kbd> Prev</span>

          {saveStatus === 'saving' && <span style={{ color: '#facc15' }}><RefreshCw size={12} className="animate-spin" /> Saving...</span>}
          {saveStatus === 'success' && <span style={{ color: '#22c55e' }}><Check size={12} /> Saved!</span>}
          {saveStatus === 'error' && <span style={{ color: '#ef4444' }}><AlertCircle size={12} /> Error</span>}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tag, HelpCircle, Check, RefreshCw, AlertCircle, Settings, Maximize2 } from 'lucide-react';
import { getTagCategory, getDisplayTagName, getActiveCategories, getCategoryObj } from '../data/mockData';
import { getLocalScrapes, getLocalMediaFiles, getLocalDb, updateItemTags, invalidateItemsCache, getPaginatedItems } from '../services/localDb';
import { formatLocalAssetUrl } from '../utils/localFiles';
import './Tagger.css';

export default function Tagger({ 
  posts: propPosts, 
  setPosts: propSetPosts, 
  onExit,
  currentAtlas,
  activeFilters = [],
  searchQuery = '',
  currentPage = 1,
  selectedPostId = null
} = {}) {
  const namespaces = getActiveCategories();
  const [posts, setPosts] = useState(propPosts || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!propPosts);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'untagged'

  // Keep local posts state in sync with propPosts if provided
  useEffect(() => {
    if (propPosts) {
      setPosts(propPosts);
      setLoading(false);
    }
  }, [propPosts]);

  // Tag States
  const [stagedTags, setStagedTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  
  // Input State: Single unified input string
  const [inputValue, setInputValue] = useState('');

  // Command Mode States
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [selectionType, setSelectionType] = useState('tag'); // 'tag' | 'category'
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [hiddenTags, setHiddenTags] = useState([]);
  const [collapsedCategories, setCollapsedCategories] = useState([]);

  // Inline edit state
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Fullscreen state
  const [isFullscreenMedia, setIsFullscreenMedia] = useState(false);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('controls');

  useEffect(() => {
    if (isSettingsOpen) {
      setActiveSettingsTab('controls');
    }
  }, [isSettingsOpen]);
  
  // Notification State
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Session counter
  const [sessionCount, setSessionCount] = useState(0);
  const [taggedPostIds, setTaggedPostIds] = useState(new Set());

  const inputRef = useRef(null);
  const timelineRef = useRef(null);
  const isInitializedRef = useRef(false);

  const parseTagsArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return raw.split(/[,;\s]+/).filter(Boolean);
    }
  }
  return [];
};

// Autocomplete Suggestions States
  const [tagDictionary, setTagDictionary] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Load tag dictionary once on mount for instant in-memory autocomplete
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const allItems = await getLocalDb() ? await getLocalDb().then(async () => {
          const [scrapes, media] = await Promise.all([getLocalScrapes(), getLocalMediaFiles()]);
          return [...scrapes, ...media];
        }) : [];
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

  // Compute live autocomplete suggestions (max 8 items) in-memory
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

  // Select an autocomplete suggestion
  const selectSuggestion = (suggestion) => {
    if (!suggestion) return;
    addStagedTag(suggestion.name);
    setInputValue('');
    setSelectedSuggestionIndex(-1);
  };

  // Helper to check if a post is descriptively untagged
  const isUntagged = (post) => {
    const postTags = parseTagsArray(post.tags);
    if (postTags.length === 0) return true;
    return !postTags.some(tag => {
      const cat = getTagCategory(tag);
      return cat === 'artist' || cat === 'character' || cat === 'copyright' || cat === 'general';
    });
  };

  // Fetch posts from local database (paginated limit: 40)
  const fetchPosts = async () => {
    if (propPosts) return;
    setLoading(true);
    setSaveStatus('idle');
    try {
      const { posts: fetchedPosts } = await getPaginatedItems({
        page: currentPage,
        limit: 40,
        tags: activeFilters,
        search: (activeFilters && activeFilters.length > 0) ? '' : searchQuery
      });
      let fetched = fetchedPosts;

      if (filterMode === 'untagged') {
        fetched = fetched.filter(isUntagged);
      }

      setPosts(fetched);
      if (!isInitializedRef.current) {
        if (selectedPostId && fetched.length > 0) {
          const foundIdx = fetched.findIndex(p => p.id === selectedPostId);
          setCurrentIndex(foundIdx !== -1 ? foundIdx : 0);
        } else {
          setCurrentIndex(0);
        }
        isInitializedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching local tagger posts:', err);
      setErrorMessage(err.message || String(err));
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Sync propPosts or trigger fetch when filterMode, propPosts, activeFilters, searchQuery, or currentPage changes
  useEffect(() => {
    if (propPosts) {
      let filtered = propPosts;
      if (filterMode === 'untagged') {
        filtered = filtered.filter(isUntagged);
      }
      setPosts(filtered);
      if (!isInitializedRef.current) {
        if (selectedPostId && filtered.length > 0) {
          const foundIdx = filtered.findIndex(p => p.id === selectedPostId);
          setCurrentIndex(foundIdx !== -1 ? foundIdx : 0);
        } else {
          setCurrentIndex(0);
        }
        isInitializedRef.current = true;
      }
      setLoading(false);
    } else {
      fetchPosts();
    }
  }, [filterMode, propPosts, activeFilters, searchQuery, currentPage]);

  // Keep input focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, posts]);

  // Initialize tags when current post changes
  const currentPost = posts[currentIndex];
  useEffect(() => {
    if (currentPost) {
      setExistingTags(parseTagsArray(currentPost.tags));
      setStagedTags([]);
      setInputValue('');
      setSaveStatus('idle');
      // Reset navigation and edit states for the new post
      setSelectedTagIndex(0);
      setSelectedCategoryIndex(0);
      setSelectionType('tag');
      setHiddenTags([]);
      setCollapsedCategories([]);
      setEditingTag(null);
      setEditValue('');
      setIsFullscreenMedia(false);
    }
  }, [currentPost]);

  // Scroll active timeline item into view
  useEffect(() => {
    if (timelineRef.current) {
      const activeItem = timelineRef.current.querySelector('.tagger-timeline-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  // Enable horizontal mouse wheel scrolling on queue timeline
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [posts]);

  // Normalize tag names
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

  // Add tag to staging
  const addStagedTag = (tagStr) => {
    const normalized = normalizeTag(tagStr, '');
    if (normalized && !stagedTags.includes(normalized) && !existingTags.includes(normalized)) {
      setStagedTags(prev => [...prev, normalized]);
    }
  };

  // Handle typing input changes (detect trailing comma)
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

  // Commit inline renaming
  const commitRename = (oldTag, newDisplayName) => {
    const cat = getTagCategory(oldTag);
    const ns = namespaces.find(n => n.key === cat);
    const prefix = ns ? ns.prefix : '';

    const newNormalized = normalizeTag(newDisplayName, prefix);
    if (!newNormalized) return;

    if (existingTags.includes(oldTag)) {
      setExistingTags(prev => prev.map(t => t === oldTag ? newNormalized : t));
    }
    if (stagedTags.includes(oldTag)) {
      setStagedTags(prev => prev.map(t => t === oldTag ? newNormalized : t));
    }

    setEditingTag(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e, oldTag) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename(oldTag, editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingTag(null);
      setEditValue('');
    }
  };

  // Keyboard navigation & controls
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      saveAndNext();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleSkip();
    } else if (e.key === 'Backspace' && inputValue === '') {
      // Remove last staged tag
      if (stagedTags.length > 0) {
        const lastStaged = stagedTags[stagedTags.length - 1];
        setStagedTags(prev => prev.filter(t => t !== lastStaged));
      }
    }
  };

  // Global window keydown listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If settings modal is open, Escape closes it
      if (isSettingsOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSettingsOpen(false);
        }
        return;
      }

      // If fullscreen media is active, Esc or Tab or F key closes it
      if (isFullscreenMedia) {
        if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          setIsFullscreenMedia(false);
        }
        return;
      }

      // Tab toggles fullscreen regardless of mode (unless in Command Mode with Shift key)
      if (e.key === 'Tab' && !(isCommandMode && e.shiftKey)) {
        e.preventDefault();
        setIsFullscreenMedia(prev => !prev);
        return;
      }

      // Backquote ` goes to the previous post regardless of mode
      if (e.key === '`' || e.code === 'Backquote') {
        e.preventDefault();
        regressPrev();
        return;
      }

      // CapsLock toggle (both in Typing and Command modes)
      if (e.key === 'CapsLock') {
        e.preventDefault();
        setIsCommandMode(prev => {
          const nextMode = !prev;
          if (nextMode) {
            if (inputRef.current) inputRef.current.blur();
          } else {
            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
            }, 10);
          }
          return nextMode;
        });
        return;
      }

      // Skip capturing keys if inline edit is active
      if (editingTag !== null) {
        return;
      }

      // Typing Mode specific inputs
      if (!isCommandMode) {
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
            e.preventDefault();
            if (inputValue.trim()) {
              setInputValue('');
              setSelectedSuggestionIndex(-1);
            } else {
              handleSkip();
            }
            return;
          }
        }
        return;
      }

      // Command Mode Handles
      e.preventDefault();

      const sortedTags = getSortedTags();
      const numTags = sortedTags.length;
      const numCats = namespaces.length;

      // w -> Next, q -> Prev
      if (e.key === 'w' || e.key === 'W' || (e.key === 'Tab' && e.shiftKey)) {
        if (e.shiftKey) {
          setSelectionType('category');
          setSelectedCategoryIndex(prev => (prev + 1) % numCats);
        } else {
          setSelectionType('tag');
          if (numTags > 0) {
            setSelectedTagIndex(prev => (prev + 1) % numTags);
          }
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        if (e.shiftKey) {
          setSelectionType('category');
          setSelectedCategoryIndex(prev => (prev - 1 + numCats) % numCats);
        } else {
          setSelectionType('tag');
          if (numTags > 0) {
            setSelectedTagIndex(prev => (prev - 1 + numTags) % numTags);
          }
        }
      } 
      // Focus / Enter Typing Mode
      else if (e.key === 'i' || e.key === 'I' || e.key === 'Enter') {
        setIsCommandMode(false);
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 10);
      }
      // Intelligent deletion
      else if (e.key === 'd' || e.key === 'D' || e.key === 'Backspace' || e.key === 'Delete') {
        if (selectionType === 'tag' && numTags > 0) {
          const selected = sortedTags[selectedTagIndex];
          if (selected) {
            const isStaged = selected.type === 'staged';
            if (isStaged) {
              removeStagedTag(selected.tag);
            } else {
              removeExistingTag(selected.tag);
            }
            setSelectedTagIndex(prev => Math.max(0, Math.min(prev, numTags - 2)));
          }
        } else if (selectionType === 'category') {
          const activeNs = namespaces[selectedCategoryIndex];
          if (activeNs) {
            setExistingTags(prev => prev.filter(t => getTagCategory(t) !== activeNs.key));
            setStagedTags(prev => prev.filter(t => getTagCategory(t) !== activeNs.key));
          }
        }
      }
      // Intelligent Hide/Show
      else if (e.key === 'e' || e.key === 'E') {
        if (selectionType === 'tag' && numTags > 0) {
          const selected = sortedTags[selectedTagIndex];
          if (selected) {
            setHiddenTags(prev => 
              prev.includes(selected.tag) 
                ? prev.filter(t => t !== selected.tag) 
                : [...prev, selected.tag]
            );
          }
        } else if (selectionType === 'category') {
          const activeNs = namespaces[selectedCategoryIndex];
          if (activeNs) {
            setCollapsedCategories(prev => 
              prev.includes(activeNs.key) 
                ? prev.filter(c => c !== activeNs.key) 
                : [...prev, activeNs.key]
            );
          }
        }
      }
      // Inline edit rename
      else if (e.key === 'r' || e.key === 'R') {
        if (selectionType === 'tag' && numTags > 0) {
          const selected = sortedTags[selectedTagIndex];
          if (selected) {
            setEditingTag(selected.tag);
            setEditValue(getDisplayTagName(selected.tag));
          }
        }
      }
      // Open reddit comments thread
      else if (e.key === 'o' || e.key === 'O') {
        if (currentPost && currentPost.permalink) {
          window.open(currentPost.permalink, '_blank');
        }
      }
      // Open Wiki search page (new key: k)
      else if (e.key === 'k' || e.key === 'K') {
        if (selectionType === 'tag' && numTags > 0) {
          const selected = sortedTags[selectedTagIndex];
          if (selected) {
            const display = getDisplayTagName(selected.tag);
            window.open(`https://wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(display)}`, '_blank');
          }
        }
      }
      // Fullscreen view media (f or TAB)
      else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreenMedia(prev => !prev);
      }
      // Skip post
      else if (e.key === 's' || e.key === 'S') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isCommandMode, selectedTagIndex, selectedCategoryIndex, selectionType, existingTags, stagedTags, currentPost, editingTag, inputValue, isFullscreenMedia, currentIndex, isSettingsOpen]);

  // Remove a staged tag
  const removeStagedTag = (tagToRemove) => {
    setStagedTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Delete an existing tag locally
  const removeExistingTag = (tagToRemove) => {
    setExistingTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Save tags to local database and load next post
  const saveAndNext = async () => {
    if (!currentPost) return;
    setSaveStatus('saving');
    
    // Commit any currently typed draft inputs
    const draftTags = [];
    const val = inputValue.trim();
    if (val) {
      const normalized = normalizeTag(val, '');
      if (normalized) {
        draftTags.push(normalized);
      }
    }

    const combinedStaged = [...stagedTags, ...draftTags];
    const finalTags = Array.from(new Set([...existingTags, ...combinedStaged]));
    
    try {
      await updateItemTags(currentPost.id, Boolean(currentPost.filePath), finalTags);

      // Update local state copy (avoiding mutating state object reference)
      const updatedPosts = [...posts];
      updatedPosts[currentIndex] = {
        ...updatedPosts[currentIndex],
        tags: finalTags
      };
      setPosts(updatedPosts);

      // If we are in embedded mode, also update the parent state
      if (propSetPosts) {
        propSetPosts(updatedPosts);
      }

      // Track session metrics
      setTaggedPostIds(prev => {
        const next = new Set(prev);
        next.add(currentPost.id);
        return next;
      });
      setSessionCount(prev => prev + 1);

      setSaveStatus('success');

      // Clear all inputs
      setStagedTags([]);
      setInputValue('');

      setTimeout(() => {
        advanceNext();
      }, 350);

    } catch (err) {
      console.error('Error saving tags:', err.message);
      setErrorMessage(err.message);
      setSaveStatus('error');
    }
  };

  // Keep ref of active post draft tags for auto-saving on unmount / navigation
  const activePostDataRef = useRef({ currentPost, stagedTags, inputValue, existingTags });
  useEffect(() => {
    activePostDataRef.current = { currentPost, stagedTags, inputValue, existingTags };
  }, [currentPost, stagedTags, inputValue, existingTags]);

  useEffect(() => {
    return () => {
      const { currentPost: post, stagedTags: staged, inputValue: val, existingTags: existing } = activePostDataRef.current;
      if (post && (staged.length > 0 || (val && val.trim()))) {
        const draft = [];
        const cleanVal = val ? val.trim() : '';
        if (cleanVal) {
          const colonIndex = cleanVal.indexOf(':');
          if (colonIndex !== -1) {
            const pref = cleanVal.substring(0, colonIndex + 1);
            const name = cleanVal.substring(colonIndex + 1);
            draft.push(pref + name.replace(/\s+/g, '_').replace(/[^\w\-]/g, ''));
          } else {
            draft.push(cleanVal.replace(/\s+/g, '_').replace(/[^\w\-]/g, ''));
          }
        }
        const finalTags = Array.from(new Set([...existing, ...staged, ...draft]));
        updateItemTags(post.id, Boolean(post.filePath), finalTags).then(() => {
          invalidateItemsCache();
        }).catch(() => {});
      }
    };
  }, []);

  // Handle explicit Exit Tagger trigger
  const handleExitTagger = async () => {
    if (currentPost && (stagedTags.length > 0 || inputValue.trim())) {
      const draftTags = [];
      const val = inputValue.trim();
      if (val) {
        const normalized = normalizeTag(val, '');
        if (normalized) draftTags.push(normalized);
      }
      const combinedStaged = [...stagedTags, ...draftTags];
      if (combinedStaged.length > 0) {
        const finalTags = Array.from(new Set([...existingTags, ...combinedStaged]));
        try {
          await updateItemTags(currentPost.id, Boolean(currentPost.filePath), finalTags);
          invalidateItemsCache();
        } catch (e) {
          console.error('Error auto-saving on exit:', e);
        }
      }
    }
    if (onExit) onExit();
  };

  // Skip current post
  const handleSkip = () => {
    setSaveStatus('idle');
    advanceNext();
  };

  // Move to next post index
  const advanceNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (propPosts) {
        // Stay on last post but reset save status
        setSaveStatus('success');
      } else {
        fetchPosts();
      }
    }
  };

  // Move to previous post index
  const regressPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Check if media is a video
  const isVideoFormat = (url, tagsInput = []) => {
    if (!url) return false;
    const tags = parseTagsArray(tagsInput);
    // Skip image previews and direct image extensions immediately (they cannot be played inside a <video> element)
    if (url.includes('external-preview.redd.it') || url.match(/\.(png|jpg|jpeg|gif|webp)/i)) {
      return false;
    }
    return (
      url.match(/\.(mp4|webm|mov|ogg)/i) || 
      tags.includes('meta:format:video')
    );
  };

  // Sort and group tags
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

  const handleContainerClick = (e) => {
    if (!e.target.closest('.tagger-line-tag') && !e.target.closest('.tagger-inline-edit-input')) {
      setIsCommandMode(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  // Render the single inline tags display line + inline input
  const renderTagsAndInput = () => {
    const sortedTags = getSortedTags();
    const elements = [];

    sortedTags.forEach(({ tag, type }, index) => {
      const cat = getTagCategory(tag);
      const isStaged = type === 'staged';
      const isTagSelected = isCommandMode && selectionType === 'tag' && index === selectedTagIndex;
      const isCatSelected = isCommandMode && selectionType === 'category' && namespaces[selectedCategoryIndex] && namespaces[selectedCategoryIndex].key === cat;
      const isHidden = hiddenTags.includes(tag) || collapsedCategories.includes(cat);

      if (editingTag === tag) {
        elements.push(
          <input
            key={`edit-${tag}`}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.toLowerCase())}
            onKeyDown={(e) => handleEditKeyDown(e, tag)}
            className={`tagger-inline-edit-input ${cat}`}
            autoFocus
            style={{ width: `calc(${editValue.length + 2}ch)` }}
          />
        );
        return;
      }

      const catNs = getCategoryObj(tag);
      const tagStyle = catNs ? { color: catNs.color, backgroundColor: catNs.bg || 'var(--bg-secondary)' } : {};

      elements.push(
        <span 
          key={`${type}-${tag}`} 
          className={`tagger-line-tag ${type} ${cat} ${isTagSelected ? 'selected' : ''} ${isCatSelected ? 'cat-selected' : ''} ${isHidden ? 'hidden-tag' : ''}`}
          style={tagStyle}
          title={`Category: ${catNs.label.toUpperCase()} • Click to delete`}
          onClick={(e) => {
            e.stopPropagation();
            if (isStaged) {
              removeStagedTag(tag);
            } else {
              removeExistingTag(tag);
            }
          }}
        >
          {getDisplayTagName(tag)}
        </span>
      );
    });

    const currentInputNs = getCategoryObj(inputValue);
    const inputColor = currentInputNs ? currentInputNs.color : 'var(--accent-color)';

    // Calculate dynamic input width based on text length
    const inputWidth = inputValue 
      ? `calc(${inputValue.length + 1}ch)` 
      : (elements.length === 0 ? '150px' : '15px');

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div className={`tagger-inline-flow-container ${isCommandMode ? 'command-mode' : ''}`} onClick={handleContainerClick}>
          {elements.map((el, i) => (
            <React.Fragment key={el.key}>
              {i > 0 && <span className="tagger-line-comma">, </span>}
              {el}
            </React.Fragment>
          ))}
          
          {elements.length > 0 && !isCommandMode && (
            <span className="tagger-line-comma">, </span>
          )}

          {!isCommandMode && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={elements.length === 0 ? "type tag..." : ""}
              className="tagger-inline-input"
              style={{ 
                color: inputColor,
                width: inputWidth
              }}
            />
          )}
        </div>

        {/* Autocomplete Suggestions Popover */}
        {suggestions.length > 0 && !isCommandMode && (
          <div className="tagger-suggestions-dropdown">
            {suggestions.map((item, idx) => {
              const catObj = getCategoryObj(item.name);
              const isSelected = idx === selectedSuggestionIndex;
              return (
                <div
                  key={item.name}
                  className={`tagger-suggestion-item ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSuggestion(item);
                  }}
                  onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: catObj ? catObj.color : 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: catObj ? catObj.color : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.display}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}>
                      ({item.name})
                    </span>
                  </div>
                  <span className="tagger-suggestion-count">
                    ({item.count})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tagger-container">
      {loading ? (
        <div className="tagger-empty-state">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading Speed Tagger Queue...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="tagger-empty-state">
          <AlertCircle size={32} style={{ color: 'var(--text-tertiary)' }} />
          <h3>Queue Empty</h3>
          <p>No posts found matching the filter.</p>
          <button className="btn btn-primary" onClick={() => setFilterMode('all')} style={{ marginTop: '1rem' }}>
            Show All Posts
          </button>
        </div>
      ) : (
        <div className="tagger-workspace">
          {/* Main Visual Panel - Centered */}
          <div className="tagger-main-panel">
            
            {/* Header: Centered Media & Info */}
            <div className="tagger-post-header-centered">
              <div 
                className="tagger-media-thumb-box clickable" 
                style={{ backgroundColor: currentPost.color_theme?.bg || '#f5f2eb' }}
                onClick={() => setIsFullscreenMedia(true)}
                title="Click to view full screen (or press Tab / F)"
              >
                {isVideoFormat(currentPost.url, currentPost.tags) ? (
                  <video 
                    src={currentPost.url} 
                    className="tagger-media-thumb-element"
                    muted 
                    autoPlay 
                    loop 
                    referrerPolicy="no-referrer"
                  />
                ) : currentPost.url ? (
                  <img 
                    src={currentPost.url} 
                    alt="" 
                    className="tagger-media-thumb-element" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <HelpCircle size={24} style={{ opacity: 0.3 }} />
                )}
                <div className="tagger-media-expand-badge" title="Click to view full screen">
                  <Maximize2 size={12} />
                </div>
              </div>

              <div className="tagger-post-info-centered">
                <span className="tagger-post-subreddit-centered" style={{ color: 'var(--color-subreddit)' }}>
                  r/{currentPost.subreddit}
                </span>
                <h3 className="tagger-post-title-centered">{currentPost.title}</h3>
              </div>
            </div>

            {/* Unified tags list and inline input */}
            {renderTagsAndInput()}

            {/* Save Status Container */}
            <div className="tagger-save-status-container-minimal">
              {saveStatus === 'success' && (
                <span className="tagger-status-success animate-fade-out">
                  <Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> Saved!
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="tagger-status-loading">
                  Saving...
                </span>
              )}
              {saveStatus === 'error' && (
                <div className="tagger-save-error">
                  <AlertCircle size={14} />
                  <span>Error: {errorMessage}</span>
                </div>
              )}
            </div>

          </div>

          {/* Timeline Queue (Bottom) */}
          <div className="tagger-timeline-wrapper">
            <div className="tagger-timeline-header">
              <h4 className="tagger-timeline-title">
                Queue Timeline ({currentIndex + 1} / {posts.length})
                {isCommandMode && <span className="command-mode-badge" style={{ marginLeft: '10px' }}>COMMAND MODE</span>}
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {onExit && (
                  <button 
                    className="tagger-exit-trigger" 
                    onClick={handleExitTagger}
                    title="Return to Grid View (Auto-saves staged tags)"
                    style={{
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent-color)',
                      border: '1px solid rgba(204, 90, 1, 0.25)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    Exit Tagger
                  </button>
                )}
                <button 
                  className="tagger-settings-trigger" 
                  onClick={() => setIsSettingsOpen(true)}
                  title="Open Settings"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
            <div ref={timelineRef} className="tagger-timeline-scroll">
              {posts.map((post, idx) => {
                const isCurrent = idx === currentIndex;
                const isSaved = taggedPostIds.has(post.id);
                const hasDescriptiveTags = !isUntagged(post);
                const isVideo = isVideoFormat(post.url, post.tags);
                const staticThumb = (post.thumbnailUrl && !isVideoFormat(post.thumbnailUrl, post.tags)) 
                  ? post.thumbnailUrl 
                  : ((post.thumbnail && !isVideoFormat(post.thumbnail, post.tags)) ? post.thumbnail : null);

                return (
                  <div 
                    key={post.id}
                    className={`tagger-timeline-item ${isCurrent ? 'active' : ''} ${isSaved ? 'saved' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    style={{ '--post-bg': post.color_theme?.bg || '#f5f2eb' }}
                  >
                    {staticThumb ? (
                      <img 
                        src={staticThumb} 
                        alt="" 
                        className="tagger-timeline-thumb" 
                        referrerPolicy="no-referrer"
                      />
                    ) : isVideo ? (
                      <video 
                        src={post.url} 
                        className="tagger-timeline-thumb" 
                        muted 
                        playsInline 
                        loop
                        preload="metadata"
                      />
                    ) : post.url ? (
                      <img 
                        src={post.url} 
                        alt="" 
                        className="tagger-timeline-thumb" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="tagger-timeline-fallback-thumb" />
                    )}

                    <div className="tagger-timeline-badge-container">
                      {isSaved && (
                        <span className="tagger-badge-check" title="Saved this session">
                          <Check size={10} />
                        </span>
                      )}
                      {hasDescriptiveTags && (
                        <span className="tagger-badge-tagged" title="Has descriptive tags" />
                      )}
                    </div>

                    <div className="tagger-timeline-info">
                      <span className="tagger-timeline-id">#{post.id}</span>
                      <span className="tagger-timeline-sub">r/{post.subreddit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Media Overlay */}
      {isFullscreenMedia && currentPost && (
        <div className="tagger-fullscreen-overlay" onClick={() => setIsFullscreenMedia(false)}>
          <div className="tagger-fullscreen-content" onClick={(e) => e.stopPropagation()}>
            {isVideoFormat(currentPost.url, currentPost.tags) ? (
              <video 
                src={currentPost.id ? `http://127.0.0.1:7171/api/stream/${encodeURIComponent(currentPost.id)}` : formatLocalAssetUrl(currentPost.filePath || currentPost.url)} 
                className="tagger-fullscreen-media"
                controls
                autoPlay 
                loop 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src = formatLocalAssetUrl(currentPost.filePath || currentPost.url);
                }}
              />
            ) : (
              <img 
                src={formatLocalAssetUrl(currentPost.filePath || currentPost.url)} 
                alt="" 
                className="tagger-fullscreen-media" 
                referrerPolicy="no-referrer"
              />
            )}
            <button className="tagger-fullscreen-close" onClick={() => setIsFullscreenMedia(false)}>✕ Close (F)</button>
          </div>
        </div>
      )}

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="tagger-settings-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="tagger-settings-modal" onClick={(e) => e.stopPropagation()}>
            <header className="tagger-settings-modal-header">
              <h3>Tagger Settings</h3>
              <button className="tagger-settings-modal-close" onClick={() => setIsSettingsOpen(false)}>✕</button>
            </header>

            {/* Tab Navigation */}
            <div className="tagger-settings-tabs" style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              padding: '0 1.5rem',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <button
                className={`tagger-settings-tab-btn ${activeSettingsTab === 'controls' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('controls')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSettingsTab === 'controls' ? '2px solid var(--accent-color)' : '2px solid transparent',
                  color: activeSettingsTab === 'controls' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Keyboard Shortcuts
              </button>
              <button
                className={`tagger-settings-tab-btn ${activeSettingsTab === 'prefixes' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('prefixes')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSettingsTab === 'prefixes' ? '2px solid var(--accent-color)' : '2px solid transparent',
                  color: activeSettingsTab === 'prefixes' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Tag Prefixes
              </button>
            </div>

            <div className="tagger-settings-modal-body" style={{ paddingTop: '1.25rem' }}>
              {activeSettingsTab === 'controls' && (
                <section className="tagger-settings-section">
                  <h4>Keyboard Shortcuts Reference</h4>
                  <div className="tagger-shortcuts-grid">
                    <div className="tagger-shortcuts-column">
                      <h5>Typing Mode</h5>
                      <ul className="tagger-shortcuts-list">
                        <li><kbd>,</kbd> Stage current tag</li>
                        <li><kbd>ENTER</kbd> Save & next post</li>
                        <li><kbd>ESC</kbd> Skip post</li>
                        <li><kbd>`</kbd> Previous post</li>
                        <li><kbd>TAB</kbd> Toggle Fullscreen</li>
                        <li><kbd>CapsLock</kbd> Toggle Command Mode</li>
                      </ul>
                    </div>

                    <div className="tagger-shortcuts-column">
                      <h5>Command Mode</h5>
                      <ul className="tagger-shortcuts-list">
                        <li><kbd>q</kbd> / <kbd>w</kbd> Prev / Next Tag</li>
                        <li><kbd>Shift + q</kbd> / <kbd>Shift + Tab</kbd> Prev / Next Category</li>
                        <li><kbd>d</kbd> / <kbd>Backspace</kbd> Delete selected</li>
                        <li><kbd>e</kbd> Hide/Show toggle</li>
                        <li><kbd>r</kbd> Rename tag</li>
                        <li><kbd>k</kbd> Wikipedia search</li>
                        <li><kbd>o</kbd> Open Reddit thread</li>
                        <li><kbd>`</kbd> Previous post</li>
                        <li><kbd>TAB</kbd> Toggle Fullscreen</li>
                        <li><kbd>CapsLock</kbd> Toggle Typing Mode</li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {activeSettingsTab === 'prefixes' && (
                <section className="tagger-settings-section">
                  <h4>Category Prefixes Reference</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Type tags with these prefix namespaces to automatically categorize them:
                  </p>
                  <table className="tagger-prefixes-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '6px 12px 6px 0', color: 'var(--text-tertiary)', fontWeight: 700 }}>Category</th>
                        <th style={{ padding: '6px 12px', color: 'var(--text-tertiary)', fontWeight: 700 }}>Prefix</th>
                        <th style={{ padding: '6px 12px', color: 'var(--text-tertiary)', fontWeight: 700 }}>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-copyright)' }}>Copyright</td>
                        <td style={{ padding: '8px 12px' }}><kbd>copyright:</kbd></td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>copyright:dragon_ball</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-artist)' }}>Artists</td>
                        <td style={{ padding: '8px 12px' }}><kbd>artist:</kbd> or <kbd>u/</kbd></td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>artist:kyacchan</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-character)' }}>Characters</td>
                        <td style={{ padding: '8px 12px' }}><kbd>character:</kbd></td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>character:goku</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-flair)' }}>Flairs</td>
                        <td style={{ padding: '8px 12px' }}><kbd>flair:</kbd></td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>flair:original</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-subreddit)' }}>Subreddits</td>
                        <td style={{ padding: '8px 12px' }}><kbd>r/</kbd></td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>r/wallpaper</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-meta)' }}>Metadata</td>
                        <td style={{ padding: '8px 12px' }}><kbd>meta:</kbd></td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>meta:format:image</code></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--color-general)' }}>Tags</td>
                        <td style={{ padding: '8px 12px', fontStyle: 'italic', color: 'var(--text-tertiary)' }}>none (default)</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}><code>landscape</code></td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

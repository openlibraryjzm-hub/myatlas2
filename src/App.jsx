import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';
import Upload from './pages/Upload';
import Deletor from './pages/Deletor';
import Categories from './pages/Categories';
import Subreddits from './pages/Subreddits';
import Users from './pages/Users';
import Tagger from './pages/Tagger';
import AtlasSwitcher from './pages/AtlasSwitcher';
import { fetchServerAtlases } from './services/api';
import { DEFAULT_ATLAS } from './utils/subAtlasUtils';

export default function App() {
  const [view, setView] = useState('posts'); // 'posts' | 'home' | 'upload' | 'deletor' | 'categories' | 'subreddits' | 'users' | 'tagger' | 'switcher'

  const currentUser = { id: 'usr_curator', username: 'curator', displayName: 'Curator' };

  const [currentAtlas, setCurrentAtlas] = useState(() => localStorage.getItem('active_atlas') || 'myatlas');
  const [atlases, setAtlases] = useState([DEFAULT_ATLAS]);
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);

  const loadSubAtlases = async () => {
    try {
      const serverAtlases = await fetchServerAtlases();
      const savedLocal = JSON.parse(localStorage.getItem('myatlas_sub_atlases') || '[]');
      const combined = [DEFAULT_ATLAS];
      
      const toMerge = Array.isArray(serverAtlases) && serverAtlases.length > 0 ? serverAtlases : savedLocal;
      toMerge.forEach(a => {
        if (!combined.some(c => c.id.toLowerCase() === a.id.toLowerCase())) {
          combined.push(a);
        }
      });
      setAtlases(combined);
    } catch (err) {
      console.warn('Error loading sub-atlases registry:', err);
    }
  };

  useEffect(() => {
    loadSubAtlases();
  }, [currentAtlas, view]);

  // Compute active atlas details object with default fallback
  const activeAtlasDetails = atlases.find(
    a => a.id.toLowerCase() === (currentAtlas || 'myatlas').toLowerCase()
  ) || {
    id: currentAtlas || 'myatlas',
    title: currentAtlas ? (currentAtlas.charAt(0).toUpperCase() + currentAtlas.slice(1)) : 'My Atlas',
    accentColor: '#CC5A01'
  };

  const isReadOnly = (currentAtlas || 'myatlas').toLowerCase() !== 'myatlas';

  // Inject CSS accent colors onto document root
  useEffect(() => {
    const color = activeAtlasDetails.accentColor || '#CC5A01';
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-color-light', `${color}15`);
    document.documentElement.style.setProperty('--accent-color-border', `${color}30`);
  }, [activeAtlasDetails.accentColor]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [subredditsCount, setSubredditsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const handleSelectAtlas = (atlasId) => {
    const slug = (atlasId || 'myatlas').toLowerCase();
    setCurrentAtlas(slug);
    localStorage.setItem('active_atlas', slug);
    setShowSwitcherModal(false);
    setView('posts');
    setCurrentPage(1);
  };

  const handleConnectAtlas = (atlasName) => {
    handleSelectAtlas(atlasName || 'myatlas');
  };

  // Keyboard shortcut Ctrl+K to open atlas switcher modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSwitcherModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saves') || '[]');
    setSavedPostIds(saved);
  }, []);

  const handleToggleSave = (id) => {
    let saved = JSON.parse(localStorage.getItem('saves') || '[]');
    if (saved.includes(id)) {
      saved = saved.filter(savedId => savedId !== id);
    } else {
      saved.push(id);
    }
    localStorage.setItem('saves', JSON.stringify(saved));
    setSavedPostIds(saved);
  };

  // Fetch stats dynamically scoped to active sub-atlas
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { getPaginatedItems } = await import('./services/localDb');
      const { fetchServerPosts, checkServerHealth } = await import('./services/api');
      const slug = (currentAtlas || 'myatlas').toLowerCase();

      // 1. Check local SQLite total for active sub-atlas
      const localResult = await getPaginatedItems({
        page: 1,
        limit: 1,
        atlas: slug
      });

      let total = localResult?.total || 0;

      // 2. Check server total for active sub-atlas if C# server is online
      const isOnline = await checkServerHealth();
      if (isOnline) {
        const serverResult = await fetchServerPosts({
          page: 1,
          limit: 1,
          atlas: slug
        });
        if (serverResult && typeof serverResult.total === 'number') {
          total = serverResult.total;
        }
      }

      setTotalCount(total);
    } catch (err) {
      console.error('Error fetching sub-atlas stats:', err);
      setTotalCount(0);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [view, currentAtlas]);

  // Sync activeFilters back to searchQuery string
  const syncFiltersToSearchQuery = (filters) => {
    setSearchQuery(filters.join(' '));
  };

  // Handle toggling of a tag (add/remove from filter list)
  const handleTagToggle = (tag) => {
    let nextFilters;
    if (activeFilters.includes(tag)) {
      nextFilters = activeFilters.filter(f => f !== tag);
    } else {
      nextFilters = [...activeFilters, tag];
    }
    setActiveFilters(nextFilters);
    syncFiltersToSearchQuery(nextFilters);
    setCurrentPage(1);
    setView('posts');
  };

  // Handle a text search submission
  const handleSearchSubmit = (queryText) => {
    const searchTags = queryText
      .split(/\s+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    setActiveFilters(searchTags);
    setCurrentPage(1);
    setView('posts');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className={`app-container theme-${currentAtlas} ${view === 'users' || view === 'posts' ? 'users-view-active' : ''}`}>
      {/* Shared Navbar - Hidden on Home Page */}
      {view !== 'home' && (
        <Navbar 
          view={view} 
          setView={setView} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          currentAtlas={currentAtlas}
          activeAtlasDetails={activeAtlasDetails}
          currentUser={currentUser}
        />
      )}

      {/* Quick Switcher Modal Overlay */}
      {showSwitcherModal && (
        <AtlasSwitcher
          currentAtlas={currentAtlas}
          onSelectAtlas={handleSelectAtlas}
          isModal={true}
          onClose={() => setShowSwitcherModal(false)}
        />
      )}

      {/* Page Routing */}
      {view === 'home' ? (
        <Home 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          totalCount={totalCount}
          subredditsCount={subredditsCount}
          usersCount={usersCount}
          savesCount={savedPostIds.length}
          loadingStats={loadingStats}
          setView={setView}
          currentAtlas={currentAtlas}
          activeAtlasDetails={activeAtlasDetails}
          onConnectAtlas={handleConnectAtlas}
        />
      ) : view === 'switcher' ? (
        <AtlasSwitcher
          currentAtlas={currentAtlas}
          onSelectAtlas={handleSelectAtlas}
        />
      ) : view === 'upload' ? (
        <Upload currentAtlas={currentAtlas} isReadOnly={isReadOnly} />
      ) : view === 'deletor' ? (
        <Deletor isReadOnly={isReadOnly} />
      ) : view === 'categories' ? (
        <Categories onTagClick={(tag) => { handleTagToggle(tag); setView('posts'); }} />
      ) : view === 'subreddits' ? (
        <Subreddits onSubredditClick={handleTagToggle} />
      ) : view === 'users' ? (
        <Users currentUser={currentUser} />
      ) : view === 'tagger' ? (
        <Tagger 
          currentAtlas={currentAtlas} 
          activeFilters={activeFilters}
          searchQuery={searchQuery}
          currentPage={currentPage}
          onExit={() => setView('posts')}
          isReadOnly={isReadOnly}
        />
      ) : (
        <Posts 
          activeFilters={activeFilters}
          onTagClick={handleTagToggle}
          onClearFilters={handleClearFilters}
          viewMode={view === 'saves' ? 'saves' : 'all'}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSave}
          currentAtlas={currentAtlas}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onNavigateHome={() => setView('home')}
          onNavigateUpload={() => setView('upload')}
          onNavigateDeletor={() => setView('deletor')}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Footer */}
      {view !== 'users' && view !== 'posts' && (
        <footer className="app-footer">
          <p>
            <span>my</span>atlas &copy; {new Date().getFullYear()} &bull; Local Bookmark & Media Manager.
          </p>
        </footer>
      )}
    </div>
  );
}

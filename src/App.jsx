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
import CreateAtlas from './pages/CreateAtlas';
import { getLocalScrapes, getLocalMediaFiles } from './services/localDb';

export default function App() {
  const [view, setView] = useState('posts'); // 'posts' | 'home' | 'upload' | 'subreddits' | 'users' | 'saves' | 'switcher' | 'create-atlas'

  const [currentAtlas, setCurrentAtlas] = useState(() => localStorage.getItem('active_atlas') || 'myatlas');
  const [initialCreateSlug, setInitialCreateSlug] = useState('');
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);

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

  const handleStartCreateAtlas = (slug) => {
    setInitialCreateSlug(slug || '');
    setShowSwitcherModal(false);
    setView('create-atlas');
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

  // Fetch stats dynamically from local SQLite DB
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [scrapes, media] = await Promise.all([
        getLocalScrapes(),
        getLocalMediaFiles()
      ]);
      const totalLocal = scrapes.length + media.length;
      setTotalCount(totalLocal);

      // Extract unique categories/subreddits from local items
      const allTags = [...scrapes, ...media].flatMap(item => item.tags || []);
      const subs = new Set(allTags.filter(t => typeof t === 'string' && t.startsWith('r/')));
      const users = new Set(allTags.filter(t => typeof t === 'string' && t.startsWith('u/')));
      
      setSubredditsCount(subs.size);
      setUsersCount(users.size);
    } catch (err) {
      console.error('Error fetching local stats:', err);
      setTotalCount(0);
      setSubredditsCount(0);
      setUsersCount(0);
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
          onOpenSwitcher={() => setShowSwitcherModal(true)}
        />
      )}

      {/* Quick Switcher Modal Overlay */}
      {showSwitcherModal && (
        <AtlasSwitcher
          currentAtlas={currentAtlas}
          onSelectAtlas={handleSelectAtlas}
          onCreateAtlas={handleStartCreateAtlas}
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
          onConnectAtlas={handleConnectAtlas}
        />
      ) : view === 'switcher' ? (
        <AtlasSwitcher
          currentAtlas={currentAtlas}
          onSelectAtlas={handleSelectAtlas}
          onCreateAtlas={handleStartCreateAtlas}
        />
      ) : view === 'create-atlas' ? (
        <CreateAtlas
          initialSlug={initialCreateSlug}
          onAtlasCreated={handleSelectAtlas}
          onCancel={() => setView('posts')}
        />
      ) : view === 'upload' ? (
        <Upload currentAtlas={currentAtlas} />
      ) : view === 'deletor' ? (
        <Deletor />
      ) : view === 'categories' ? (
        <Categories onTagClick={(tag) => { handleTagToggle(tag); setView('posts'); }} />
      ) : view === 'subreddits' ? (
        <Subreddits onSubredditClick={handleTagToggle} />
      ) : view === 'users' ? (
        <Users searchQuery={searchQuery} />
      ) : view === 'tagger' ? (
        <Tagger 
          currentAtlas={currentAtlas} 
          activeFilters={activeFilters}
          searchQuery={searchQuery}
          currentPage={currentPage}
          onExit={() => setView('posts')}
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

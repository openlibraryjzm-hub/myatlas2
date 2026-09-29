import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';
import Upload from './pages/Upload';
import Deletor from './pages/Deletor';
import Tagger from './pages/Tagger';
import Injector from './pages/Injector';
import Folders from './pages/Folders';

export default function App() {
  const [view, setView] = useState('posts'); // 'posts' | 'home' | 'folders' | 'upload' | 'deletor' | 'tagger' | 'injector'

  const currentAtlas = 'myatlas';
  const activeAtlasDetails = {
    id: 'myatlas',
    title: 'My Atlas',
    accentColor: '#CC5A01'
  };
  const isReadOnly = false;

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
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

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

  // Fetch stats from local database
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { getPaginatedItems } = await import('./services/localDb');
      const localResult = await getPaginatedItems({
        page: 1,
        limit: 1,
        atlas: 'myatlas'
      });
      setTotalCount(localResult?.total || 0);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setTotalCount(0);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [view]);

  // Sync activeFilters back to searchQuery string
  const syncFiltersToSearchQuery = (filters) => {
    setSearchQuery(filters.join(' '));
  };

  // Handle toggling of a tag
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

  const [selectedTaggerPostId, setSelectedTaggerPostId] = useState(null);
  const [selectedTaggerPosts, setSelectedTaggerPosts] = useState(null);
  const [taggerInitialMediaMode, setTaggerInitialMediaMode] = useState(true);

  const handleNavigateTagger = (postId, pagePosts, page, initialMediaMode = true) => {
    setSelectedTaggerPostId(postId);
    if (pagePosts) {
      setSelectedTaggerPosts(pagePosts);
    }
    if (page) {
      setCurrentPage(page);
    }
    setTaggerInitialMediaMode(initialMediaMode);
    setView('tagger');
  };

  const [cardHoverTitle, setCardHoverTitle] = useState('');

  useEffect(() => {
    setCardHoverTitle('');
  }, [view]);

  return (
    <div className={`app-container theme-myatlas ${view === 'posts' ? 'users-view-active' : ''}`}>
      {/* Shared Navbar - Hidden on Home Page */}
      {view !== 'home' && (
        <Navbar 
          view={view} 
          setView={setView} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalFilteredCount={totalFilteredCount}
          cardHoverTitle={cardHoverTitle}
        />
      )}

      {/* Page Routing */}
      {view === 'home' ? (
        <Home 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          totalCount={totalCount}
          loadingStats={loadingStats}
          setView={setView}
        />
      ) : view === 'folders' ? (
        <Folders currentAtlas={currentAtlas} isReadOnly={isReadOnly} />
      ) : view === 'upload' ? (
        <Upload currentAtlas={currentAtlas} isReadOnly={isReadOnly} />
      ) : view === 'deletor' ? (
        <Deletor isReadOnly={isReadOnly} />
      ) : view === 'tagger' ? (
        <Tagger 
          posts={selectedTaggerPosts}
          currentAtlas={currentAtlas} 
          activeFilters={activeFilters}
          searchQuery={searchQuery}
          currentPage={currentPage}
          initialMediaMode={taggerInitialMediaMode}
          onExit={() => {
            setSelectedTaggerPosts(null);
            setView('posts');
          }}
          isReadOnly={isReadOnly}
          selectedPostId={selectedTaggerPostId}
        />
      ) : view === 'injector' ? (
        <Injector 
          isReadOnly={isReadOnly}
          onNavigatePosts={() => setView('posts')}
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
          onTotalCountChange={setTotalFilteredCount}
          onNavigateHome={() => setView('home')}
          onNavigateUpload={() => setView('upload')}
          onNavigateDeletor={() => setView('deletor')}
          onNavigateTagger={handleNavigateTagger}
          onPostHover={setCardHoverTitle}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Footer */}
      {view !== 'posts' && (
        <footer className="app-footer">
          <p>
            <span>my</span>atlas &copy; {new Date().getFullYear()} &bull; Local Bookmark & Media Manager.
          </p>
        </footer>
      )}
    </div>
  );
}

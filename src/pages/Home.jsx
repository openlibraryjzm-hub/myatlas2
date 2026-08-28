import React, { useState } from 'react';
import './Home.css';

export default function Home({ 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit, 
  totalCount, 
  subredditsCount,
  usersCount,
  savesCount,
  loadingStats,
  setView,
  currentAtlas = 'myatlas',
  onConnectAtlas
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(localQuery);
  };

  const getMetricText = () => {
    return (totalCount || 0).toLocaleString();
  };

  return (
    <main className="home-container">
      <div className="home-logo-container">
        <h1 className="home-title">
          <span className="title-reddit highlighted">my</span>
          <span className="title-booru">atlas</span>
        </h1>
      </div>

      <form className="home-search-container" onSubmit={handleSubmit}>
        <div className="home-search-wrapper-minimal">
          <input
            type="text"
            className="home-search-input-minimal"
            autoFocus
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>
      </form>

      <div 
        className="home-total-count fade-in clickable"
        onClick={() => setView('posts')}
      >
        {loadingStats ? '···' : (
          <>
            <span>{getMetricText()}</span>
            <span className="home-total-count-arrow">&gt;</span>
          </>
        )}
      </div>
    </main>
  );
}

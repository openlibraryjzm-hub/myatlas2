import React, { useState } from 'react';
import './Home.css';

export default function Home({ 
  searchQuery, 
  onSearchSubmit, 
  totalCount, 
  loadingStats,
  setView
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(localQuery);
  };

  const getMetricText = () => {
    return (totalCount || 0).toLocaleString();
  };

  return (
    <main className="home-container">
      {/* Top Header Logo & Post Counter Subtitle */}
      <div className="home-logo-container">
        <h1 className="home-title static-title">
          <span className="title-my" style={{ color: 'var(--text-primary)' }}>my</span>
          <span className="title-atlas" style={{ color: 'var(--accent-color)' }}>atlas</span>
        </h1>

        <div 
          className="home-total-count fade-in clickable"
          onClick={() => setView('posts')}
          title="Browse Atlas Items"
        >
          {loadingStats ? '···' : (
            <>
              <span>{getMetricText()}</span>
              <span className="home-total-count-arrow">&gt;</span>
            </>
          )}
        </div>
      </div>

      {/* Minimalist Search Input */}
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
    </main>
  );
}

import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
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
  const [hoveredOptionText, setHoveredOptionText] = useState(null);

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

      <div className="home-options-bar">
        <a 
          href="#manifesto" 
          className="home-option-link home-icon-option-link" 
          onClick={(e) => { e.preventDefault(); setView('manifesto'); }}
          onMouseEnter={() => setHoveredOptionText('Manifesto')}
          onMouseLeave={() => setHoveredOptionText(null)}
          aria-label="Manifesto"
          title="Manifesto"
        >
          <ScrollText size={13} strokeWidth={2.5} />
        </a>
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
        key={`${hoveredOptionText || 'numeric'}`} 
        className="home-total-count fade-in clickable"
        onClick={() => {
          if (hoveredOptionText === 'Manifesto') setView('manifesto');
          else setView('posts');
        }}
      >
        {loadingStats ? '···' : (
          <>
            <span>{hoveredOptionText || getMetricText()}</span>
            {!hoveredOptionText && <span className="home-total-count-arrow">&gt;</span>}
          </>
        )}
      </div>
    </main>
  );
}

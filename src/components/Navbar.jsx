import React, { useState } from 'react';
import { Search, Compass, Upload, Trash2, ScrollText, Users as UsersIcon, Tag, Heart, Globe, Wrench } from 'lucide-react';
import './Navbar.css';

// Custom simplified isometric pool SVG icon
function PoolsIcon({ size = 16, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 7v6l10 5 10-5V7" />
      <path d="M12 12l5-2.5" />
      <path d="M7 9.5L12 12" />
      <path d="M14 4.5l-0.8 2M16 5.5l-0.8 2" />
    </svg>
  );
}

export default function Navbar({ view, setView, searchQuery, setSearchQuery, onSearchSubmit, currentAtlas = 'myatlas' }) {
  const [searchOpen, setSearchOpen] = useState(!!searchQuery);
  const [hoveredLabel, setHoveredLabel] = useState('');

  const handleLogoClick = () => {
    setView('home');
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  const renderLogo = () => {
    return (
      <>
        <span className="title-reddit highlighted">my</span>
        <span className="title-booru">atlas</span>
      </>
    );
  };

  return (
    <header className="nav-header">
      <div className="nav-left-group">
        <div className="nav-logo" onClick={handleLogoClick}>
          {renderLogo()}
        </div>
        
        <div className="nav-icon-buttons">
          <button 
            className={`nav-icon-btn ${view === 'posts' ? 'active' : ''}`}
            onClick={() => setView('posts')}
            onMouseEnter={() => setHoveredLabel('browse media')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Browse Media"
          >
            <Compass size={16} />
          </button>

          <button 
            className={`nav-icon-btn ${view === 'pools' ? 'active' : ''}`}
            onClick={() => setView('pools')}
            onMouseEnter={() => setHoveredLabel('curation pools')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Curation Pools"
          >
            <PoolsIcon size={16} />
          </button>

          <button 
            className={`nav-icon-btn ${view === 'categories' ? 'active' : ''}`}
            onClick={() => setView('categories')}
            onMouseEnter={() => setHoveredLabel('tag categories')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Tag Categories Directory"
          >
            <Tag size={16} />
          </button>

          <button 
            className={`nav-icon-btn ${view === 'tagger' ? 'active' : ''}`}
            onClick={() => setView('tagger')}
            onMouseEnter={() => setHoveredLabel('speed tagger')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Speed Tagger"
          >
            <Wrench size={16} />
          </button>

          <button 
            className={`nav-icon-btn ${view === 'manifesto' ? 'active' : ''}`}
            onClick={() => setView('manifesto')}
            onMouseEnter={() => setHoveredLabel('manifesto')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Manifesto"
          >
            <ScrollText size={16} />
          </button>

          <button 
            className={`nav-icon-btn ${view === 'saves' ? 'active' : ''}`}
            onClick={() => setView('saves')}
            onMouseEnter={() => setHoveredLabel('saved bookmarks')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Saved Favorites"
          >
            <Heart size={16} />
          </button>

          <div className={`nav-search-wrapper ${searchOpen ? 'expanded' : ''}`}>
            <button 
              className={`nav-icon-btn search-trigger ${searchOpen ? 'active' : ''}`}
              onClick={() => {
                setSearchOpen(!searchOpen);
                setHoveredLabel('');
              }}
              onMouseEnter={() => {
                if (!searchOpen) setHoveredLabel('search');
              }}
              onMouseLeave={() => setHoveredLabel('')}
              title="Search"
            >
              <Search size={16} />
            </button>
            {searchOpen && (
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="nav-search-inline-input"
                autoFocus
              />
            )}
          </div>
        </div>
      </div>

      {/* Centered Hover Label */}
      <div className={`nav-center-text ${hoveredLabel ? 'visible' : ''}`}>
        {hoveredLabel}
      </div>

      <div className="nav-right-group">
        <button 
          className={`nav-icon-btn ${view === 'upload' ? 'active' : ''}`}
          onClick={() => setView('upload')}
          onMouseEnter={() => setHoveredLabel('ingest media')}
          onMouseLeave={() => setHoveredLabel('')}
          title="Ingest Media"
        >
          <Upload size={16} />
        </button>

        <button 
          className={`nav-icon-btn ${view === 'deletor' ? 'active' : ''}`}
          onClick={() => setView('deletor')}
          onMouseEnter={() => setHoveredLabel('mass deletor')}
          onMouseLeave={() => setHoveredLabel('')}
          title="Mass Deletor Studio"
        >
          <Trash2 size={16} />
        </button>

        <button className="nav-user-pill" title="Local System User">
          <span className="nav-help-icon">?</span>
          <span>Unregistered</span>
        </button>
      </div>
    </header>
  );
}

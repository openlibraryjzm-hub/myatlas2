import React, { useState } from 'react';
import { Search, Compass, Upload, Trash2, Tag, Wrench, User } from 'lucide-react';
import { renderDynamicTitle } from '../utils/subAtlasUtils';
import './Navbar.css';

export default function Navbar({ 
  view, 
  setView, 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit, 
  currentAtlas = 'myatlas', 
  activeAtlasDetails
}) {
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
    const titleText = activeAtlasDetails?.title || currentAtlas;
    const accentColor = activeAtlasDetails?.accentColor || '#CC5A01';
    return renderDynamicTitle(titleText, accentColor);
  };

  return (
    <header className="nav-header">
      <div className="nav-left-group">
        <div className="nav-logo" onClick={handleLogoClick} title="Go to Home Page">
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

        <button 
          className={`nav-icon-btn ${view === 'users' ? 'active' : ''}`}
          onClick={() => setView('users')}
          onMouseEnter={() => setHoveredLabel('curator profile')}
          onMouseLeave={() => setHoveredLabel('')}
          title="Curator Profile"
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}

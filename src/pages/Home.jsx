import React, { useState } from 'react';
import { renderDynamicTitle } from '../utils/subAtlasUtils';
import './Home.css';

// Custom Colored Icons
function AccountRingIcon({ size = 26, color = "#CC5A01" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill={`${color}15`} stroke={color} />
      <circle cx="12" cy="9" r="3" fill={color} />
      <path d="M 6.5 18.5 C 7.5 15.5 9.5 14.5 12 14.5 C 14.5 14.5 16.5 15.5 17.5 18.5" strokeWidth="1.5" />
    </svg>
  );
}

// 6 Fixed Sub-Atlas Options
const FIXED_ATLAS_OPTIONS = [
  {
    id: 'myatlas',
    label: 'myatlas',
    image: '/aesthetic-value-of-vintage-keys-free-png.webp',
  },
  {
    id: 'amberatlas',
    label: 'Amber',
    image: '/bernstein-261133_1280.png',
  },
  {
    id: 'youtubeatlas',
    label: 'Youtube',
    image: '/pngtree-a-straight-shot-of-a-realistic-eighties-crt-television-set-png-image_19729924.webp',
  },
  {
    id: 'wikiatlas',
    label: 'Wiki',
    image: '/pngtree-stack-of-books-image-png-image_17810565.png',
  },
  {
    id: 'gamesatlas',
    label: 'Games',
    image: '/Game-Boy-FL.png',
  },
  {
    id: 'toolsatlas',
    label: 'Tools',
    image: '/pngtree-work-and-repair-tools-png-image_14699823.png',
  }
];

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
  activeAtlasDetails,
  onSelectAtlas,
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

  const titleText = activeAtlasDetails?.title || currentAtlas;
  const accentColor = activeAtlasDetails?.accentColor || '#CC5A01';
  const activeSlug = (currentAtlas || 'myatlas').toLowerCase();

  return (
    <main className="home-container">
      {/* Top Header Logo & Post Counter Subtitle */}
      <div className="home-logo-container">
        <h1 className="home-title">
          {renderDynamicTitle(titleText, accentColor)}
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

      {/* Fixed 6 Sub-Atlas Options Row */}
      <div className="home-options-container">
        {FIXED_ATLAS_OPTIONS.map((opt) => {
          const isCurrentlyActive = activeSlug === opt.id.toLowerCase();

          return (
            <div 
              key={opt.id} 
              className={`home-option-item ${isCurrentlyActive ? 'active-atlas-item' : ''}`}
              onClick={() => onSelectAtlas && onSelectAtlas(opt.id)}
              title={`Switch to ${opt.label} Atlas`}
            >
              <div className="home-option-icon">
                <img 
                  src={opt.image} 
                  alt={opt.label} 
                  style={{ width: '34px', height: '34px', objectFit: 'contain' }} 
                />
              </div>
              <span 
                className="home-option-link"
                style={isCurrentlyActive ? { color: accentColor, fontWeight: 700 } : {}}
              >
                {opt.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Centered Account Button */}
      <div className="home-account-container">
        <div className="home-option-item home-account-item" onClick={() => setView('users')}>
          <div className="home-option-icon">
            <AccountRingIcon size={26} color={accentColor} />
          </div>
          <span className="home-option-link">Account</span>
        </div>
      </div>
    </main>
  );
}

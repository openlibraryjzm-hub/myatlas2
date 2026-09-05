import React, { useState } from 'react';
import { renderDynamicTitle } from '../utils/subAtlasUtils';
import './Home.css';

// Custom Colored Icons
function AmberBugIcon({ size = 22, color = "#D97706" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="9" ry="10" fill={`${color}18`} stroke={color} />
      <circle cx="12" cy="10" r="1.5" fill={color} />
      <path d="M 12 11.5 V 15.5" strokeWidth="1.5" />
      <path d="M 9.5 9 L 7.5 7.5" strokeWidth="1.2" />
      <path d="M 14.5 9 L 16.5 7.5" strokeWidth="1.2" />
      <path d="M 10 12 L 8 13.5" strokeWidth="1.2" />
      <path d="M 14 12 L 16 13.5" strokeWidth="1.2" />
      <path d="M 10.5 14.5 L 9 16" strokeWidth="1.2" />
      <path d="M 13.5 14.5 L 15 16" strokeWidth="1.2" />
    </svg>
  );
}

function YouTubeScreenIcon({ size = 22, color = "#EF4444" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="4" fill={`${color}15`} stroke={color} />
      <polygon points="10,8 16,12 10,16" fill={color} stroke="none" />
    </svg>
  );
}

function WikiBookIcon({ size = 22, color = "#4F46E5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 2 6 C 6 4 11 5 12 7 C 13 5 18 4 22 6 V 19 C 18 17 13 18 12 20 C 11 18 6 17 2 19 Z" fill={`${color}15`} stroke={color} />
      <path d="M 12 7 V 20" strokeWidth="1.5" />
    </svg>
  );
}

function AngledJoystickIcon({ size = 22, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="15" width="18" height="6" rx="2" fill={`${color}15`} stroke={color} />
      <path d="M 9.5 15 L 14.5 7" strokeWidth="2.2" />
      <circle cx="16" cy="5" r="3" fill={color} stroke={color} />
      <ellipse cx="9.5" cy="15" rx="2.5" ry="1.2" fill={color} />
    </svg>
  );
}

function GreenShoppingBagIcon({ size = 22, color = "#16A34A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 6 8 L 4 21 H 20 L 18 8 Z" fill={`${color}15`} stroke={color} />
      <path d="M 9 8 V 6 C 9 4.34 10.34 3 12 3 C 13.66 3 15 4.34 15 6 V 8" strokeWidth="1.75" />
    </svg>
  );
}

function AccountRingIcon({ size = 22, color = "#CC5A01" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill={`${color}15`} stroke={color} />
      <circle cx="12" cy="9" r="3" fill={color} />
      <path d="M 6.5 18.5 C 7.5 15.5 9.5 14.5 12 14.5 C 14.5 14.5 16.5 15.5 17.5 18.5" strokeWidth="1.5" />
    </svg>
  );
}

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

  return (
    <main className="home-container">
      <div className="home-logo-container">
        <h1 className="home-title">
          {renderDynamicTitle(titleText, accentColor)}
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

      {/* Horizontally Aligned Option Items with Icons Above Text */}
      <div className="home-options-container">
        <div className="home-option-item" onClick={() => onSearchSubmit('amber')}>
          <div className="home-option-icon">
            <AmberBugIcon size={22} color="#D97706" />
          </div>
          <span className="home-option-link">Amber</span>
        </div>

        <div className="home-option-item" onClick={() => onSearchSubmit('youtube')}>
          <div className="home-option-icon">
            <YouTubeScreenIcon size={22} color="#EF4444" />
          </div>
          <span className="home-option-link">Youtube</span>
        </div>

        <div className="home-option-item" onClick={() => onSearchSubmit('wiki')}>
          <div className="home-option-icon">
            <WikiBookIcon size={22} color="#4F46E5" />
          </div>
          <span className="home-option-link">Wiki</span>
        </div>

        <div className="home-option-item" onClick={() => onSearchSubmit('games')}>
          <div className="home-option-icon">
            <AngledJoystickIcon size={22} color="#2563EB" />
          </div>
          <span className="home-option-link">Games</span>
        </div>

        <div className="home-option-item" onClick={() => setView('shop')}>
          <div className="home-option-icon">
            <GreenShoppingBagIcon size={22} color="#16A34A" />
          </div>
          <span className="home-option-link">Shop</span>
        </div>

        <div className="home-option-item" onClick={() => setView('users')}>
          <div className="home-option-icon">
            <AccountRingIcon size={22} color="#CC5A01" />
          </div>
          <span className="home-option-link">Account</span>
        </div>
      </div>

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

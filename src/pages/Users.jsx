import React from 'react';
import { Heart, Settings, LogOut, Award, Globe, Image as ImageIcon } from 'lucide-react';
import './Users.css';

// Custom Mythological Atlas SVG Icon (Titan holding up the celestial sphere)
function MythologicalAtlasIcon({ size = 18, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Celestial Sphere / Boulder held on shoulders */}
      <circle cx="15.5" cy="7.5" r="5.5" />
      <path d="M 10.5 7.5 H 20.5" strokeWidth="1.2" opacity="0.6" />
      <path d="M 15.5 2.5 C 17.5 4.5 17.5 10.5 15.5 12.5" strokeWidth="1.2" opacity="0.6" />

      {/* Atlas's Head - bent down */}
      <circle cx="7" cy="11.5" r="1.5" fill="currentColor" />

      {/* Hunched Back & Torso carrying weight */}
      <path d="M 5 21 L 7 15 C 8 13.5 10 12.5 13 13" />

      {/* Raised Bracing Arms holding sphere */}
      <path d="M 9.5 13 L 13 8.5" />

      {/* Bracing Legs */}
      <path d="M 7 15 L 4 21" />
      <path d="M 9.5 15.5 L 12 21" />
      <path d="M 3 21 H 14" strokeWidth="1.2" />
    </svg>
  );
}

export default function Users() {
  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* Left Side: Avatar, Icon Options, and Giant Bio Box */}
        <aside className="user-profile-left">
          {/* Large Square Profile Picture Placeholder */}
          <div className="user-avatar-square-placeholder">
            <div className="avatar-blank-inner">
              <span className="avatar-placeholder-text">-placeholder-</span>
            </div>
          </div>

          {/* Pure Icon-Only Action Options */}
          <div className="user-options-row icon-only-row">
            <button className="user-option-icon-btn" title="MyAtlas" onClick={(e) => e.preventDefault()}>
              <Heart size={18} />
            </button>
            <button className="user-option-icon-btn" title="Atlases" onClick={(e) => e.preventDefault()}>
              <MythologicalAtlasIcon size={18} />
            </button>
            <button className="user-option-icon-btn" title="Options" onClick={(e) => e.preventDefault()}>
              <Settings size={18} />
            </button>
            <button className="user-option-icon-btn" title="Log Out" onClick={(e) => e.preventDefault()}>
              <LogOut size={18} />
            </button>
          </div>

          {/* Giant Text Box with Centered Placeholder */}
          <div className="user-bio-giant-textbox">
            <span className="giant-textbox-placeholder-text">-placeholder-</span>
          </div>
        </aside>

        {/* Right Side: 3 Wide Stacked Showcase Bars */}
        <main className="user-profile-right">
          {/* Top Bar: Badge Showcase */}
          <section className="showcase-bar">
            <div className="showcase-bar-header">
              <div className="showcase-header-left">
                <Award className="showcase-icon" size={16} />
                <h3 className="showcase-title">Badge Showcase</h3>
              </div>
              <span className="showcase-badge-count">0 Badges</span>
            </div>
            <div className="showcase-bar-content">
              <div className="showcase-blank-grid">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={`badge-slot-${idx}`} className="showcase-blank-card">
                    <span className="blank-card-text">-placeholder-</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Middle Bar: Atlas Showcase */}
          <section className="showcase-bar">
            <div className="showcase-bar-header">
              <div className="showcase-header-left">
                <Globe className="showcase-icon" size={16} />
                <h3 className="showcase-title">Atlas Showcase</h3>
              </div>
              <span className="showcase-badge-count">0 Featured</span>
            </div>
            <div className="showcase-bar-content">
              <div className="showcase-blank-grid">
                {[1, 2, 3].map((idx) => (
                  <div key={`atlas-slot-${idx}`} className="showcase-blank-card showcase-wide-card">
                    <span className="blank-card-text">-placeholder-</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Bar: Post Showcase */}
          <section className="showcase-bar">
            <div className="showcase-bar-header">
              <div className="showcase-header-left">
                <ImageIcon className="showcase-icon" size={16} />
                <h3 className="showcase-title">Post Showcase</h3>
              </div>
              <span className="showcase-badge-count">0 Items</span>
            </div>
            <div className="showcase-bar-content">
              <div className="showcase-blank-grid">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={`post-slot-${idx}`} className="showcase-blank-card showcase-post-card">
                    <span className="blank-card-text">-placeholder-</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

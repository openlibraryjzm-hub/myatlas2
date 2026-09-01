import React, { useState } from 'react';
import DiscoveryCloudPreview from '../components/DiscoveryCloudPreview';
import './Landing.css';

export default function Landing({ setView, onSelectAtlas }) {
  const [activeCategory, setActiveCategory] = useState('posts');
  
  const categories = ['posts', 'followers', 'new', 'bump'];

  // 4 Top Row Featured Atlases (Placeholders)
  const topRowAtlases = [
    { id: 'myatlas', title: 'My Atlas' },
    { id: 'space', title: 'Space & Cosmos' },
    { id: 'military', title: 'Military Tech' },
    { id: 'design', title: 'UI / UX Design' }
  ];

  // 6 Bottom Row Featured Atlases (Placeholders) - bottom-heavy 4x6 grid
  const bottomRowAtlases = [
    { id: 'eldenring', title: 'Elden Ring' },
    { id: 'anime', title: 'Anime & Manga' },
    { id: 'arch', title: 'Architecture' },
    { id: 'retro', title: '80s Synthwave' },
    { id: 'nature', title: 'Wild Photography' },
    { id: '3d_art', title: 'Render & 3D' }
  ];

  const handleAtlasClick = (slug) => {
    if (onSelectAtlas) {
      onSelectAtlas(slug);
    } else if (setView) {
      setView('posts');
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-content-container">
        {/* 1. TOP SECTION: Clean Minimalist Title */}
        <header className="landing-header">
          <h1 className="landing-title">Atlas Network</h1>
        </header>

        {/* 2. MIDDLE SECTION: Dot-Separated Categories & Tightly Packed Square Hero Grid */}
        <section className="landing-middle">
          {/* Plain Text Categories Separated by Floating Dots */}
          <div className="landing-category-list">
            {categories.map((cat, idx) => (
              <React.Fragment key={cat}>
                <button
                  className={`landing-category-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
                {idx < categories.length - 1 && (
                  <span className="landing-category-dot">&bull;</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Tightly Packed Image-Only Square Grid Display */}
          <div className="hero-select-grid-container">
            {/* Top Row: 4 Small Squares */}
            <div className="hero-grid-row hero-row-top">
              {topRowAtlases.map((atlas, idx) => (
                <div 
                  key={`top-atlas-${idx}`} 
                  className="hero-square-card"
                  onClick={() => handleAtlasClick(atlas.id)}
                  title={atlas.title}
                />
              ))}
            </div>

            {/* Bottom Row: 6 Small Squares */}
            <div className="hero-grid-row hero-row-bottom">
              {bottomRowAtlases.map((atlas, idx) => (
                <div 
                  key={`bottom-atlas-${idx}`} 
                  className="hero-square-card"
                  onClick={() => handleAtlasClick(atlas.id)}
                  title={atlas.title}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. BOTTOM SECTION: Simple Text Link & Seamless Particle Swarm */}
        <footer className="landing-bottom">
          <button 
            className="explore-more-text-btn"
            onClick={() => setView('discovery')}
          >
            Explore 1904 more Atlases
          </button>

          {/* Pure Visual Background Particle Swarm */}
          <DiscoveryCloudPreview />
        </footer>
      </div>
    </div>
  );
}

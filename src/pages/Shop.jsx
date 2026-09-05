import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Lock, Sparkles, ExternalLink, Tag, Folder } from 'lucide-react';
import './Shop.css';

// Helper to determine dynamic font-size class based on title character length
const getTitleSizeClass = (title = '') => {
  const len = title.trim().length;
  if (len <= 6) return 'size-short';
  if (len <= 11) return 'size-medium';
  return 'size-long';
};

// 17 Active Shop Atlases Roster Data
const ACTIVE_SHOP_ROSTER = [
  { id: 'tools', title: 'Tools', subtitle: 'Software & Web Apps', color: '#2563EB', gradient: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)', icon: '🛠️', tag: 'shop:tools', image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=400&q=80' },
  { id: 'addons', title: 'Addons', subtitle: 'Blender & Plugins', color: '#7C3AED', gradient: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #9333EA 100%)', icon: '🧩', tag: 'shop:addons', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
  { id: 'assets', title: 'Assets', subtitle: '3D Models & PBR', color: '#06B6D4', gradient: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 50%, #22D3EE 100%)', icon: '📦', tag: 'shop:assets', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80' },
  { id: 'media', title: 'Media', subtitle: 'Stock Footage & SFX', color: '#F97316', gradient: 'linear-gradient(135deg, #C2410C 0%, #F97316 50%, #FB923C 100%)', icon: '🎬', tag: 'shop:media', image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80' },
  { id: 'deals', title: 'Deals', subtitle: 'Discounts & Bundles', color: '#EF4444', gradient: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 50%, #F87171 100%)', icon: '🏷️', tag: 'shop:deals', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80' },
  { id: 'learn', title: 'Learn', subtitle: 'Courses & Workshops', color: '#10B981', gradient: 'linear-gradient(135deg, #047857 0%, #10B981 50%, #34D399 100%)', icon: '🎓', tag: 'shop:learn', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80' },
  { id: 'print', title: 'Print', subtitle: '3D Print STLs', color: '#0D9488', gradient: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)', icon: '🖨️', tag: 'shop:print', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
  { id: 'steam_workshop', title: 'Steam Workshop', subtitle: 'Community Mods', color: '#3B82F6', gradient: 'linear-gradient(135deg, #171A21 0%, #172554 40%, #1D4ED8 100%)', icon: '⚙️', tag: 'shop:steam_workshop', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&q=80' },
  { id: 'nexus_mods', title: 'Nexus Mods', subtitle: 'PC Overhauls & ENBs', color: '#D97706', gradient: 'linear-gradient(135deg, #1E2022 0%, #78350F 50%, #D97706 100%)', icon: '🌀', tag: 'shop:nexus_mods', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80' },
  { id: 'minecraft', title: 'Minecraft', subtitle: 'Textures & Shaders', color: '#16A34A', gradient: 'linear-gradient(135deg, #14532D 0%, #16A34A 50%, #22C55E 100%)', icon: '🟩', tag: 'shop:minecraft', image: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=400&q=80' },
  { id: 'tf2', title: 'Team Fortress 2', subtitle: 'Cosmetics & Keys', color: '#D97706', gradient: 'linear-gradient(135deg, #78350F 0%, #D97706 50%, #F59E0B 100%)', icon: '🎩', tag: 'shop:tf2', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
  { id: 'overwatch', title: 'Overwatch', subtitle: 'Skins & Emotes', color: '#F59E0B', gradient: 'linear-gradient(135deg, #78350F 0%, #F59E0B 50%, #FBBF24 100%)', icon: '🛡️', tag: 'shop:overwatch', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80' },
  { id: 'marvel_rivals', title: 'Marvel Rivals', subtitle: 'Multiverse Skins', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 50%, #A78BFA 100%)', icon: '⚡', tag: 'shop:marvel_rivals', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80' },
  { id: 'roblox', title: 'Roblox', subtitle: 'Avatar UGC Items', color: '#E11D48', gradient: 'linear-gradient(135deg, #881337 0%, #E11D48 50%, #FB7185 100%)', icon: '🟥', tag: 'shop:roblox', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80' },
  { id: 'fallout76', title: 'Fallout 76', subtitle: 'Atomic Shop & CAMP', color: '#EAB308', gradient: 'linear-gradient(135deg, #1E3A8A 0%, #854D0E 50%, #EAB308 100%)', icon: '☢️', tag: 'shop:fallout76', image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80' },
  { id: 'halo_infinite', title: 'Halo Infinite', subtitle: 'Armor Coatings', color: '#15803D', gradient: 'linear-gradient(135deg, #064E3B 0%, #15803D 50%, #4ADE80 100%)', icon: '🎯', tag: 'shop:halo_infinite', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80' },
  { id: 'league_of_legends', title: 'League of Legends', subtitle: 'Skins & Hextech', color: '#2563EB', gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)', icon: '⚔️', tag: 'shop:league', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&q=80' }
];

// Generate exactly 78 total slots (13 cols x 6 rows)
const TOTAL_SLOTS = 78;
const FULL_ROSTER_SLOTS = Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
  if (index < ACTIVE_SHOP_ROSTER.length) {
    return { ...ACTIVE_SHOP_ROSTER[index], isPlaceholder: false, index };
  }
  return {
    id: `placeholder_${index}`,
    title: '-placeholder-',
    subtitle: 'Locked Slot',
    isPlaceholder: true,
    index
  };
});

// Helper to generate CSS background-image fallback chain for local /shop/ images
const getItemBgSources = (slot) => {
  if (!slot || slot.isPlaceholder) return 'none';
  return `url('/shop/${slot.id}2.jpg'), url('/shop/${slot.id}2.png'), url('/shop/${slot.id}.jpg'), url('/shop/${slot.id}.png'), url('/shop/${slot.id}.jpeg'), url('/shop/${slot.id}.webp'), url('${slot.image}')`;
};

// Helper component for preview card image loading with local /shop/ lookup
function ShopItemImage({ item, className = 'smash-portrait-img' }) {
  const extensions = ['2.jpg', '2.png', '.jpg', '.png', '.jpeg', '.webp'];
  const [extIdx, setExtIdx] = useState(0);
  const [src, setSrc] = useState(`/shop/${item?.id}${extensions[0]}`);

  React.useEffect(() => {
    setExtIdx(0);
    setSrc(`/shop/${item?.id}${extensions[0]}`);
  }, [item?.id]);

  const handleError = () => {
    if (extIdx < extensions.length - 1) {
      const nextIdx = extIdx + 1;
      setExtIdx(nextIdx);
      setSrc(`/shop/${item.id}${extensions[nextIdx]}`);
    } else {
      setSrc(item.image);
    }
  };

  return (
    <img 
      src={src} 
      alt={item?.title} 
      className={className} 
      onError={handleError}
    />
  );
}

export default function Shop({ setView, onSelectAtlas, onTagClick }) {
  const [selectedPreset, setSelectedPreset] = useState('Default');

  const handleSelectSlot = (slot) => {
    if (slot.isPlaceholder) return;
    if (onTagClick) {
      onTagClick(slot.tag);
    } else if (onSelectAtlas) {
      onSelectAtlas(slot.id);
    }
  };

  return (
    <div className="smash-css-page">
      {/* Top Header Bar: Large Back Arrow + Large Preset Selector Dropdown */}
      <header className="smash-top-bar">
        <div className="smash-top-left">
          <button 
            className="smash-back-arrow" 
            onClick={() => setView('home')}
            title="Return to Home"
          >
            <ArrowLeft size={32} strokeWidth={2.5} />
          </button>

          <div className="smash-preset-wrapper">
            <label className="smash-preset-label">PRESET:</label>
            <div className="smash-select-custom">
              <select 
                className="smash-preset-select"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
              >
                <option value="Default">Default</option>
              </select>
              <ChevronDown size={18} className="smash-select-chevron" />
            </div>
          </div>
        </div>

        <div className="smash-top-title-right">
          <span className="smash-css-badge">SHOP ATLASES</span>
        </div>
      </header>

      {/* Main 13 Columns x 6 Rows Roster Grid (78 Compact Slots) */}
      <main className="smash-roster-section">
        <div className="smash-css-grid-13x6">
          {FULL_ROSTER_SLOTS.map((slot) => {
            if (slot.isPlaceholder) {
              return (
                <div key={slot.id} className="smash-slot smash-slot-placeholder">
                  <div className="smash-placeholder-pattern">
                    <Lock size={12} className="smash-lock-icon" />
                    <span className="smash-placeholder-text">-placeholder-</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className="smash-slot smash-slot-active"
                onClick={() => handleSelectSlot(slot)}
                title={`${slot.title} - ${slot.subtitle}`}
              >
                {/* Background Image / Color Fill */}
                <div 
                  className="smash-slot-image" 
                  style={{ backgroundImage: getItemBgSources(slot), backgroundColor: slot.color }}
                >
                  <div className="smash-slot-gradient-overlay" />
                </div>

                {/* Overlaid Title Text at Bottom */}
                <div className="smash-slot-label-bar">
                  <span className={`smash-slot-title ${getTitleSizeClass(slot.title)}`}>
                    {slot.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Half Showcase Section: Static Item Preview Card */}
      <section className="smash-bottom-preview-container">
        <div className="smash-preview-card-frame">
          <div className="smash-preview-portrait-box">
            <ShopItemImage item={ACTIVE_SHOP_ROSTER[0]} className="smash-portrait-img" />
            <div className="smash-portrait-badge-overlay">
              <span className="smash-portrait-icon">{ACTIVE_SHOP_ROSTER[0].icon}</span>
            </div>
          </div>

          <div className="smash-preview-details-box">
            <div className="smash-preview-header">
              <span className="smash-preview-tag">SHOP ATLAS PREVIEW</span>
              <h2 className="smash-preview-title">{ACTIVE_SHOP_ROSTER[0].title}</h2>
              <p className="smash-preview-sub">{ACTIVE_SHOP_ROSTER[0].subtitle}</p>
            </div>
            <p className="smash-preview-description">
              {ACTIVE_SHOP_ROSTER[0].description}
            </p>
            <div className="smash-preview-actions">
              <button 
                className="smash-enter-atlas-btn"
                onClick={() => handleSelectSlot(ACTIVE_SHOP_ROSTER[0])}
              >
                <span>ENTER ATLAS</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

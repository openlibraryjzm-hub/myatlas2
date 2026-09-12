import React, { useState } from 'react';
import './Shop.css';

const SHOP_TABS = [
  { id: 'deckpad', label: 'Deckpad', hasFreeSticker: false },
  { id: 'light-brace', label: 'Light Controller Brace', hasFreeSticker: false },
  { id: 'heavy-brace', label: 'Heavy Controller Brace', hasFreeSticker: false },
  { id: 'todays-three', label: 'Todays Three', hasFreeSticker: true }
];

export default function Shop({ setView }) {
  const [activeTab, setActiveTab] = useState('deckpad');

  const currentTabObj = SHOP_TABS.find(t => t.id === activeTab) || SHOP_TABS[0];

  return (
    <div className="shop-page-container">
      {/* Full-Width Top Navigation Tabs Bar Right Under Navbar */}
      <nav className="shop-tabs-bar" aria-label="Shop categories">
        {SHOP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`shop-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.hasFreeSticker && (
                <span className="free-splash-sticker">FREE!</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Full Width Unconstrained Content Area for Active Tab */}
      <main className="shop-tab-viewport">
        <div className="tab-preview-content">
          <p>{currentTabObj.label} view</p>
        </div>
      </main>
    </div>
  );
}

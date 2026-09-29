import React, { useState } from 'react';
import { Search, Compass, Upload, Trash2, Wrench, Layers, Folder } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ 
  view, 
  setView, 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit,
  currentPage = 1,
  setCurrentPage,
  totalFilteredCount = 0,
  itemsPerPage = 40,
  cardHoverTitle = ''
}) {
  const [searchOpen, setSearchOpen] = useState(!!searchQuery);
  const [hoveredLabel, setHoveredLabel] = useState('');

  const activeDisplayLabel = hoveredLabel || cardHoverTitle;

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && setCurrentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

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

  return (
    <header className="nav-header">
      <div className="nav-left-group">
        <div className="nav-logo" onClick={handleLogoClick} title="Go to Home Page">
          <span className="title-highlighted" style={{ color: 'var(--accent-color)' }}>my</span>
          <span className="title-rest">atlas</span>
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
            className={`nav-icon-btn ${view === 'tagger' ? 'active' : ''}`}
            onClick={() => setView('tagger')}
            onMouseEnter={() => setHoveredLabel('speed tagger')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Speed Tagger"
          >
            <Wrench size={16} />
          </button>

          <button 
            className={`nav-icon-btn ${view === 'injector' ? 'active' : ''}`}
            onClick={() => setView('injector')}
            onMouseEnter={() => setHoveredLabel('bulk tag injector')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Bulk Tag Injector"
          >
            <Layers size={16} />
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

          <button 
            className={`nav-icon-btn ${view === 'folders' ? 'active' : ''}`}
            onClick={() => setView('folders')}
            onMouseEnter={() => setHoveredLabel('folders & health')}
            onMouseLeave={() => setHoveredLabel('')}
            title="Folders & Library Health"
          >
            <Folder size={16} />
          </button>

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
        </div>

        {activeDisplayLabel && (
          <div className="nav-center-text visible" title={activeDisplayLabel}>
            {activeDisplayLabel}
          </div>
        )}
      </div>

      <div className="nav-right-group">
        {view === 'posts' && totalPages > 1 && (
          <div className="pagination-container-minimal nav-pagination">
            <button 
              className="pagination-btn-minimal"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              &lt;&lt;
            </button>
            <button 
              className="pagination-btn-minimal"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              &lt;
            </button>
            
            {renderPaginationButtons()}
            
            <button 
              className="pagination-btn-minimal"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              &gt;
            </button>
            <button 
              className="pagination-btn-minimal"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              &gt;&gt;
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

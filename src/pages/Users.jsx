import React, { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import './Users.css';

// Initialize a static list of 60 mock users scattered with profile images
const initialUsersList = [];
const profiles = [
  { name: 'AlphaBot', profilePic: '/profile_robot.jpg' },
  { name: 'WiseWhiskers', profilePic: '/profile_cat.jpg' },
  { name: 'Aurelia', profilePic: '/profile_person.jpg' },
  { name: 'GoggleOwl', profilePic: '/profile_owl.jpg' }
];

for (let i = 1; i <= 60; i++) {
  const base = profiles[(i - 1) % 4];
  const indexStr = i.toString().padStart(2, '0');
  const name = `${base.name}_${indexStr}`;
  const count = Math.floor(Math.random() * 150) + 10;
  const totalScore = count * (Math.floor(Math.random() * 500) + 50);
  
  // Random date in the last 6 months
  const date = new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000));
  
  initialUsersList.push({
    name,
    count,
    totalScore,
    newestPost: date,
    profilePic: base.profilePic
  });
}

export default function Users({ searchQuery = '' }) {
  const [usersList, setUsersList] = useState(initialUsersList);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 48;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDeleteUser = (userName) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete all posts uploaded by u/${userName}? This action cannot be undone.`);
    if (!confirmed) return;

    setUsersList(prev => prev.filter(user => user.name !== userName));
    if (selectedUser?.name === userName) {
      setSelectedUser(null);
    }
  };

  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentUsersCount = paginatedUsers.length;
  const numCols = 4;
  const numRows = Math.ceil(currentUsersCount / numCols);
  const totalCells = numRows * numCols;
  const emptyCellsCount = totalCells - currentUsersCount;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll grid container back to top
      const gridContainer = document.querySelector('.users-grid-container');
      if (gridContainer) {
        gridContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
      if (i >= 1 && i <= totalPages) {
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
    }
    return buttons;
  };

  return (
    <div className="users-layout">
      <aside className="users-sidebar">
        {selectedUser ? (
          <div className="users-sidebar-detail fade-in">
            <div className="sidebar-detail-image-container">
              <img src={selectedUser.profilePic} alt={selectedUser.name} className="sidebar-detail-image" />
            </div>
            <h3 className="sidebar-detail-name">u/{selectedUser.name}</h3>
            
            <div className="sidebar-detail-stats">
              <div className="sidebar-detail-stat">
                <span className="stat-label">Total Posts</span>
                <span className="stat-value">{selectedUser.count}</span>
              </div>
              <div className="sidebar-detail-stat">
                <span className="stat-label">Avg Score</span>
                <span className="stat-value">
                  {Math.round(selectedUser.totalScore / selectedUser.count).toLocaleString()}
                </span>
              </div>
              <div className="sidebar-detail-stat">
                <span className="stat-label">Newest Post</span>
                <span className="stat-value">
                  {selectedUser.newestPost.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
            
            <button 
              className="sidebar-delete-btn"
              onClick={() => handleDeleteUser(selectedUser.name)}
              title={`Delete all uploads from u/${selectedUser.name}`}
            >
              <Trash2 size={14} style={{ marginRight: '0.4rem' }} />
              Delete User Uploads
            </button>
          </div>
        ) : (
          <div className="sidebar-placeholder">
            <span className="sidebar-placeholder-text">test</span>
            <p className="sidebar-placeholder-sub">Select an indexer from the grid to view details</p>
          </div>
        )}
      </aside>

      <main className="users-grid-container">
        {filteredUsers.length === 0 ? (
          <div className="users-empty-full">No users found matching "{searchQuery}".</div>
        ) : (
          <>
            <div className="users-grid">
              {paginatedUsers.map(user => {
                const isSelected = selectedUser?.name === user.name;
                return (
                  <div 
                    key={user.name} 
                    className={`user-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <img src={user.profilePic} alt={user.name} className="user-card-image" />
                  </div>
                );
              })}
              {Array.from({ length: emptyCellsCount }).map((_, idx) => (
                <div key={`empty-${idx}`} className="empty-grid-cell" />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container-minimal">
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
          </>
        )}
      </main>
    </div>
  );
}

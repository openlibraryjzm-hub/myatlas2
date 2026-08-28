import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Search, CheckCircle, Clock, Tag, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { getAllItems, getAllMetaUploadTags, deletePostsByTag, clearAllLocalStores } from '../services/localDb';
import { getOptimizedThumbnailUrl } from '../utils/localFiles';
import './Deletor.css';

export default function Deletor() {
  const [batches, setBatches] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [allAvailableTags, setAllAvailableTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [matchingPosts, setMatchingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Modal confirmation state
  const [confirmModal, setConfirmModal] = useState({ open: false, tag: '', count: 0 });
  const [nukeModalOpen, setNukeModalOpen] = useState(false);

  // Load all posts and metadata upload batches
  const loadData = async () => {
    setLoading(true);
    try {
      const posts = await getAllItems({ forceRefresh: true });
      setAllPosts(posts);

      // Extract unique tags for autocomplete suggestions
      const tagsSet = new Set();
      posts.forEach(p => {
        (p.tags || []).forEach(t => tagsSet.add(t));
      });
      setAllAvailableTags(Array.from(tagsSet).sort());

      // Get meta upload batches
      const metaBatches = await getAllMetaUploadTags();
      setBatches(metaBatches);
    } catch (err) {
      console.error('Error loading deletor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update matching posts when customTag changes
  useEffect(() => {
    const query = customTag.trim().toLowerCase();
    if (!query) {
      setMatchingPosts([]);
      return;
    }

    const matches = allPosts.filter(p => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      return tags.some(t => String(t).toLowerCase() === query || String(t).toLowerCase().includes(query));
    });
    setMatchingPosts(matches);
  }, [customTag, allPosts]);

  // Handle deletion execution
  const executeDelete = async (tagToDelete) => {
    setDeleting(true);
    setStatusMessage(null);
    try {
      const count = await deletePostsByTag(tagToDelete);
      setStatusMessage({
        type: 'success',
        text: `Successfully deleted ${count} item(s) tagged with "${tagToDelete}".`
      });
      setConfirmModal({ open: false, tag: '', count: 0 });
      setCustomTag('');
      await loadData();
    } catch (err) {
      console.error('Error deleting posts:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to delete posts: ${err.message}`
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle wiping the entire database / deleting ALL posts
  const handleNukeAll = async () => {
    setDeleting(true);
    setNukeModalOpen(false);
    try {
      await clearAllLocalStores();
      setStatusMessage({
        type: 'success',
        text: `Successfully wiped database clean. All ${allPosts.length} posts have been deleted.`
      });
      setCustomTag('');
      await loadData();
    } catch (err) {
      console.error('Error wiping database:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to wipe database: ${err.message}`
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="deletor-container">
      {/* Header Bar */}
      <div className="deletor-header">
        <div className="deletor-title-row">
          <div>
            <h2 className="deletor-title">Mass Deletor Studio</h2>
            <p className="deletor-subtitle">
              Bulk delete posts by upload timestamp batch, or type any tag to prune matching items.
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={loadData}
            disabled={loading || deleting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div 
          className="no-results-minimal" 
          style={{
            borderColor: statusMessage.type === 'success' ? '#22c55e' : '#ef4444',
            color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
            backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Section 1: Meta Timestamp Batches */}
      <div className="deletor-section">
        <div className="deletor-section-title">
          <Clock size={16} /> Upload Timestamp Batches ({batches.length})
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Scanning database for upload batches...
          </div>
        ) : batches.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            No <code>meta:upload:*</code> timestamp batches found in your database.
          </div>
        ) : (
          <div className="deletor-batch-grid">
            {batches.map(batch => (
              <div key={batch.tag} className="deletor-batch-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="deletor-batch-tag">{batch.tag}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                      {batch.count} item{batch.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="deletor-batch-meta">
                    <span>Uploaded: {batch.timestamp.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Preview Thumbnail Grid */}
                <div className="deletor-preview-thumbnails">
                  {batch.previews.map((prev, idx) => (
                    <img 
                      key={prev.id || idx} 
                      src={getOptimizedThumbnailUrl(prev.thumbnail || prev.url, 'thumb')} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="deletor-thumb-img" 
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 6 - batch.previews.length) }).map((_, idx) => (
                    <div key={`empty_${idx}`} style={{ background: 'var(--bg-card)', opacity: 0.5 }} />
                  ))}
                </div>

                {/* Delete Batch Button */}
                <button
                  type="button"
                  className="deletor-delete-btn"
                  onClick={() => setConfirmModal({ open: true, tag: batch.tag, count: batch.count })}
                  disabled={deleting}
                >
                  <Trash2 size={14} /> Delete Batch ({batch.count})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Custom Tag Type-to-Delete */}
      <div className="deletor-section">
        <div className="deletor-section-title">
          <Tag size={16} /> Custom Tag Mass Deletor
        </div>

        <div className="deletor-custom-box">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Type any tag name to delete all matching posts:
          </label>
          <div className="deletor-search-input-wrapper">
            <Search size={16} className="deletor-search-icon" />
            <input
              type="text"
              className="deletor-search-input"
              placeholder="Type tag (e.g. r/twitter, u/Umio_xo, meta:extension:png, flair:art)..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
            />
            {customTag && (
              <button
                type="button"
                onClick={() => setCustomTag('')}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Matching Results Preview */}
          {customTag.trim() && (
            <div className="deletor-matching-results">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Found <strong>{matchingPosts.length}</strong> matching item(s) for tag "<strong>{customTag}</strong>"
                </span>

                {matchingPosts.length > 0 && (
                  <button
                    type="button"
                    className="deletor-delete-btn"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                    onClick={() => setConfirmModal({ open: true, tag: customTag.trim(), count: matchingPosts.length })}
                    disabled={deleting}
                  >
                    <Trash2 size={15} /> Delete All {matchingPosts.length} Matching Items
                  </button>
                )}
              </div>

              {/* Live Preview Cards Grid */}
              {matchingPosts.length > 0 && (
                <div className="deletor-preview-grid">
                  {matchingPosts.slice(0, 36).map((post, idx) => (
                    <div key={post.id || idx} className="deletor-preview-card-small" title={post.title}>
                      <img src={getOptimizedThumbnailUrl(post.thumbnail || post.url, 'small')} alt={post.title} referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Danger Zone - Delete ALL Posts */}
      <div className="deletor-section" style={{ border: '1px solid rgba(220, 38, 38, 0.3)', backgroundColor: 'rgba(254, 242, 242, 0.5)' }}>
        <div className="deletor-section-title" style={{ color: '#dc2626' }}>
          <AlertTriangle size={16} /> Danger Zone: Delete All Posts & Reset Database
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
          Permanently delete all <strong>{allPosts.length}</strong> items across all local database stores and clear cached WebP thumbnails.
        </p>
        <button
          type="button"
          className="deletor-delete-btn"
          style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
          onClick={() => setNukeModalOpen(true)}
          disabled={deleting || allPosts.length === 0}
        >
          <Trash2 size={15} /> Delete All {allPosts.length} Posts (Wipe Database)
        </button>
      </div>

      {/* Confirmation Modal for Batch / Tag Delete */}
      {confirmModal.open && (
        <div className="deletor-modal-overlay" onClick={() => setConfirmModal({ open: false, tag: '', count: 0 })}>
          <div className="deletor-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="deletor-modal-title">
              <AlertTriangle size={20} /> Confirm Batch Deletion
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Are you sure you want to permanently delete all <strong>{confirmModal.count}</strong> item(s) tagged with:
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <span className="deletor-batch-tag">{confirmModal.tag}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              This action cannot be undone. Records will be removed from your SQLite database and cached thumbnails will be cleared.
            </p>

            <div className="deletor-modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setConfirmModal({ open: false, tag: '', count: 0 })}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                onClick={() => executeDelete(confirmModal.tag)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : `Permanently Delete ${confirmModal.count} Items`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete ALL Posts */}
      {nukeModalOpen && (
        <div className="deletor-modal-overlay" onClick={() => setNukeModalOpen(false)}>
          <div className="deletor-modal-content" style={{ borderTop: '4px solid #dc2626' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="deletor-modal-title" style={{ color: '#dc2626' }}>
              <AlertTriangle size={20} /> Delete ALL {allPosts.length} Posts?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Are you sure you want to delete <strong>ALL {allPosts.length} items</strong> and clear your database and thumbnail cache?
            </p>
            <p style={{ fontSize: '0.8rem', color: '#dc2626', background: 'rgba(254, 242, 242, 0.8)', padding: '0.6rem 0.8rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>WARNING:</strong> This action cannot be undone. All indexed media items and scraped bookmarks will be deleted.
            </p>

            <div className="deletor-modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setNukeModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                onClick={handleNukeAll}
                disabled={deleting}
              >
                {deleting ? 'Wiping Database...' : `Yes, Delete All ${allPosts.length} Posts`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

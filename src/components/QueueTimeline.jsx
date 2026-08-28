import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { formatLocalAssetUrl } from '../utils/localFiles';
import { getDisplayTagName, parseTagsArray } from '../data/mockData';
import './QueueTimeline.css';

export default function QueueTimeline({
  posts = [],
  currentIndex = 0,
  onSelectIndex,
  taggedPostIds = new Set()
}) {
  const timelineRef = useRef(null);

  // Auto scroll active item into view
  useEffect(() => {
    if (timelineRef.current) {
      const activeItem = timelineRef.current.querySelector('.queue-timeline-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  // Enable horizontal mouse wheel scrolling
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [posts]);

  // Helper to test if post is a video format
  const isVideoFormat = (url, tagsInput = []) => {
    if (!url) return false;
    const tags = parseTagsArray(tagsInput);
    if (url.includes('external-preview.redd.it') || url.match(/\.(png|jpg|jpeg|gif|webp)/i)) {
      return false;
    }
    return (
      url.match(/\.(mp4|webm|mov|ogg)/i) || 
      tags.includes('meta:format:video')
    );
  };

  if (!posts || posts.length === 0) return null;

  return (
    <div className="queue-timeline-wrapper">
      <div className="queue-timeline-header">
        <span className="queue-timeline-title">
          Page Queue ({posts.length} Items)
        </span>
      </div>

      <div className="queue-timeline-scroll" ref={timelineRef}>
        {posts.map((post, idx) => {
          const isActive = idx === currentIndex;
          const isVideo = isVideoFormat(post.url || post.filePath, post.tags);
          const isTaggedInSession = taggedPostIds.has(post.id);

          const assetUrl = post.filePath
            ? formatLocalAssetUrl(post.filePath)
            : (post.thumbnailUrl || post.url);

          return (
            <div
              key={post.id || idx}
              className={`queue-timeline-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectIndex && onSelectIndex(idx)}
              title={post.title || post.fileName || `Post #${idx + 1}`}
            >
              {/* Badges */}
              <div className="queue-timeline-badge-container">
                {isTaggedInSession && (
                  <div className="queue-badge-check" title="Tagged in this session">
                    <Check size={9} strokeWidth={3} />
                  </div>
                )}
                {isVideo && (
                  <div className="queue-badge-video">VIDEO</div>
                )}
              </div>

              {/* Thumbnail Render */}
              {isVideo ? (
                post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : formatLocalAssetUrl(post.thumbnailUrl)}
                    alt=""
                    className="queue-timeline-thumb"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={assetUrl}
                    className="queue-timeline-thumb"
                    muted
                    preload="metadata"
                  />
                )
              ) : assetUrl ? (
                <img
                  src={assetUrl}
                  alt=""
                  className="queue-timeline-thumb"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="queue-timeline-fallback-thumb" />
              )}

              {/* Bottom Label Overlay */}
              <div className="queue-timeline-info">
                <span className="queue-timeline-id">#{idx + 1}</span>
                <span className="queue-timeline-sub">
                  {post.subreddit ? `r/${post.subreddit}` : (post.fileName || 'Item')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

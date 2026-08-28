import React, { useEffect, useRef } from 'react';
import { Check, Film } from 'lucide-react';
import { formatLocalAssetUrl } from '../utils/localFiles';
import { parseTagsArray } from '../data/mockData';
import './QueueTimeline.css';

export default function QueueTimeline({
  posts = [],
  currentIndex = 0,
  onSelectIndex,
  taggedPostIds = new Set()
}) {
  const timelineRef = useRef(null);

  // Fast & smooth active item scroll positioning
  useEffect(() => {
    if (!timelineRef.current) return;
    
    // Use requestAnimationFrame to ensure DOM layout metrics are ready
    const rafId = requestAnimationFrame(() => {
      if (timelineRef.current) {
        const activeItem = timelineRef.current.querySelector('.queue-timeline-item.active');
        if (activeItem) {
          activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentIndex]);

  // Map vertical wheel scrolling to horizontal timeline scroll instantly
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
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

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

          // Resolve lightweight static image thumbnail (WebP proxy for videos, local asset for images)
          const primaryThumbUrl = (() => {
            const directThumb = post.thumbnailUrl || post.thumbnail;
            if (directThumb) {
              return directThumb.startsWith('http') ? directThumb : formatLocalAssetUrl(directThumb);
            }
            if (isVideo && post.id) {
              return `http://127.0.0.1:7171/api/thumbnail/${encodeURIComponent(post.id)}`;
            }
            return post.filePath ? formatLocalAssetUrl(post.filePath) : (post.url || '');
          })();

          const fallbackThumbUrl = post.filePath ? formatLocalAssetUrl(post.filePath) : (post.url || '');

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

              {/* 100% Lightweight Static Thumbnail Image */}
              {primaryThumbUrl ? (
                <img
                  src={primaryThumbUrl}
                  alt=""
                  className="queue-timeline-thumb"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.target.src !== fallbackThumbUrl && fallbackThumbUrl && !isVideo) {
                      e.target.src = fallbackThumbUrl;
                    } else {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }
                  }}
                />
              ) : null}

              {/* Icon Fallback (only shown if static image fails to load) */}
              <div className="queue-timeline-fallback-box" style={{ display: !primaryThumbUrl ? 'flex' : 'none' }}>
                {isVideo ? (
                  <Film size={20} style={{ color: '#facc15', opacity: 0.75 }} />
                ) : (
                  <div className="queue-timeline-fallback-thumb" />
                )}
              </div>

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

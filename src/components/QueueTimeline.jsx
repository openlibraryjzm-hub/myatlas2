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

  // Smooth 60 FPS momentum wheel scrolling
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    let animFrame = null;
    let targetScroll = el.scrollLeft;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        targetScroll += e.deltaY * 0.85;
        targetScroll = Math.max(0, Math.min(targetScroll, el.scrollWidth - el.clientWidth));

        if (!animFrame) {
          animFrame = requestAnimationFrame(() => {
            el.scrollLeft += (targetScroll - el.scrollLeft) * 0.35;
            if (Math.abs(targetScroll - el.scrollLeft) > 0.5) {
              animFrame = requestAnimationFrame(function step() {
                el.scrollLeft += (targetScroll - el.scrollLeft) * 0.35;
                if (Math.abs(targetScroll - el.scrollLeft) > 0.5) {
                  animFrame = requestAnimationFrame(step);
                } else {
                  animFrame = null;
                }
              });
            } else {
              animFrame = null;
            }
          });
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (animFrame) cancelAnimationFrame(animFrame);
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

          // Always prefer lightweight static image thumbnails (NEVER spawn live <video> decoders in 40 timeline cards)
          const thumbUrl = post.thumbnailUrl 
            ? (post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : formatLocalAssetUrl(post.thumbnailUrl))
            : (post.filePath ? formatLocalAssetUrl(post.filePath) : post.url);

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

              {/* Lightweight Image Thumbnail (No heavy video decoders) */}
              {isVideo && !post.thumbnailUrl ? (
                <div className="queue-timeline-video-placeholder">
                  <Film size={22} style={{ color: '#facc15', opacity: 0.8 }} />
                </div>
              ) : thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt=""
                  className="queue-timeline-thumb"
                  loading="lazy"
                  decoding="async"
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

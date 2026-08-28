import React, { useState, useEffect, useRef } from 'react';
import { Image, Play } from 'lucide-react';
import { formatLocalAssetUrl } from '../utils/localFiles';
import './PostCard.css';

const parseTagsArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return raw.split(/[,;\s]+/).filter(Boolean);
    }
  }
  return [];
};

function PostCard({ post, index = 0, onPostClick, onRightClick }) {
  const { id, title, subreddit, colorTheme, url, permalink, thumbnail, tags, derivedTags, filePath, mediaUrl } = post;
  
  const tagsList = parseTagsArray(tags);
  const derivedTagsList = parseTagsArray(derivedTags);
  const allTags = tagsList.length > 0 ? tagsList : derivedTagsList;

  const isGif = allTags.includes('meta:extension:gif') || url?.toLowerCase().endsWith('.gif');
  const isVideo = allTags.includes('meta:format:video') || 
                  allTags.includes('meta:extension:mp4') || 
                  allTags.includes('meta:extension:webm') || 
                  allTags.includes('meta:extension:mov') ||
                  (filePath && Boolean(filePath.match(/\.(mp4|webm|mov|mkv|avi)$/i))) || 
                  (url && Boolean(url.match(/\.(mp4|webm|mov|mkv|avi)$/i)));

  const isToolAtlas = subreddit === 'toolatlas' || allTags.includes('meta:atlas:toolatlas') || allTags.some(t => String(t).startsWith('meta:atlas:toolatlas'));
  
  const [imgError, setImgError] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef(null);

  // Asset URL for native desktop rendering
  const targetDiskPath = filePath || post.file_path || (url && !url.startsWith('http://') && !url.startsWith('https://') ? url : null);
  const rawTarget = targetDiskPath || url || mediaUrl || thumbnail;
  const assetUrl = formatLocalAssetUrl(rawTarget);

  const isBase64Thumb = thumbnail && (thumbnail.startsWith('data:image/webp') || thumbnail.startsWith('blob:'));

  let imageSrc = null;
  if (!imgError) {
    if (isBase64Thumb) {
      imageSrc = thumbnail;
    } else if (thumbnail && thumbnail.includes('/api/thumbnail/')) {
      imageSrc = thumbnail;
    } else if (id || filePath) {
      const param = (filePath || id);
      imageSrc = `http://127.0.0.1:7171/api/thumbnail/${encodeURIComponent(param)}`;
    } else {
      imageSrc = assetUrl;
    }
  } else if (!isVideo) {
    imageSrc = assetUrl;
  }

  // Reset error states when props change
  useEffect(() => {
    setImgError(false);
    setIsImgLoaded(true);
  }, [id, url, thumbnail, filePath]);

  // Instant cache detection on mount
  useEffect(() => {
    if (imgRef.current && (imgRef.current.complete || imgRef.current.naturalWidth > 0)) {
      setIsImgLoaded(true);
    }
  }, [imageSrc]);

  const handleImageError = () => {
    setImgError(true);
  };

  const handleImageLoad = () => {
    setIsImgLoaded(true);
  };

  // Space-separated list of tags for DOM-based selection
  const tagsAttribute = allTags.join(' ');

  const safeTheme = colorTheme || { bg: '#f5f2eb', accent: '#cc5a01', text: '#44403c' };

  return (
    <article 
      className={`post-card-minimal ${isToolAtlas ? 'toolatlas-card' : ''} ${isGif ? 'gif-card' : ''} ${isVideo ? 'video-card' : ''}`}
      data-post-id={id}
      data-tags={tagsAttribute}
      style={isToolAtlas ? {} : { backgroundColor: safeTheme.bg }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPostClick && onPostClick(post)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onRightClick) onRightClick(post);
      }}
    >
      {isVideo && (isHovered || imgError || !imageSrc) ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <video 
            src={assetUrl} 
            muted 
            autoPlay={isHovered}
            loop={isHovered}
            playsInline 
            preload="metadata"
            className="post-card-image" 
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
          <div 
            className="post-card-video-badge"
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: isHovered ? 'rgba(204, 90, 1, 0.9)' : 'rgba(0, 0, 0, 0.65)',
              color: '#fff',
              padding: '3px 6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 600,
              pointerEvents: 'none',
              backdropFilter: 'blur(4px)',
              letterSpacing: '0.04em'
            }}
          >
            <Play size={10} fill="currentColor" />
            <span>{isHovered ? 'PLAYING' : 'VIDEO'}</span>
          </div>
        </div>
      ) : imageSrc ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt={title || 'Post thumbnail'} 
            referrerPolicy="no-referrer"
            className="post-card-image"
            decoding="async"
            loading={index < 16 ? 'eager' : 'lazy'}
            fetchPriority={index < 16 ? 'high' : 'low'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              opacity: 1,
              transition: 'none',
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
          {isVideo && (
            <div 
              className="post-card-video-badge"
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: '#fff',
                padding: '3px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                fontWeight: 600,
                pointerEvents: 'none',
                backdropFilter: 'blur(4px)',
                letterSpacing: '0.04em'
              }}
            >
              <Play size={10} fill="currentColor" />
              <span>VIDEO</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="post-card-preview-pattern" />
          
          {/* Fallback Icon */}
          <div className="post-card-icon-minimal" style={{ color: safeTheme.accent }}>
            {isGif || isVideo ? (
              <Play size={20} strokeWidth={1.5} fill="currentColor" style={{ opacity: 0.8 }} />
            ) : (
              <Image size={18} strokeWidth={1.5} />
            )}
          </div>
        </>
      )}

      {/* Elegant Hover Info Overlay */}
      <div className="post-card-hover-overlay">
        <span className="post-card-hover-id">#{id}</span>
        {permalink ? (
          <a 
            href={permalink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="post-card-hover-sub link"
            onClick={(e) => e.stopPropagation()}
          >
            {subreddit} ↗
          </a>
        ) : (
          <span className="post-card-hover-sub">{subreddit}</span>
        )}
      </div>
    </article>
  );
}

export default React.memo(PostCard);

export function PostCardSkeleton() {
  return (
    <div className="post-card-minimal skeleton" style={{ width: '100%', height: '220px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', opacity: 0.6 }} />
  );
}




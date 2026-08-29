import React, { useState } from 'react';
import { Upload as UploadIcon, Database, CheckCircle, AlertTriangle, FileJson, Folder, HardDrive, X, RefreshCw, Trash2, Tag } from 'lucide-react';
import { isDesktopApp, selectLocalFiles, selectLocalDirectory, formatLocalAssetUrl, getLocalFileAsBlobUrl, getOptimizedThumbnailUrl, generateWebpThumbnail, generateVideoWebpThumbnail } from '../utils/localFiles';
import { importScrapedJsonArray, addLocalMediaFile, clearAllLocalStores } from '../services/localDb';
import { ensureTagCategoriesExist } from '../data/mockData';
import './Upload.css';

// Deterministic pastel themes based on string hashes
const PASTEL_PALETTES = [
  { bg: "#f5f3f9", text: "#6b21a8", accent: "#a855f7", desc: "Soft Lavender Theme" },
  { bg: "#f0fdf4", text: "#166534", accent: "#22c55e", desc: "Dappled Sage Theme" },
  { bg: "#fff5f5", text: "#9b2c2c", accent: "#e53e3e", desc: "Warm Coral Theme" },
  { bg: "#ecfeff", text: "#155e75", accent: "#06b6d4", desc: "Ocean Cyan Theme" },
  { bg: "#fefdf0", text: "#78350f", accent: "#d97706", desc: "Golden Amber Theme" },
  { bg: "#fafaf9", text: "#44403c", accent: "#78716c", desc: "Slate Minimal Theme" }
];

const getPalette = (str) => {
  if (!str) return PASTEL_PALETTES[5];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTES.length;
  return PASTEL_PALETTES[index];
};

const getMediaUrl = (url, thumbnail) => {
  if (!url && !thumbnail) return '';
  if (url && url.match(/\.(png|jpg|jpeg|gif|webp)/i) && !url.includes('external-preview.redd.it')) {
    if (url.includes('preview.redd.it') && !url.includes('external-preview.redd.it')) {
      try {
        const u = new URL(url);
        return `https://i.redd.it${u.pathname}`;
      } catch (e) {}
    }
    return url;
  }
  if (thumbnail && thumbnail.includes('preview.redd.it') && !thumbnail.includes('external-preview.redd.it')) {
    try {
      const u = new URL(thumbnail);
      return `https://i.redd.it${u.pathname}`;
    } catch (e) {}
  }
  return url && url.match(/^https?:\/\//i) ? url : (thumbnail || '');
};

function PreviewCard({ post, onRemove }) {
  const isGif = post.tags?.includes('meta:extension:gif') || post.url?.toLowerCase().endsWith('.gif') || post.derivedTags?.includes('meta:extension:gif');
  const isVideo = post.tags?.includes('meta:format:video') || post.derivedTags?.includes('meta:format:video') || post.mediaUrl?.toLowerCase().endsWith('.mp4');
  const isToolAtlas = post.subreddit === 'toolatlas' || post.tags?.includes('meta:atlas:toolatlas') || post.derivedTags?.includes('meta:atlas:toolatlas');
  
  const displayThumb = formatLocalAssetUrl(post.mediaUrl || post.url || post.thumbnail || post.filePath);
  const [imgSrc, setImgSrc] = React.useState(isGif ? (displayThumb || null) : displayThumb);
  const [isBroken, setIsBroken] = React.useState(false);

  React.useEffect(() => {
    const isGifType = post.tags?.includes('meta:extension:gif') || post.url?.toLowerCase().endsWith('.gif') || post.derivedTags?.includes('meta:extension:gif');
    const optThumb = formatLocalAssetUrl(post.mediaUrl || post.url || post.thumbnail || post.filePath);
    setImgSrc(isGifType ? (optThumb || null) : optThumb);
    setIsBroken(false);
  }, [post._tempId, post.thumbnail, post.mediaUrl, post.url]);


  const handleImageError = () => {
    if (!isGif && imgSrc !== post.mediaUrl && post.mediaUrl) {
      setImgSrc(post.mediaUrl);
    } else {
      setImgSrc(null);
      setIsBroken(true);
    }
  };

  return (
    <div 
      className={`post-card-minimal ${isToolAtlas ? 'toolatlas-card' : ''} ${isGif ? 'gif-card' : ''} ${isVideo ? 'video-card' : ''} ${isBroken ? 'broken-preview-card' : ''}`}
      style={isToolAtlas ? { position: 'relative' } : { backgroundColor: post.colorTheme?.bg, position: 'relative' }}
    >
      <button 
        type="button"
        className="preview-card-remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (onRemove) onRemove();
        }}
        title="Exclude this item from batch upload"
      >
        <X size={12} strokeWidth={2.5} />
      </button>

      {imgSrc && !isBroken ? (
        isVideo ? (
          <video 
            src={imgSrc} 
            muted 
            loop 
            playsInline 
            className="post-card-image" 
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={handleImageError}
          />
        ) : (
          <img 
            src={imgSrc} 
            alt={post.title} 
            referrerPolicy="no-referrer"
            className="post-card-image"
            onError={handleImageError}
          />

        )
      ) : (
        <>
          <div className="post-card-preview-pattern" />
          <div style={{ color: isBroken ? '#ef4444' : (post.colorTheme?.accent || '#cc5a01'), opacity: isBroken ? 0.8 : 0.4 }}>
            {isBroken ? <AlertTriangle size={20} /> : <FileJson size={18} />}
          </div>
        </>
      )}

      <div className="preview-tags-container">
        <div className="preview-tags-header">Derived Tags</div>
        <div className="preview-tags-list">
          {(post.derivedTags || []).map(tag => (
            <span key={tag} className="preview-tag-badge">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Upload() {
  const [uploadType, setUploadType] = useState('local_files'); // 'local_files' | 'disk_scan'
  const [targetAtlas, setTargetAtlas] = useState('localatlas');
  const [dragging, setDragging] = useState(false);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'parsing' | 'loaded' | 'uploading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [precaching, setPrecaching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [atlasTagInput, setAtlasTagInput] = useState('atlas:');
  const [customBatchTagsInput, setCustomBatchTagsInput] = useState('');

  const getParsedBatchUserTags = (atlasInput, customInput) => {
    const tags = [];
    const trimmedAtlas = (atlasInput || '').trim();
    if (trimmedAtlas && trimmedAtlas.toLowerCase() !== 'atlas:') {
      const value = trimmedAtlas.replace(/^atlas:/i, '').trim();
      if (value) {
        tags.push(`meta:atlas:${value}`);
        tags.push(`atlas:${value}`);
      }
    }

    const trimmedCustom = (customInput || '').trim();
    if (trimmedCustom) {
      const parts = trimmedCustom.split(/[,;\s]+/);
      parts.forEach(part => {
        const clean = part.trim().toLowerCase();
        if (clean && clean !== 'atlas:' && !tags.includes(clean)) {
          tags.push(clean);
        }
      });
    }

    return tags;
  };

  const activeBatchUserTags = getParsedBatchUserTags(atlasTagInput, customBatchTagsInput);

  const handleAtlasTagChange = (e) => {
    let val = e.target.value;
    if (!val.toLowerCase().startsWith('atlas:')) {
      val = 'atlas:' + val.replace(/^atlas:/i, '');
    }
    setAtlasTagInput(val);
  };

  const handleWipeDatabase = async () => {
    if (window.confirm("ARE YOU SURE? This will permanently delete ALL stored posts and custom tags from your local database so you can re-upload fresh.")) {
      setIsClearing(true);
      try {
        await clearAllLocalStores();
        handleClear();
        setStatus('idle');
        setMessage('All posts and tags have been wiped clean from database.');
        alert('Database wiped clean successfully. You can now re-upload fresh!');
      } catch (err) {
        console.error('Error wiping database:', err);
        alert('Error wiping database: ' + err.message);
      } finally {
        setIsClearing(false);
      }
    }
  };

  // Dropzone drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      readAndProcessFile(file);
    } else {
      setStatus('error');
      setMessage('Invalid file type. Please drop a valid JSON file.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      readAndProcessFile(file);
    }
  };

  // Helper to detect Twitter tweet objects
  const isTwitterItem = (item) => {
    if (!item || typeof item !== 'object') return false;
    return Boolean(
      item.screen_name ||
      item.full_text ||
      item.tweet_id ||
      (item.metadata && item.metadata.__typename === 'Tweet') ||
      (item.url && (item.url.includes('twitter.com') || item.url.includes('x.com'))) ||
      (Array.isArray(item.media) && item.media.some(m => m.original || m.thumbnail || m.media_url_https))
    );
  };

  // Reads the JSON file
  const readAndProcessFile = (file) => {
    setFileName(file.name);
    setStatus('parsing');
    setTargetAtlas('myatlas');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        let rawItems = [];
        if (Array.isArray(json)) {
          rawItems = json;
        } else if (json.posts && Array.isArray(json.posts)) {
          rawItems = json.posts;
        } else if (json.tweets && Array.isArray(json.tweets)) {
          rawItems = json.tweets;
        } else if (json.items && Array.isArray(json.items)) {
          rawItems = json.items;
        } else if (json.data && Array.isArray(json.data)) {
          rawItems = json.data;
        } else {
          throw new Error("JSON file must contain an array of posts or tweets.");
        }
        processExtractedPosts(rawItems);
      } catch (err) {
        setStatus('error');
        setMessage(`Error parsing JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Process raw scraped JSON array
  const processExtractedPosts = (rawPosts) => {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const batchTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    const parsed = [];

    rawPosts.forEach((post, idx) => {
      if (isTwitterItem(post)) {
        const screenName = post.screen_name || post.metadata?.core?.user_results?.result?.core?.screen_name || post.author || 'unknown';
        
        let mediaList = [];
        if (Array.isArray(post.media) && post.media.length > 0) {
          mediaList = post.media;
        } else if (post.metadata?.legacy?.extended_entities?.media) {
          mediaList = post.metadata.legacy.extended_entities.media;
        } else if (post.metadata?.legacy?.entities?.media) {
          mediaList = post.metadata.legacy.entities.media;
        } else if (post.url || post.thumbnail) {
          mediaList = [{ type: 'photo', url: post.url, thumbnail: post.thumbnail, original: post.url }];
        }

        const tweetText = post.full_text || post.text || post.title || 'Untitled Tweet';

        const hashtags = [];
        const matches = tweetText.match(/#([a-zA-Z0-9_]+)/g);
        if (matches) {
          matches.forEach(h => hashtags.push(`flair:${h.substring(1).toLowerCase()}`));
        }

        mediaList.forEach((mediaItem, mIdx) => {
          const mediaType = mediaItem.type || 'photo';
          const isGif = mediaType === 'animated_gif' || (mediaItem.original && mediaItem.original.includes('.gif'));
          const isVideo = mediaType === 'video';

          let mediaUrl = '';
          if (isVideo || isGif) {
            const variants = mediaItem.video_info?.variants || mediaItem.variants || [];
            const mp4s = variants
              .filter(v => v.content_type === 'video/mp4' || (v.url && v.url.includes('.mp4')))
              .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            if (mp4s.length > 0) {
              mediaUrl = mp4s[0].url;
            } else {
              mediaUrl = mediaItem.original || mediaItem.media_url_https || mediaItem.url || post.url || '';
            }
          } else {
            mediaUrl = mediaItem.original || mediaItem.media_url_https || mediaItem.url || post.url || '';
          }

          const thumbnailUrl = mediaItem.thumbnail || mediaItem.media_url_https || mediaItem.url || post.thumbnail || mediaUrl;

          let ext = null;
          if (isGif) ext = 'gif';
          else if (isVideo) ext = 'mp4';
          else {
            try {
              const u = new URL(mediaUrl);
              const formatParam = u.searchParams.get('format');
              if (formatParam) {
                ext = formatParam.toLowerCase();
              } else {
                const m = u.pathname.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
                if (m) ext = m[1].toLowerCase();
              }
            } catch (e) {}
          }
          if (!ext) ext = 'jpg';
          if (ext === 'jpeg') ext = 'jpg';

          const format = isVideo ? 'video' : 'image';
          const derivedTags = [
            'r/twitter',
            `u/${screenName}`,
            `artist:${screenName.toLowerCase()}`,
            `meta:format:${format}`,
            `meta:extension:${ext}`,
            'meta:source:twitter',
            `meta:upload:${batchTimestamp}`,
            ...hashtags
          ];

          const itemId = mediaList.length > 1 ? `${post.id || idx}_m${mIdx}` : String(post.id || `tw_${Date.now()}_${idx}`);
          const palette = getPalette(tweetText || screenName);

          parsed.push({
            ...post,
            _tempId: itemId,
            id: itemId,
            title: tweetText,
            author: screenName,
            subreddit: 'twitter',
            format: ext,
            url: mediaUrl,
            mediaUrl: mediaUrl,
            thumbnail: getOptimizedThumbnailUrl(thumbnailUrl || mediaUrl, 'small'),
            permalink: post.url || (screenName && post.id ? `https://twitter.com/${screenName}/status/${post.id}` : ''),
            score: Number(post.favorite_count || post.like_count || 0),
            comments_count: Number(post.reply_count || 0),
            created_at: post.created_at || post.legacy?.created_at || new Date().toISOString(),
            derivedTags: Array.from(new Set(derivedTags)),
            colorTheme: {
              bg: palette.bg,
              text: palette.text,
              accent: palette.accent,
              description: palette.desc
            }
          });
        });
      } else {
        // Standard Reddit/Generic JSON Post parsing
        const derivedTags = Array.isArray(post.derivedTags) 
          ? [...post.derivedTags] 
          : (Array.isArray(post.tags) ? [...post.tags] : []);

        if (post.subreddit && post.subreddit !== 'toolatlas' && post.subreddit !== 'unknown' && !derivedTags.includes(`r/${post.subreddit}`)) {
          derivedTags.push(`r/${post.subreddit}`);
        }

        const isGallery = !!post.is_gallery || (post.url && post.url.includes('reddit.com/gallery/'));
        const isVideo = !!post.is_video;
        
        if (isGallery && !derivedTags.includes('meta:format:gallery')) {
          derivedTags.push('meta:format:gallery');
        } else if (isVideo && !derivedTags.includes('meta:format:video')) {
          derivedTags.push('meta:format:video');
        } else if (!isGallery && !isVideo && !derivedTags.includes('meta:format:image')) {
          derivedTags.push('meta:format:image');
        }

        let ext = null;
        if (post.url) {
          try {
            const urlObj = new URL(post.url);
            const path = urlObj.pathname;
            const formatParam = urlObj.searchParams.get('format');
            if (formatParam) {
              ext = formatParam.toLowerCase();
            } else {
              const match = path.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
              if (match) {
                ext = match[1].toLowerCase();
              }
            }
          } catch (e) {}
        }

        if (!ext && isVideo) ext = 'mp4';
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'gifv') ext = 'gif';

        if (ext && !derivedTags.includes(`meta:extension:${ext}`)) {
          derivedTags.push(`meta:extension:${ext}`);
        }

        if (post.flair) {
          const cleanFlair = post.flair.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
          if (cleanFlair && !derivedTags.includes(`flair:${cleanFlair}`)) {
            derivedTags.push(`flair:${cleanFlair}`);
          }
        }

        const isOc = !!post.is_oc || (post.title && (post.title.toLowerCase().includes('[oc]') || post.title.toLowerCase().includes('(oc)')));
        if (isOc && post.author && !derivedTags.includes(`artist:${post.author.toLowerCase()}`)) {
          derivedTags.push(`artist:${post.author.toLowerCase()}`);
        }

        if (!derivedTags.some(t => t.startsWith('meta:upload:'))) {
          derivedTags.push(`meta:upload:${batchTimestamp}`);
        }

        activeBatchUserTags.forEach(bt => {
          if (!derivedTags.includes(bt)) derivedTags.push(bt);
        });

        const uniqueTags = Array.from(new Set(derivedTags));
        const palette = getPalette(post.title || post.author || String(idx));
        const mediaUrl = getMediaUrl(post.url, post.thumbnail);
        const tempId = post.id ? String(post.id) : `preview_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 9)}`;

        parsed.push({
          ...post,
          _tempId: tempId,
          is_oc: isOc,
          is_gallery: isGallery,
          derivedTags: uniqueTags,
          mediaUrl,
          colorTheme: {
            bg: palette.bg,
            text: palette.text,
            accent: palette.accent,
            description: palette.desc
          }
        });
      }
    });

    parsed.forEach(item => ensureTagCategoriesExist(item.derivedTags));

    setPosts(parsed);
    setStatus('loaded');
    setMessage(`Successfully loaded ${parsed.length} items for import.`);
  };

  // Pick local hard drive files
  const handleSelectLocalMediaFiles = async () => {
    setStatus('parsing');
    setTargetAtlas('localatlas');
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const batchTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    try {
      if (isDesktopApp()) {
        const selected = await selectLocalFiles({ multiple: true, title: 'Select Media Files' });
        if (!selected) {
          setStatus('idle');
          return;
        }
        let filePaths = Array.isArray(selected) ? selected : [selected];
        setFileName(`${filePaths.length} local file(s) selected`);

        // Check if manifest.json exists in the parent directory of selected files
        const manifestMap = new Map();
        try {
          const firstPath = filePaths[0];
          const parentDirPath = firstPath.substring(0, Math.max(firstPath.lastIndexOf('/'), firstPath.lastIndexOf('\\')));
          const manifestUrl = formatLocalAssetUrl(`${parentDirPath}/manifest.json`);
          const manifestRes = await fetch(manifestUrl);
          if (manifestRes.ok) {
            const manifestJson = await manifestRes.json();
            if (Array.isArray(manifestJson)) {
              manifestJson.forEach(item => {
                if (item && item.file && Array.isArray(item.tags)) {
                  manifestMap.set(item.file.toLowerCase(), item.tags);
                  const baseName = item.file.substring(0, item.file.lastIndexOf('.')).toLowerCase();
                  if (baseName) manifestMap.set(baseName, item.tags);
                  ensureTagCategoriesExist(item.tags);
                }
              });
            }
          }
        } catch (manifestErr) {
          // Ignore manifest load errors if not present
        }

        // Filter out manifest.json itself from image selection if user selected all files
        filePaths = filePaths.filter(fp => !fp.toLowerCase().endsWith('manifest.json'));

        const parsed = await Promise.all(filePaths.map(async (fp, idx) => {
          const name = fp.split(/[\\/]/).pop();
          const ext = name.split('.').pop().toLowerCase();
          const baseName = name.substring(0, name.lastIndexOf('.'));
          const palette = getPalette(name);
          const assetUrl = formatLocalAssetUrl(fp);
          const isVid = ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext);

          let thumbUrl = assetUrl;
          if (isVid) {
            try {
              thumbUrl = await generateVideoWebpThumbnail(fp);
            } catch (e) {
              console.warn('Video thumbnail generation error:', e);
            }
          }

          const parts = fp.split(/[\\/]/).filter(Boolean);
          let folderTag = null;
          if (parts.length >= 2) {
            const parentFolder = parts[parts.length - 2];
            const cleanFolder = parentFolder.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
            if (cleanFolder && !cleanFolder.match(/^[a-z]:$/i)) {
              folderTag = cleanFolder;
            }
          }

          const fileDerivedTags = [
            `meta:extension:${ext}`,
            `meta:format:${isVid ? 'video' : 'image'}`,
            `meta:upload:${batchTimestamp}`,
            ...activeBatchUserTags
          ];

          if (folderTag) {
            fileDerivedTags.push(`meta:folder:${folderTag}`);
            fileDerivedTags.push(`folder:${folderTag}`);
          }

          // Check if manifest tags exist for this file
          const manifestTags = manifestMap.get(name.toLowerCase()) || manifestMap.get(baseName.toLowerCase());
          if (manifestTags && Array.isArray(manifestTags)) {
            manifestTags.forEach(t => {
              if (t && !fileDerivedTags.includes(t)) {
                fileDerivedTags.push(t);
              }
            });
            ensureTagCategoriesExist(manifestTags);
          }

          return {
            _tempId: `local_${Date.now()}_${idx}`,
            title: name,
            url: assetUrl,
            mediaUrl: assetUrl,
            thumbnail: thumbUrl,
            filePath: fp,
            derivedTags: Array.from(new Set(fileDerivedTags)),
            colorTheme: { bg: palette.bg, text: palette.text, accent: palette.accent, description: palette.desc }
          };
        }));

        setPosts(parsed);
        setStatus('loaded');
        setMessage(`Loaded ${parsed.length} local files for indexing (with enriched manifest metadata).`);

      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
          const files = Array.from(e.target.files || []);
          setFileName(`${files.length} web file(s) selected`);
          
          Promise.all(files.map((file, idx) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                const ext = file.name.split('.').pop().toLowerCase();
                const palette = getPalette(file.name);
                resolve({
                  _tempId: `webfile_${Date.now()}_${idx}`,
                  title: file.name,
                  url: dataUrl,
                  mediaUrl: dataUrl,
                  thumbnail: dataUrl,
                  filePath: file.name,
                  derivedTags: [
                    `meta:extension:${ext}`,
                    `meta:format:${file.type.startsWith('video') ? 'video' : 'image'}`,
                    `meta:upload:${batchTimestamp}`
                  ],
                  colorTheme: { bg: palette.bg, text: palette.text, accent: palette.accent, description: palette.desc }
                });

              };
              reader.readAsDataURL(file);
            });
          })).then(parsed => {
            setPosts(parsed);
            setStatus('loaded');
            setMessage(`Loaded ${parsed.length} local files for indexing.`);
          });
        };
        input.click();
      }

    } catch (err) {
      console.error('Error selecting local files:', err);
      setStatus('error');
      setMessage(`Error picking files: ${err.message}`);
    }
  };

  // Commit items to target destination
  const handleCommitToDatabase = async () => {
    setStatus('uploading');
    try {
      if (targetAtlas === 'myatlas') {
        const { importScrapedJsonArray } = await import('../services/localDb');
        const res = await importScrapedJsonArray(posts);
        const count = Array.isArray(res) ? res.length : res;
        setStatus('success');
        setMessage(`Successfully imported ${count} items into your local myatlas database!`);
      } else if (targetAtlas === 'localatlas') {
        const { addLocalMediaFile } = await import('../services/localDb');
        for (const post of posts) {
          await addLocalMediaFile({
            filePath: post.filePath || post.mediaUrl || post.title,
            fileName: post.title,
            format: (post.title || '').split('.').pop() || 'jpg',
            sizeBytes: 0,
            thumbnailUrl: post.thumbnail || post.mediaUrl,
            tags: post.derivedTags || []
          });
        }
        setStatus('success');
        setMessage(`Successfully indexed ${posts.length} local media files!`);
      } else {
        const { importScrapedJsonArray } = await import('../services/localDb');
        const res = await importScrapedJsonArray(posts);
        const count = Array.isArray(res) ? res.length : res;
        setStatus('success');
        setMessage(`Successfully imported ${count} items into your local database!`);
      }

    } catch (err) {
      console.error('Error committing posts:', err.message);
      setStatus('error');
      setMessage(`Commit failed: ${err.message}`);
    }
  };

  const handleRemovePost = (targetTempId) => {
    setPosts(prev => {
      const next = prev.filter(p => p._tempId !== targetTempId);
      if (next.length === 0) {
        setStatus('idle');
        setMessage('');
        setFileName('');
      }
      return next;
    });
  };

  const handleClear = () => {
    setPosts([]);
    setStatus('idle');
    setMessage('');
    setFileName('');
  };

  const handlePrecacheMissing = async () => {
    setPrecaching(true);
    try {
      const res = await fetch('http://127.0.0.1:7171/api/precache', { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        setStatus('success');
        setMessage(`Scanned database: Found ${data.count} missing thumbnail(s). Background repair launched!`);
      } else {
        setStatus('error');
        setMessage('Failed to launch thumbnail repair.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(`Repair server unavailable: ${err.message}`);
    } finally {
      setPrecaching(false);
    }
  };

  return (
    <div className="upload-container">
      {/* Page Header */}
      <div className="upload-preview-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="upload-preview-title">Local Hard Drive Ingestion Manager</h2>
            <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              Index local photos and videos on your hard drive with automated folder tagging, WebP thumbnail generation, and batch classification.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={handlePrecacheMissing}
              disabled={precaching}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
            >
              <RefreshCw size={14} className={precaching ? 'spin' : ''} />
              {precaching ? 'Scanning Cache...' : 'Repair Missing Thumbnails'}
            </button>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={handleWipeDatabase}
              disabled={isClearing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}
              title="Permanently delete all stored posts and custom tags from database"
            >
              <Trash2 size={14} />
              {isClearing ? 'Wiping DB...' : 'Delete All Posts + Tags'}
            </button>
            {posts.length > 0 && (
              <button className="clear-filters-btn-minimal" onClick={handleClear}>
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Configuration Controls Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', width: '100%', background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {/* 1. Upload Source Method */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Local Source Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => { setUploadType('local_files'); setTargetAtlas('localatlas'); handleClear(); }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: uploadType === 'local_files' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  background: uploadType === 'local_files' ? 'var(--accent-light)' : 'var(--bg-primary)',
                  color: uploadType === 'local_files' ? 'var(--accent-color)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <HardDrive size={16} /> Select Local Media Files
              </button>
            </div>
          </div>
        </div>

        {/* 3. Batch Namespace Tagging Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} style={{ color: 'var(--accent-color)' }} />
              3. Batch Namespace Tagging (Applied to All Items in Batch)
            </label>
            {activeBatchUserTags.length > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-color)' }}>
                {activeBatchUserTags.length} batch tag(s) active
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Box 1: Pre-filled atlas: tag */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Atlas Tag (Pre-filled <code>atlas:</code> prefix):
              </label>
              <input
                type="text"
                value={atlasTagInput}
                onChange={handleAtlasTagChange}
                placeholder="atlas:collection_name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
                Generates <code>meta:atlas:{atlasTagInput.replace(/^atlas:/i, '').trim() || 'value'}</code> tag
              </span>
            </div>

            {/* Box 2: Free-form namespace:value tags */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Free-Form Namespace Tags (Comma or space separated):
              </label>
              <input
                type="text"
                value={customBatchTagsInput}
                onChange={(e) => setCustomBatchTagsInput(e.target.value)}
                placeholder="medium:3d, genre:sci-fi, mood:dark, location:japan"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
                Any <code>namespace:value</code> tags (e.g. <code>medium:digital</code>, <code>genre:cyberpunk</code>)
              </span>
            </div>
          </div>

          {/* Active Batch Tags Pills Preview */}
          {activeBatchUserTags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Batch Tags:</span>
              {activeBatchUserTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    border: '1px solid rgba(204, 90, 1, 0.25)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mode A: Dropzone for JSON Files */}
      {posts.length === 0 && uploadType === 'json' && (
        <>
          <div 
            className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('json-file-input').click()}
          >
            <UploadIcon className="upload-dropzone-icon" size={48} strokeWidth={1} />
            <h3 className="upload-dropzone-title">Drop Scraped JSON file here</h3>
            <p className="upload-dropzone-subtitle">
              or click to browse your files (e.g. reddit_posts_Morrowind_....json)
            </p>
            <input 
              id="json-file-input" 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          {/* Supported Formats Info */}
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Supported JSON Export Schemas:</h4>
            <ul style={{ fontSize: '12px', opacity: 0.8, paddingLeft: '18px', lineHeight: 1.6 }}>
              <li><strong>Twitter / X Scrapes & Media Archives</strong>: Tweets with <code>screen_name</code>, <code>full_text</code>, <code>media</code> arrays (photos, videos, gifs) & remote hotlink URLs (e.g. <code>twitter-UserMedia-*.json</code>).</li>
              <li><strong>Reddit Saves & Scrapes</strong>: Files exported with <code>author</code>, <code>subreddit</code>, <code>url</code>, <code>thumbnail</code>, <code>permalink</code>, <code>score</code>, <code>comments_count</code> (e.g. <code>reddit_posts_*.json</code>).</li>
              <li><strong>Toolfolio & Tech Ingestion Batches</strong>: JSON files with <code>title</code>, <code>permalink</code>, <code>thumbnail</code>, <code>tags</code> (e.g. <code>toolfolio_50_batch*.json</code>).</li>
              <li><strong>Generic Booru Arrays</strong>: Any JSON array of objects with <code>id</code>, <code>title</code>, <code>url</code>, and <code>tags</code>.</li>
            </ul>
          </div>

          {status === 'error' && (
            <div className="no-results-minimal" style={{ borderColor: '#ef4444', color: '#b91c1c', backgroundColor: '#fef2f2', marginTop: '16px' }}>
              <AlertTriangle size={18} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
              {message}
            </div>
          )}
        </>
      )}

      {/* Mode B: Local Disk File Picker */}
      {posts.length === 0 && uploadType === 'local_files' && (
        <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px', marginTop: '16px' }}>
          <HardDrive size={48} strokeWidth={1} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Select Local Hard Drive Files</h3>
          <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '16px' }}>
            Pick images (.jpg, .png, .gif, .webp) or videos (.mp4, .webm) from your computer to index into <strong>{targetAtlas}</strong>.
          </p>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleSelectLocalMediaFiles}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            <Folder size={16} /> Select Hard Drive Files
          </button>
        </div>
      )}

      {/* Preview Ingestion State */}
      {posts.length > 0 && (
        <>
          {/* Status Message */}
          {status === 'success' ? (
            <div className="no-results-minimal" style={{ borderColor: '#22c55e', color: '#15803d', backgroundColor: '#f0fdf4', fontSize: '1rem', padding: '1.5rem', marginTop: '16px' }}>
              <CheckCircle size={24} style={{ marginRight: '0.6rem', display: 'inline', verticalAlign: 'middle' }} />
              {message}
            </div>
          ) : status === 'error' ? (
            <div className="no-results-minimal" style={{ borderColor: '#ef4444', color: '#b91c1c', backgroundColor: '#fef2f2', marginTop: '16px' }}>
              <AlertTriangle size={18} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
              {message}
            </div>
          ) : (
            <div className="no-results-minimal" style={{ borderStyle: 'solid', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginTop: '16px' }}>
              <FileJson size={18} className="text-secondary" />
              <span>Loaded <strong>{fileName}</strong> ({posts.length} items). Preview tags on hover, or click <strong>×</strong> on any card to exclude it before importing.</span>
            </div>
          )}

          {/* Densely Packed Rows of 8 Grid with image hotlinks */}
          <div className="gallery-grid-dense">
            {posts.map((post) => (
              <PreviewCard 
                key={post._tempId} 
                post={post} 
                onRemove={() => handleRemovePost(post._tempId)}
              />
            ))}
          </div>

          {/* Sticky Commit Action Bar */}
          {status !== 'success' && (
            <div className="upload-commit-bar">
              <div className="upload-commit-info">
                <span className="upload-commit-stat">{posts.length} Items Ready</span>
                <span className="upload-commit-desc">
                  Target Destination: <strong>MyAtlas</strong> (Local SQLite Database).
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleClear}
                  disabled={status === 'uploading'}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCommitToDatabase}
                  disabled={status === 'uploading'}
                >
                  <Database size={15} />
                  {status === 'uploading' ? 'Importing...' : `Import into ${targetAtlas}`}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

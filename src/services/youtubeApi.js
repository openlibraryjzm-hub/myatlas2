/**
 * YouTube API Service for MyAtlas
 * Handles: API key storage, YouTube link parsing, Data API v3 & oEmbed metadata fetching,
 * and automatic Booru taxonomy tag extraction per docs/taxonomy.md
 */

const API_KEY_STORAGE_KEY = 'myatlas_youtube_api_key';

/**
 * Get YouTube API key from local storage
 */
export function getYoutubeApiKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

/**
 * Save YouTube API key to local storage
 */
export function setYoutubeApiKey(key) {
  if (typeof window === 'undefined') return;
  const clean = (key || '').trim();
  if (clean) {
    localStorage.setItem(API_KEY_STORAGE_KEY, clean);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

/**
 * Parse an 11-character YouTube video ID from various link formats
 */
export function parseYoutubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();

  // Raw 11-character Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Standard YouTube URL regex patterns (watch?v=, shortlinks, shorts, embeds)
  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

/**
 * Parse multi-line string containing YouTube URLs or IDs
 */
export function parseMultipleYoutubeLinks(text) {
  if (!text || typeof text !== 'string') return { valid: [], invalid: [], total: 0 };
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const validMap = new Map();
  const invalid = [];

  lines.forEach((line) => {
    const videoId = parseYoutubeVideoId(line);
    if (videoId) {
      if (!validMap.has(videoId)) {
        validMap.set(videoId, {
          id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          rawInput: line
        });
      }
    } else {
      invalid.push(line);
    }
  });

  return {
    valid: Array.from(validMap.values()),
    invalid,
    total: lines.length
  };
}

/**
 * Helper to parse ISO8601 duration string (e.g. PT1H10M24S -> 1h10m24s)
 */
function parseIsoDuration(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return '';
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return durationStr;
  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? `${match[2]}m` : '';
  const seconds = match[3] ? `${match[3]}s` : '';
  return `${hours}${minutes}${seconds}` || durationStr;
}

/**
 * Convert metadata object to Booru taxonomy tags according to docs/taxonomy.md
 */
export function buildYoutubeTaxonomyTags(meta) {
  const tags = [];
  const videoId = meta.id;

  // 1. Source Category (source:)
  tags.push(`source:https://www.youtube.com/watch?v=${videoId}`);
  tags.push('source:youtube');

  // 2. Creator Category (creator: / artist:)
  if (meta.channelTitle) {
    const cleanChannel = meta.channelTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s-]+/g, '_');
    if (cleanChannel) {
      tags.push(`creator:${cleanChannel}`);
      tags.push(`artist:${cleanChannel}`);
    }
  }

  // 3. Metadata Category (meta:)
  tags.push('meta:youtube');
  tags.push('meta:format:video');

  if (meta.publishedAt) {
    const year = new Date(meta.publishedAt).getFullYear();
    if (!isNaN(year)) {
      tags.push(`year:${year}`);
      const dateStr = meta.publishedAt.split('T')[0];
      if (dateStr) tags.push(`meta:published:${dateStr}`);
    }
  }

  if (meta.duration) {
    const dur = parseIsoDuration(meta.duration);
    if (dur) tags.push(`meta:duration:${dur}`);
  }

  // 4. General Category (creator video tags)
  if (Array.isArray(meta.tags)) {
    meta.tags.forEach((rawTag) => {
      const cleanTag = rawTag
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '_');
      if (cleanTag && cleanTag.length > 1 && !tags.includes(cleanTag)) {
        tags.push(cleanTag);
      }
    });
  }

  return Array.from(new Set(tags));
}

/**
 * Fetch video details for a single YouTube video ID
 */
export async function fetchYoutubeVideoMetadata(videoId) {
  const batch = await fetchYoutubeMetadataBatch([videoId]);
  return batch[0] || null;
}

/**
 * Fetch metadata for batch of YouTube video IDs (Data API v3 or oEmbed fallback)
 */
export async function fetchYoutubeMetadataBatch(videoIds) {
  if (!Array.isArray(videoIds) || videoIds.length === 0) return [];
  const uniqueIds = Array.from(new Set(videoIds.filter(Boolean)));

  const apiKey = getYoutubeApiKey();

  if (apiKey) {
    try {
      // YouTube API limits to 50 IDs per request
      const chunks = [];
      for (let i = 0; i < uniqueIds.length; i += 50) {
        chunks.push(uniqueIds.slice(i, i + 50));
      }

      const results = [];
      for (const chunk of chunks) {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${chunk.join(',')}&key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`YouTube API returned ${res.status}`);
        }
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item) => {
            const snippet = item.snippet || {};
            const contentDetails = item.contentDetails || {};
            const stats = item.statistics || {};
            const thumbs = snippet.thumbnails || {};

            const bestThumb = thumbs.maxres?.url || thumbs.high?.url || thumbs.medium?.url || `https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`;

            results.push({
              id: item.id,
              title: snippet.title || 'Untitled YouTube Video',
              channelTitle: snippet.channelTitle || 'YouTube Channel',
              channelId: snippet.channelId || '',
              publishedAt: snippet.publishedAt || new Date().toISOString(),
              description: snippet.description || '',
              thumbnailUrl: bestThumb,
              duration: contentDetails.duration || '',
              tags: snippet.tags || [],
              viewCount: stats.viewCount || 0,
              url: `https://www.youtube.com/watch?v=${item.id}`
            });
          });
        }
      }

      if (results.length > 0) return results;
    } catch (err) {
      console.warn('YouTube Data API error, falling back to oEmbed:', err.message);
    }
  }

  // Fallback: YouTube oEmbed API (No API key required)
  const oembedPromises = uniqueIds.map(async (id) => {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
      const res = await fetch(oembedUrl);
      if (!res.ok) throw new Error(`oEmbed returned ${res.status}`);
      const data = await res.json();
      return {
        id,
        title: data.title || 'Untitled YouTube Video',
        channelTitle: data.author_name || 'YouTube Channel',
        channelId: '',
        publishedAt: new Date().toISOString(),
        description: '',
        thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        duration: '',
        tags: [],
        viewCount: 0,
        url: `https://www.youtube.com/watch?v=${id}`
      };
    } catch (e) {
      // Baseline fallback if oEmbed fails too
      return {
        id,
        title: `YouTube Video #${id}`,
        channelTitle: 'YouTube',
        channelId: '',
        publishedAt: new Date().toISOString(),
        description: '',
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        duration: '',
        tags: [],
        viewCount: 0,
        url: `https://www.youtube.com/watch?v=${id}`
      };
    }
  });

  return await Promise.all(oembedPromises);
}

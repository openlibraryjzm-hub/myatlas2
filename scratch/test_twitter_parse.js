import fs from 'fs';

const PASTEL_PALETTES = [
  { bg: "#f5f3f9", text: "#6b21a8", accent: "#a855f7" },
  { bg: "#f0fdf4", text: "#166534", accent: "#22c55e" },
  { bg: "#fff5f5", text: "#9b2c2c", accent: "#e53e3e" },
  { bg: "#ecfeff", text: "#155e75", accent: "#06b6d4" },
  { bg: "#fefdf0", text: "#78350f", accent: "#d97706" },
  { bg: "#fafaf9", text: "#44403c", accent: "#78716c" }
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

function parseTwitterPost(post, batchTimestamp, idx) {
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

  const results = mediaList.map((mediaItem, mIdx) => {
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

    return {
      _tempId: itemId,
      id: itemId,
      title: tweetText,
      author: screenName,
      subreddit: 'twitter',
      format: ext,
      url: mediaUrl,
      mediaUrl: mediaUrl,
      thumbnail: thumbnailUrl,
      permalink: post.url || (screenName && post.id ? `https://twitter.com/${screenName}/status/${post.id}` : ''),
      score: Number(post.favorite_count || post.like_count || 0),
      comments_count: Number(post.reply_count || 0),
      created_at: post.created_at || post.legacy?.created_at || new Date().toISOString(),
      derivedTags: Array.from(new Set(derivedTags)),
      colorTheme: { bg: palette.bg, text: palette.text, accent: palette.accent }
    };
  });

  return results;
}

// Read sample JSON
const data = JSON.parse(fs.readFileSync('import/twitter-UserMedia-1787202999020.json'));
let allParsed = [];
data.forEach((post, idx) => {
  if (isTwitterItem(post)) {
    const items = parseTwitterPost(post, '2026-08-20_17-30-00', idx);
    allParsed.push(...items);
  }
});

console.log('Total parsed items:', allParsed.length);
console.log('Sample parsed item #0:', allParsed[0]);
console.log('Sample parsed item #10:', allParsed[10]);

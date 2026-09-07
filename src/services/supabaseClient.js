import { createClient } from '@supabase/supabase-js';
import { parseTagsArray } from '../data/mockData';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://giguvusbbgonlvsqtrei.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-eLh4iHUShl5pYEyXOLEvg_YBvfrLST';

let supabaseInstance = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return supabaseInstance;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
    }
  }
  return null;
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

import { formatLocalAssetUrl } from '../utils/localFiles';

/**
 * Upload a binary file or blob to Supabase Storage bucket ('atlas-media')
 */
export async function uploadMediaToSupabaseStorage(atlasId, fileOrBlob, fileName) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const sanitizeKey = (str) => str.replace(/[^\w.-]/g, '_').toLowerCase();
  const cleanAtlasId = sanitizeKey(atlasId || 'curated');

  // Extract extension from fileName or fileOrBlob
  let ext = 'jpg';
  const match = (fileName || fileOrBlob || '').match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
  if (match) {
    ext = match[1].toLowerCase();
  }

  let cleanBaseName = sanitizeKey((fileName || `media_${Date.now()}`).replace(/\.[^/.]+$/, ''));
  const cleanFileName = `${cleanBaseName}.${ext}`;
  const storagePath = `${cleanAtlasId}/${cleanFileName}`;

  let blob = fileOrBlob;
  if (typeof fileOrBlob === 'string') {
    const targetUrl = formatLocalAssetUrl(fileOrBlob);
    try {
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      blob = await res.blob();
    } catch (fetchErr) {
      console.warn(`Failed to fetch binary for ${fileOrBlob}:`, fetchErr.message);
      // Fallback: If it's already an HTTP URL, return it directly
      if (fileOrBlob.startsWith('http://') || fileOrBlob.startsWith('https://')) {
        return fileOrBlob;
      }
      throw new Error(`Cannot upload missing or unreadable file: ${fileName || fileOrBlob}`);
    }
  }

  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  else if (ext === 'webp') contentType = 'image/webp';
  else if (ext === 'gif') contentType = 'image/gif';
  else if (ext === 'mp4') contentType = 'video/mp4';

  const { data, error } = await supabase.storage
    .from('atlas-media')
    .upload(storagePath, blob, {
      upsert: true,
      contentType
    });

  if (error) {
    console.warn(`Supabase Storage upload notice for ${storagePath}:`, error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('atlas-media')
    .getPublicUrl(storagePath);

  return publicUrlData?.publicUrl || (typeof fileOrBlob === 'string' ? fileOrBlob : '');
}


/**
 * Commit posts directly to Supabase Cloud Database ('posts' table)
 */
export async function commitPostsToSupabase(atlasId, postsArray) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const cleanAtlas = atlasId || 'myatlas';

  // 1. Register atlas in Supabase 'atlases' table if not present
  try {
    await supabase.from('atlases').insert([{
      id: cleanAtlas,
      name: cleanAtlas.charAt(0).toUpperCase() + cleanAtlas.slice(1),
      tagline: `${cleanAtlas} collection`,
      description: `Curated ${cleanAtlas} archive`,
      theme_color: '#2563EB'
    }]);
  } catch (e) {}

  // 2. Prepare post records
  const records = postsArray.map((post, idx) => {
    const tagsList = parseTagsArray(post.derivedTags || post.tags);
    const sourceUrl = tagsList.find(t => typeof t === 'string' && t.startsWith('source:'))?.replace('source:', '') || post.permalink || '';
    const itemId = post.id || `cloud_${cleanAtlas}_${Date.now()}_${idx}`;

    return {
      id: itemId,
      atlas_id: cleanAtlas,
      name: post.title || post.fileName || `Item #${idx + 1}`,
      tagline: post.author || null,
      description: null,
      website: post.mediaUrl || post.url || post.thumbnail || sourceUrl,
      secondary_url: sourceUrl,
      visual_color: post.colorTheme?.accent || '#7c3aed',
      rating: 'safe',
      tags: tagsList,
      created_at: post.created_at || new Date().toISOString()
    };
  });

  // 3. Insert records
  let { data, error } = await supabase
    .from('posts')
    .insert(records)
    .select();

  // If duplicate IDs exist, replace them cleanly for batch re-upload
  if (error) {
    console.warn('Supabase insert notice, updating batch items:', error.message);
    const ids = records.map(r => r.id).filter(Boolean);
    if (ids.length > 0) {
      await supabase.from('posts').delete().in('id', ids);
    }
    const retry = await supabase.from('posts').insert(records).select();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Supabase DB commit error:', error);
    throw new Error(error.message || 'Database commit failed');
  }

  return data || records;
}

/**
 * Fetch cloud posts from Supabase for a given atlas_id
 */
export async function fetchSupabasePosts({ atlasId = 'gamesatlas', page = 1, limit = 40, search = '', tags = [] } = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    let query = supabase.from('posts').select('*', { count: 'exact' });

    if (atlasId) {
      query = query.eq('atlas_id', atlasId);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map(r => ({
      id: r.id,
      title: r.name || r.title || 'Untitled Item',
      author: r.tagline || r.author || 'Curated',
      subreddit: r.atlas_id || 'curated',
      format: 'jpg',
      url: r.website || r.url,
      mediaUrl: r.website || r.url,
      thumbnail: r.website || r.url || r.thumbnail,
      permalink: r.secondary_url || r.permalink,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
      atlas_id: r.atlas_id,
      color_theme: { bg: '#f5f2eb', text: '#1e1d1b', accent: r.visual_color || '#7c3aed' },
      created_at: r.created_at
    }));

    return {
      posts: mapped,
      totalCount: count || mapped.length,
      page,
      limit
    };
  } catch (err) {
    console.warn(`Supabase fetch warning for atlas '${atlasId}':`, err.message);
    return null;
  }
}

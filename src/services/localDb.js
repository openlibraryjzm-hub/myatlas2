/**
 * Local Database Service using Tauri SQL Plugin (SQLite) & In-Memory/Web Fallback
 * Handles:
 * 1. myatlas: Imported Scraped JSON archives (Reddit saves, Twitter bookmarks)
 * 2. localatlas: Hard drive media files (.jpg, .png, .mp4, .gif)
 */

import { isDesktopApp, formatLocalAssetUrl, getLocalFileAsBlobUrl } from '../utils/localFiles';
import { checkServerHealth, importServerPostsBatch } from './api';
import { getTagCategory } from '../data/mockData';

let dbInstance = null;
const DB_NAME = 'sqlite:myatlas_local.db';

// IndexedDB persistence layer for web mode (unlimited disk quota, zero 5MB limits)
const IDB_NAME = 'myatlas_web_idb';
const IDB_VERSION = 1;

let idbPromise = null;

function getIDB() {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('scrapes')) db.createObjectStore('scrapes', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('media')) db.createObjectStore('media', { keyPath: 'id' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => resolve(null);
  });
  return idbPromise;
}

async function saveToIDB(storeName, items) {
  const db = await getIDB();
  if (!db) return;
  try {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    console.warn(`IndexedDB save warning on ${storeName}:`, e);
  }
}

async function loadFromIDB(storeName) {
  const db = await getIDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

let webScrapesStore = [];
let webLocalMediaStore = [];

function syncWebStores() {
  try {
    saveToIDB('scrapes', webScrapesStore);
    saveToIDB('media', webLocalMediaStore);
  } catch (e) {}
}



/**
 * Get or initialize the local SQLite database
 */
export async function getLocalDb() {
  if (dbInstance) return dbInstance;

  if (isDesktopApp()) {
    try {
      const Database = (await import('@tauri-apps/plugin-sql')).default;
      dbInstance = await Database.load(DB_NAME);

      // Create SQLite table for myatlas (imported JSON scraped archives)
      await dbInstance.execute(`
        CREATE TABLE IF NOT EXISTS local_scrapes (
          id TEXT PRIMARY KEY,
          reddit_id TEXT,
          title TEXT,
          author TEXT,
          subreddit TEXT,
          url TEXT,
          thumbnail TEXT,
          permalink TEXT,
          score INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          extracted_at TEXT
        );
      `);

      // Create SQLite table for localatlas (hard drive files)
      await dbInstance.execute(`
        CREATE TABLE IF NOT EXISTS local_media (
          id TEXT PRIMARY KEY,
          file_path TEXT UNIQUE,
          file_name TEXT,
          format TEXT,
          size_bytes INTEGER,
          thumbnail_url TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Local SQLite database ready:', DB_NAME);
      return dbInstance;
    } catch (err) {
      console.error('Failed to initialize Tauri SQLite plugin:', err);
    }
  }

  return null;
}

/**
 * Import a Reddit/Scraped JSON array into local_scrapes (myatlas)
 */
export async function importScrapedJsonArray(items) {
  const db = await getLocalDb();

  const formattedItems = (items || []).map((item, idx) => {
    const id = item.id || item.reddit_id || `scrape_${Date.now()}_${idx}`;
    const subreddit = item.subreddit || 'imported';
    const author = item.author || 'unknown';

    // Build derived tags
    const derivedTags = [];
    if (subreddit && subreddit !== 'imported') derivedTags.push(`r/${subreddit}`);
    if (author && author !== 'unknown') derivedTags.push(`u/${author}`);
    if (item.flair) derivedTags.push(`flair:${item.flair}`);
    if (item.is_oc) derivedTags.push('meta:oc');
    if (item.is_video) derivedTags.push('meta:video');

    const resolvedUrl = item.url || item.mediaUrl || item.thumbnail || item.filePath || '';
    const resolvedThumb = item.thumbnail || item.mediaUrl || item.url || item.filePath || '';

    return {
      id: String(id),
      reddit_id: String(item.reddit_id || item.id || ''),
      title: item.title || item.fileName || 'Untitled Item',
      author: author,
      subreddit: subreddit,
      url: resolvedUrl,
      thumbnail: resolvedThumb,
      permalink: item.permalink || '',
      score: Number(item.score || 0),
      comments_count: Number(item.comments_count || 0),
      tags: item.tags || item.derivedTags || derivedTags,
      created_at: item.created_at || new Date().toISOString(),
      extracted_at: item.extracted_at || new Date().toISOString()
    };

  });

  // Attempt sync to C# Backend Minimal WebAPI if online
  const isServerOnline = await checkServerHealth();
  if (isServerOnline) {
    try {
      await importServerPostsBatch(formattedItems);
    } catch (err) {
      console.warn('Backend sync failed, saving to client SQLite:', err);
    }
  }

  if (isDesktopApp() && db) {
    try {
      for (const item of formattedItems) {
        await db.execute(`
          INSERT OR REPLACE INTO local_scrapes 
          (id, reddit_id, title, author, subreddit, url, thumbnail, permalink, score, comments_count, tags, extracted_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        `, [
          item.id,
          item.reddit_id,
          item.title,
          item.author,
          item.subreddit,
          item.url,
          item.thumbnail,
          item.permalink,
          item.score,
          item.comments_count,
          JSON.stringify(item.tags),
          item.extracted_at
        ]);
      }
    } catch (err) {
      console.error('Error inserting into local_scrapes SQLite:', err);
    }
  }

  webScrapesStore = [...formattedItems, ...webScrapesStore];
  syncWebStores();
  invalidateItemsCache();
  return formattedItems;
}


/**
 * Fetch all scraped posts from local_scrapes
 */
export async function getLocalScrapes() {
  const db = await getLocalDb();

  if (isDesktopApp() && db) {
    try {
      const rows = await db.select('SELECT * FROM local_scrapes ORDER BY created_at DESC');
      return rows.map(r => ({
        id: r.id,
        reddit_id: r.reddit_id,
        title: r.title,
        author: r.author,
        subreddit: r.subreddit,
        url: r.url,
        thumbnail: r.thumbnail,
        permalink: r.permalink,
        score: r.score,
        comments_count: r.comments_count,
        tags: r.tags ? JSON.parse(r.tags) : [],
        created_at: r.created_at,
        extracted_at: r.extracted_at
      }));
    } catch (err) {
      console.error('Error querying local_scrapes:', err);
    }
  }

  if (webScrapesStore.length === 0) {
    webScrapesStore = await loadFromIDB('scrapes');
  }
  return webScrapesStore;
}

/**
 * Add a local hard drive media file to local_media (localatlas)
 */
export async function addLocalMediaFile(fileInfo) {
  const db = await getLocalDb();
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  const newItem = {
    id,
    file_path: fileInfo.filePath,
    file_name: fileInfo.fileName || fileInfo.filePath.split(/[/\\]/).pop(),
    format: fileInfo.format || fileInfo.filePath.split('.').pop().toLowerCase(),
    size_bytes: fileInfo.sizeBytes || 0,
    thumbnail_url: fileInfo.thumbnailUrl || fileInfo.filePath,
    tags: fileInfo.tags || [`meta:extension:${fileInfo.format || 'file'}`],
    created_at: new Date().toISOString()
  };

  // Sync to C# Backend if online to trigger background thumbnail extraction
  const isServerOnline = await checkServerHealth();
  if (isServerOnline) {
    try {
      await importServerPostsBatch([{
        id: newItem.id,
        filePath: newItem.file_path,
        title: newItem.file_name,
        author: 'local_creator',
        subreddit: 'localatlas',
        format: newItem.format,
        sizeBytes: newItem.size_bytes,
        url: formatLocalAssetUrl(newItem.file_path),
        thumbnail: newItem.thumbnail_url,
        tags: newItem.tags
      }]);
    } catch (err) {
      console.warn('Backend sync warning for addLocalMediaFile:', err);
    }
  }

  if (isDesktopApp() && db) {
    try {
      await db.execute(`
        INSERT OR REPLACE INTO local_media 
        (id, file_path, file_name, format, size_bytes, thumbnail_url, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [
        newItem.id,
        newItem.file_path,
        newItem.file_name,
        newItem.format,
        newItem.size_bytes,
        newItem.thumbnail_url,
        JSON.stringify(newItem.tags)
      ]);
    } catch (err) {
      console.error('Error inserting into local_media SQLite:', err);
    }
  }

  webLocalMediaStore = [newItem, ...webLocalMediaStore];
  syncWebStores();
  invalidateItemsCache();
  return newItem;
}


/**
 * Fetch all local hard drive files from local_media
 */
export async function getLocalMediaFiles() {
  const db = await getLocalDb();

  if (isDesktopApp() && db) {
    try {
      const rows = await db.select('SELECT * FROM local_media ORDER BY created_at DESC');
      return rows.map(r => {
        const assetUrl = formatLocalAssetUrl(r.file_path);
        const thumbUrl = r.thumbnail_url ? formatLocalAssetUrl(r.thumbnail_url) : assetUrl;
        return {
          id: r.id,
          title: r.file_name,
          filePath: r.file_path,
          url: assetUrl,
          thumbnail: thumbUrl,
          format: r.format,
          sizeBytes: r.size_bytes,
          tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
          createdAt: r.created_at
        };
      });
    } catch (err) {
      console.error('Error querying local_media:', err);
    }
  }

  if (webLocalMediaStore.length === 0) {
    webLocalMediaStore = await loadFromIDB('media');
  }

  return webLocalMediaStore.map(r => {
    const assetUrl = formatLocalAssetUrl(r.file_path);
    const thumbUrl = r.thumbnail_url ? formatLocalAssetUrl(r.thumbnail_url) : assetUrl;
    return {
      id: r.id,
      title: r.file_name,
      filePath: r.file_path,
      url: r.url || assetUrl,
      thumbnail: r.thumbnail || thumbUrl,
      format: r.format,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
      createdAt: r.created_at
    };
  });
}





let cachedItems = null;

export function invalidateItemsCache() {
  cachedItems = null;
}

export async function getAllItems(forceRefresh = false) {
  if (cachedItems && !forceRefresh) {
    return cachedItems;
  }
  const [scrapes, media] = await Promise.all([
    getLocalScrapes(),
    getLocalMediaFiles()
  ]);
  cachedItems = [...scrapes, ...media];
  return cachedItems;
}

const parseTagsList = (rawTags) => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === 'string') {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return rawTags.split(/[,;\s]+/).filter(Boolean);
    }
  }
  return [];
};

export async function getPaginatedItems({ page = 1, limit = 40, tags = [], search = '' } = {}) {
  let allItems = await getAllItems();

  if (tags && tags.length > 0) {
    allItems = allItems.filter(item => {
      const itemTags = parseTagsList(item.tags);
      return tags.every(f => {
        if (typeof f === 'string' && (f.startsWith('category:') || f.endsWith(':') || f === 'r/' || f === 'u/')) {
          const rawCat = f.startsWith('category:') 
            ? f.replace('category:', '') 
            : (f.endsWith(':') ? f.slice(0, -1) : (f === 'r/' ? 'subreddit' : (f === 'u/' ? 'artist' : f)));
          const cleanCat = rawCat.toLowerCase();
          return itemTags.some(t => getTagCategory(t).toLowerCase() === cleanCat);
        }
        const term = String(f).toLowerCase();
        return (
          itemTags.some(t => {
            const lowerT = String(t).toLowerCase();
            return lowerT === term || lowerT.endsWith(`:${term}`) || lowerT.endsWith(`/${term}`) || lowerT.includes(term);
          }) ||
          (item.title || '').toLowerCase().includes(term) ||
          (item.author || '').toLowerCase().includes(term) ||
          (item.subreddit || '').toLowerCase().includes(term) ||
          (item.fileName || item.file_name || '').toLowerCase().includes(term)
        );
      });
    });
  } else if (search) {
    const q = search.toLowerCase();
    allItems = allItems.filter(item => {
      const itemTags = parseTagsList(item.tags);
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q) ||
        (item.subreddit || '').toLowerCase().includes(q) ||
        (item.fileName || item.file_name || '').toLowerCase().includes(q) ||
        itemTags.some(t => String(t).toLowerCase().includes(q))
      );
    });
  }
  const total = allItems.length;
  const start = (page - 1) * limit;
  const posts = allItems.slice(start, start + limit);
  return { posts, total };
}

export async function getAllMetaUploadTags() {
  const uniqueItems = await getAllItems();
  const batchCounts = new Map();
  const batchPreviews = new Map();

  uniqueItems.forEach(item => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    tags.forEach(tag => {
      if (typeof tag === 'string' && tag.startsWith('meta:upload:')) {
        batchCounts.set(tag, (batchCounts.get(tag) || 0) + 1);
        if (!batchPreviews.has(tag)) batchPreviews.set(tag, []);
        if (batchPreviews.get(tag).length < 6) batchPreviews.get(tag).push(item);
      }
    });
  });

  return Array.from(batchCounts.entries()).map(([tag, count]) => ({
    tag,
    count,
    timestamp: tag.replace('meta:upload:', ''),
    previews: batchPreviews.get(tag) || []
  })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function deletePostsByTag(tagToDelete) {
  const db = await getLocalDb();
  if (isDesktopApp() && db) {
    try {
      const scrapes = await getLocalScrapes();
      const scrapesToDelete = scrapes.filter(s => (s.tags || []).includes(tagToDelete));
      for (const s of scrapesToDelete) {
        await db.execute('DELETE FROM local_scrapes WHERE id = $1', [s.id]);
      }
      const media = await getLocalMediaFiles();
      const mediaToDelete = media.filter(m => (m.tags || []).includes(tagToDelete));
      for (const m of mediaToDelete) {
        await db.execute('DELETE FROM local_media WHERE id = $1', [m.id]);
      }
    } catch (e) {
      console.error('Error deleting posts by tag in SQLite:', e);
    }
  }

  webScrapesStore = webScrapesStore.filter(s => !(s.tags || []).includes(tagToDelete));
  webLocalMediaStore = webLocalMediaStore.filter(m => !(m.tags || []).includes(tagToDelete));

  await checkServerHealth().then(async (online) => {
    if (online) {
      const { deleteServerPostsByTag } = await import('./api');
      await deleteServerPostsByTag(tagToDelete);
    }
  });
}



export async function updateItemTags(id, tagsArray) {
  const db = await getLocalDb();

  const isServerOnline = await checkServerHealth();
  if (isServerOnline) {
    try {
      const { saveServerItemTags } = await import('./api');
      await saveServerItemTags(id, tagsArray);
    } catch (e) {
      console.warn('C# backend tag update warning:', e.message);
    }
  }

  if (isDesktopApp() && db) {
    try {
      await db.execute('UPDATE local_scrapes SET tags = $1 WHERE id = $2', [JSON.stringify(tagsArray), id]);
      await db.execute('UPDATE local_media SET tags = $1 WHERE id = $2', [JSON.stringify(tagsArray), id]);
    } catch (e) {
      console.error('Error updating tags in SQLite:', e);
    }
  }

  webScrapesStore = webScrapesStore.map(item => item.id === id ? { ...item, tags: tagsArray } : item);
  webLocalMediaStore = webLocalMediaStore.map(item => item.id === id ? { ...item, tags: tagsArray } : item);

  invalidateItemsCache();
  return tagsArray;
}

export async function clearAllLocalStores() {
  const db = await getLocalDb();
  if (isDesktopApp() && db) {
    try {
      await db.execute('DELETE FROM local_scrapes;');
      await db.execute('DELETE FROM local_media;');
    } catch (e) {
      console.error('Error clearing local SQLite tables:', e);
    }
  }

  webScrapesStore = [];
  webLocalMediaStore = [];

  try {
    localStorage.removeItem('myatlas_web_scrapes');
    localStorage.removeItem('myatlas_web_media');
    localStorage.removeItem('scraped_posts');
    localStorage.removeItem('scraped_posts_v2');
  } catch (e) {}

  invalidateItemsCache();

  await checkServerHealth().then(async (online) => {
    if (online) {
      try {
        const { clearServerDatabase } = await import('./api');
        await clearServerDatabase();
      } catch (e) {}
    }
  });
  invalidateItemsCache();
}



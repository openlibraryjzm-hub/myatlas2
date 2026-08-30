/**
 * MyAtlas REST API Client for C# .NET 8 Backend (http://127.0.0.1:7171)
 */

const SERVER_BASE_URL = 'http://127.0.0.1:7171';

/**
 * Check if C# Backend Server is active
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (err) {
    return false;
  }
}

/**
 * Fetch dynamic stats from C# Backend
 */
export async function fetchServerStats() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/stats`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('C# backend stats offline:', err.message);
    return null;
  }
}

/**
 * Fetch paginated & filtered posts from C# Backend
 */
export async function fetchServerPosts({ page = 1, limit = 40, search = '', tags = [], atlas = '' } = {}) {
  try {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (search) params.set('search', search);
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (atlas) params.set('atlas_id', atlas);

    const res = await fetch(`${SERVER_BASE_URL}/api/posts?${params.toString()}`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('C# backend posts offline:', err.message);
    return null;
  }
}

/**
 * Fetch all Sub-Atlases from C# Backend
 */
export async function fetchServerAtlases() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/atlases`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('C# backend atlases offline:', err.message);
    return null;
  }
}

/**
 * Fetch details for a single Sub-Atlas by slug/id
 */
export async function fetchServerAtlas(id) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/atlases/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch atlas '${id}' from server:`, err.message);
    return null;
  }
}

/**
 * Create or update a Sub-Atlas on C# Backend
 */
export async function createServerAtlas({ id, title, description = '', accentColor = '#CC5A01' }) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/atlases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, description, accentColor })
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to create atlas on C# backend:', err.message);
    return null;
  }
}

/**
 * Delete a Sub-Atlas on C# Backend
 */
export async function deleteServerAtlas(id) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/atlases/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Failed to delete atlas '${id}' on C# backend:`, err.message);
    return null;
  }
}

/**
 * Save updated tags for an item on C# Backend
 */
export async function saveServerItemTags(id, tagsArray) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/posts/${encodeURIComponent(id)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagsArray)
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to update tags on C# backend:', err.message);
    return null;
  }
}

/**
 * Fetch tag taxonomy counts matrix from C# Backend
 */
export async function fetchServerTags() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/tags`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('C# backend tags offline:', err.message);
    return null;
  }
}

/**
 * Trigger multi-threaded disk scan on C# Backend
 */
export async function scanServerFolder(folderPath) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath })
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error scanning folder on C# backend:', err.message);
    throw err;
  }
}

/**
 * Wipe all database records on C# Backend
 */
export async function clearServerDatabase() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/clear`, { method: 'POST' });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to clear C# backend database:', err.message);
    return null;
  }
}

/**
 * Import batch of scraped JSON items into C# Backend
 */
export async function importServerPostsBatch(postsArray) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postsArray)
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to import posts to C# backend:', err.message);
    return null;
  }
}

/**
 * Delete posts by tag from C# Backend
 */
export async function deleteServerPostsByTag(tag) {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/delete-by-tag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Failed to delete posts by tag '${tag}' on C# backend:`, err.message);
    return null;
  }
}

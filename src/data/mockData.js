// Helper: robust tag array normalization
export const parseTagsArray = (rawTags) => {
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

// Helper: categorise a tag based on the Booru taxonomy schema
export const getTagCategory = (tag) => {
  if (!tag || typeof tag !== 'string') return "general";
  const trimmed = tag.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("r/")) return "subreddit";
  if (lower.startsWith("qid:") || lower.startsWith("artist:") || lower.startsWith("meta:artist:") || lower.startsWith("u/")) return "artist"; 
  if (lower.startsWith("copyright:") || lower.startsWith("meta:copyright:")) return "copyright";
  if (lower.startsWith("character:") || lower.startsWith("meta:character:")) return "character";
  if (lower.startsWith("flair:") || lower.startsWith("meta:flair:")) return "flair";
  if (lower.startsWith("folder:") || lower.startsWith("meta:folder:")) return "folder";
  if (lower.startsWith("meta:")) return "meta";
  
  if (trimmed.includes(":")) {
    const prefix = trimmed.split(":")[0].toLowerCase();
    if (prefix && prefix !== "http" && prefix !== "https") {
      return prefix;
    }
  }

  return "general";
};

// Helper: strip namespace prefixes for clean display
export const getDisplayTagName = (tag) => {
  if (!tag || typeof tag !== 'string') return "";
  const trimmed = tag.trim();
  if (trimmed.startsWith("category:")) {
    const key = trimmed.replace("category:", "");
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    return `${label} (All)`;
  }
  if (trimmed.startsWith("r/")) return trimmed; 
  if (trimmed.startsWith("u/")) return trimmed; 
  
  // Handle meta sub-prefixes
  if (trimmed.startsWith("meta:")) {
    let clean = trimmed.substring(5);
    if (clean.startsWith("extension:")) clean = clean.substring(10);
    else if (clean.startsWith("format:")) clean = clean.substring(7);
    else if (clean.startsWith("folder:")) clean = clean.substring(7);
    else if (clean.startsWith("qid:")) clean = clean.substring(4);
    return clean.replace(/_/g, ' ');
  }
  
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    return parts.slice(1).join(":").replace(/_/g, ' ');
  }

  return trimmed.replace(/_/g, ' ');
};

export const PALETTE_COLORS = [
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#9333ea', // Violet
  '#ca8a04'  // Gold
];

export const DEFAULT_CATEGORIES = [
  { key: 'subreddit', prefix: 'r/', label: 'Subreddits', color: '#b45309', bg: '#fef3c7', isDefault: true },
  { key: 'folder', prefix: 'folder:', label: 'Folders', color: '#0284c7', bg: '#e0f2fe', isDefault: true },
  { key: 'copyright', prefix: 'copyright:', label: 'Copyright', color: '#7c3aed', bg: '#f3e8ff', isDefault: true },
  { key: 'character', prefix: 'character:', label: 'Characters', color: '#16a34a', bg: '#dcfce7', isDefault: true },
  { key: 'artist', prefix: 'artist:', label: 'Artists', color: '#2563eb', bg: '#dbeafe', isDefault: true },
  { key: 'flair', prefix: 'flair:', label: 'Flairs', color: '#db2777', bg: '#fce7f3', isDefault: true },
  { key: 'meta', prefix: 'meta:', label: 'Metadata', color: '#4b5563', bg: '#f3f4f6', isDefault: true },
  { key: 'general', prefix: '', label: 'General Tags', color: '#cc5a01', bg: '#fdf5e6', isDefault: true }
];

export const getTagCategories = () => {
  try {
    const saved = localStorage.getItem('myatlas_tag_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const unique = [];
        const seen = new Set();
        parsed.forEach(c => {
          if (c && c.key && !seen.has(c.key.toLowerCase())) {
            seen.add(c.key.toLowerCase());
            unique.push(c);
          }
        });
        if (unique.length > 0) return unique;
      }
    }
  } catch (e) {}
  return DEFAULT_CATEGORIES;
};

export const saveTagCategories = (categories) => {
  try {
    localStorage.setItem('myatlas_tag_categories', JSON.stringify(categories));
  } catch (e) {}
};

export const addTagCategory = (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return getTagCategories();
  let raw = inputStr.trim().toLowerCase();
  if (!raw) return getTagCategories();

  if (raw !== 'general' && !raw.startsWith('r/') && !raw.startsWith('u/') && !raw.endsWith(':')) {
    raw = `${raw}:`;
  }

  const current = getTagCategories();
  const existing = current.find(c => c.prefix === raw || c.key === raw.replace(':', ''));
  if (existing) return current;

  const key = raw.endsWith(':') ? raw.slice(0, -1) : raw;
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  const colorIndex = (current.length - DEFAULT_CATEGORIES.length) % PALETTE_COLORS.length;
  const assignedColor = PALETTE_COLORS[Math.max(0, colorIndex)];

  const newCat = {
    key,
    prefix: raw,
    label,
    color: assignedColor,
    bg: `${assignedColor}18`,
    isDefault: false
  };

  const updated = [...current, newCat];
  saveTagCategories(updated);
  return updated;
};

export const removeTagCategory = (prefixToRemove) => {
  const current = getTagCategories();
  const updated = current.filter(c => c.prefix !== prefixToRemove && c.key !== prefixToRemove);
  saveTagCategories(updated);
  return updated;
};

export const resetTagCategories = () => {
  saveTagCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
};

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

// Helper: retrieve category object for a tag or category key
export const getCategoryObj = (tagOrKey) => {
  if (!tagOrKey) return DEFAULT_CATEGORIES.find(c => c.key === 'general');
  const categories = getTagCategories();
  const raw = String(tagOrKey).trim();
  const lower = raw.toLowerCase().replace(/:$/, '');

  // 1. Direct match on registered category key or prefix (e.g. 'character', 'character:', 'r/')
  const directMatch = categories.find(c => 
    c.key.toLowerCase() === lower || 
    c.prefix.toLowerCase().replace(/:$/, '') === lower ||
    c.prefix.toLowerCase() === lower
  );
  if (directMatch) return directMatch;

  // 2. Resolve category key via getTagCategory (e.g. 'landscape' -> 'general', 'character:goku' -> 'character')
  const catKey = getTagCategory(raw);
  const catMatch = categories.find(c => c.key.toLowerCase() === catKey.toLowerCase());
  if (catMatch) return catMatch;

  // 3. Fallback for custom dynamic namespace prefix (e.g. 'ship:otago' -> catKey 'ship')
  if (catKey && catKey.toLowerCase() !== 'general') {
    const label = catKey.charAt(0).toUpperCase() + catKey.slice(1);
    const colorIndex = Math.abs(hashCode(catKey.toLowerCase())) % PALETTE_COLORS.length;
    const color = PALETTE_COLORS[colorIndex];
    return {
      key: catKey.toLowerCase(),
      prefix: `${catKey.toLowerCase()}:`,
      label,
      color,
      bg: `${color}18`,
      isDefault: false
    };
  }

  // 4. Default to General Tags
  return categories.find(c => c.key === 'general') || DEFAULT_CATEGORIES.find(c => c.key === 'general');
};

export const getActiveCategories = getTagCategories;

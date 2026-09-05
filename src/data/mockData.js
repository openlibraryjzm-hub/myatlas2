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

  if (lower.startsWith("r/") || lower.startsWith("subreddit:") || lower.startsWith("meta:subreddit:")) return "subreddit";
  if (lower.startsWith("creator:") || lower.startsWith("artist:") || lower.startsWith("u/") || lower.startsWith("qid:") || lower.startsWith("meta:creator:") || lower.startsWith("meta:artist:")) return "creator";
  if (lower.startsWith("source:") || lower.startsWith("copyright:") || lower.startsWith("meta:source:") || lower.startsWith("meta:copyright:")) return "source";
  if (lower.startsWith("work:") || lower.startsWith("meta:work:")) return "work";
  if (lower.startsWith("character:") || lower.startsWith("meta:character:")) return "character";
  if (lower.startsWith("meta:")) return "meta";

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
  '#cc5a01', // General (Amber)
  '#4b5563', // Meta (Slate)
  '#7c3aed', // Source (Purple)
  '#0284c7', // Work (Sky Blue)
  '#b45309', // Subreddit (Amber Gold)
  '#16a34a', // Character (Green)
  '#2563eb'  // Creator (Royal Blue)
];

export const DEFAULT_CATEGORIES = [
  { key: 'general', prefix: '', label: 'General Tags', color: '#cc5a01', bg: '#fdf5e6', isDefault: true },
  { key: 'meta', prefix: 'meta:', label: 'Metadata', color: '#4b5563', bg: '#f3f4f6', isDefault: true },
  { key: 'source', prefix: 'source:', label: 'Source', color: '#7c3aed', bg: '#f3e8ff', isDefault: true },
  { key: 'work', prefix: 'work:', label: 'Work', color: '#0284c7', bg: '#e0f2fe', isDefault: true },
  { key: 'subreddit', prefix: 'r/', label: 'Subreddits', color: '#b45309', bg: '#fef3c7', isDefault: true },
  { key: 'character', prefix: 'character:', label: 'Characters', color: '#16a34a', bg: '#dcfce7', isDefault: true },
  { key: 'creator', prefix: 'creator:', label: 'Creator', color: '#2563eb', bg: '#dbeafe', isDefault: true }
];

export const getTagCategories = () => DEFAULT_CATEGORIES;
export const saveTagCategories = () => DEFAULT_CATEGORIES;
export const addTagCategory = () => DEFAULT_CATEGORIES;
export const ensureTagCategoriesExist = () => {};
export const removeTagCategory = () => DEFAULT_CATEGORIES;
export const resetTagCategories = () => DEFAULT_CATEGORIES;

// Helper: retrieve category object for a tag or category key
export const getCategoryObj = (tagOrKey) => {
  if (!tagOrKey) return DEFAULT_CATEGORIES[0];
  const raw = String(tagOrKey).trim();
  const lower = raw.toLowerCase().replace(/:$/, '');

  // 1. Direct match on registered category key or prefix
  const directMatch = DEFAULT_CATEGORIES.find(c => 
    c.key.toLowerCase() === lower || 
    c.prefix.toLowerCase().replace(/:$/, '') === lower ||
    c.prefix.toLowerCase() === lower
  );
  if (directMatch) return directMatch;

  // 2. Resolve category key via getTagCategory
  const catKey = getTagCategory(raw);
  const catMatch = DEFAULT_CATEGORIES.find(c => c.key.toLowerCase() === catKey.toLowerCase());
  if (catMatch) return catMatch;

  // 3. Default to General Tags
  return DEFAULT_CATEGORIES[0];
};

export const getActiveCategories = getTagCategories;

// Helper: categorise a tag based on the Booru taxonomy schema
export const getTagCategory = (tag) => {
  if (!tag) return "general";
  if (tag.startsWith("r/")) return "subreddit";
  if (tag.startsWith("qid:")) return "artist"; 
  if (tag.startsWith("artist:")) return "artist";
  if (tag.startsWith("u/")) return "artist"; 
  if (tag.startsWith("copyright:")) return "copyright";
  if (tag.startsWith("character:")) return "character";
  if (tag.startsWith("flair:")) return "flair";
  if (tag.startsWith("folder:")) return "folder";
  if (tag.startsWith("meta:")) return "meta";
  
  if (tag.includes(":")) {
    const prefix = tag.split(":")[0].toLowerCase();
    if (prefix && prefix !== "http" && prefix !== "https") {
      return prefix;
    }
  }

  return "general";
};

// Helper: strip namespace prefixes for clean display
export const getDisplayTagName = (tag) => {
  if (!tag) return "";
  if (tag.startsWith("category:")) {
    const key = tag.replace("category:", "");
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    return `${label} (All)`;
  }
  if (tag.startsWith("r/")) return tag; 
  if (tag.startsWith("u/")) return tag; 
  
  // Handle meta sub-prefixes
  if (tag.startsWith("meta:")) {
    let clean = tag.substring(5);
    if (clean.startsWith("extension:")) clean = clean.substring(10);
    else if (clean.startsWith("format:")) clean = clean.substring(7);
    else if (clean.startsWith("folder:")) clean = clean.substring(7);
    else if (clean.startsWith("qid:")) clean = clean.substring(4);
    return clean.replace(/_/g, ' ');
  }
  
  if (tag.includes(":")) {
    const parts = tag.split(":");
    return parts.slice(1).join(":").replace(/_/g, ' ');
  }

  return tag.replace(/_/g, ' ');
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    bg: `${assignedColor}18`, // Light opacity tint
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

// Helper: retrieve category object (key, prefix, label, color, bg) for a tag or category key
export const getCategoryObj = (tagOrKey) => {
  if (!tagOrKey) return DEFAULT_CATEGORIES.find(c => c.key === 'general');
  const categories = getTagCategories();
  const lower = String(tagOrKey).toLowerCase().trim();
  
  // Check exact key match or prefix match first (e.g. 'ship', 'ship:', 'r/', 'copyright')
  const directMatch = categories.find(c => 
    c.key.toLowerCase() === lower || 
    c.prefix.toLowerCase() === lower ||
    c.prefix.toLowerCase() === `${lower}:`
  );
  if (directMatch) return directMatch;

  // Next check via getTagCategory(tag) for full tags (e.g. 'ship:otago')
  const catKey = getTagCategory(tagOrKey);
  const found = categories.find(c => c.key === catKey || c.prefix === tagOrKey);
  if (found) return found;
  
  // Fallback if custom category was used but not explicitly in list
  if (catKey !== 'general') {
    const label = catKey.charAt(0).toUpperCase() + catKey.slice(1);
    return {
      key: catKey,
      prefix: `${catKey}:`,
      label,
      color: '#0d9488',
      bg: '#0d948818',
      isDefault: false
    };
  }

  return DEFAULT_CATEGORIES.find(c => c.key === 'general');
};

// Backward-compatibility wrappers for slotConfig queries
export const getActiveCategories = getTagCategories;
export const getSlotConfig = () => {
  const cats = getTagCategories();
  return [
    { id: 0, label: "All Categories", prefixes: cats.map(c => c.prefix) }
  ];
};
export const saveSlotConfig = () => {};
export const DEFAULT_SLOT_CONFIG = getSlotConfig();
export const BUILTIN_PRESETS = [];
export const getCustomPresets = () => [];
export const saveCustomPresets = () => {};
export const getDeletedPresetIds = () => [];
export const saveDeletedPresetIds = () => {};
export const getTagSlotIndex = () => 0;

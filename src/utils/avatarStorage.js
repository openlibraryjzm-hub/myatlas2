// Utility module to store and manage 2.5D Pop-Out Avatar configurations

export const DEFAULT_AVATAR_CONFIG = {
  imageUrl: '/bernstein-261133_1280.png', // Default transparent sample asset
  orbColor: '#CC5A01',
  orbBgColor: '#FDF5E6',
  strokeWidth: 4,
  showGlow: true,
  imageScale: 1.2, // Image scale multiplier (1.0 = 100%, 2.0 = 200%)
  imageOffsetX: 0, // Horizontal offset in percentage (-50% to +50%)
  imageOffsetY: -5, // Vertical offset in percentage (-50% to +50%, negative moves up)
  objectFit: 'contain', // 'contain' (full uncropped image) or 'cover' (crop fill)
  customMaskUrl: null, // Canvas-painted alpha mask data URL for precision pop-outs
  quadrants: {
    topLeft: true,
    topRight: true,
    bottomLeft: false,
    bottomRight: false
  }
};

const STORAGE_KEY = 'myatlas_popout_avatar_config';

export function getAvatarConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_AVATAR_CONFIG;
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_AVATAR_CONFIG,
      ...parsed,
      quadrants: {
        ...DEFAULT_AVATAR_CONFIG.quadrants,
        ...(parsed.quadrants || {})
      }
    };
  } catch (err) {
    console.warn('Failed to load avatar config from localStorage:', err);
    return DEFAULT_AVATAR_CONFIG;
  }
}

export function saveAvatarConfig(newConfig) {
  try {
    const updated = {
      ...getAvatarConfig(),
      ...newConfig
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event to notify components across the app instantly
    window.dispatchEvent(new CustomEvent('myatlas_avatar_changed', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to save avatar config to localStorage:', err);
    return newConfig;
  }
}

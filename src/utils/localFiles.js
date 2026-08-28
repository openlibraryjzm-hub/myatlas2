/**
 * Local File System Helper for Tauri Desktop & Web fallback
 */

let isTauriAvailable = false;

try {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    isTauriAvailable = true;
  }
} catch (e) {
  isTauriAvailable = false;
}

import { convertFileSrc } from '@tauri-apps/api/core';

/**
 * Check whether the application is running inside a Tauri desktop container
 */
export function isDesktopApp() {
  return isTauriAvailable || (typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__));
}

/**
 * Convert a local hard drive file path to a valid webview asset URL or blob URL
 */
export function formatLocalAssetUrl(filePath) {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('blob:') ||
    filePath.startsWith('asset://')
  ) {
    return filePath;
  }
  try {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      return convertFileSrc(normalizedPath);
    }
  } catch (err) {
    console.warn('Error converting file path to asset URL:', err);
  }
  return filePath;
}

/**
 * Load local file as a blob URL for guaranteed rendering regardless of webview asset protocol restrictions
 */
export async function getLocalFileAsBlobUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:') || filePath.startsWith('blob:')) {
    return filePath;
  }
  try {
    if (isDesktopApp()) {
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const bytes = await readFile(filePath);
      const ext = filePath.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg';
      if (['png', 'webp', 'gif', 'svg'].includes(ext)) mimeType = `image/${ext}`;
      else if (['mp4', 'webm', 'mov'].includes(ext)) mimeType = `video/${ext}`;
      
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn('Error loading local file as blob URL:', err);
  }
  return formatLocalAssetUrl(filePath);
}

/**
 * Pick a directory on the local device
 */
export async function selectLocalDirectory(options = {}) {
  if (isDesktopApp()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: options.title || 'Select Folder',
      });
      return selected;
    } catch (err) {
      console.error('Error selecting directory via Tauri plugin:', err);
      return null;
    }
  } else {
    alert('Local directory picker requires the desktop app environment (run via npm run tauri dev).');
    return null;
  }
}

/**
 * Pick local file(s)
 */
export async function selectLocalFiles(options = {}) {
  if (isDesktopApp()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: options.multiple ?? false,
        filters: options.filters || [],
        title: options.title || 'Select File(s)',
      });
      return selected;
    } catch (err) {
      console.error('Error picking local files via Tauri:', err);
      return null;
    }
  } else {
    // Fallback HTML file picker for web browser
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.multiple ?? false;
      if (options.accept) input.accept = options.accept;
      input.onchange = (e) => {
        const files = Array.from(e.target.files || []);
        resolve(files);
      };
      input.click();
    });
  }
}

/**
 * Read binary contents of a local file path
 */
export async function readLocalFileBinary(filePath) {
  if (isDesktopApp()) {
    const { readFile } = await import('@tauri-apps/plugin-fs');
    return await readFile(filePath);
  } else {
    throw new Error('Reading arbitrary file paths is only available in the desktop version.');
  }
}

/**
 * Read text content of a local file
 */
export async function readLocalFileText(filePath) {
  if (isDesktopApp()) {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    return await readTextFile(filePath);
  } else {
    throw new Error('Reading text files from path is only available in the desktop version.');
  }
}

/**
 * Cap remote thumbnail resolutions (e.g. Twitter pbs.twimg.com name=small instead of 5MB orig)
 * for high-speed 60 FPS grid scrolling & lightweight batch rendering
 */
export function getOptimizedThumbnailUrl(url, targetSize = 'small') {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('twimg.com')) {
    try {
      const u = new URL(url);
      let ext = 'jpg';
      let pathname = u.pathname;
      const m = pathname.match(/\.(jpg|jpeg|png|webp)$/i);
      if (m) {
        ext = m[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        pathname = pathname.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      }
      u.pathname = pathname;
      if (!u.searchParams.has('format')) {
        u.searchParams.set('format', ext);
      }
      u.searchParams.set('name', targetSize === 'thumb' ? 'thumb' : 'small');
      return u.toString();
    } catch (e) {
      if (url.includes('name=orig') || url.includes('name=large')) {
        return url.replace(/name=(orig|large|medium)/, `name=${targetSize === 'thumb' ? 'thumb' : 'small'}`);
      }
    }
  } else if (url.includes('preview.redd.it') || url.includes('external-preview.redd.it')) {
    try {
      const u = new URL(url);
      u.searchParams.set('width', targetSize === 'thumb' ? '320' : '640');
      return u.toString();
    } catch (e) {}
  }
  return formatLocalAssetUrl(url);
}

/**
 * Generate a lightweight 300px WebP thumbnail (~15 KB) from a Blob or local file path
 * for instant grid rendering without consuming full-resolution image RAM.
 */
export async function generateWebpThumbnail(fileOrBlobUrl, maxWidth = 300) {
  if (!fileOrBlobUrl || typeof fileOrBlobUrl !== 'string') return '';
  if (fileOrBlobUrl.startsWith('data:image/webp')) return fileOrBlobUrl; // Already a WebP thumbnail

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const webpDataUrl = canvas.toDataURL('image/webp', 0.75);
        resolve(webpDataUrl);
      } catch (e) {
        resolve(fileOrBlobUrl);
      }
    };
    img.onerror = () => resolve(fileOrBlobUrl);
    img.src = fileOrBlobUrl;
  });
}

/**
 * Generate a 300px WebP thumbnail image (~15 KB) from a video file or blob URL
 * using an offscreen HTML5 <video> element and <canvas>
 */
export async function generateVideoWebpThumbnail(videoUrl, maxWidth = 300) {
  if (!videoUrl || typeof videoUrl !== 'string') return '';
  if (videoUrl.startsWith('data:image/webp')) return videoUrl; // Already a WebP thumbnail

  const targetUrl = formatLocalAssetUrl(videoUrl);

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    let resolved = false;
    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(videoUrl);
      }
    }, 3500);

    const captureFrame = () => {
      if (resolved) return;
      try {
        const canvas = document.createElement('canvas');
        let width = video.videoWidth || 300;
        let height = video.videoHeight || 300;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        const webpDataUrl = canvas.toDataURL('image/webp', 0.75);
        resolved = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve(webpDataUrl);
      } catch (e) {
        resolved = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve(videoUrl);
      }
    };

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
      } catch (e) {
        captureFrame();
      }
    };

    video.onseeked = () => {
      captureFrame();
    };

    video.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve(videoUrl);
      }
    };

    video.src = targetUrl;
  });
}

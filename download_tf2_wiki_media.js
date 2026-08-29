import fs from 'fs';
import path from 'path';

/**
 * TF2 Wiki Targeted Media Downloader
 * Downloads official hero renders & showcases for:
 *  - Weapons (Category:Weapons)
 *  - Cosmetics (Category:Cosmetic items)
 *  - Maps (Category:Maps)
 * 
 * Usage:
 *  node download_tf2_wiki_media.js --type=weapons
 *  node download_tf2_wiki_media.js --type=cosmetics
 *  node download_tf2_wiki_media.js --type=maps
 *  node download_tf2_wiki_media.js --type=all
 */

const API_URL = 'https://wiki.teamfortress.com/w/api.php';
const USER_AGENT = 'MyAtlasImporter/1.0 (TF2 Wiki Offline Archiver)';
const BATCH_DELAY_MS = 300;
const FILE_DELAY_MS = 50;

// Parse command line arguments
const args = process.argv.slice(2);
const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1]?.toLowerCase() || 'all';

const CATEGORIES = {
  weapons: { category: 'Weapons', folder: './tf2_downloads/weapons' },
  cosmetics: { category: 'Cosmetic items', folder: './tf2_downloads/cosmetics' },
  maps: { category: 'Maps', folder: './tf2_downloads/maps' }
};

function sanitizeFilename(filename) {
  let name = filename.trim();
  if (name.startsWith('File:')) name = name.slice(5);
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

// Batch resolution of file titles to direct CDN download URLs
async function resolveFileUrls(fileTitles) {
  const urlMap = new Map();
  // MediaWiki allows up to 50 titles per query
  for (let i = 0; i < fileTitles.length; i += 50) {
    const chunk = fileTitles.slice(i, i + 50);
    const params = new URLSearchParams({
      action: 'query',
      titles: chunk.map(t => t.startsWith('File:') ? t : `File:${t}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
      format: 'json'
    });

    const data = await fetchJson(`${API_URL}?${params}`);
    const pages = Object.values(data?.query?.pages || {});
    for (const page of pages) {
      const fileUrl = page?.imageinfo?.[0]?.url;
      if (fileUrl) {
        urlMap.set(page.title, fileUrl);
      }
    }
  }
  return urlMap;
}

async function processCategory(catKey, catConfig) {
  console.log(`\n==================================================`);
  console.log(`🚀 Starting extraction for [${catKey.toUpperCase()}]`);
  console.log(`📁 Saving to: ${path.resolve(catConfig.folder)}`);
  console.log(`==================================================\n`);

  if (!fs.existsSync(catConfig.folder)) {
    fs.mkdirSync(catConfig.folder, { recursive: true });
  }

  let gcmcontinue = '';
  let totalFound = 0;
  let totalDownloaded = 0;
  let totalSkipped = 0;
  let batchNum = 1;

  while (true) {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'categorymembers',
      gcmtitle: `Category:${catConfig.category}`,
      gcmlimit: '50',
      gcmtype: 'page',
      prop: 'revisions',
      rvprop: 'content',
      format: 'json',
      ...(gcmcontinue ? { gcmcontinue } : {})
    });

    console.log(`🔍 Fetching category batch #${batchNum}...`);
    const data = await fetchJson(`${API_URL}?${params}`);
    const pages = Object.values(data?.query?.pages || {});

    if (pages.length === 0) break;

    const pageImageMap = []; // Array of { pageTitle, fileTitle }

    for (const page of pages) {
      const text = page.revisions?.[0]?.['*'] || '';
      // Extract main image from infobox template
      const match = text.match(/\|\s*(?:image|map-image)\s*=\s*([^|\r\n}]+)/i);
      if (match && match[1]) {
        const rawImgName = match[1].trim();
        if (rawImgName && !rawImgName.includes('<!--')) {
          pageImageMap.push({ pageTitle: page.title, fileTitle: rawImgName });
        }
      }
    }

    totalFound += pageImageMap.length;

    // Bulk resolve image URLs for this batch
    if (pageImageMap.length > 0) {
      const fileTitles = pageImageMap.map(item => item.fileTitle);
      const urlMap = await resolveFileUrls(fileTitles);

      for (const item of pageImageMap) {
        const fullFileTitle = item.fileTitle.startsWith('File:') ? item.fileTitle : `File:${item.fileTitle}`;
        const fileUrl = urlMap.get(fullFileTitle);

        if (!fileUrl) {
          console.warn(`  [!] Could not resolve URL for: ${item.fileTitle}`);
          continue;
        }

        const ext = path.extname(fileUrl) || '.png';
        const safePageTitle = sanitizeFilename(item.pageTitle);
        const fileName = `${safePageTitle}${ext}`;
        const destPath = path.join(catConfig.folder, fileName);

        if (fs.existsSync(destPath)) {
          totalSkipped++;
          continue;
        }

        try {
          await downloadFile(fileUrl, destPath);
          totalDownloaded++;
          console.log(`  [+] Saved: ${fileName}`);
          await new Promise(r => setTimeout(r, FILE_DELAY_MS));
        } catch (err) {
          console.error(`  [!] Failed downloading ${fileName}:`, err.message);
        }
      }
    }

    if (data.continue?.gcmcontinue) {
      gcmcontinue = data.continue.gcmcontinue;
      batchNum++;
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    } else {
      break;
    }
  }

  console.log(`\n--- ${catKey.toUpperCase()} Summary ---`);
  console.log(`Found item pages: ${totalFound}`);
  console.log(`Downloaded: ${totalDownloaded}`);
  console.log(`Skipped (already exists): ${totalSkipped}`);
}

async function main() {
  console.log(`Target selected: [${typeArg.toUpperCase()}]`);

  const keysToProcess = typeArg === 'all' 
    ? Object.keys(CATEGORIES) 
    : [typeArg];

  for (const key of keysToProcess) {
    if (CATEGORIES[key]) {
      await processCategory(key, CATEGORIES[key]);
    } else {
      console.error(`Unknown type: "${key}". Available options: --type=weapons, --type=cosmetics, --type=maps, --type=all`);
    }
  }

  console.log('\n🎉 Finished processing targeted TF2 Wiki downloads!');
}

main();

import fs from 'fs';
import path from 'path';

/**
 * TF2 Maps Manifest Enricher
 * Scans a folder of downloaded TF2 map showcase images, queries the TF2 Wiki API for map infobox metadata,
 * and generates a complete manifest.json enriched with booru tags:
 *  - folder:tf2_maps
 *  - copyright:tf2
 *  - type:map
 *  - gamemode:<payload|capture_the_flag|attack_defend|payload_race|king_of_the_hill|mann_vs_machine|medieval_mode>
 *  - mapcode:<ctf_2fort|pl_badwater|cp_dustbowl|etc>
 *  - prefix:<ctf|pl|cp|plr|koth|mvm|vsh>
 *  - env:<desert|farmland|alpine|german_town|industrial|city|space>
 *  - setting:<daylight|dusk|night|sunny|cloudy>
 *  - update:<launch|heavy|engineer|two_cities|jungle_inferno|etc>
 *  - year:<release_year>
 *  - hazard:<drowning|pitfall|crushing|payload_cart_explosion|bomb_hatch_explosion|train|sawblade>
 *  - feature:<pyrovision|bot_support>
 */

const API_URL = 'https://wiki.teamfortress.com/w/api.php';
const USER_AGENT = 'MyAtlasImporter/1.0 (TF2 Maps Enricher)';
const BATCH_DELAY_MS = 250;

const MAPS_DIR = process.argv[2] || './tf2_downloads/maps';

function cleanTagValue(str) {
  if (!str) return '';
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/_?update$/i, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_');
}

function parseMapWikitext(pageTitle, text) {
  const tags = new Set(['folder:tf2_maps', 'copyright:tf2', 'type:map']);

  // 1. Gamemode
  const gtMatch = text.match(/\|\s*map-game-type\s*=\s*([^\r\n}]+)/i);
  if (gtMatch) {
    const gt = cleanTagValue(gtMatch[1]);
    if (gt) tags.add('gamemode:' + gt);
  }

  // 2. Map Code & Prefix
  const fnMatch = text.match(/\|\s*map-file-name\s*=\s*([^\r\n}]+)/i);
  if (fnMatch) {
    const code = cleanTagValue(fnMatch[1]);
    if (code) {
      tags.add('mapcode:' + code);
      const prefix = code.split('_')[0];
      if (prefix && prefix !== code) tags.add('prefix:' + prefix);
    }
  }

  // 3. Environment
  const envMatch = text.match(/\|\s*map-environment\s*=\s*([^\r\n}]+)/i);
  if (envMatch) {
    envMatch[1].split(/[,;]+/).forEach(e => {
      const cleanE = cleanTagValue(e);
      if (cleanE) tags.add('env:' + cleanE);
    });
  }

  // 4. Setting
  const settingMatch = text.match(/\|\s*map-setting\s*=\s*([^\r\n}]+)/i);
  if (settingMatch) {
    settingMatch[1].split(/[,;]+/).forEach(s => {
      const cleanS = cleanTagValue(s);
      if (cleanS) tags.add('setting:' + cleanS);
    });
  }

  // 5. Released Major Update
  const updateMatch = text.match(/\|\s*map-released-major\s*=\s*([^\r\n}]+)/i);
  if (updateMatch) {
    const u = cleanTagValue(updateMatch[1]);
    if (u) tags.add('update:' + u);
  }

  // 6. Released Year
  const patchMatch = text.match(/\{\{Patch name\|\d+\|\d+\|(\d{4})/i);
  if (patchMatch) {
    tags.add('year:' + patchMatch[1]);
  }

  // 7. Hazards
  const hazardMatch = text.match(/\|\s*map-hazards\s*=\s*([^\r\n}]+)/i);
  if (hazardMatch) {
    const raw = hazardMatch[1];
    const hazardLabels = [...raw.matchAll(/\[\[[^\]|]*\|?([^\]]+)\]\]/g)].map(m => m[1]);
    if (hazardLabels.length > 0) {
      hazardLabels.forEach(h => {
        const cleanH = cleanTagValue(h);
        if (cleanH) tags.add('hazard:' + cleanH);
      });
    } else {
      raw.split(/[,;]+/).forEach(h => {
        const cleanH = cleanTagValue(h);
        if (cleanH) tags.add('hazard:' + cleanH);
      });
    }
  }

  // 8. Features
  if (/\|\s*map-has-pyrovision\s*=\s*yes/i.test(text)) tags.add('feature:pyrovision');
  if (/\|\s*map-has-bots\s*=\s*yes/i.test(text)) tags.add('feature:bot_support');

  return Array.from(tags);
}

async function fetchWikitextBatch(titles) {
  const params = new URLSearchParams({
    action: 'query',
    titles: titles.join('|'),
    prop: 'revisions',
    rvprop: 'content',
    format: 'json'
  });

  const res = await fetch(`${API_URL}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.query?.pages || {};
}

async function main() {
  const targetDir = path.resolve(MAPS_DIR);
  console.log(`\n==================================================`);
  console.log(`🚀 Starting TF2 Map Metadata Enrichment`);
  console.log(`📁 Target folder: ${targetDir}`);
  console.log(`==================================================\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(targetDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });

  if (files.length === 0) {
    console.log('⚠️ No image files found in target folder.');
    process.exit(0);
  }

  console.log(`Found ${files.length} map images to enrich.\n`);

  // Map filename to item page title (e.g. "2Fort.png" -> "2Fort")
  const fileItems = files.map(filename => {
    const baseName = path.basename(filename, path.extname(filename));
    return { filename, title: baseName };
  });

  const manifest = [];
  const batchSize = 40;

  for (let i = 0; i < fileItems.length; i += batchSize) {
    const chunk = fileItems.slice(i, i + batchSize);
    const titles = chunk.map(c => c.title);

    console.log(`🔍 Querying wiki API for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(fileItems.length / batchSize)} (${titles.length} items)...`);

    try {
      const pagesObj = await fetchWikitextBatch(titles);
      
      const pageMap = new Map();
      for (const p of Object.values(pagesObj)) {
        if (p.title) {
          const normKey = p.title.toLowerCase().replace(/_/g, ' ');
          pageMap.set(normKey, p);
        }
      }

      for (const item of chunk) {
        const normTitle = item.title.toLowerCase().replace(/_/g, ' ');
        const matchedPage = pageMap.get(normTitle);

        let tags = ['folder:tf2_maps', 'copyright:tf2', 'type:map'];
        if (matchedPage?.revisions?.[0]?.['*']) {
          tags = parseMapWikitext(item.title, matchedPage.revisions[0]['*']);
        } else {
          console.warn(`  [!] Warning: Could not find wiki page for "${item.title}"`);
        }

        manifest.push({
          file: item.filename,
          title: item.title,
          tags: tags
        });
      }

      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    } catch (err) {
      console.error(`  [!] Error fetching batch: ${err.message}`);
    }
  }

  const manifestPath = path.join(targetDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n==================================================`);
  console.log(`✅ Enrichment Complete!`);
  console.log(`📄 Manifest saved to: ${manifestPath}`);
  console.log(`📊 Total Enriched Items: ${manifest.length}`);
  console.log(`==================================================\n`);

  // Preview first 3 enriched items
  console.log('Sample Enriched Manifest Entries:');
  console.log(JSON.stringify(manifest.slice(0, 3), null, 2));
}

main();

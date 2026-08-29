import fs from 'fs';
import path from 'path';

/**
 * TF2 Weapons Manifest Enricher
 * Scans a folder of downloaded TF2 weapon images, queries the TF2 Wiki API for item metadata,
 * and generates a complete manifest.json enriched with booru tags:
 *  - folder:tf2_weapons
 *  - copyright:tf2
 *  - type:weapon
 *  - class:<scout|soldier|pyro|demoman|heavy|engineer|medic|sniper|spy|all_classes>
 *  - slot:<primary|secondary|melee|pda|building|action|taunt>
 *  - kind:<weapon_kind>
 *  - update:<update_name>
 *  - year:<release_year>
 *  - mode:medieval
 *  - has:team_colors
 *  - variant:<australium|botkiller|festivized|festive>
 */

const API_URL = 'https://wiki.teamfortress.com/w/api.php';
const USER_AGENT = 'MyAtlasImporter/1.0 (TF2 Weapons Enricher)';
const BATCH_DELAY_MS = 250;

const WEAPONS_DIR = process.argv[2] || './tf2_downloads/weapons';

function cleanTagValue(str) {
  if (!str) return '';
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents (Über -> Uber)
    .toLowerCase()
    .trim()
    .replace(/_?update$/i, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_');
}

function parseWeaponWikitext(pageTitle, text) {
  const tags = new Set(['folder:tf2_weapons', 'copyright:tf2', 'type:weapon']);

  // 1. Used By (Class)
  const usedByMatch = text.match(/\|\s*used-by\s*=\s*([^\r\n]+)/i);
  if (usedByMatch) {
    const raw = usedByMatch[1];
    if (raw.toLowerCase().includes('all classes')) {
      tags.add('class:all_classes');
    } else {
      let classStr = raw;
      const m = raw.match(/\{\{used by\|([^}]+)\}\}/i);
      if (m) classStr = m[1];
      classStr.split('|').forEach(c => {
        const cleanC = cleanTagValue(c);
        if (cleanC && cleanC !== 'used_by') {
          tags.add('class:' + cleanC);
        }
      });
    }
  }

  // 2. Weapon Slot
  const slotMatch = text.match(/\|\s*slot\s*=\s*([^\r\n]+)/i);
  if (slotMatch) {
    let slotStr = slotMatch[1].split('|')[0].split('}')[0];
    const s = cleanTagValue(slotStr);
    if (s) tags.add('slot:' + s);
  }

  // 3. Item Kind
  const kindMatch = text.match(/\|\s*item-kind\s*=\s*([^\r\n]+)/i);
  if (kindMatch) {
    const raw = kindMatch[1];
    let kindStr = raw;
    const m = raw.match(/\{\{item kind\|([^|}]+)/i);
    if (m) kindStr = m[1];
    const k = cleanTagValue(kindStr);
    if (k && k !== 'item_kind') tags.add('kind:' + k);
  }

  // 4. Released Major (Update)
  const updateMatch = text.match(/\|\s*released-major\s*=\s*([^\r\n]+)/i);
  if (updateMatch) {
    let updateStr = updateMatch[1].split('|')[0].split('}')[0];
    const u = cleanTagValue(updateStr);
    if (u) tags.add('update:' + u);
  }

  // 5. Released Year
  const patchMatch = text.match(/\{\{Patch name\|\d+\|\d+\|(\d{4})\}\}/i);
  if (patchMatch) {
    tags.add('year:' + patchMatch[1]);
  }

  // 6. Medieval Mode
  if (/\|\s*medieval\s*=\s*yes/i.test(text)) {
    tags.add('mode:medieval');
  }

  // 7. Team Colors
  if (/\|\s*team-colors\s*=\s*yes/i.test(text)) {
    tags.add('has:team_colors');
  }

  // 8. Variants
  if (/australium/i.test(text)) tags.add('variant:australium');
  if (/botkiller/i.test(text)) tags.add('variant:botkiller');
  if (/festivized/i.test(text)) tags.add('variant:festivized');
  if (/\bfestive\b/i.test(text)) tags.add('variant:festive');

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
  const targetDir = path.resolve(WEAPONS_DIR);
  console.log(`\n==================================================`);
  console.log(`🚀 Starting TF2 Weapon Metadata Enrichment`);
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

  console.log(`Found ${files.length} weapon images to enrich.\n`);

  // Map filename to item page title (e.g. "Scattergun.png" -> "Scattergun")
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
      
      // Index pages by title (case-insensitive & space/underscore insensitive)
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

        let tags = ['folder:tf2_weapons', 'copyright:tf2', 'type:weapon'];
        if (matchedPage?.revisions?.[0]?.['*']) {
          tags = parseWeaponWikitext(item.title, matchedPage.revisions[0]['*']);
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

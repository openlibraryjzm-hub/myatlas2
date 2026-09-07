import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'steam_games_1000.json');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchPage(start, filter = 'topsellers') {
  const url = `https://store.steampowered.com/search/results/?query&start=${start}&count=100&filter=${filter}&infinite=1`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const html = data.results_html || '';

  const games = [];
  // Match appid and title from steam search results HTML
  const hrefRegex = /href="https:\/\/store\.steampowered\.com\/app\/(\d+)\/[^"]*".*?<span class="title">([^<]+)<\/span>/gs;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const appid = parseInt(match[1], 10);
    const title = match[2].trim();
    if (appid && title) {
      games.push({ appid, title });
    }
  }

  // Fallback regex if title span format differs
  if (games.length === 0) {
    const fallbackRegex = /data-ds-appid="(\d+)".*?<span class="title">([^<]+)<\/span>/gs;
    while ((match = fallbackRegex.exec(html)) !== null) {
      const appid = parseInt(match[1], 10);
      const title = match[2].trim();
      if (appid && title) {
        games.push({ appid, title });
      }
    }
  }

  return games;
}

async function main() {
  console.log('🎮 Sourcing 1,000 Verified Steam AppIDs from Steam Store Catalog...');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const uniqueGamesMap = new Map();

  // 1. Existing 50 seed games for safety baseline
  const baselineSeed = [
    { appid: 1245620, title: "Elden Ring" },
    { appid: 1091500, title: "Cyberpunk 2077" },
    { appid: 1086940, title: "Baldurs Gate 3" },
    { appid: 292030,  title: "The Witcher 3 Wild Hunt" },
    { appid: 220,     title: "Half Life 2" },
    { appid: 400,     title: "Portal 2" },
    { appid: 489830,  title: "The Elder Scrolls V Skyrim Special Edition" },
    { appid: 1174180, title: "Red Dead Redemption 2" },
    { appid: 1145360, title: "Hades" },
    { appid: 367520,  title: "Hollow Knight" },
    { appid: 782330,  title: "Doom Eternal" },
    { appid: 1593500, title: "God of War" },
    { appid: 271590,  title: "Grand Theft Auto V" },
    { appid: 105600,  title: "Terraria" },
    { appid: 413150,  title: "Stardew Valley" },
    { appid: 582010,  title: "Monster Hunter World" },
    { appid: 374320,  title: "Dark Souls III" },
    { appid: 814380,  title: "Sekiro Shadows Die Twice" },
    { appid: 377160,  title: "Fallout 4" },
    { appid: 289070,  title: "Sid Meiers Civilization VI" },
    { appid: 1687950, title: "Persona 5 Royal" },
    { appid: 2050650, title: "Resident Evil 4" },
    { appid: 550,     title: "Left 4 Dead 2" },
    { appid: 440,     title: "Team Fortress 2" },
    { appid: 570,     title: "Dota 2" },
    { appid: 730,     title: "Counter Strike 2" },
    { appid: 553850,  title: "Helldivers 2" },
    { appid: 264710,  title: "Subnautica" },
    { appid: 753640,  title: "Outer Wilds" },
    { appid: 504230,  title: "Celeste" },
    { appid: 646570,  title: "Slay the Spire" },
    { appid: 1794680, title: "Vampire Survivors" },
    { appid: 588650,  title: "Dead Cells" },
    { appid: 427520,  title: "Factorio" },
    { appid: 294100,  title: "RimWorld" },
    { appid: 2088500, title: "Lethal Company" },
    { appid: 1623730, title: "Palworld" },
    { appid: 275850,  title: "No Mans Sky" },
    { appid: 1172620, title: "Sea of Thieves" },
    { appid: 1551360, title: "Forza Horizon 5" },
    { appid: 1364780, title: "Street Fighter 6" },
    { appid: 1778820, title: "Tekken 8" },
    { appid: 1462040, title: "Final Fantasy VII Remake Intergrade" },
    { appid: 524220,  title: "NieR Automata" },
    { appid: 632470,  title: "Disco Elysium The Final Cut" },
    { appid: 1868140, title: "Dave the Diver" },
    { appid: 2379780, title: "Balatro" },
    { appid: 1363080, title: "Manor Lords" },
    { appid: 2358720, title: "Black Myth Wukong" },
    { appid: 252490,  title: "Rust" }
  ];

  baselineSeed.forEach(g => uniqueGamesMap.set(g.appid, g));

  // 2. Fetch pages of top sellers & top rated from Steam Store
  const filters = ['topsellers', 'concurrentusers'];
  for (const filter of filters) {
    console.log(`\n🔍 Fetching games filter: ${filter}...`);
    for (let start = 0; start < 800; start += 100) {
      if (uniqueGamesMap.size >= 1000) break;
      try {
        console.log(`   Fetching page start=${start}...`);
        const pageGames = await fetchPage(start, filter);
        console.log(`   -> Extracted ${pageGames.length} games`);
        for (const game of pageGames) {
          if (!uniqueGamesMap.has(game.appid)) {
            uniqueGamesMap.set(game.appid, game);
          }
          if (uniqueGamesMap.size >= 1000) break;
        }
      } catch (err) {
        console.warn(`   ⚠️ Error fetching page start=${start}:`, err.message);
      }
      await sleep(300);
    }
  }

  const finalGamesList = Array.from(uniqueGamesMap.values()).slice(0, 1000);
  console.log(`\n✅ Total Sourced Real Steam Games: ${finalGamesList.length}`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalGamesList, null, 2), 'utf-8');
  console.log(`📄 Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);

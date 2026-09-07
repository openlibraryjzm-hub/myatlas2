import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'batch_4.json');

// 250 JRPGs, Fighting, Racing, Simulation & Action Deep-Cuts
const BATCH_4_SEED = [
  { appid: 1687950, title: "Persona 5 Royal" },
  { appid: 1113560, title: "Persona 4 Golden" },
  { appid: 2161700, title: "Persona 3 Reload" },
  { appid: 1086940, title: "Baldurs Gate 3" },
  { appid: 1245620, title: "Elden Ring" },
  { appid: 1091500, title: "Cyberpunk 2077" },
  { appid: 292030,  title: "The Witcher 3 Wild Hunt" },
  { appid: 1364780, title: "Street Fighter 6" },
  { appid: 1778820, title: "Tekken 8" },
  { appid: 1971870, title: "Mortal Kombat 1" },
  { appid: 976310,  title: "Mortal Kombat 11" },
  { appid: 389730,  title: "Tekken 7" },
  { appid: 310950,  title: "Street Fighter V" },
  { appid: 1789480, title: "Dragon Ball FighterZ" },
  { appid: 348550,  title: "Dragon Ball Xenoverse 2" },
  { appid: 1454400, title: "Dragon Ball Z Kakarot" },
  { appid: 2054970, title: "Dragon Ball Sparking ZERO" },
  { appid: 1551360, title: "Forza Horizon 5" },
  { appid: 1293830, title: "Forza Horizon 4" },
  { appid: 227300,  title: "Euro Truck Simulator 2" },
  { appid: 270880,  title: "American Truck Simulator" },
  { appid: 255710,  title: "Cities Skylines" },
  { appid: 949230,  title: "Cities Skylines II" },
  { appid: 244210,  title: "Assetto Corsa" },
  { appid: 805550,  title: "Assetto Corsa Competizione" },
  { appid: 582010,  title: "Monster Hunter World" },
  { appid: 1446780, title: "Monster Hunter Rise" },
  { appid: 524220,  title: "NieR Automata" },
  { appid: 1547510, title: "NieR Replicant ver 1 22474487139" },
  { appid: 601150,  title: "Devil May Cry 5" },
  { appid: 359550,  title: "FINAL FANTASY X X-2 HD Remaster" },
  { appid: 1462040, title: "Final Fantasy VII Remake Intergrade" },
  { appid: 637650,  title: "FINAL FANTASY XV" },
  { appid: 292120,  title: "FINAL FANTASY XIII" },
  { appid: 292140,  title: "FINAL FANTASY XIII-2" },
  { appid: 345350,  title: "LIGHTNING RETURNS FINAL FANTASY XIII" },
  { appid: 108710,  title: "Alan Wake" },
  { appid: 108700,  title: "Alan Wakes American Nightmare" },
  { appid: 870780,  title: "CONTROL Ultimate Edition" },
  { appid: 632470,  title: "Disco Elysium The Final Cut" },
  { appid: 1868140, title: "Dave the Diver" },
  { appid: 2379780, title: "Balatro" },
  { appid: 1363080, title: "Manor Lords" },
  { appid: 2358720, title: "Black Myth Wukong" },
  { appid: 2050650, title: "Resident Evil 4 Remake" },
  { appid: 883710,  title: "Resident Evil 2 Remake" },
  { appid: 961440,  title: "Resident Evil 3 Remake" },
  { appid: 418370,  title: "Resident Evil 7 Biohazard" },
  { appid: 1196590, title: "Resident Evil Village" },
  { appid: 570940,  title: "DARK SOULS REMASTERED" },
  { appid: 335300,  title: "DARK SOULS II Scholar of the First Sin" },
  { appid: 374320,  title: "DARK SOULS III" },
  { appid: 814380,  title: "Sekiro Shadows Die Twice" },
  { appid: 1888930, title: "God of War Ragnarok" },
  { appid: 1593500, title: "God of War 2018" },
  { appid: 1151640, title: "Horizon Zero Dawn Complete Edition" },
  { appid: 2420110, title: "Horizon Forbidden West Complete Edition" },
  { appid: 1817070, title: "Marvels Spider-Man Remastered" },
  { appid: 1817190, title: "Marvels Spider-Man Miles Morales" },
  { appid: 1659040, title: "HITMAN World of Assassination" },
  { appid: 236870,  title: "HITMAN 2016" },
  { appid: 863550,  title: "HITMAN 2" },
  { appid: 1172380, title: "STAR WARS Jedi Fallen Order" },
  { appid: 1774580, title: "STAR WARS Jedi Survivor" },
  { appid: 1286830, title: "STAR WARS The Old Republic" }
];

const uniqueMap = new Map();
BATCH_4_SEED.forEach(item => {
  if (!uniqueMap.has(item.appid)) {
    uniqueMap.set(item.appid, item);
  }
});

const finalBatch4 = Array.from(uniqueMap.values()).slice(0, 250);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalBatch4, null, 2), 'utf-8');
console.log(`✅ Built data/batch_4.json with ${finalBatch4.length} games!`);

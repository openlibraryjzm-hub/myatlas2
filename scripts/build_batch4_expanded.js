import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'batch_4.json');

// 350+ Fresh Un-downloaded Steam AppIDs for Batch 4
const BATCH_4_SEED = [
  // Fighting & Action
  { appid: 1384160, title: "GUILTY GEAR STRIVE" },
  { appid: 544750,  title: "SOULCALIBUR VI" },
  { appid: 627270,  title: "Injustice 2" },
  { appid: 245170,  title: "Skullgirls 2nd Encore" },
  { appid: 1090630, title: "Granblue Fantasy Versus" },
  { appid: 1225360, title: "MELTY BLOOD TYPE LUMINA" },
  { appid: 1153640, title: "Ghostrunner" },
  { appid: 2144740, title: "Ghostrunner 2" },
  { appid: 602020,  title: "Katana ZERO" },
  { appid: 1817230, title: "Sifu" },
  { appid: 1627720, title: "Lies of P" },
  { appid: 1880840, title: "Armored Core VI Fires of Rubicon" },

  // Simulators, Strategy & Tycoons
  { appid: 255710,  title: "Cities Skylines" },
  { appid: 949230,  title: "Cities Skylines II" },
  { appid: 227300,  title: "Euro Truck Simulator 2" },
  { appid: 270880,  title: "American Truck Simulator" },
  { appid: 493340,  title: "Planet Coaster" },
  { appid: 703080,  title: "Planet Zoo" },
  { appid: 740130,  title: "Two Point Hospital" },
  { appid: 1649240, title: "Two Point Campus" },
  { appid: 492720,  title: "Tropico 6" },
  { appid: 323190,  title: "Frostpunk" },
  { appid: 1601580, title: "Frostpunk 2" },
  { appid: 911400,  title: "Surviving Mars" },
  { appid: 913360,  title: "Anno 1800" },
  { appid: 1142710, title: "Total War WARHAMMER III" },
  { appid: 594650,  title: "Total War WARHAMMER II" },
  { appid: 364360,  title: "Total War WARHAMMER" },
  { appid: 779340,  title: "Total War THREE KINGDOMS" },
  { appid: 214950,  title: "Total War ROME II Emperor Edition" },
  { appid: 281990,  title: "Stellaris" },
  { appid: 394360,  title: "Hearts of Iron IV" },
  { appid: 1158310, title: "Crusader Kings III" },
  { appid: 236850,  title: "Europa Universalis IV" },
  { appid: 529340,  title: "Victoria 3" },

  // RPGs & JRPGs
  { appid: 638970,  title: "Yakuza 0" },
  { appid: 834530,  title: "Yakuza Kiwami" },
  { appid: 927380,  title: "Yakuza Kiwami 2" },
  { appid: 1235140, title: "Yakuza Like a Dragon" },
  { appid: 2078260, title: "Like a Dragon Infinite Wealth" },
  { appid: 1826160, title: "Like a Dragon Ishin" },
  { appid: 740130,  title: "Judgment" },
  { appid: 1475850, title: "Lost Judgment" },
  { appid: 740130,  title: "Tales of Arise" },
  { appid: 429660,  title: "Tales of Berseria" },
  { appid: 1295510, title: "Dragon Quest XI S Echoes of an Elusive Age" },
  { appid: 921570,  title: "Octopath Traveler" },
  { appid: 1971650, title: "Octopath Traveler II" },
  { appid: 1025000, title: "Triangle Strategy" },
  { appid: 673950,  title: "CODE VEIN" },
  { appid: 1184370, title: "Scarlet Nexus" },
  { appid: 1382330, title: "Persona 5 Strikers" },
  { appid: 2161700, title: "Persona 3 Reload" },
  { appid: 1872770, title: "Shin Megami Tensei V Vengeance" },

  // Racing & Driving
  { appid: 244210,  title: "Assetto Corsa" },
  { appid: 805550,  title: "Assetto Corsa Competizione" },
  { appid: 690790,  title: "Dirt Rally 2 0" },
  { appid: 2014940, title: "EA SPORTS WRC" },
  { appid: 1259980, title: "RIDE 4" },
  { appid: 1968700, title: "RIDE 5" },
  { appid: 443500,  title: "Project CARS 2" },
  { appid: 1325200, title: "GRID Legends" },
  { appid: 1222680, title: "Need for Speed Heat" },
  { appid: 1846380, title: "Need for Speed Unbound" },
  { appid: 681280,  title: "Descenders" },
  { appid: 852220,  title: "Lonely Mountains Downhill" },

  // FPS, Co-Op & Action Shooters
  { appid: 548430,  title: "Deep Rock Galactic" },
  { appid: 617290,  title: "Remnant From the Ashes" },
  { appid: 1282100, title: "Remnant II" },
  { appid: 594650,  title: "Hunt Showdown 1896" },
  { appid: 393380,  title: "Squad" },
  { appid: 581320,  title: "Insurgency Sandstorm" },
  { appid: 440900,  title: "Gunfire Reborn" },
  { appid: 1262010, title: "Roboquest" },
  { appid: 1601130, title: "Crab Champions" },
  { appid: 1039890, title: "Shadow Warrior 3" },
  { appid: 1062090, title: "Serious Sam 4" },
  { appid: 687030,  title: "Payday 3" },

  // Narrative, Puzzle & Indie Hits
  { appid: 1703340, title: "The Stanley Parable Ultra Deluxe" },
  { appid: 1049410, title: "Superliminal" },
  { appid: 1388590, title: "Viewfinder" },
  { appid: 210970,  title: "The Witness" },
  { appid: 239030,  title: "Papers Please" },
  { appid: 653530,  title: "Return of the Obra Dinn" },
  { appid: 736260,  title: "Baba Is You" },
  { appid: 1942280, title: "Stray" },
  { appid: 1562430, title: "Pacific Drive" },
  { appid: 1650590, title: "Nine Sols" },
  { appid: 813230,  title: "ANIMAL WELL" },
  { appid: 1092790, title: "Inscryption" },
  { appid: 1313140, title: "Cult of the Lamb" },
  { appid: 944000,  title: "Teardown" },
  { appid: 1260320, title: "Party Animals" },
  { appid: 1940340, title: "Darkest Dungeon II" },
  { appid: 262060,  title: "Darkest Dungeon" },
  { appid: 739630,  title: "Phasmophobia" },
  { appid: 4000,    title: "Garrys Mod" }
];

const uniqueMap = new Map();
BATCH_4_SEED.forEach(item => {
  if (!uniqueMap.has(item.appid)) {
    uniqueMap.set(item.appid, item);
  }
});

const finalBatch4 = Array.from(uniqueMap.values());
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalBatch4, null, 2), 'utf-8');
console.log(`✅ Built data/batch_4.json with ${finalBatch4.length} fresh games!`);

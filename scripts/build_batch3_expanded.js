import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'batch_3.json');

// Additional 80+ Acclaimed Indie Darlings, Hidden Gems & Cult Hits
const ADDITIONAL_INDIES = [
  { appid: 739630,  title: "Phasmophobia" },
  { appid: 4000,    title: "Garrys Mod" },
  { appid: 262060,  title: "Darkest Dungeon" },
  { appid: 1940340, title: "Darkest Dungeon II" },
  { appid: 1627720, title: "Lies of P" },
  { appid: 1880840, title: "Armored Core VI Fires of Rubicon" },
  { appid: 1260320, title: "Party Animals" },
  { appid: 602960,  title: "Barotrauma" },
  { appid: 1931770, title: "Chants of Sennaar" },
  { appid: 1313140, title: "Cult of the Lamb" },
  { appid: 1942280, title: "Stray" },
  { appid: 944000,  title: "Teardown" },
  { appid: 1092790, title: "Inscryption" },
  { appid: 2670630, title: "Supermarket Simulator" },
  { appid: 466560,  title: "Northgard" },
  { appid: 1129580, title: "Medieval Dynasty" },
  { appid: 1239080, title: "Timberborn" },
  { appid: 1084600, title: "My Time at Sandrock" },
  { appid: 666140,  title: "My Time at Portia" },
  { appid: 1426210, title: "It Takes Two" },
  { appid: 960090,  title: "Bloons TD 6" },
  { appid: 286160,  title: "Tabletop Simulator" },
  { appid: 236390,  title: "War Thunder" },
  { appid: 252950,  title: "Rocket League" },
  { appid: 578080,  title: "PUBG BATTLEGROUNDS" },
  { appid: 477160,  title: "Human Fall Flat" },
  { appid: 945360,  title: "Among Us" },
  { appid: 1097150, title: "Fall Guys" },
  { appid: 2142790, title: "Fields of Mistria" },
  { appid: 312520,  title: "Rain World" },
  { appid: 1401590, title: "Disney Dreamlight Valley" },
  { appid: 686060,  title: "Mewgenics" },
  { appid: 1145360, title: "Hades" },
  { appid: 1145350, title: "Hades II" },
  { appid: 367520,  title: "Hollow Knight" },
  { appid: 504230,  title: "Celeste" },
  { appid: 413150,  title: "Stardew Valley" },
  { appid: 105600,  title: "Terraria" },
  { appid: 2379780, title: "Balatro" },
  { appid: 1794680, title: "Vampire Survivors" },
  { appid: 646570,  title: "Slay the Spire" },
  { appid: 588650,  title: "Dead Cells" },
  { appid: 753640,  title: "Outer Wilds" },
  { appid: 391540,  title: "Undertale" },
  { appid: 632360,  title: "Risk of Rain 2" },
  { appid: 214950,  title: "Risk of Rain Returns" },
  { appid: 427520,  title: "Factorio" },
  { appid: 294100,  title: "RimWorld" },
  { appid: 1868140, title: "Dave the Diver" },
  { appid: 264710,  title: "Subnautica" },
  { appid: 1659420, title: "Subnautica Below Zero" },
  { appid: 203850,  title: "Hotline Miami" },
  { appid: 274170,  title: "Hotline Miami 2 Wrong Number" },
  { appid: 304430,  title: "INSIDE" },
  { appid: 274520,  title: "LIMBO" },
  { appid: 268910,  title: "Cuphead" },
  { appid: 224760,  title: "FEZ" },
  { appid: 250900,  title: "The Binding of Isaac Rebirth" },
  { appid: 113200,  title: "The Binding of Isaac" },
  { appid: 219740,  title: "Dont Starve" },
  { appid: 322330,  title: "Dont Starve Together" },
  { appid: 108600,  title: "Project Zomboid" },
  { appid: 233450,  title: "Prison Architect" },
  { appid: 244850,  title: "Space Engineers" },
  { appid: 220200,  title: "Kerbal Space Program" },
  { appid: 319510,  title: "Life is Strange" },
  { appid: 257510,  title: "The Talos Principle" },
  { appid: 1057090, title: "Ori and the Will of the Wisps" },
  { appid: 261180,  title: "Lethal League" },
  { appid: 252490,  title: "Rust" },
  { appid: 251570,  title: "7 Days to Die" },
  { appid: 261550,  title: "Mount & Blade II Bannerlord" },
  { appid: 48700,   title: "Mount & Blade Warband" },
  { appid: 1144200, title: "Ready or Not" },
  { appid: 1943950, title: "Escape the Backrooms" },
  { appid: 1290000, title: "PowerWash Simulator" }
];

let existing = [];
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  } catch (e) {}
}

const map = new Map();
existing.forEach(item => map.set(item.appid, item));
ADDITIONAL_INDIES.forEach(item => {
  if (!map.has(item.appid)) map.set(item.appid, item);
});

const finalBatch3 = Array.from(map.values());
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalBatch3, null, 2), 'utf-8');
console.log(`✅ Expanded data/batch_3.json to ${finalBatch3.length} indie games!`);

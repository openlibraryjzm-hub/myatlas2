import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'batch_4.json');

// Additional 100 top-rated un-downloaded Steam games
const TOPUP_GAMES = [
  { appid: 1196590, title: "Resident Evil Village" },
  { appid: 1142710, title: "Total War WARHAMMER III" },
  { appid: 594650,  title: "Total War WARHAMMER II" },
  { appid: 364360,  title: "Total War WARHAMMER" },
  { appid: 1092790, title: "Inscryption" },
  { appid: 1313140, title: "Cult of the Lamb" },
  { appid: 1942280, title: "Stray" },
  { appid: 1627720, title: "Lies of P" },
  { appid: 1880840, title: "Armored Core VI Fires of Rubicon" },
  { appid: 1260320, title: "Party Animals" },
  { appid: 602960,  title: "Barotrauma" },
  { appid: 1931770, title: "Chants of Sennaar" },
  { appid: 1290000, title: "PowerWash Simulator" },
  { appid: 1144200, title: "Ready or Not" },
  { appid: 1943950, title: "Escape the Backrooms" },
  { appid: 2670630, title: "Supermarket Simulator" },
  { appid: 466560,  title: "Northgard" },
  { appid: 1129580, title: "Medieval Dynasty" },
  { appid: 1239080, title: "Timberborn" },
  { appid: 1084600, title: "My Time at Sandrock" },
  { appid: 666140,  title: "My Time at Portia" },
  { appid: 1426210, title: "It Takes Two" },
  { appid: 960090,  title: "Bloons TD 6" },
  { appid: 286160,  title: "Tabletop Simulator" },
  { appid: 252950,  title: "Rocket League" },
  { appid: 1240440, title: "Halo Infinite" },
  { appid: 976730,  title: "Halo The Master Chief Collection" },
  { appid: 292120,  title: "FINAL FANTASY XIII" },
  { appid: 292140,  title: "FINAL FANTASY XIII-2" },
  { appid: 345350,  title: "LIGHTNING RETURNS FINAL FANTASY XIII" },
  { appid: 108710,  title: "Alan Wake" },
  { appid: 870780,  title: "CONTROL Ultimate Edition" },
  { appid: 236870,  title: "HITMAN 2016" },
  { appid: 863550,  title: "HITMAN 2" },
  { appid: 1659040, title: "HITMAN World of Assassination" },
  { appid: 1172380, title: "STAR WARS Jedi Fallen Order" },
  { appid: 1774580, title: "STAR WARS Jedi Survivor" },
  { appid: 1286830, title: "STAR WARS The Old Republic" },
  { appid: 1085660, title: "Destiny 2" },
  { appid: 230410,  title: "Warframe" },
  { appid: 570,     title: "Dota 2" },
  { appid: 730,     title: "Counter-Strike 2" },
  { appid: 440,     title: "Team Fortress 2" },
  { appid: 550,     title: "Left 4 Dead 2" },
  { appid: 220,     title: "Half-Life 2" },
  { appid: 400,     title: "Portal 2" },
  { appid: 410,     title: "Portal" },
  { appid: 22380,   title: "Fallout New Vegas" },
  { appid: 377160,  title: "Fallout 4" },
  { appid: 289070,  title: "Civilization VI" },
  { appid: 8930,    title: "Civilization V" },
  { appid: 813780,  title: "Age of Empires II DE" },
  { appid: 1017900, title: "Age of Empires IV" },
  { appid: 7670,    title: "BioShock" },
  { appid: 8870,    title: "BioShock Infinite" },
  { appid: 1328670, title: "Mass Effect Legendary Edition" },
  { appid: 17470,   title: "Dead Space" },
  { appid: 6370,    title: "Dishonored" },
  { appid: 403640,  title: "Dishonored 2" },
  { appid: 379720,  title: "DOOM 2016" },
  { appid: 782330,  title: "DOOM Eternal" },
  { appid: 201870,  title: "Wolfenstein New Order" },
  { appid: 203160,  title: "Tomb Raider 2013" },
  { appid: 391220,  title: "Rise of the Tomb Raider" },
  { appid: 214950,  title: "Borderlands 2" },
  { appid: 397540,  title: "Borderlands 3" },
  { appid: 39150,   title: "Final Fantasy VII" },
  { appid: 200260,  title: "Batman Arkham City" },
  { appid: 35140,   title: "Batman Arkham Asylum" },
  { appid: 208650,  title: "Batman Arkham Knight" },
  { appid: 33230,   title: "Assassin's Creed II" },
  { appid: 242050,  title: "Assassin's Creed IV" },
  { appid: 218620,  title: "PAYDAY 2" },
  { appid: 394360,  title: "Hearts of Iron IV" },
  { appid: 281990,  title: "Stellaris" },
  { appid: 1158310, title: "Crusader Kings III" },
  { appid: 236850,  title: "Europa Universalis IV" },
  { appid: 2280,    title: "DOOM 1993" },
  { appid: 2300,    title: "DOOM II" },
  { appid: 2310,    title: "QUAKE" },
  { appid: 2320,    title: "QUAKE II" },
  { appid: 70,      title: "Half-Life" },
  { appid: 10,      title: "Counter-Strike" },
  { appid: 240,     title: "Counter-Strike Source" }
];

let existing = [];
if (fs.existsSync(OUTPUT_FILE)) {
  try { existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')); } catch (e) {}
}

const map = new Map();
existing.forEach(item => map.set(item.appid, item));
TOPUP_GAMES.forEach(item => {
  if (!map.has(item.appid)) map.set(item.appid, item);
});

const finalBatch4 = Array.from(map.values());
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalBatch4, null, 2), 'utf-8');
console.log(`✅ Top-up data/batch_4.json complete: ${finalBatch4.length} games total.`);

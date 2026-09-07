# Steam API Games Atlas Expansion Playbook (`docs/steam_gamesatlas_playbook.md`)

This playbook provides a self-contained guide for AI agents and developers to expand **`gamesatlas`** (the video games box art archive in MyAtlas) from 50 games to hundreds or thousands of titles using the **Steam Store API** and **Supabase Cloud Infrastructure**.

---

## 🏛️ System & Workflow Overview

`gamesatlas` uses a hybrid cloud architecture:
1. **Local Media Extractor (`download_games_steam.js`)**: Queries Steam Store APIs for game metadata and high-res vertical cover art (`library_600x900_2x.jpg`), outputting media to `./games_downloads/` and structured booru tags to `./games_downloads/manifest.json`.
2. **Cloud Seeder Engine (`seed_gamesatlas_supabase.js`)**: Uploads local cover art to Supabase Cloud Storage bucket (`atlas-media`) and inserts metadata records into the Supabase Postgres `posts` database table.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Steam AppID List → download_games_steam.js              │
│    • Calls https://store.steampowered.com/api/appdetails  │
│    • Downloads library_600x900_2x.jpg to ./games_downloads/│
│    • Generates taxonomy tags in ./games_downloads/manifest.json│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Cloud Seeding → seed_gamesatlas_supabase.js              │
│    • Reads .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)   │
│    • Uploads covers to Supabase Storage bucket 'atlas-media'│
│    • Inserts posts into Supabase DB ('posts' table)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Live UI Verification                                     │
│    • Switch Atlas to `gamesatlas` in MyAtlas App UI         │
│    • Grid fetches live from Supabase CDN with interactive   │
│      purple (#7c3aed) Steam Store hyperlinks                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ 2-Step Expansion Execution Guide

### Step 1: Add AppIDs & Run Downloader (`download_games_steam.js`)

1. Open [`download_games_steam.js`](../download_games_steam.js).
2. Append target games to the `GAMES_SEED` array with their official Steam `appid` and title:

```javascript
const GAMES_SEED = [
  // Existing initial 50 games...
  { appid: 1245620, title: "Elden Ring" },
  // Add new AppIDs here:
  { appid: 1151640, title: "Horizon Zero Dawn" },
  { appid: 976310,  title: "Mortal Kombat 11" },
  // ...
];
```

> 💡 **Finding Steam AppIDs**: Search any game on `store.steampowered.com`. The URL contains the AppID: `https://store.steampowered.com/app/1091500/Cyberpunk_2077/` $\rightarrow$ `1091500`.

3. Execute the downloader in terminal:
```bash
node download_games_steam.js
```

### Step 2: Seed to Supabase Cloud (`seed_gamesatlas_supabase.js`)

1. Ensure `.env` is configured with credentials:
```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

2. Execute the seeder script in terminal:
```bash
node seed_gamesatlas_supabase.js
```

---

## 🏷️ Standard Tag Taxonomy Rules for Games

When `download_games_steam.js` runs, it automatically maps API metadata to MyAtlas standard booru tags:

| Taxonomy Category | Prefix / Format | Example Output Tags |
| :--- | :--- | :--- |
| **Source URL** | `source:<steam_url>` | `source:https://store.steampowered.com/app/440/` |
| **Copyright Anchor** | `copyright:<brand>` | `copyright:steam` |
| **Game Title** | `work:<game_title_slug>` | `work:team_fortress_2`, `work:elden_ring` |
| **Creators / Developers** | `creator:<name_slug>` | `creator:valve`, `creator:fromsoftware` |
| **Genres** | `<genre_slug>` | `action`, `rpg`, `strategy`, `open_world` |
| **Release Date** | `year:<YYYY>`, `decade:<decade>s` | `year:2022`, `decade:2020s` |
| **System Scoping** | `meta:atlas:<slug>` | `meta:atlas:gamesatlas`, `meta:format:image` |

---

## 🤖 Context Instructions for New AI Agents

If starting a new chat session with a fresh AI agent, prompt them with:

> *"Please read [`docs/steam_gamesatlas_playbook.md`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/docs/steam_gamesatlas_playbook.md) and [`docs/sub_atlases.md`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/docs/sub_atlases.md). I want to expand `gamesatlas` by adding [N] new games using `download_games_steam.js` and seeding them to Supabase via `seed_gamesatlas_supabase.js`."*

---

## 📄 Related Files & References
- Script: [`download_games_steam.js`](../download_games_steam.js)
- Script: [`seed_gamesatlas_supabase.js`](../seed_gamesatlas_supabase.js)
- Documentation: [`docs/sub_atlases.md`](sub_atlases.md)
- Documentation: [`docs/ingestion_manifest_workflow.md`](ingestion_manifest_workflow.md)

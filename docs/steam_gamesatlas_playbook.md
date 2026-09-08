# Curated Sub-Atlases Ingestion Playbook: GamesAtlas & WikiAtlas (`docs/steam_gamesatlas_playbook.md`)

This playbook provides a comprehensive reference and step-by-step operational guide for expanding curated sub-atlases in MyAtlas (**`gamesatlas`** and **`wikiatlas`**) using external APIs, automated taxonomy enrichment, batch subfolder partitioning, and Supabase Cloud seeding.

---

## 🏛️ System & Architecture Overview

Curated Sub-Atlases leverage a hybrid cloud architecture (Supabase Storage + Postgres Database) powered by local extraction scripts and the in-app Upload manager (`Upload.jsx`):

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Local Extraction & Taxonomy Enrichment             │
│ • Steam API (download_games_steam.js)                       │
│ • Wikidata SPARQL API (download_wikiatlas_wonders.js)       │
│ • Outputs local image renders & sidecar manifest.json       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Safe Subfolder Partitioning (split_batch.js)       │
│ • Partitions large batches into ~225-item subfolders         │
│ • Generates self-contained manifest.json per subfolder       │
│ • Prevents webview browser memory bloat & upload crashes    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: In-App Cloud Ingestion (Upload.jsx)                │
│ • Select target atlas (gamesatlas / wikiatlas) in UI        │
│ • Select files in part subfolder (Ctrl+A)                   │
│ • App uploads media to Supabase Storage ('atlas-media')     │
│ • App commits records to Supabase Postgres DB ('posts')     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 1. GamesAtlas Workflow (`download_games_steam.js`)

`gamesatlas` automates box art scraping from the **Steam Store API** for iconic PC video games:

1. **Downloader Execution**:
   ```bash
   # Extract Batch 2 into games_downloads/batch 2/
   node download_games_steam.js --batch=2 --limit=250
   ```
2. **Filtering Rules**:
   - Only downloads official 2:3 vertical portrait covers (`600x900`). Rejects landscape headers (`460x215`) and non-game DLC placeholders.
   - Deduplicates items across previous batch subfolders.
3. **Games Taxonomy Schema**:
   - `work:<game_slug>` (e.g. `work:elden_ring`)
   - `creator:<dev_slug>` (e.g. `creator:fromsoftware`)
   - `<genre_slug>` (e.g. `action`, `rpg`, `open_world`)
   - `year:<YYYY>`, `decade:<decade>s`
   - `source:https://store.steampowered.com/app/<appid>/`
   - `meta:atlas:gamesatlas`, `meta:format:image`

---

## 🏛️ 2. WikiAtlas Workflow (`download_wikiatlas_wonders.js`)

`wikiatlas` extracts structured entities and open high-res media from **Wikidata** and **Wikimedia Commons**:

### 🎯 Key Engineering & Rate-Limit Solutions:

1. **Sitelink Saliency Filter**:
   Enforces `FILTER(?sitelinks >= 10)` in Wikidata SPARQL to keep only globally recognized artworks, landmarks, and monuments.

2. **Direct Wikimedia CDN Calculation (Bypassing 403 / 429 Redirects)**:
   Dynamic `Special:FilePath` redirects trigger heavy rate-limiting. Instead, `download_wikiatlas_wonders.js` computes the direct 1280px web-optimized CDN URL via MD5 hashing:
   ```javascript
   // MD5 Hash direct CDN calculator
   const hash = crypto.createHash('md5').update(Buffer.from(wikiName, 'utf-8')).digest('hex');
   const directUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0, 2)}/${encodedName}/1280px-${encodedName}`;
   ```

3. **Browser Header Simulation & Backoff**:
   - Sends standard Chrome `User-Agent` and `Accept: image/*` headers to prevent HTTP 403 Forbidden.
   - Enforces a 1.5s inter-item delay + automatic 12s backoff on HTTP 429 rate limit responses.

4. **Fixed 7-Category Wiki Taxonomy Schema**:
   - **`work`**: `work:<item_slug>` (e.g., `work:stonehenge`)
   - **`general`**: `<entity_type>` (e.g. `castle`, `palace`, `monument`), `location_<country>` (e.g. `location_france`), `year_<YYYY>` (e.g. `year_1661`)
   - **`creator`**: `creator:<architect_or_author>` (e.g. `creator:antoni_gaudi`)
   - **`source`**: Wikidata QID URL + `copyright:public_domain`
   - **`meta`**: `meta:atlas:wikiatlas`, `meta:qid:Q...`, `meta:license:public_domain`, `meta:format:image`
   - **`subreddit`**: `r/wikiatlas`

---

## 📦 3. Subfolder Chunking & In-App Upload (`split_batch.js`)

To upload large batches (~1,300+ items) without risking browser memory bloat or manual file selection errors:

1. **Run Splitter Utility**:
   ```bash
   node split_batch.js
   ```
   *Splits `./wiki_downloads/batch_wonders/` into self-contained subfolders (`batch_wonders_part1/`, `batch_wonders_part2/`, etc.) with ~225 images and a matching dedicated `manifest.json` per folder.*

2. **In-App Ingestion (`Upload.jsx`)**:
   - Open MyAtlas app -> Navigate to **Upload** manager.
   - Select target atlas (`gamesatlas` or `wikiatlas`).
   - Click **Select Local Media Files**, open `batch_wonders_part1`, press `Ctrl+A`, and click **Commit to Database**.
   - Repeat for remaining part subfolders.

---

## 🤖 Context Instructions for New AI Agent Sessions

If starting a new chat session with a fresh AI agent, prompt them with:

> *"Please read [`docs/steam_gamesatlas_playbook.md`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/docs/steam_gamesatlas_playbook.md), [`docs/wikiatlas_expansion_plan.md`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/docs/wikiatlas_expansion_plan.md), and [`docs/sub_atlases.md`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/docs/sub_atlases.md). I am working on adding new curated batches to `gamesatlas` / `wikiatlas` using our Node extraction scripts, `split_batch.js` partitioner, and in-app Upload view."*

---

## 📄 Related Scripts & References
- Script: [`download_games_steam.js`](../download_games_steam.js)
- Script: [`download_wikiatlas_wonders.js`](../download_wikiatlas_wonders.js)
- Script: [`split_batch.js`](../split_batch.js)
- Documentation: [`docs/wikiatlas_expansion_plan.md`](wikiatlas_expansion_plan.md)
- Documentation: [`docs/sub_atlases.md`](sub_atlases.md)
- Documentation: [`docs/ingestion_manifest_workflow.md`](ingestion_manifest_workflow.md)

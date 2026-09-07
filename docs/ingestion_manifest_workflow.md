# External MediaWiki & API Manifest Ingestion Workflow (`docs/ingestion_manifest_workflow.md`)

This document defines the architectural strategy, multi-phase workflow, script design patterns, and sidecar `manifest.json` specifications for downloading external domain media, enriching metadata into structured booru tags, and ingesting enriched media into **MyAtlas**.

---

## 🏛️ Standard 3-Phase Ingestion Workflow

To convert any external universe or franchise (e.g. Team Fortress 2, Minecraft, Pokémon, Star Wars) into a fully-tagged offline MyAtlas collection, follow this standard 3-phase workflow:

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 0: Concept & Data Source Evaluation                   │
│ • Select target universe (e.g., "Minecraft", "Pokémon")     │
│ • Verify robust API (MediaWiki API, PokéAPI, REST endpoints) │
└──────────────────────────────┬──────────────────────────────┘
                               │ High-Level Media Splits
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Media Downloader Execution                         │
│ • Define high-level splits (e.g., `blocks` vs `mobs`)       │
│ • Build script (`download_<target>_<split>.js`)             │
│ • Save 300px/HD renders to `./<target>_downloads/<split>/`   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Local Media Renders (.png / .gif)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Deterministic Metadata & Manifest Enrichment       │
│ • Brainstorm multi-value namespaces (e.g. `hp:`, `type:`)   │
│ • Query APIs/wikitext deterministically (no subjective calls)│
│ • Output `./<target>_downloads/<split>/manifest.json`       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Sidecar `manifest.json`
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Ingestion: MyAtlas Application Import (`Upload.jsx`)        │
│ • User selects folder in Upload view                        │
│ • App auto-detects `manifest.json` & matches file basenames  │
│ • Auto-registers custom tag namespaces into `localStorage`   │
│ • Renders interactive sidebar accordions on Browse Grid     │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 0: Concept & Data Source Evaluation
1. **Target Selection**: Identify a media universe or archival topic (e.g. "TF2", "Minecraft", "Pokémon", "Star Wars").
2. **API Verification**: Ensure the target platform offers a ripe, structured data source. Standard candidates:
   - **MediaWiki Action APIs**: `wiki.teamfortress.com/w/api.php`, `minecraft.wiki/api.php`, `starwars.fandom.com/api.php`, `oldschool.runescape.wiki/api.php`
   - **Public REST APIs**: `pokeapi.co` (Pokémon), `db.ygoprodeck.com` (Yu-Gi-Oh!), `api.scryfall.com` (MTG)

---

### Phase 1: Media Downloader Execution
1. **Media Splits**: Divide the larger concept into logical, isolated sub-folders (e.g. `weapons` vs `maps` for TF2, `blocks` vs `mobs` for Minecraft, `gen1` for Pokémon, `spacecraft` vs `weapons` for Star Wars).
2. **Script Implementation**: Write `download_<target>_<split>.js` in the repository root.
3. **Execution Safety**:
   - Include a custom header: `User-Agent: MyAtlasImporter/1.0 (Offline Archiver)`
   - Add a `100ms`–`300ms` delay between requests to stay below API rate limits.
   - Implement resumability by checking `fs.existsSync(destPath)` before fetching.
   - Save high-resolution transparent renders or official 3D artwork directly into `./<target>_downloads/<split>/`.

---

### Phase 2: Deterministic Metadata Enrichment & Manifest Generation
1. **Namespace Brainstorming**: Define structured, multi-value booru namespaces specific to the media split.
   - **Minecraft Mobs**: `behavior:hostile`, `mobtype:undead`, `hp:20`, `dimension:overworld`, `drop:rotten_flesh`, `vehicle:boat`
   - **Minecraft Blocks**: `tool:iron_pickaxe`, `material:wood`, `shape:stairs`, `stack:64`
   - **Pokémon**: `type:fire`, `habitat:mountain`, `color:red`, `egg_group:dragon`, `body:upright`, `ability:blaze`, `status:starter`
   - **Star Wars Spacecraft**: `faction:rebel_alliance`, `ship_class:starfighter`, `manufacturer:incom`, `pilot:luke_skywalker`
2. **Strict Determinism Principle**: All tags MUST be extractable deterministically from structured API fields, infobox parameters (`{{Infobox entity}}`, `{{Infobox block}}`), or official data attributes. Avoid subjective human judgments.
3. **Enricher Script Implementation**: Write `enrich_<target>_<split>.js` to batch query metadata and output a sidecar `manifest.json` inside the target download directory.

---

## 📄 Standard `manifest.json` Schema Reference

Enricher scripts output a flat JSON array of item objects inside `./<target>_downloads/<split>/manifest.json`:

```json
[
  {
    "file": "Creeper.png",
    "title": "Creeper",
    "tags": [
      "folder:minecraft_mobs",
      "copyright:minecraft",
      "type:mob",
      "behavior:hostile",
      "mobtype:monster",
      "hp:20",
      "dimension:overworld",
      "drop:gunpowder"
    ]
  },
  {
    "file": "Pikachu.png",
    "title": "Pikachu",
    "tags": [
      "folder:pokemon_gen1",
      "copyright:pokemon",
      "type:pokemon",
      "generation:gen1",
      "type:electric",
      "habitat:forest",
      "color:yellow",
      "egg_group:field",
      "egg_group:fairy",
      "body:quadruped",
      "ability:static",
      "status:starter"
    ]
  },
  {
    "file": "Millennium Falcon.png",
    "title": "Millennium Falcon",
    "tags": [
      "folder:starwars_spacecraft",
      "copyright:star_wars",
      "type:spacecraft",
      "faction:rebel_alliance",
      "ship_class:freighter",
      "manufacturer:corellian",
      "pilot:han_solo"
    ]
  }
]
```

---

## 📥 Application Ingestion Engine (`Upload.jsx`)

## 📥 Application Ingestion Engine (`Upload.jsx`)

When an end-user selects local files in the **Upload** view ([`Upload.jsx`](../src/pages/Upload.jsx)):

1. **Manifest Auto-Detection**: The frontend scanner checks the selected folder for `manifest.json`.
2. **Basename Matching**: Matches file names (e.g. `Creeper.png` or `Creeper`) to manifest entries.
3. **Auto-Category Registration**: The app invokes `ensureTagCategoriesExist(tags)` ([`mockData.js`](../src/data/mockData.js)), registering any newly encountered namespaces into `localStorage` (`myatlas_tag_categories`) with auto-assigned palette colors (`PALETTE_COLORS`).
4. **Sidebar Accordion Integration**: On the **Browse Grid** ([`Posts.jsx`](../src/pages/Posts.jsx)), new categories illuminate as sovereign expandable accordions in the left sidebar with 1-click drill-down filtering and 250ms inspect-hover illumination.

---

## 🎖️ World War II Ingestion Architecture & Domain Reference

### Target Sub-Atlas Strategy: `ww2`
This project ingests historical World War II equipment, vehicles, small arms, naval craft, and field photography into a dedicated offline Sub-Atlas using **Wikimedia Commons API** (`commons.wikimedia.org/w/api.php`) and **Wikidata SPARQL API** (`query.wikidata.org/sparql`).

### Wikimedia & Wikidata Querying Strategy:
- **API Candidates**:
  - MediaWiki Action API: `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category:<Target_Category>&prop=imageinfo&iiprop=url|size|extmetadata&format=json`
  - Wikidata SPARQL API: `https://query.wikidata.org/sparql?query=<SPARQL>` targeting equipment items (`P31`), country of origin (`P495`), part of World War II (`P361` -> `Q362`), and direct Commons image links (`P18`).
- **Tag Namespaces**:
  - `copyright:ww2_history` (anchor)
  - `license:public_domain` (anchor)
  - `category:ww2`
  - `faction:allies` | `faction:axis`
  - `country:united_states` | `country:germany` | `country:soviet_union` | `country:united_kingdom` | `country:japan` | `country:italy`
  - `type:armored_vehicle` | `type:aircraft` | `type:warship` | `type:small_arms` | `type:field_photo`
  - `model:<slug>` (e.g. `model:panzer_iv`, `model:spitfire`, `model:t34`, `model:m1_garand`)
  - `year:YYYY` & `decade:1940s`

---

### 🛑 Filtering Traps & Guidelines
1. **Modern Reenactments & Airshows**: Exclude modern airshow photos, reenactor portraits in uniform, and Living History events.
2. **Scale Models & Die-Cast Toys**: Exclude plastic model kits, RC models, die-cast toys, and box art illustrations.
3. **Memorial Monuments & Statues**: Exclude modern town square monuments, commemorative plaques, and museum exhibit signs.
4. **Vector Diagrams**: Exclude `.svg` tactical map vectors or technical blueprints unless photographic media.
- *Strict Exclusion Pattern*: `/reenactment|airshow|scale\s*model|replica|die-cast|diecast|monument|memorial|statue|museum\s+display|exhibit\s+sign|blueprint|toy|commemoration|gala|anniversary/i`

---

### WWII Planned Media Splits
1. **`ww2_downloads/tanks/`**: Armored Fighting Vehicles & Self-Propelled Guns (Panzer, T-34, M4 Sherman, Tiger I, Churchill, KV-1).
2. **`ww2_downloads/aircraft/`**: Fighter, Bomber & Reconnaissance Aircraft (Spitfire, Bf 109, P-51 Mustang, B-17 Flying Fortress, A6M Zero, Il-2 Sturmovik).
3. **`ww2_downloads/warships/`**: Naval Warfare, Submarines & Aircraft Carriers (U-boats, USS Enterprise, Yamato, HMS Hood, Bismarck, Fletcher-class).
4. **`ww2_downloads/small_arms/`**: Infantry Weapons & Artillery (M1 Garand, MP 40, Mosin-Nagant, Thompson SMG, PPSh-41, 88mm Flak).
5. **`ww2_downloads/pivotal_battles/`**: Authentic Historical Field Photography (Battle of Britain, Stalingrad, D-Day/Normandy, Midway, Iwo Jima, Kursk).

---

## 🎮 Steam Store Archiver & Supabase Cloud Seeding Architecture (`gamesatlas`)

### Target Sub-Atlas Strategy: `gamesatlas`
This workflow automates the scraping of iconic PC game vertical box art covers (`library_600x900_2x.jpg`), metadata extraction via the Steam Store API, deterministic tag taxonomy generation, and automatic cloud seeding to Supabase.

### 1. Steam Store Downloader & Manifest Generator (`download_games_steam.js`)
- **API Target**: `https://store.steampowered.com/api/appdetails?appids=<appid>`
- **Asset URL**: `https://cdn.akamai.steamstatic.com/steam/apps/<appid>/library_600x900_2x.jpg`
- **Downloaded Directory**: `./games_downloads/`
- **Output Manifest**: `./games_downloads/manifest.json`
- **Automated Taxonomy Rules**:
  - `game` (Base anchor tag)
  - `platform:pc`
  - `developer:<dev_name_slug>`
  - `publisher:<pub_name_slug>`
  - `genre:<genre_slug>` (e.g. `genre:action`, `genre:rpg`, `genre:strategy`, `genre:open_world`)
  - `release_year:<YYYY>`
  - `source:https://store.steampowered.com/app/<appid>/`

### 2. Supabase Cloud Seeding Script (`seed_gamesatlas_supabase.js`)
- **Target Bucket**: `atlas-media` (Supabase Storage)
- **Target Table**: `posts` (Supabase Database with `atlas_id = 'gamesatlas'`)
- **Seeding Execution**:
  1. Uploads high-res box art images to Supabase Storage with clean key basenames.
  2. Obtains public CDN HTTPS media URLs.
  3. Prepares post records containing `name`, `tagline`, `website` (media CDN URL), `secondary_url` (Steam Store URL), `visual_color`, `tags` (JSON array of taxonomy tags), and `atlas_id: 'gamesatlas'`.
  4. Inserts records into the Supabase Postgres `posts` table for immediate cloud availability across all clients.



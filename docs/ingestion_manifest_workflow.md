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

When an end-user selects local files in the **Upload** view ([`Upload.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Upload.jsx)):

1. **Manifest Auto-Detection**: The frontend scanner checks the selected folder for `manifest.json`.
2. **Basename Matching**: Matches file names (e.g. `Creeper.png` or `Creeper`) to manifest entries.
3. **Auto-Category Registration**: The app invokes `ensureTagCategoriesExist(tags)` ([`mockData.js`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/data/mockData.js)), registering any newly encountered namespaces into `localStorage` (`myatlas_tag_categories`) with auto-assigned palette colors (`PALETTE_COLORS`).
4. **Sidebar Accordion Integration**: On the **Browse Grid** ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)), new categories illuminate as sovereign expandable accordions in the left sidebar with 1-click drill-down filtering and 250ms inspect-hover illumination.

# External MediaWiki API & Manifest Ingestion Workflow (`docs/ingestion_manifest_workflow.md`)

This document defines the architecture, workflow, and specifications for downloading external wiki media, enriching item metadata into a `manifest.json` sidecar file, and ingesting enriched booru items into **MyAtlas**.

---

## 🏛️ Architecture & Workflow Overview

MyAtlas supports bulk local folder ingestion powered by sidecar `manifest.json` metadata manifests. This allows external scripts (e.g. MediaWiki scrapers, booru archivers) to download media files, extract rich domain metadata (such as classes, equipment slots, game modes, environments, updates, and release years), and deliver fully-tagged media into MyAtlas without manual tagging.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Bulk Media Downloader (`download_tf2_wiki_media.js`)     │
│    Queries MediaWiki API (`generator=allimages`) & saves     │
│    hero renders to `./tf2_downloads/<category>/`            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Local Image Files (.png / .jpg)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Metadata Enricher (`enrich_tf2_weapons.js` / `maps.js`)  │
│    Parses `{{Item infobox}}` & `{{Map infobox}}` wikitext     │
│    and outputs `manifest.json` with namespace booru tags     │
└──────────────────────────────┬──────────────────────────────┘
                               │ `manifest.json` Sidecar Manifest
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. MyAtlas Ingestion Engine (`Upload.jsx`)                 │
│    • Auto-detects `manifest.json` in local folder           │
│    • Matches filenames to manifest tag arrays              │
│    • Auto-registers new categories in `localStorage`         │
│    • Ingests items into SQLite `myatlas_local.db`           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Step 1: Bulk Media Downloading

To prevent rate-limiting and avoid downloading site UI assets, down-loader scripts target specific MediaWiki categories (`Category:Weapons`, `Category:Cosmetic items`, `Category:Maps`).

- **API Endpoint**: `https://wiki.teamfortress.com/w/api.php`
- **Request Parameters**: `action=query&generator=categorymembers&gcmtitle=Category:<Name>&prop=revisions&rvprop=content&format=json`
- **Rate-Limiting**: Identifies with a custom `User-Agent: MyAtlasImporter/1.0` header and adds a `300ms` delay between batch pagination requests.
- **Resumability**: Skips existing local files if interrupted and re-run.

---

## 🏷️ Step 2: Metadata Extraction & Manifest Generation

Enricher scripts read local file names, query MediaWiki for page wikitext, parse infobox template parameters (`{{Item infobox}}` and `{{Map infobox}}`), and generate a standardized `manifest.json` array inside the download folder.

### Deterministic Tag Mapping Reference (TF2 Example):

| Wiki Infobox Parameter | Extracted Namespace | Example Generated Tags |
| :--- | :--- | :--- |
| `used-by` | `class:` | `class:scout`, `class:soldier`, `class:spy`, `class:all_classes` |
| `slot` | `slot:` | `slot:primary`, `slot:secondary`, `slot:melee`, `slot:pda` |
| `item-kind` | `kind:` | `kind:rocket_launcher`, `kind:revolver`, `kind:wrench` |
| `map-game-type` | `gamemode:` | `gamemode:payload`, `gamemode:capture_the_flag` |
| `map-environment` | `env:` | `env:desert`, `env:farmland`, `env:alpine` |
| `map-setting` | `setting:` | `setting:daylight`, `setting:dusk`, `setting:night` |
| `map-file-name` | `mapcode:` / `prefix:` | `mapcode:ctf_2fort`, `prefix:ctf` |
| `map-hazards` | `hazard:` | `hazard:drowning`, `hazard:pitfall`, `hazard:crushing` |
| `released-major` | `update:` | `update:launch`, `update:heavy`, `update:jungle_inferno` |
| `released` | `year:` | `year:2007`, `year:2014`, `year:2017` |

### Standard `manifest.json` Schema Format:

```json
[
  {
    "file": "Scattergun.png",
    "title": "Scattergun",
    "tags": [
      "folder:tf2_weapons",
      "copyright:tf2",
      "type:weapon",
      "class:scout",
      "slot:primary",
      "kind:scattergun",
      "year:2007"
    ]
  },
  {
    "file": "2Fort.png",
    "title": "2Fort",
    "tags": [
      "folder:tf2_maps",
      "copyright:tf2",
      "type:map",
      "gamemode:capture_the_flag",
      "mapcode:ctf_2fort",
      "prefix:ctf",
      "env:farmland",
      "setting:daylight",
      "update:launch",
      "year:2007",
      "hazard:drowning"
    ]
  }
]
```

---

## 📥 Step 3: Ingestion & Auto-Category Registration

When an end-user selects local files in the **Upload** view ([`Upload.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Upload.jsx)):

1. **Manifest Detection**: The app inspects the selected folder for `manifest.json`.
2. **Tag Matching**: Matches file basenames (e.g. `Scattergun.png` or `Scattergun`) to the manifest lookup map.
3. **Auto-Category Registration**: The app calls `ensureTagCategoriesExist(tags)` ([`mockData.js`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/data/mockData.js)), automatically registering any newly encountered namespaces (`class:`, `slot:`, `kind:`, `update:`, `env:`, `gamemode:`, `hazard:`, `year:`) into `localStorage` (`myatlas_tag_categories`) with auto-assigned palette colors (`PALETTE_COLORS`).
4. **Grid Integration**: On the **Browse Grid** ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)), new categories automatically illuminate in the left sidebar as sovereign expandable accordions (`Classes`, `Slots`, `Updates`, `Kinds`, `Environments`, `Hazards`, `Years`) with full inspect mode and 1-click drill-down filtering.

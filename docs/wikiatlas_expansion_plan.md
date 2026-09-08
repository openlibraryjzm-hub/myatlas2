# WikiAtlas Expansion Strategy & Architecture (`docs/wikiatlas_expansion_plan.md`)

This document defines the technical strategy, SPARQL query engine, Wikipedia sitelink saliency filtering, multi-batch execution roadmap, and 7-category taxonomy mapping for **`wikiatlas`** in MyAtlas.

---

## 🏛️ System & Architecture Overview

`wikiatlas` is a universal curated Sub-Atlas powered by **Wikidata** and **Wikimedia Commons**. It converts structured Wikidata entities and open high-resolution Wikimedia Commons media into MyAtlas booru items with 100% deterministic, non-hallucinated taxonomy tags.

```
┌─────────────────────────────────────────────────────────────┐
1. Wikidata SPARQL Query Service                             │
   • Query target QID classes (Paintings, Monuments, Space)   │
   • Filter by sitelinks (FILTER(?sitelinks >= 10))           │
   • Extract P18 Wikimedia Commons image URLs                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
2. Local Extractor Script (`download_wikiatlas.js`)            │
   • Downloads high-res Commons images to ./wiki_downloads/   │
   • Maps statements to MyAtlas 7-category taxonomy           │
   • Generates ./wiki_downloads/batch N/manifest.json          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
3. In-App Supabase Upload (`Upload.jsx`)                       │
   • User selects batch folder / files in Upload view             │
   • App auto-detects `manifest.json` & matches metadata          │
   • Uploads media to Supabase Storage ('atlas-media')            │
   • Commits records to Supabase Postgres DB ('posts' table)      │
└──────────────────────────────┬──────────────────────────────┘
```

---

## 🎯 Wikipedia Sitelink Saliency Filtering

Wikidata contains over 6 million items with Wikimedia images (`P18`). To filter out noise (e.g., obscure street signs, single tax records) and ensure only high-value, iconic items enter `wikiatlas`, every query enforces **Sitelink Count Filtering**:

```sparql
# Popularity & significance threshold
?item wikibase:sitelinks ?sitelinks .
FILTER(?sitelinks >= 10)
```

Items with 10+ Wikipedia sitelinks represent globally recognized artworks, historical landmarks, scientific missions, and cultural treasures.

---

## 🏷️ Fixed 7-Category Taxonomy Mapping Schema

To prevent sidebar category bloat, statement properties (`kind:`, `location:`, `movement:`, `era:`) fold cleanly into **General Tags** (`general`), preserving MyAtlas's fixed 7-category schema:

| MyAtlas Category | Category Prefix | Wikidata Source Property | Example Output Tags | Default Color |
| :--- | :--- | :--- | :--- | :--- |
| **`general`** | *(none)* | `P31` (instance), `P17` (country), `P135` (movement), `P571` (year) | `painting`, `sculpture`, `location_france`, `movement_renaissance`, `year_1503` | Warm Amber (`#cc5a01`) |
| **`creator`** | `creator:` | `P170` (creator), `P50` (author), `P84` (architect), `P178` (developer) | `creator:leonardo_da_vinci`, `creator:vincent_van_gogh`, `creator:nasa` | Royal Blue (`#2563eb`) |
| **`work`** | `work:` | Primary item title / label | `work:mona_lisa`, `work:eiffel_tower`, `work:apollo_11` | Sky Blue (`#0284c7`) |
| **`source`** | `source:` | Canonical Wikidata QID & Wikimedia URL | `source:https://www.wikidata.org/wiki/Q12418`, `copyright:public_domain` | Deep Purple (`#7c3aed`) |
| **`meta`** | `meta:` | System, License & QID references | `meta:atlas:wikiatlas`, `meta:qid:Q12418`, `meta:license:public_domain`, `meta:format:image` | Slate Gray (`#4b5563`) |
| **`character`** | `character:` | `P31` $\rightarrow$ Fictional Character (`Q95074`) **only** | `character:zeus`, `character:sherlock_holmes` | Forest Green (`#16a34a`) |
| **`subreddit`** | `r/` | Sub-atlas domain indicator | `r/wikiatlas` | Amber Gold (`#b45309`) |

---

## 📅 Thematic Batch Roadmap (2,000 Items Per Batch)

### Batch 1: World Famous Artworks & Masterpieces
- **Class Targets**: `Q185932` (painting) & `Q838948` (sculpture)
- **Extracted Items**: *Mona Lisa, Starry Night, The Last Supper, The Scream, David, Girl with a Pearl Earring, The Thinker, Guernica, The Great Wave off Kanagawa*.
- **Target Size**: 1,500 – 2,000 items.

### Batch 2: World Wonders, Castles & Architecture
- **Class Targets**: `Q41176` (building), `Q12513` (castle), `Q2977` (cathedral), `Q570116` (tourist attraction)
- **Extracted Items**: *Eiffel Tower, Great Wall of China, Taj Mahal, Colosseum, Pyramids of Giza, Machu Picchu, Notre-Dame, Statue of Liberty, Sagrada Família*.
- **Target Size**: 1,500 – 2,000 items.

### Batch 3: Space Exploration & Astronomy
- **Class Targets**: `Q2133` (spacecraft), `Q40218` (space mission), `Q42372` (astronomical object)
- **Extracted Items**: *Apollo 11, Hubble Telescope, Saturn V, James Webb Telescope, Voyager 1, Mars Curiosity Rover, International Space Station, Crab Nebula*.
- **Target Size**: 1,000 – 1,500 items.

### Batch 4: Antiquities, Relics & Museum Treasures
- **Class Targets**: `Q220659` (archaeological artifact), `Q98247` (weapon/armor), `Q124794` (historical document)
- **Extracted Items**: *Rosetta Stone, King Tutankhamun's Mask, Antikythera Mechanism, Bayeux Tapestry, Sutton Hoo Helmet, Dead Sea Scrolls, Terracotta Army*.
- **Target Size**: 1,000 – 1,500 items.

---

## 🛠️ Implementation Plan

1. **SPARQL Extractor Script (`download_wikiatlas.js`)**:
   - Query Wikidata SPARQL API endpoint (`https://query.wikidata.org/sparql`).
   - Download Wikimedia Commons images to `wiki_downloads/batch N/`.
   - Write `wiki_downloads/batch N/manifest.json` with mapped 7-category tags.
2. **In-App Cloud Ingestion (`Upload.jsx`)**:
   - Select target atlas (`wikiatlas`) in the Upload view.
   - Pick local files from `wiki_downloads/batch N/`.
   - App automatically matches sidecar `manifest.json`, previews all cards with derived tags, uploads media to Supabase Storage (`atlas-media`), and commits post records to Supabase Postgres (`posts` table with `atlas_id: 'wikiatlas'`).

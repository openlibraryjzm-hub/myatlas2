# Big Picture Vision & Cloud Conversion Strategy (`docs/big_picture_dream.md`)

This document outlines the strategic vision, architectural principles, cloud conversion roadmap, and scaling strategy for **MyAtlas**: transforming an airtight, offline-first local desktop app into a hosted, multi-tenant public platform—**"Reddit, but for Boorus & Atlases"**.

---

## 🌟 The Vision: "Reddit for Boorus"

Existing social and content platforms fall short when organizing and discovering structured media:
- **Reddit / Pinterest / Twitter**: Optimized for chronological feeds and post titles, but **terrible for deep media discovery**. Search fails when attempting to query precise, multi-dimensional booru tags (e.g. `vehicle:tank country:germany era:ww2`).
- **Legacy Boorus (Danbooru, Gelbooru)**: Extremely powerful tag systems, but strictly hardcoded to anime art niches on monolithic codebases. There is no platform where a community can instantly create a **"Booru for Astrophotography"**, **"Booru for Game Assets"**, or **"Booru for Military Aviation"**.

### The Solution: Sovereign Sub-Atlases
MyAtlas introduces **user-created Sub-Atlases** (accessible via `atlasnetwork.org/[slug]`). Anyone can launch a sovereign booru archive for any domain (`space`, `military`, `eldenring`, `ui_design`) with custom namespace taxonomies, auto-assigned palette themes, tag implications, and instant matrix filtering.

---

## 🛠️ The Two-Phase Product Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       PHASE 1: LOCAL                        │
│   Airtight Local Desktop App (Tauri + React + C# SQLite)    │
│   • 100% offline privacy & zero cloud infrastructure costs  │
│   • Fast curation, WebP thumbnail caching, speed tagger     │
│   • Multi-tenant domain model (`atlas_id` column)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ 1-to-1 Schema Parity
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       PHASE 2: CLOUD                        │
│   Public Multi-Tenant Web Platform (Supabase + Postgres + R2)│
│   • `atlasnetwork.org/[slug]` public hosting                │
│   • 1-click cloud sync of local archives & tag wikis        │
│   • High-performance GIN tag search & scale to 100M+ posts  │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1: The Airtight Local Foundation (Current)
Before deploying web servers, authentication systems, or cloud billing pipelines, all core functionality is perfected inside a local desktop container:
- **Zero Cloud Costs**: Build, curate, test, and iterate offline without spending money on hosting or database ingress/egress fees.
- **Strict Data Privacy**: Personal media archives, disk folder paths, and bookmarks stay local.
- **1-to-1 Cloud Parity**: The database schema (`local_items` with `atlas_id`), tag arrays, and category taxonomies match PostgreSQL patterns 1-to-1.

### Phase 2: Public Cloud Platform (`atlasnetwork.org`)
When transitioning online, your local database exports directly into Supabase (PostgreSQL) with **zero re-tagging or data restructuring**.

---

## 🚀 Scaling Strategy to 100,000,000+ Posts

A common concern when planning a media booru at scale is whether relational databases can handle millions of posts (e.g. ingesting 6M+ Wikidata/Wikimedia items). **Yes, single-node PostgreSQL natively scales to 100M+ posts when modeled correctly.**

```
                          ┌─────────────────────────────┐
                          │   posts (Logical Master)    │
                          └──────────────┬──────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌───────────────┐                ┌───────────────┐                ┌───────────────┐
│ posts_space   │                │ posts_military│                │  posts_other  │
│ (15M rows)    │                │ (20M rows)    │                │ (65M rows)    │
└───────────────┘                └───────────────┘                └───────────────┘
```

### Key Scaling Pillars

1. **Single Database with Multi-Tenant Scoping (`atlas_id`)**:
   - Avoid splitting databases per Atlas. A single PostgreSQL cluster indexed with B-Tree indexes on `atlas_id` reduces 100M-row scans down to **sub-5ms index lookups**.
2. **PostgreSQL Declarative Table Partitioning**:
   - Split storage physically on disk using `PARTITION BY LIST (atlas_id)`. When querying `WHERE atlas_id = 'space'`, Postgres automatically prunes all non-matching physical partitions.
3. **GIN Inverted Tag Indexing**:
   - PostgreSQL native text arrays (`tags text[]`) paired with GIN indexes (`USING GIN (atlas_id, tags)`) enable complex boolean tag queries (`WHERE atlas_id = 'space' AND tags @> ARRAY['nasa', 'saturn']`) in **10ms–25ms**.
4. **Egress-Free Thumbnail CDN**:
   - Store full-res media on **Cloudflare R2** ($0 egress bandwidth fees).
   - Serve pre-generated 300px WebP thumbnails (~15 KB) via edge worker proxies with immutable cache headers (`max-age=31536000`).

---

## 📄 Related Documentation
- [Sub-Atlas System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/sub_atlases.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Tagging & Category Taxonomy](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/taxonomy.md)

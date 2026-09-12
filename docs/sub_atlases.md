# Sub-Atlas System Architecture: Multi-Atlas Scoping (`docs/sub_atlases.md`)

This document defines the technical specifications, atlas scoping rules, atlas switcher, dynamic title logo integration, and backend storage engine for **Atlases** in **MyAtlas**.

---

## 🏛️ Atlas Architecture & Scoping Model

An **Atlas** is a booru archive focused on a specific domain (`myatlas`, `amberatlas`, `youtubeatlas`, `wikiatlas`, `gamesatlas`, `toolsatlas`).

```
┌─────────────────────────────────────────────────────────────┐
│                       MyAtlas Desktop                       │
│                     (`currentAtlas` Scope)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ atlas:myatlas │       │atlas:youtube..│       │ atlas:tools.. │
│ (Personal,    │       │(Dedicated     │       │(Dedicated     │
│  Editable)    │       │ Booru Archive)│       │ Booru Archive)│
└───────────────┘       └───────────────┘       └───────────────┘
```

### Registered Built-in Sub-Atlases:
1. **`myatlas`**: Personal Workspace (`#CC5A01`) — Title: *"my atlas"*
2. **`amberatlas`**: Amber Archive (`#D97706`) — Title: *"amber atlas"*
3. **`youtubeatlas`**: YouTube Video Collection (`#EF4444`) — Title: *"youtube atlas"*
4. **`shopatlas`**: Shop & Hardware Archive (`#8B5CF6`) — Title: *"shop atlas"*
5. **`supportatlas`**: Support & Community Archive (`#10B981`) — Title: *"support atlas"*

### Core Scoping Rules:
1. **Personal Workspace (`myatlas`)**: Default editable user archive.
2. **Dedicated Domain Atlases**: Specialized booru archives reskinned in signature accent colors.
3. **Database Tenant Isolation**: All post queries, tag matrices, and pagination requests filter strictly by `atlas_id`.

---

## ⚡ The Atlas Switcher (`AtlasSwitcher.jsx`)

The Atlas Switcher provides clean, keyboard-accessible navigation (`Ctrl+K` modal or full view):
- Displays available built-in fixed Atlases (`myatlas` + 5 domain archives).
- Provides instant slug filtering and `Enter` key execution.

---

## 🧭 Dynamic Logo & Homepage Option Swap (`Home.jsx` / `Navbar.jsx`)

- **Dynamic Logo (Word-Splitting)**: Renders the active atlas title (`"youtube atlas"` -> `"youtube"` in red accent, `"atlas"` in dark text).
- **Dynamic Homepage Option Swap**: When navigating to a sub-atlas (e.g. `youtubeatlas`), the redundant option button on the Home page is dynamically swapped for the **`myatlas`** key button (🔑 `myatlas`), allowing instant toggling back to `myatlas`.
- **Global `Ctrl+K` Shortcut**: Opens the Atlas Switcher modal from anywhere in the app.

---

## 💾 Backend & SQLite Storage Specifications

### SQLite Schema (`myatlas_server.db`)

```sql
-- Sub-Atlas Registry Table
CREATE TABLE IF NOT EXISTS atlases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    accent_color TEXT DEFAULT '#CC5A01',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default Sub-Atlas
INSERT OR IGNORE INTO atlases (id, title, description, accent_color) 
VALUES ('myatlas', 'My Atlas', 'Default main atlas archive', '#CC5A01');

-- Items Table Scoping
ALTER TABLE local_items ADD COLUMN atlas_id TEXT DEFAULT 'myatlas';
CREATE INDEX IF NOT EXISTS idx_local_items_atlas ON local_items(atlas_id);
```

---

## ☁️ Hybrid Cloud Hosting Architecture (Supabase Engine)

While **`myatlas`** functions strictly as a 100% offline local workspace, curated domain Sub-Atlases (such as **`youtubeatlas`**) are powered by a zero-maintenance **Supabase Cloud Infrastructure** layer:

```
                          ┌───────────────────────────┐
                          │   MyAtlas UI Application  │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌─────────────────────────────┐                           ┌─────────────────────────────┐
│    Personal Workspace       │                           │   Curated Sub-Atlases       │
│        (`myatlas`)          │                           │      (`youtubeatlas`)       │
├─────────────────────────────┤                           ├─────────────────────────────┤
│ • Local C# Sidecar Engine   │                           │ • Supabase Postgres DB      │
│ • Local SQLite Store        │                           │   (`posts` & `atlases`)     │
│ • Local Disk File Assets    │                           │ • Supabase Storage Bucket   │
│ • 100% Offline Integrity    │                           │   (`atlas-media` bucket)    │
└─────────────────────────────┘                           └─────────────────────────────┘
```

### Key Capabilities of Cloud Sub-Atlases:
1. **Cloud CDN Image Streaming**: Non-`myatlas` media assets are hosted in Supabase Storage (`atlas-media` bucket) and served globally via high-speed public CDN URLs (`https://<project-ref>.supabase.co/storage/v1/object/public/atlas-media/...`).
2. **Direct Cloud DB Fetching (`localDb.js`)**: `getPaginatedItems({ atlas_id })` detects non-`myatlas` targets and queries the cloud database directly with tag filters and pagination.
3. **No Overwrite Safety (`Posts.jsx`)**: Background C# server checks verify `if (serverResult?.posts?.length > 0)` before applying local results, preventing empty local responses from wiping or overwriting remote cloud posts.
4. **Direct Cloud Ingestion (`Upload.jsx`)**: Selecting any non-`myatlas` target in the Upload manager routes media binary uploads directly to Supabase Storage and inserts records into the cloud `posts` database table.

---

## 📄 Related Documentation
- [Big Picture Vision](big_picture_dream.md)
- [YouTube Atlas Specifications](youtubeatlas.md)
- [System Architecture](architecture.md)
- [Ingestion & Manifest Workflow](ingestion_manifest_workflow.md)
- [Browse Grid Specifications](views/grid.md)
- [Home View Specifications](views/home.md)
- [Curator Shop Specifications](views/shop.md)
- [Support View Specifications](views/support.md)


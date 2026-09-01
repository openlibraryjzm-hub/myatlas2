# Sub-Atlas System Architecture: Router, Creator & Multi-Tenant Backend (`docs/sub_atlases.md`)

This document defines the technical specifications, domain scoping rules, hyperminimalist slug router, creator workflow, persistent header integration, and backend multi-tenant database engine for **Sub-Atlases** in **MyAtlas**.

---

## 🏛️ Domain Architecture & Sub-Atlas Distinction

A **Sub-Atlas** is a sovereign booru archive focused on a specific domain (e.g. `myatlas`, `space`, `military`, `eldenring`, `ui_design`).

```
┌─────────────────────────────────────────────────────────────┐
│                 Atlas Network Platform Shell                │
│                 (`activeAtlas` Scope State)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  atlas: myatlas │   │   atlas: space  │   │ atlas: military │
│  (1,500 posts)  │   │    (0 posts)    │   │   (450 posts)   │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Core Rules:
1. **Sub-Atlas Slug**: Lowercase identifier (e.g. `space`, `military`) sanitized to `a-z0-9_-`.
2. **Default Fallback**: Default main archive is `myatlas`. All legacy and unassigned posts belong to `myatlas` for 100% backwards compatibility.
3. **Domain Isolation**: Post queries, tag matrices, and pagination queries filter strictly by `atlas_id`.
4. **Fundamentally Distinct from Namespace Tags**: The `atlas_id` slug defines database tenant isolation. It is completely distinct from legacy user tags (e.g. `atlas:collection_name` or `meta:atlas:value`), which are flat tags stored inside the `tags` array.

---

## ⚡ The Hyperminimalist Slug Router (`AtlasSwitcher.jsx`)

The Sub-Atlas Router allows instant navigation via a terminal-styled prompt matching the Claude warm cream aesthetic (`#FBFAF7` backdrop, monospace inputs).

```
┌─────────────────────────────────────────────────────────────┐
│                       ATLAS NETWORK                         │
│        Navigate, discover, and curate booru archives        │
│                                                             │
│       ┌───────────────────────────────────────────────┐     │
│       │ atlasnetwork.org/ [ space                   ] │ ↵   │
│       └───────────────────────────────────────────────┘     │
│                                                             │
│       ✔ Found: Space & Astronomy Archive (1,420 posts)      │
│         Press Enter ↵ to enter atlas                        │
│                                                             │
│   ───────────────────────────────────────────────────────   │
│   Quick Access:  [🌐 myatlas]  [🚀 space]  [⚔️ military]    │
└─────────────────────────────────────────────────────────────┘
```

### Live Slug Lookup Behaviors:
- **Match Found**: Displays green indicator (`✓ Found: "Space & Astronomy Archive" • 1,420 posts`) with `Press Enter ↵ to enter atlas`. Pressing `Enter` navigates to the grid.
- **Match Not Found**: Displays amber indicator (`+ Sub-atlas "atlasnetwork.org/space-x" doesn't exist yet. Press Enter ↵ to create it now!`). Pressing `Enter` opens the Sub-Atlas Creator with the slug pre-filled.
- **Infinite Scale Typed Router**: Pre-rendered atlas pills are omitted so that navigating between thousands of sub-atlases relies strictly on instant, typed slug inputs (`atlasnetwork.org/<slug>`) with 0ms UI lag or overflow.

---

## 🌌 Discovery Cloud 3D Atlas Galaxy Explorer (`DiscoveryCloud.jsx`)

The **Discovery Cloud** (`view === 'discovery'`, accessible via the Globe header icon) provides an interactive 3D constellation visualizer for sub-atlas archives across the platform:
- **Mathematical 3D Fibonacci Placement**: Automatically calculates 3D coordinates $(x, y, z)$ across a Fibonacci sphere for any number of registered sub-atlases.
- **Live Tag Search & Dimming**: Typing tag queries or selecting category filters ignites matching stars in their accent color (`atlas.accentColor`) while dimming non-matching archives down to 8% opacity.
- **Raycast Hover Inspection**: Hovering near any 3D node displays a popover card showing the sub-atlas display title, slug (`atlasnetwork.org/<slug>`), post count, tags, and a 1-click **"Enter Sub-Atlas"** navigation CTA.
- **Non-Passive Scroll Locking**: Canvas attaches a native `{ passive: false }` wheel listener that locks viewport scrolling, ensuring mouse wheel interactions purely control 3D camera zoom distance.

---

## 🎨 Sub-Atlas Creator (`CreateAtlas.jsx`)

Registers a new sub-atlas in SQLite and C# backend:
- **Slug**: Route key (e.g. `space`, `military`).
- **Display Title**: Custom title (e.g. "Space & Astronomy Archive").
- **Description**: Overview & curation scope.
- **Accent Color**: Palette picker:
  1. Warm Amber (`#CC5A01`)
  2. Sky Blue (`#0284c7`)
  3. Forest Green (`#16a34a`)
  4. Royal Blue (`#2563eb`)
  5. Deep Purple (`#7c3aed`)
  6. Hot Pink (`#db2777`)
  7. Teal (`#0d9488`)
  8. Burnt Orange (`#ea580c`)

---

## 🧭 Header Badge Pill & Dynamic Title Logo (`Navbar.jsx`)

- **Dynamic Logo (Option A Word-Splitting)**: Renders the active sub-atlas display title in the top-left logo. The first word is highlighted with the sub-atlas's chosen accent color (`--accent-color`), with remaining words in standard text.
- **Logo Navigation**: Clicking the top-left active sub-atlas logo navigates directly back to the active sub-atlas's Homepage (`view = 'home'`).
- **Navbar Badge Pill**: Displays the active sub-atlas pill in the sticky top header (`atlasnetwork.org/myatlas` or `atlasnetwork.org/nasa`) with an active accent border/tint matching the sub-atlas theme color.
- **Global `Ctrl+K` Shortcut**: Pressing `Ctrl+K` or clicking the Navbar atlas pill opens the hyperminimalist switcher modal overlay from anywhere in the application.

---

## 📥 Ingestion Manager Destination Target (`Upload.jsx`)

The Ingestion Manager includes an explicit **Target Sub-Atlas Archive Destination Panel**:
- Automatically defaults to the atlas you opened the upload page from.
- Features a clean, typed slug input (`atlasnetwork.org/<slug>`) so users can type or switch destination archives before ingesting media.
- Ingested files (local photos, videos, or JSON scrape archives) receive `atlas_id: selectedAtlasSlug` during database commit.

---

## 💾 Backend & SQLite Storage Specifications

### SQLite Schema (`myatlas_server.db` & `myatlas_local.db`)

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

### C# REST API Endpoints (`MyAtlas.Backend`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/atlases` | `GET` | List all sub-atlases with live post counts. |
| `GET /api/atlases/{id}` | `GET` | Get details for single sub-atlas. |
| `POST /api/atlases` | `POST` | Create or update a sub-atlas record. |
| `DELETE /api/atlases/{id}` | `DELETE` | Delete sub-atlas and reassign items to `myatlas`. |
| `GET /api/posts` | `GET` | Accepts `atlas_id` parameter (`WHERE atlas_id = $atlas_id`). |
| `POST /api/import` | `POST` | Ingests batch items with `atlas_id` property. |

---

## 📄 Related Documentation
- [Landing Page Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/landingpage.md)
- [Discovery Cloud 3D Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/discovery_cloud.md)
- [Big Picture Vision & Cloud Conversion Strategy](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/big_picture_dream.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Browse Grid & Left Sidebar Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)
- [Ingestion & Upload Manager Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/upload.md)

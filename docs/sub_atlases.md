# Sub-Atlas System Architecture: Fixed Local Atlases & Scoping (`docs/sub_atlases.md`)

This document defines the technical specifications, atlas scoping rules, atlas switcher, dynamic title logo integration, and backend storage engine for **Atlases** in **MyAtlas**.

---

## 🏛️ Atlas Architecture & Scoping Model

An **Atlas** is a booru archive focused on a specific domain (e.g. `myatlas`, `space`, `military`).

```
┌─────────────────────────────────────────────────────────────┐
│                       MyAtlas Desktop                       │
│                     (`currentAtlas` Scope)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         ▼                                           ▼
┌─────────────────┐                         ┌─────────────────┐
│  atlas: myatlas │                         │   atlas: space  │
│  (Personal,     │                         │ (Author Curated,│
│   Editable)     │                         │   Read-Only)    │
└─────────────────┘                         └─────────────────┘
```

### Core Rules:
1. **Personal Workspace (`myatlas`)**: Every user gets an isolated `myatlas` archive with 100% editable freedoms (uploading, speed tagging, mass deleting, and metadata edits).
2. **Curated Read-Only Atlases**: Official reference archives created by the app author loaded in **Read-Only** mode for end users.
3. **Database Tenant Isolation**: All post queries, tag matrices, and pagination requests filter strictly by `atlas_id`.

---

## ⚡ The Atlas Switcher (`AtlasSwitcher.jsx`)

The Atlas Switcher provides clean, keyboard-accessible navigation (`Ctrl+K` modal or full view):
- Displays available fixed Atlases (`myatlas` personal workspace + official author-curated Atlases).
- Indicates **Personal Workspace (editable)** vs **Curated Archive (Read-Only)** badges.
- Provides instant slug filtering and `Enter` key execution.

---

## 🧭 Dynamic Logo Integration (`Navbar.jsx`)

- **Dynamic Logo (Word-Splitting)**: Renders the active atlas title in the top-left logo. The first word is highlighted with the atlas's theme accent color (`--accent-color`), with remaining words in standard heading text.
- **Logo Navigation**: Clicking the top-left logo navigates directly back to the active atlas's Homepage (`view = 'home'`).
- **Global `Ctrl+K` Shortcut**: Pressing `Ctrl+K` opens the Atlas Switcher modal from anywhere in the application.

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

### C# REST API Endpoints (`MyAtlas.Backend`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/atlases` | `GET` | List all sub-atlases with live post counts. |
| `GET /api/atlases/{id}` | `GET` | Get details for single sub-atlas. |
| `GET /api/posts` | `GET` | Accepts `atlas_id` parameter (`WHERE atlas_id = $atlas_id`). |
| `POST /api/import` | `POST` | Ingests batch items with `atlas_id` property. |

---

## 📄 Related Documentation
- [Big Picture Vision](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/big_picture_dream.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Browse Grid Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)
- [Ingestion Manager Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/upload.md)

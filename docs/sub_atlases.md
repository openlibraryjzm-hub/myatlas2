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
4. **`wikiatlas`**: Wiki Document Archive (`#4F46E5`) — Title: *"wiki atlas"*
5. **`gamesatlas`**: Games & ROM Archive (`#2563EB`) — Title: *"games atlas"*
6. **`toolsatlas`**: Tools & Software Directory (`#16A34A`) — Title: *"tools atlas"*

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

## 📄 Related Documentation
- [Big Picture Vision](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/big_picture_dream.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Browse Grid Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)
- [Home View Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/home.md)

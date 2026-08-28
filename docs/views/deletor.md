# Mass Deletor Studio Specifications (`docs/views/deletor.md`)

This document defines the layout architecture, visual components, batch deletion mechanics, custom tag pruning, and database reset actions for the Mass Deletor Studio view (`view === 'deletor'`).

---

## 🎨 Theme & Layout Architecture

- **Universal Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Top Navbar Access**: Accessible directly from the top navigation bar (`Navbar.jsx`) via the `<Trash2 size={16} />` icon button alongside `Upload`.
- **Header**: Displays "Mass Deletor Studio" title, descriptive subtitle, and a top-right **Refresh Data** button.

---

## 🛠️ Deletor Studio Features

### 1. Upload Batch Mass Deletor
- Displays auto-grouped cards for every `meta:upload:YYYY-MM-DD_HH-mm-ss` batch tag.
- Shows timestamp header, matching post count badge, and 6 small thumbnail preview tiles.
- **Delete Batch Button**: Triggers confirmation modal to delete all items tagged with that batch timestamp and automatically invalidates memory caches (`invalidateItemsCache()`).

### 2. Custom Tag Mass Deletor
- Type-to-delete search input with live autocomplete suggestions from all unique tags in the database.
- Displays live preview grid of up to 36 matching items for the typed tag.
- **Delete All Matching Items Button**: Triggers confirmation modal to delete all posts sharing that exact tag.

### 3. Danger Zone: Delete All Posts & Reset Database
- Prominent danger section displaying the total item count currently indexed in the database.
- **Delete All Posts Button**: Triggers a high-priority confirmation modal.
- Calls `clearAllLocalStores()`, executing `DELETE FROM local_items` on C# backend SQLite, `DELETE FROM local_scrapes; DELETE FROM local_media;` on Tauri SQLite, clearing disk WebP thumbnail caches, and resetting memory state.

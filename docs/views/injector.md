# Bulk Tag Injector Specifications (`docs/views/injector.md`)

This document defines the layout metrics, dual-input match filtering, live match calculation, category-tinted preview pill logic, thumbnail preview strip rendering, and database batch injection specifications for the **Bulk Tag Injector** view (`view === 'injector'`).

---

## 🎨 Theme & Visual Design System

- **Universal Page Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`). Header, card container, and inputs rest on a continuous backdrop.
- **Top Header Integration**: Accessible directly from the top navigation bar ([`Navbar.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/Navbar.jsx)) via the `<Layers size={16} />` icon button ("Bulk Tag Injector").
- **Header Section**: Displays a circular accent icon badge (`<Layers size={22} />`), centered Lora serif title (*"bulk tag injector"*), and descriptive subtitle explaining the batch tag implication process.
- **Card Container**: Centered white card (`max-width: 580px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.04)`).

---

## ⚡ Core Workflow & Dual Input Fields

### 1. Target Match Tag Field
- **Input Query**: Accepts any existing tag or search query string (e.g. `navy_ship`, `r/wallpapers`, `folder:scifi`).
- **In-Memory Autocomplete Popover**: Pre-caches the full tag dictionary on mount and filters top 7 matching tags with item counts (`.slice(0, 7)`).
- **Keyboard Navigation**: Supports `ArrowDown` / `ArrowUp` to navigate suggestions, `Enter` to select or advance focus to input 2, and `Escape` to close the popover.
- **Live Match Badge**: Calculates matching post count in real-time and displays a monospace count badge (`500 items found`).

### 2. Matching Media Preview Strip
- Displays a horizontal thumbnail preview strip showing up to 5 matching media assets (`54px × 54px` rounded thumbnails).
- Uses `getOptimizedThumbnailUrl` and `formatLocalAssetUrl` for instant thumbnail rendering.
- Displays non-matching feedback if no items match the typed query.

### 3. Tag to Inject & Fixed Category Auto-Coloring
- **Input Field**: Accepts the new tag to append across all matching media items (e.g. `military`, `creator:author`, `work:game`).
- **Real-Time Category Auto-Coloring**: Evaluates the tag category in real-time via `getCategoryObj(tagToInject)` against the **7 fixed categories** (`general`, `meta`, `source`, `work`, `subreddit`, `character`, `creator`).
- **Category Preview Pill**: Formats the preview badge cleanly using `{injectCatObj.label}: {getDisplayTagName(tagToInject)}`, preventing duplicate string prefixes while displaying the category tint color and background badge in real time (e.g., `Creator: xyz` in Royal Blue, `Metadata: png` in Slate).

### 4. Batch Execution Pipeline (`bulkInjectTagToFilter`)
- Clicking **`Inject Tag to X Items`** invokes `bulkInjectTagToFilter(targetFilterTag, newTagToInject)` in [`localDb.js`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/services/localDb.js).
- **Database Persistence**: Iterates through all matching items in `local_scrapes` and `local_media` (and C# backend server if online), appending the new tag string while avoiding duplicates.
- **Cache Invalidation**: Invokes `invalidateItemsCache()` upon completion.
- **Feedback Banner**: Displays a status toast (`Successfully injected tag "military" into 500 item(s)...`).

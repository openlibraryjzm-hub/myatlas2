# Tag Category Creator & Manager Modal (`docs/views/category_manager.md`)

This document defines the architecture, visual design system, taxonomy registry API, auto-coloring palette, and persistence mechanics for the **Tag Category Creator Modal** ([`SlotCategoryManagerModal.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/SlotCategoryManagerModal.jsx)).

---

## 🎨 Overview & Visual Design System

The Tag Category Creator Modal provides a sleek, minimalist single-view interface for managing custom tag category prefixes without artificial mode barriers or tab switching.

- **Single-View Interface**: Renders a clean modal window featuring a quick category input bar and a flex grid of active category badges.
- **Color Indicator Badges**: Each active category badge displays:
  - An assigned color indicator dot (`color`).
  - Human-readable category label (e.g. `Country`).
  - Search namespace prefix (e.g. `country:`).
  - One-click removal button (`×`).
- **Dark Minimal Theme**: Uses semi-transparent dark backdrop overlays (`rgba(0, 0, 0, 0.6)`), rounded borders (`12px`), subtle borders (`var(--border-color)`), and smooth CSS transitions.

---

## ⚙️ Quick Add Category Workflow

1. **Input Format**: Users type desired category names with or without a trailing colon into the quick input bar:
   - Example 1: `country:` -> Prefix: `country:`, Label: `Country`.
   - Example 2: `location` -> Prefix: `location:`, Label: `Location`.
   - Example 3: `camera_angle:` -> Prefix: `camera_angle:`, Label: `Camera Angle`.
2. **Submission**: Pressing `ENTER` or clicking **Add Category** formats the input, assigns the next available color from the `PALETTE_COLORS` array, and saves the category.
3. **Instant Global Sync**: Category additions and deletions instantly update the taxonomy registry in `localStorage` (`'myatlas_tag_categories'`), synchronizing category colors in real time across the **Browse Grid Sidebar** and **Speed Tagger**.

---

## 🎨 Automatic Color Assignment System (`PALETTE_COLORS`)

Core Booru taxonomy categories use signature default colors, while user-created custom categories are automatically assigned vibrant colors in rotation from `PALETTE_COLORS`:

| Category Type | Category Key | Prefix | Color | Hex Code |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `subreddit` | `r/` | Amber Gold | `#b45309` |
| **Default** | `copyright` | `copyright:` | Deep Purple | `#7c3aed` |
| **Default** | `character` | `character:` | Forest Green | `#16a34a` |
| **Default** | `artist` | `artist:` | Royal Blue | `#2563eb` |
| **Default** | `flair` | `flair:` | Hot Pink | `#db2777` |
| **Default** | `meta` | `meta:` | Slate Gray | `#4b5563` |
| **Default** | `general` | *Unprefixed* | Warm Amber | `#cc5a01` |
| **Custom Palette 1** | `country` | `country:` | Teal | `#0d9488` |
| **Custom Palette 2** | `location` | `location:` | Crimson Rose | `#e11d48` |
| **Custom Palette 3** | `camera` | `camera:` | Indigo | `#4f46e5` |
| **Custom Palette 4** | `medium` | `medium:` | Emerald | `#059669` |
| **Custom Palette 5** | `series` | `series:` | Cyan | `#0891b2` |
| **Custom Palette 6** | `era` | `era:` | Burnt Orange | `#ea580c` |
| **Custom Palette 7** | `genre` | `genre:` | Vivid Violet | `#9333ea` |
| **Custom Palette 8** | `license` | `license:` | Dark Gold | `#ca8a04` |

---

## 💾 Registry & Storage API (`src/data/mockData.js`)

Category taxonomy data is managed through centralized helper functions:

```javascript
// Retrieve active categories (combines defaults + custom categories)
getTagCategories()

// Persist category list to localStorage ('myatlas_tag_categories')
saveTagCategories(categoriesArray)

// Register a new custom category prefix
addTagCategory(inputString)

// Delete a category prefix by key
removeTagCategory(categoryKey)

// Reset taxonomy to core default categories
resetTagCategories()
```

---

## 🔄 Integration Touchpoints

- **Browse Grid Left Sidebar ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx))**: Saving or updating categories triggers an immediate tag recount (`fetchTags()`), refreshing sidebar Category Index cards and palette colors in real time.
- **Speed Tagger ([`Tagger.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Tagger.jsx))**: Dynamic caret input line and staged tag pills evaluate `getActiveCategories()` on render to color pills instantly as the user types custom namespace tags.

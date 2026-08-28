# Tag Categories Directory Specifications (`docs/views/categories.md`)

This document defines the layout architecture, namespace grouping logic, taxonomy category inspection, tag search filtering, and navigation specifications for the **Tag Categories Directory** view (`view === 'categories'`).

---

## 🎨 Theme & Layout Architecture

- **Universal Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Top Navbar Access**: Accessible from the top navigation bar (`Navbar.jsx`) via the `<Tag size={16} />` icon button between Users Directory and Speed Tagger.
- **Header Section**: Displays "Tag Categories Directory" title, descriptive subtitle, Refresh button, and three key summary stats:
  1. **Active Categories**: Number of registered namespace categories with at least 1 active tag in the database vs total registered.
  2. **Unique Namespace Tags**: Total unique tags indexed across all categories.
  3. **Total Posts Indexed**: Total posts currently in database.

---

## 🏷️ Category Cards & Scalable Tag Cloud

- **Namespace Categorization**: Resolves namespace prefixes using `getTagCategory(tag)` (`meta:`, `r/`, `artist:`, `character:`, `copyright:`, `flair:`, `general`, or custom user prefixes).
- **Category Card Header**:
  - Displays category accent color badge dot, Category Label (e.g. `Metadata`, `General Tags`, `Subreddits`), and Namespace Prefix badge (`meta:`, `r/`).
  - Displays unique tag count, matching post count, and a delete icon button for custom categories.
- **Scalable Tag Cloud Truncation**:
  - Displays color-coded pills for top 16 active tags by default.
  - Interactive **"+X more tags" / "Show less"** toggle allows expanding large tag lists without cluttering the UI.
  - Clicking any tag pill navigates directly to Browse Grid (`Posts.jsx`) with that tag filtered.

---

## 🛠️ Category Creation & Removal Controls

- **"+ Add Category" Button**: Opens modal to register a new tag category prefix (e.g., `medium:`, `genre:`, `game:`, `camera:`, `location:`).
- **Auto Palette Color Assignment**: New custom categories automatically draw distinct accent colors from `PALETTE_COLORS`.
- **Category Removal**: Custom (non-default) categories can be removed via the card header delete button (`<Trash2 size={14} />`). Tags under removed categories revert to General classification.

---

## 🔍 Category Search & Filter Chips

- **Filter Chips Bar**: One-click category filter chips allowing users to focus on specific categories (e.g. `Metadata (4)`, `General Tags (12)`).
- **Type-to-Filter Search**: Live search input filtering both category titles and tag names instantly.

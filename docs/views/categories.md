# Tag Categories Directory Specifications (`docs/views/categories.md`)

This document defines the layout architecture, namespace grouping logic, taxonomy category inspection, domain scope filtering, and navigation specifications for the **Tag Categories Directory** view (`view === 'categories'`).

---

## 🎨 Theme & Layout Architecture

- **Universal Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Top Navbar Access**: Accessible from the top navigation bar ([`Navbar.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/Navbar.jsx)) via the `<Tag size={16} />` icon button.
- **Domain Scope Filter Bar**:
  - Contains an interactive text input with a `<Globe size={15} />` icon allowing dynamic post pool filtering by domain tags (e.g. `atlas:rockets`, `folder:wallpapers`, `r/`).
  - Re-calculates all namespace categories and tag value counts strictly within the active filter scope.
  - Features a 1-click `[X]` clear button to reset scope to all media.
- **Top Action Buttons**:
  - `+ Add Prefix`: Opens a modal to register custom namespace category prefixes (e.g. `medium:`, `genre:`, `game:`, `camera:`, `atlas:`).
  - `Refresh`: Re-queries the SQLite database and rebuilds taxonomy aggregates (`loadCategoryData`).

---

## 🗂️ Single-Flow Navigation & Strict Drill-Down

1. **Namespaces Directory View (Default)**:
   - Renders all registered namespace categories (`r/`, `artist:`, `character:`, `copyright:`, `folder:`, `meta:`, custom prefixes) in **one single continuous shared line**, separated by commas `,`.
   - Category accent text colors distinguish between namespaces (e.g. Sky Blue for `folder:`, Deep Purple for `copyright:`, Forest Green for `character:`).
   - Each namespace tag item displays: `Category Label prefix (X tags)`.
   - **Strict Drill-Down Access Control**: Users cannot freely enter tag values mode. Clicking a specific namespace category drills down into tag values for *that specific category*.

2. **Drill-Down Values View (Accessed via Namespace Click)**:
   - Displays a breadcrumb navigation bar (`← Back to Namespaces / Category Label`).
   - Renders all tag values belonging to the selected category in the same continuous comma-separated text flow.
   - Each tag renders as `cleanName (count)` with category-tinted styling.
   - **1-Click Filter**: Clicking any tag value calls `onTagClick(tag)`, navigating directly to the Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)) filtered by that tag.

---

## 🛠️ Category Creation & Removal Controls

- **Custom Prefix Registration**: Custom prefixes end with a colon (e.g. `medium:`) to format tags as `prefix:value`.
- **Auto Palette Color Assignment**: New custom categories automatically draw distinct accent colors from `PALETTE_COLORS`.
- **Category Removal**: Custom (non-default) categories can be removed via the inline trash button (`<Trash2 size={11} />`). Existing tags revert to General classification.

# Tag Categories Directory Specifications (`docs/views/categories.md`)

This document defines the layout architecture, namespace grouping logic, taxonomy category inspection, domain scope filtering, and navigation specifications for the **Tag Categories Directory** view (`view === 'categories'`).

---

## 🎨 Theme & Layout Architecture

- **Universal Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Top Navbar Access**: Accessible from the top navigation bar ([`Navbar.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/Navbar.jsx)) via the `<Tag size={16} />` icon button.
- **Domain Scope Filter Bar**:
  - Contains an interactive text input with a `<Globe size={15} />` icon allowing dynamic post pool filtering by any domain tag or search query (e.g. `atlas:marineindustry`, `budget:indie`, `medium:photo`, `folder:wallpapers`).
  - **Universal Domain Scoping**: When a scope query is entered, re-calculates all namespace categories and tag value counts strictly within that post pool, dynamically surfacing ALL active namespaces (including custom prefixes like `ship:`, `berthage:`, `tools:`) present on matching posts.
  - Features a 1-click `[X]` clear button to reset scope to all media.
- **Top Action Buttons**:
  - `+ Add Prefix`: Opens a modal to register custom namespace category prefixes (e.g. `medium:`, `genre:`, `game:`, `camera:`, `atlas:`).
  - `Refresh`: Re-queries the SQLite database and rebuilds taxonomy aggregates (`loadCategoryData`).

---

## 🗂️ Single-Flow Navigation & Strict Drill-Down

1. **Namespaces Directory View**:
   - **Default View (Empty Filter Bar)**: Always renders **all 8 core default categories** (`Subreddits`, `Folders`, `Copyright`, `Characters`, `Artists`, `Flairs`, `Metadata`, `General Tags`) in a single continuous shared line separated by commas `,`. Keeps the default layout clean and un-flooded regardless of how many custom prefixes exist at scale.
   - **Scoped View (Filter Bar Active)**: Dynamically expands beyond the core defaults to surface **all active namespaces** (default and custom domain prefixes) present on matching posts in that scope.
   - Category accent text colors distinguish between namespaces (e.g. Sky Blue for `folder:`, Deep Purple for `copyright:`, Forest Green for `character:`).
   - Each namespace tag item displays: `Category Label prefix (X tags)`.
   - **Strict Drill-Down Access Control**: Users cannot freely enter tag values mode. Clicking a specific namespace category drills down into tag values for *that specific category*.

2. **Drill-Down Values View (Accessed via Namespace Click)**:
   - Displays a breadcrumb navigation bar (`← Back to Namespaces / Category Label`).
   - Renders all tag values belonging to the selected category in the same continuous comma-separated text flow.
   - Each tag renders as `cleanName (count)` with category-tinted styling. Tag counts reflect the active domain scope pool.
   - **1-Click Filter**: Clicking any tag value calls `onTagClick(tag)`, navigating directly to the Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)) filtered by that tag.

---

## 🛠️ Category Creation & Removal Controls

- **Custom Prefix Registration**: Custom prefixes end with a colon (e.g. `medium:`) to format tags as `prefix:value`. Custom prefixes are registered globally and surface dynamically whenever posts in a domain scope receive tags with that prefix.
- **Auto Palette Color Assignment**: New custom categories automatically draw distinct accent colors from `PALETTE_COLORS`.
- **Category Removal**: Custom (non-default) categories can be removed via the inline trash button (`<Trash2 size={11} />`). Existing tags revert to General classification.

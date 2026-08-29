# Tagging & Category Taxonomy (`docs/taxonomy.md`)

This document defines the boolean tag categorization, namespace schema, database mappings, auto-coloring palette, and user-expandable flat taxonomy system used to organize and query items in **MyAtlas**.

---

## 🏷️ Namespace Categories & Schema

Tags follow a booru-style boolean namespace system (`category:tag_name` or `namespace:value`) to classify content.

The default taxonomy includes the following core categories:

| Category | Namespace Prefix | Searchable / Filterable | Example Tags | Default Color |
| :--- | :--- | :--- | :--- | :--- |
| **General** | *No prefix (default)* | Yes | `landscape`, `cyberpunk`, `minimal` | Warm Amber (`#cc5a01`) |
| **Folders** | `folder:` | Yes | `folder:scifi`, `folder:wallpapers` | Sky Blue (`#0284c7`) |
| **Character / Subject** | `character:` | Yes | `character:goku`, `character:wolf` | Forest Green (`#16a34a`) |
| **Artist / Creator** | `artist:` / `u/` | Yes | `artist:kyacchan`, `u/username` | Royal Blue (`#2563eb`) |
| **Copyright / Source** | `copyright:` | Yes | `copyright:sekiro`, `copyright:dragon_ball` | Deep Purple (`#7c3aed`) |
| **Flair / Format Label** | `flair:` | Yes | `flair:concept_art`, `flair:digital_art` | Hot Pink (`#db2777`) |
| **Medium / Format** | `medium:` | Yes | `medium:3d`, `medium:digital`, `medium:photo` | Amber Gold (`#b45309`) |
| **Metadata** | `meta:` | Yes | `meta:format:image`, `meta:extension:png`, `meta:folder:scifi`, `meta:atlas:my_collection` | Slate Gray (`#4b5563`) |

---

## ⚙️ First-Colon & Sub-Prefix Namespace Parsing Rule

Namespace extraction evaluates category classification using the following precedence rules:

1. **Meta Sub-Prefix Routing**: Sub-prefixes under `meta:` like `meta:folder:`, `meta:artist:`, `meta:copyright:`, `meta:character:`, and `meta:flair:` route directly to their target core category (e.g. `meta:folder:scifi` routes to **Folders** (`folder:`)).
2. **First-Colon Extraction**: The substring preceding the first colon is evaluated as the category key (e.g. in `ship:hms_victory`, `ship` is the namespace).
3. **Value Tag Preservation**: Any subsequent colons or semicolons following the first colon are preserved 100% intact as part of the value string.

---

## 🛡️ Robust Tag Array Normalization Specification

To ensure high-performance execution and prevent runtime errors when consuming tags from SQLite or local storage, all tag consumers utilize robust array normalization (`ensureTagsArray` / `parseTagsArray`):

```javascript
export const parseTagsArray = (rawTags) => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === 'string') {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return rawTags.split(/[,;\s]+/).filter(Boolean);
    }
  }
  return [];
};
```

This normalization handles raw Javascript arrays, stringified JSON arrays (`"[\"folder:scifi\"]"`), and flat delimiter-separated tag strings cleanly.

---

## 🎨 User-Defined Custom Categories & Auto-Coloring (`PALETTE_COLORS`)

Users can register custom tag category prefixes (e.g. `medium:`, `genre:`, `game:`, `location:`, `camera:`) via the **Tag Categories Directory** ([`Categories.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Categories.jsx)).

Newly added custom categories automatically draw distinct accent colors from the `PALETTE_COLORS` array:

1. **Teal** (`#0d9488`)
2. **Crimson Rose** (`#e11d48`)
3. **Indigo** (`#4f46e5`)
4. **Emerald** (`#059669`)
5. **Cyan** (`#0891b2`)
6. **Burnt Orange** (`#ea580c`)
7. **Vivid Violet** (`#9333ea`)
8. **Dark Gold** (`#ca8a04`)

---

## ⚙️ Dynamic Category Resolution Algorithm (`getCategoryObj`)

Dynamic tag classification resolves category objects (`key`, `prefix`, `label`, `color`, `bg`) using `getCategoryObj(tagOrKey)`:

```javascript
export const getCategoryObj = (tagOrKey) => {
  if (!tagOrKey) return DEFAULT_CATEGORIES.find(c => c.key === 'general');
  const categories = getTagCategories();
  const lower = String(tagOrKey).toLowerCase().trim();
  
  // Direct key or prefix match (e.g. 'folder', 'folder:', 'r/', 'copyright')
  const directMatch = categories.find(c => 
    c.key.toLowerCase() === lower || 
    c.prefix.toLowerCase() === lower ||
    c.prefix.toLowerCase() === `${lower}:`
  );
  if (directMatch) return directMatch;

  // Prefix extraction for full tags (e.g. 'folder:scifi')
  const catKey = getTagCategory(tagOrKey);
  const found = categories.find(c => c.key === catKey || c.prefix === tagOrKey);
  if (found) return found;

  return DEFAULT_CATEGORIES.find(c => c.key === 'general');
};
```

---

## 💾 Taxonomy Registry Persistence

Taxonomy category definitions are stored in `localStorage` under `'myatlas_tag_categories'` as a flat JSON array of category objects:

```json
[
  { "key": "subreddit", "label": "Subreddits", "prefix": "r/", "color": "#b45309", "isDefault": true },
  { "key": "folder", "label": "Folders", "prefix": "folder:", "color": "#0284c7", "isDefault": true },
  { "key": "medium", "label": "Medium", "prefix": "medium:", "color": "#0d9488", "isDefault": false }
]
```

# Tagging & Category Taxonomy (`docs/taxonomy.md`)

This document defines the boolean tag categorization, namespace schema, database mappings, auto-coloring palette, and 7-category fixed taxonomy system used to organize and query items in **MyAtlas**.

---

## 🏷️ Fixed 7-Category Namespace Schema

Tags follow a booru-style boolean namespace system (`category:tag_name` or `namespace:value`) to classify content.

The system enforces a **strict, fixed 7-category taxonomy**:

| Category Key | Label | Main Prefix | Handled / Legacy Prefixes | Searchable / Filterable | Example Tags | Default Color |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`general`** | General Tags | *(none)* | `general:`, any unregistered prefix (e.g. `folder:`, `flair:`, `medium:`) | Yes | `landscape`, `cyberpunk`, `minimal` | Warm Amber (`#cc5a01`) |
| **`meta`** | Metadata | `meta:` | `meta:` | Yes | `meta:format:image`, `meta:extension:png` | Slate Gray (`#4b5563`) |
| **`source`** | Source | `source:` | `source:`, `copyright:`, `meta:copyright:` | Yes | `source:artstation`, `copyright:sekiro` | Deep Purple (`#7c3aed`) |
| **`work`** | Work | `work:` | `work:`, `meta:work:` | Yes | `work:elden_ring`, `work:star_wars` | Sky Blue (`#0284c7`) |
| **`subreddit`** | Subreddits | `subreddit:` | `subreddit:`, `r/`, `meta:subreddit:` | Yes | `r/wallpapers`, `r/conceptart` | Amber Gold (`#b45309`) |
| **`character`** | Characters | `character:` | `character:`, `meta:character:` | Yes | `character:goku`, `character:wolf` | Forest Green (`#16a34a`) |
| **`creator`** | Creator | `creator:` | `creator:`, `artist:`, `u/`, `qid:`, `meta:artist:` | Yes | `creator:kyacchan`, `u/username` | Royal Blue (`#2563eb`) |

---

## ⚙️ Namespace Parsing & Fallback Rule

Category extraction evaluates tags against the 7 fixed categories:

1. **Direct Prefix Matching**: Recognized prefixes (`r/`, `subreddit:`, `creator:`, `artist:`, `u/`, `qid:`, `source:`, `copyright:`, `work:`, `character:`, `meta:`) resolve to their respective fixed category.
2. **Meta Sub-Prefix Routing**: Sub-prefixes under `meta:` like `meta:creator:`, `meta:source:`, `meta:work:`, `meta:character:`, `meta:subreddit:` route directly to their target category.
3. **General Fallback**: Any tag without a namespace, or with an unrecognized prefix (e.g. `folder:`, `flair:`, `medium:`, `game:`), defaults cleanly to **General Tags** (`general`).

---

## 🛡️ Robust Tag Array Normalization Specification

To ensure high-performance execution and prevent runtime errors when consuming tags from SQLite or local storage, all tag consumers utilize robust array normalization (`parseTagsArray`):

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

---

## 🎨 Fixed Category Palette (`PALETTE_COLORS`) & Category Resolution

Each of the 7 fixed categories is assigned a distinct accent color and background tint in `DEFAULT_CATEGORIES`:

- **General**: `#cc5a01` / `#fdf5e6`
- **Metadata**: `#4b5563` / `#f3f4f6`
- **Source**: `#7c3aed` / `#f3e8ff`
- **Work**: `#0284c7` / `#e0f2fe`
- **Subreddits**: `#b45309` / `#fef3c7`
- **Characters**: `#16a34a` / `#dcfce7`
- **Creator**: `#2563eb` / `#dbeafe`


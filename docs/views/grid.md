# Browse Grid & Left Sidebar Specifications (`docs/views/grid.md`)

This document defines the layout architecture, visual design system, left sidebar control flow, tag stream auto-coloring, thumbnail grid performance waterfall, video card mechanics, and pagination specifications for the Browse Grid view (`view === 'posts'`).

---

## 🎨 Theme & Visual Design System

- **Universal Page Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`). Header, sidebar, and thumbnail grid rest on a continuous backdrop.
- **Accent Palette**: Claude warm amber orange (`--accent-color: #CC5A01`, hover `#B24D00`, light tint `#FDF5E6`).
- **Typography**: `Lora` serif headings paired with `Plus Jakarta Sans` body and tag text. Monospace font (`--font-mono`) used for counts and pagination badges.

---

## 📐 Symmetrical Layout & Grid Architecture

- **Outer Layout (`.posts-layout`)**:
  - Horizontal flex layout (`display: flex; flex-direction: row; justify-content: center; align-items: flex-start;`).
  - Centered via `max-width: max-content; margin: 0 auto; padding: 0 2.5rem;`.
  - Outer margins to the left of the sidebar match margins to the right of the grid.

---

## 🗂️ Floating Left Sidebar System (`.posts-sidebar`)

- **Dimensions**: Fixed width of `180px` (`flex-shrink: 0`), floating unbordered on the warm cream backdrop (`margin-right: 2.25rem`).
- **Controls & Navigation**:
  1. **Gelbooru / Danbooru Standard Flat Tag Stream**: Displays a clean, fixed flat list of the top active page tags (capped at 20) sorted by canonical Booru category priority (`Copyright` → `Character` → `Artist` → `General` → `Meta`) and frequency count descending.
  2. **Booru Category Color Badges**: Each tag features a 6px category accent dot (`catObj.color`) and category-tinted styling for instant visual distinction.
  3. **Sidebar Tag Inspect Hover (250ms Threshold)**: Hovering over any sidebar tag for > 250ms automatically illuminates matching post cards on the grid and dims non-matching cards. Moving the cursor away resets grid highlights instantly with 0ms delay.
  4. **Decoupled Grid Thumbnail Hover**: Hovering over post thumbnails on the grid leaves the sidebar tag list static and untouched.
  5. **Item Count & Reset**: Displays `{totalCount} posts` alongside a clear filter trigger (`<Trash2 size={12} />`).

---

## 🖼️ Thumbnail Grid & Performance Optimization

- **Zero Artificial Delay**: Grid navigation, filtering, and tagger exits load instantly with 0ms artificial skeleton delay.
- **Instant Cache Detection**: `PostCard.jsx` checks `imgRef.current.complete` on mount. If an image is already in memory or disk cache, it renders immediately with `opacity: 1`, bypassing 0.25s fade delays.
- **Video Card Mechanics**: Local disk video cards render lightweight 300px static WebP thumbnails with a `VIDEO` play badge overlay when idle; hovering triggers a muted video preview loop (`<video src={assetUrl} muted autoPlay loop />`). External YouTube video cards (`youtubeatlas`) render a red `YOUTUBE` platform badge overlay and preserve static thumbnail previews on hover.
- **Direct Speed Tagger View Navigation**: Right-clicking or clicking any post card on the Browse Grid transitions directly to the full-page **Speed Tagger** view ([`tagger.md`](tagger.md)) with initial focus on that post, enabling seamless high-density tag display, full post media mode, and rapid keyboard tagging.
- **Priority Image Waterfall**:
  - **Rows 1 & 2 (Cards 0–15)**: Assigned `fetchPriority="high"` and `loading="eager"` for immediate top-of-fold rendering.
  - **Rows 3+ (Cards 16+)**: Assigned `fetchPriority="low"` and `loading="lazy"` to defer off-screen network requests.

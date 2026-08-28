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
  1. **Implicit Threshold Inspect Mode (250ms Threshold)**: Hovering over a sidebar tag or category header row for > 250ms automatically illuminates matching post cards on the grid and dims non-matching cards. Moving the cursor away instantly resets all elements to normal with 0ms delay.
  2. **Grid Card Inspect Hover**: Hovering over any post card on the Browse Grid for > 250ms highlights its tags in the left sidebar matrix and dims non-matching post cards on the grid.
  3. **Item Count & Reset**: Displays `{totalCount} posts` alongside a clear filter trigger (`<Trash2 size={12} />`).
  4. **1-Click Drill-Down Category Tree**: Groups active page tags by namespace category (`Atlas`, `Metadata`, `Folders`, `Artists`, `Characters`, `Medium`, `General`). Each active category header displays an arrow (`ChevronRight`/`ChevronDown`), a 6px category accent dot, category name, and count (`({groupTags.length})`). 1-click expands/collapses the category right in the sidebar to reveal its value tags below!
  5. **Auto-Expanding Inspect Mode Hover**: Hovering over any post card for > 250ms automatically filters the sidebar to *only* the categories and value tags applying to that specific post, auto-expanding those categories to reveal the exact tags on that item!

---

## 🖼️ Thumbnail Grid & Performance Optimization

- **Zero Artificial Delay**: Grid navigation, filtering, and tagger exits load instantly with 0ms artificial skeleton delay.
- **Instant Cache Detection**: `PostCard.jsx` checks `imgRef.current.complete` on mount. If an image is already in memory or disk cache, it renders immediately with `opacity: 1`, bypassing 0.25s fade delays.
- **Video Card Mechanics**: Grid video cards render lightweight 300px static WebP thumbnail images with a `VIDEO` play badge overlay when idle for 0ms load overhead and 60 FPS buttery-smooth grid scrolling. Hovering over any video card triggers a muted video preview loop (`<video src={assetUrl} muted autoPlay loop />`).
- **Fullscreen Video Viewing**: Right-clicking or clicking any card opens the Fullscreen Viewer modal, streaming local hard drive video files (`.mp4`, `.webm`, `.mov`) natively via the C# HTTP 206 range streamer (`/api/stream/{id}`) for instant scrub-seeking.
- **Priority Image Waterfall**:
  - **Rows 1 & 2 (Cards 0–15)**: Assigned `fetchPriority="high"` and `loading="eager"` for immediate top-of-fold rendering.
  - **Rows 3+ (Cards 16+)**: Assigned `fetchPriority="low"` and `loading="lazy"` to defer off-screen network requests.

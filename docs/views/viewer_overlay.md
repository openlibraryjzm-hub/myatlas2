# Seamless Morphing Overlay Viewer Specifications (`docs/views/viewer_overlay.md`)

This document defines the layout architecture, component boundaries, 3-tab mode mechanics (`Media`, `Tags`, `Edit`), full-bleed native fullscreen scaling, and keyboard controls for the **Seamless Morphing Overlay Viewer** integrated into the Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)).

---

## 🏛️ System Overview & Zero-Unmount Guarantee

The Seamless Morphing Overlay Viewer mounts a single, continuous light-theme overlay directly over the Browse Grid, positioning seamlessly beneath the primary application top header ([`Navbar.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/Navbar.jsx)).

- **Background Preservation**: The Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)) stays 100% mounted in memory behind the overlay. It never loses scroll position, never re-runs data queries, and never tears down DOM card elements.
- **Top Header Integration**: The main application navigation bar (`.nav-header`, `z-index: 10000`) remains visible at the top of the screen when the viewer overlay is open.
- **Overlay Visual Backdrop**: Fixed container starting below the top header (`position: fixed; top: 52px; bottom: 0; left: 0; right: 0; background-color: var(--bg-primary); z-index: 9999`). 0% see-through for a clean, non-distracting media and speed tagging environment.

---

## 🎛️ Top Control Bar & 3-Tab Switcher

The top control bar rests at the upper boundary of the overlay styled with light-theme visual tokens:

1. **Left Queue Counter**: Displays active item position relative to the page queue (e.g., `Item 14 of 40`) in `var(--text-secondary)`.
2. **Centered 3-Tab Mode Switcher**:
   - Positioned horizontally centered above the media stage (`left: 50%; transform: translateX(-50%)`).
   - `Media` Button (`<ImageIcon size={14} />`): Activates Full Media Mode (`viewerMode === 'image'`).
   - `Tags` Button (`<Tag size={14} />`): Activates View-Only Tags Mode (`viewerMode === 'tagger'`).
   - `Edit` Button (`<Pencil size={14} />`): Activates Speed Tagger Edit Mode (`viewerMode === 'edit'`).
3. **Right Action Controls**:
   - `View on Reddit ↗`: Opens external permalink thread in a new browser tab (if `permalink` exists).
   - `Exit to Grid` (`<X size={14} />`): Closes the overlay viewer and returns to the Browse Grid.

---

## 🎬 Morphing Media Stage & Viewer Modes

### 1. Mode A: Full Media Mode (`viewerMode === 'image'`)
- **Primary Default State**: Opening any post card on the Browse Grid launches Full Media Mode first.
- **Spacious Unconstrained Display**: Images and videos scale dynamically to fit comfortably within the overlay stage (`max-height: 60vh; max-width: 88vw; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.12)`).
- **Media Click Navigation**: Clicking the image or video element directly toggles between `Media` View and `Tags` View (`viewerMode = 'tagger'`).
- **Hover Fullscreen Button**: Hovering over the media element displays a translucent `<Maximize2 /> Fullscreen` overlay button in the lower-right corner.
- **Native Full-Bleed Fullscreen**: Clicking the `Fullscreen` hover button launches true HTML5 native fullscreen (`requestFullscreen()`), expanding the media asset to **98vw / 98vh** (`object-fit: contain`) on a dark `#050505` backdrop.
- **Footer Details**: Item title and subreddit/local badging (`r/subreddit` or `Local Media`) displayed in `var(--text-primary)`.

### 2. Mode B: View-Only Tags Mode (`viewerMode === 'tagger'`)
- **Smooth Shrink Transition**: The media element smoothly scales down to thumbnail size (`max-height: 180px; max-width: 240px; object-fit: cover; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Interactive Tag Search Pills**: Displays category-tinted tag pills as non-editable search queries. Clicking any tag pill closes the overlay and immediately filters the Browse Grid by that tag (`onTagClick`).
- **Hidden Input**: Text input, caret buffer, and popover are hidden to prevent accidental tag editing during browsing.

### 3. Mode C: Speed Tagger Edit Mode (`viewerMode === 'edit'`)
- **Smooth Shrink Transition**: Shares the shrunken thumbnail media stage (`max-height: 180px; max-width: 240px`).
- **Inline Speed Tagger Panel ([`MorphingTaggerPanel.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/MorphingTaggerPanel.jsx))**:
  - Renders category-tinted tag pills with click-to-delete support.
  - Activates inline caret input prompt (`"add tag..."`) focused and ready for typing.
  - Renders in-memory autocomplete popover (capped at 8 items) and keyboard shortcut hints (`ENTER Save & Next`, `, Stage`, `ESC Skip`, `` ` `` Prev).
  - Automatically saves updated tags to SQLite (`updateItemTags`) and invalidates memory cache (`invalidateItemsCache`).

---

## 🎞️ Integrated Page Queue Timeline ([`QueueTimeline.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/QueueTimeline.jsx))

Renders along the bottom of the overlay across all modes with a clean transparent background:
- Shows all item thumbnails from the current active page queue (up to 40 items).
- Active item indicator with smooth auto-scroll (`scrollIntoView`).
- Horizontal mouse wheel scrolling support (`wheel` listener).
- Subreddit or `Local Media` labels and `VIDEO` format badges.
- 1-click thumbnail jumping to any item on the page.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Tab` / `F` / `f` | Cycle mode through `Media` → `Tags` → `Edit` → `Media` (when input not focused). |
| `Esc` | Close overlay viewer and return to Browse Grid (when input not focused). |
| `ArrowLeft` / `ArrowRight` | Navigate to Previous / Next item in the queue timeline (when in `Media` view). |
| `,` (Comma) | Stage typed tag buffer in `Edit` Mode. |
| `ENTER` | Commit staged tags to SQLite and advance to next item in queue timeline in `Edit` Mode. |
| `` ` `` (Backtick) | Regress to previous item in queue timeline in `Edit` Mode. |

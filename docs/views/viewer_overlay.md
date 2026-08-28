# Seamless Morphing Overlay Viewer Specifications (`docs/views/viewer_overlay.md`)

This document defines the layout architecture, component boundaries, mode switching mechanics, smooth scaling CSS transitions, and keyboard controls for the **Seamless Morphing Overlay Viewer** integrated into the Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)).

---

## 🏛️ System Overview & Zero-Unmount Guarantee

The Seamless Morphing Overlay Viewer mounts a single, continuous solid light theme overlay directly over the Browse Grid, positioning seamlessly beneath the primary application top header ([`Navbar.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/Navbar.jsx)).

- **Background Preservation**: The Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)) stays 100% mounted in memory behind the overlay. It never loses scroll position, never re-runs data queries, and never tears down DOM card elements.
- **Top Header Integration**: The main application navigation bar (`.nav-header`, `z-index: 10000`) remains visible at the top of the screen when the viewer overlay is open.
- **Overlay Visual Backdrop**: Fixed container starting below the top header (`position: fixed; top: 52px; bottom: 0; left: 0; right: 0; background-color: var(--bg-primary); z-index: 9999`). 0% see-through for a clean, non-distracting media and speed tagging environment with identical visual feel to [`Tagger.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Tagger.jsx).

---

## 🎛️ Top Control Bar

The top control bar rests at the upper boundary of the overlay styled with light-theme visual tokens:

1. **Left Queue Counter**: Displays active item position relative to the page queue (e.g., `Item 14 of 40`) in `var(--text-secondary)`.
2. **Centered Mode Switcher**:
   - Positioned horizontally centered above the media stage (`left: 50%; transform: translateX(-50%)`).
   - Renders `Media` and `Tags` buttons independently without a background bounding box wrapper.
   - `Media` Button (`<ImageIcon size={14} />`): Activates Full Media Mode (`viewerMode === 'image'`).
   - `Tags` Button (`<Tag size={14} />`): Activates Speed Tagger Mode (`viewerMode === 'tagger'`).
3. **Right Action Controls**:
   - `View on Reddit ↗`: Opens external permalink thread in a new browser tab.
   - `Exit to Grid` (`<X size={14} />`): Closes the overlay viewer and returns to the Browse Grid.

---

## 🎬 Morphing Media Stage & Modes

### 1. Mode A: Full Media Mode (`viewerMode === 'image'`)
- **Primary Default State**: Opening any post card on the Browse Grid launches Full Media Mode first.
- **Spacious Unconstrained Display**: Images and videos scale dynamically to fit comfortably within the overlay stage (`max-height: 60vh; max-width: 88vw; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.12)`).
- **1-Click Morph Trigger**: Clicking the media image directly smoothly shrinks it into **Tags Mode**.
- **Footer Details**: Item title and subreddit badge (`r/subreddit` or `Local Media`) in `var(--text-primary)`.

### 2. Mode B: Speed Tagger Mode (`viewerMode === 'tagger'`)
- **Smooth Shrink Transition**: The media element smoothly scales down to thumbnail size (`max-height: 180px; max-width: 240px; object-fit: cover; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Inline Speed Tagger Panel ([`MorphingTaggerPanel.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/MorphingTaggerPanel.jsx))**:
  - Slides into view directly beneath the shrunken media inside the exact same light theme overlay.
  - Renders category-tinted tag pills, comma-separated flow line, inline caretaker input line, and autocomplete popover (max 8 items).
  - Handles CapsLock Command Mode (`q`/`w` navigation, `d` delete, `r` rename, `k` Wikipedia search).
  - Automatically saves updated tags to SQLite (`updateItemTags`) and invalidates memory cache (`invalidateItemsCache`).
- **1-Click Morph Trigger**: Clicking the shrunken media thumbnail expands it right back to **Full Media Mode**.

---

## 🎞️ Integrated Page Queue Timeline ([`QueueTimeline.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/QueueTimeline.jsx))

Renders along the bottom of the overlay in both modes with a clean transparent background:
- Shows all item thumbnails from the current active page.
- Active item indicator with smooth auto-scroll (`scrollIntoView`).
- Horizontal mouse wheel scrolling support (`wheel` listener).
- Session-tagged checkmarks (`✓`) and `VIDEO` format badges.
- 1-click thumbnail jumping to any item on the page.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Tab` / `F` / `f` | Toggle between `Media` mode and `Tags` mode (when not typing in tag input). |
| `Esc` | Close overlay viewer and return to Browse Grid (when not typing tag). |
| `ArrowLeft` / `ArrowRight` | Navigate to Previous / Next item in the queue timeline. |
| `,` (Comma) | Stage typed tag buffer in Tags Mode. |
| `ENTER` | Commit staged tags to SQLite and advance to next item in queue timeline. |
| `` ` `` (Backtick) | Regress to previous item in queue timeline. |

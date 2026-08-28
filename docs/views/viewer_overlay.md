# Seamless Morphing Overlay Viewer Specifications (`docs/views/viewer_overlay.md`)

This document defines the layout architecture, component boundaries, mode switching mechanics, smooth scaling CSS transitions, and keyboard controls for the **Seamless Morphing Overlay Viewer** integrated into the Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)).

---

## 🏛️ System Overview & Zero-Unmount Guarantee

The Seamless Morphing Overlay Viewer replaces traditional full-page navigation by mounting a single, continuous dark frosted glass overlay directly over the Browse Grid.

- **Background Preservation**: The Browse Grid ([`Posts.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Posts.jsx)) stays 100% mounted in memory behind the overlay. It never loses scroll position, never re-runs data queries, and never tears down DOM card elements.
- **Overlay Visual Backdrop**: Fixed full-viewport container (`position: fixed; inset: 0; background: rgba(18, 17, 16, 0.92); backdrop-filter: blur(8px); z-index: 1000`).

---

## 🎛️ Top Control Bar

The top control bar rests at the upper boundary of the overlay:

1. **Left Queue Counter**: Displays active item position relative to the 40-item page queue (e.g., `Item 14 of 40`).
2. **Centered Mode Switcher**:
   - Positioned horizontally centered above the media stage (`left: 50%; transform: translateX(-50%)`).
   - `Media` Tab (`<ImageIcon size={14} />`): Activates Full Media Mode (`viewerMode === 'image'`).
   - `Tags` Tab (`<Tag size={14} />`): Activates Speed Tagger Mode (`viewerMode === 'tagger'`).
3. **Right Action Controls**:
   - `View on Reddit ↗`: Opens external permalink thread in a new browser tab.
   - `Exit to Grid` (`<X size={14} />`): Closes the overlay viewer and returns to the Browse Grid.

---

## 🎬 Morphing Media Stage & Modes

### 1. Mode A: Full Media Mode (`viewerMode === 'image'`)
- **Primary Default State**: Opening any post card on the Browse Grid launches Full Media Mode first.
- **Spacious Unconstrained Display**: Images and videos scale dynamically to fit the viewport (`max-height: 68vh; max-width: 90vw; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.6)`).
- **1-Click Morph Trigger**: Clicking the media image directly smoothly shrinks it into **Tags Mode**.
- **Footer Details**: Minimalist item title and subreddit badge (`r/subreddit` or `Local Media`).

### 2. Mode B: Speed Tagger Mode (`viewerMode === 'tagger'`)
- **Smooth Shrink Transition**: The media element smoothly scales down to thumbnail size (`max-height: 180px; max-width: 240px; object-fit: cover; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Inline Speed Tagger Panel ([`MorphingTaggerPanel.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/MorphingTaggerPanel.jsx))**:
  - Slides into view directly beneath the shrunken media inside the exact same frosted overlay.
  - Renders category-tinted tag pills, comma-separated flow line, inline caretaker input line, and autocomplete popover (max 8 items).
  - Handles CapsLock Command Mode (`q`/`w` navigation, `d` delete, `r` rename, `k` Wikipedia search).
  - Automatically saves updated tags to SQLite (`updateItemTags`) and invalidates memory cache (`invalidateItemsCache`).
- **1-Click Morph Trigger**: Clicking the shrunken media thumbnail expands it right back to **Full Media Mode**.

---

## 🎞️ Integrated 40-Item Queue Timeline ([`QueueTimeline.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/components/QueueTimeline.jsx))

Renders permanently along the bottom of the overlay in both modes:
- Shows all 40 item thumbnails from the current active page.
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
| `ArrowLeft` / `ArrowRight` | Navigate to Previous / Next item in the 40-item queue timeline. |
| `,` (Comma) | Stage typed tag buffer in Tags Mode. |
| `ENTER` | Commit staged tags to SQLite and advance to next item in queue timeline. |
| `` ` `` (Backtick) | Regress to previous item in queue timeline. |

# Speed Tagger Specifications (`docs/views/tagger.md`)

This document defines the speed tagger keyboard workflow, namespace prefix formatting, real-time category coloring, media queue rendering, Full Media View mode, and SQLite persistence contracts for the **Speed Tagger** view (`view === 'tagger'`).

---

## ⚡ Speed Tagger Workflow & Queue Dynamics

The Speed Tagger interface ([`Tagger.jsx`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/src/pages/Tagger.jsx) & [`MorphingTaggerPanel.jsx`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/src/components/MorphingTaggerPanel.jsx)) is engineered for rapid keyboard-driven item tagging and metadata classification.

- **Primary Grid Navigation Target**: Clicking or right-clicking any post card on the Browse Grid ([`grid.md`](file:///c:/Users/GGPC/Desktop/my%20atlas%202/docs/views/grid.md)) transitions directly to the full-page Speed Tagger view with initial focus on the clicked post (`selectedPostId`).
- **Centered Viewport Layout**: Displays item preview media surrounded by active tag pills, interactive inline caret input, and bottom queue timeline.
- **Current Page Queue Boundary & Highlight Positioning**: Speed Tagger receives the active page's item array (up to **40 items per page**). When launched from a clicked card, it automatically initializes the queue timeline at that exact post index.
- **Dynamic Category Auto-Coloring & Visual Feedback**:
  - As the user types a tag in the inline input line (e.g. `country:japan` or `location:tokyo`), `Tagger.jsx` checks `getActiveCategories()` in real time.
  - Registered category prefixes instantly tint tag pills and typing line with assigned palette colors.
- **In-Memory Autocomplete Suggestions**: Filters matching tag suggestions 100% in-memory with **0ms disk latency**, capped at 8 items (`.slice(0, 8)`).
- **SQLite Tag Saving & Cache Invalidation**: `ENTER` invokes `updateItemTags(currentPost.id, finalTags)` and invalidates SQLite memory cache (`invalidateItemsCache()`).
- **Auto-Save on Exit**: Exiting Speed Tagger via `Exit Tagger` button or brand logo automatically commits staged tags to SQLite.

---

## 🎬 Full Media View Mode & Control Pill

Pressing <kbd>Tab</kbd> or clicking the media thumbnail box toggles **Full Media View Mode** (`isFullscreenMedia === true`):

- **Seamless Media Navigation**: Allows continuous cycling through queue media assets (<kbd>Q</kbd> = Previous item, <kbd>W</kbd> = Next item) without exiting full view.
- **Centered Transparent Floating Control Pill**: Displays clean clustered top row (`[ ← 14 / 40 → | ✕ Exit ]`) and bottom row item filename, styled seamlessly with 0% white backdrop bloat.
- **Native Total Fullscreen**: Images and GIFs include an overlaid `<Maximize2 /> Fullscreen (E)` button in the lower-right corner. Pressing <kbd>E</kbd> or clicking the button launches HTML5 native full-bleed fullscreen (`requestFullscreen()`) on a `#050505` backdrop.

---

## ⌨️ Keyboard Shortcuts Reference

### 1. Typing Mode (Default Tags View)
- `,` (Comma): Stage current tag buffer.
- `ENTER`: Save staged tags to local SQLite database and advance to next item.
- `ESC`: Skip current item.
- `` ` `` (Backtick): Return to previous item in queue.
- `TAB`: Toggle Full Media View Mode.
- `CapsLock`: Toggle Command Mode.

### 2. Full Media View Mode (Active when Media overlay is open)
- `q` / `←`: Previous item in queue.
- `w` / `→`: Next item in queue.
- `e`: Toggle Total Native Fullscreen mode.
- `TAB` / `ESC` / `f`: Return to Tags View Mode.

### 3. Command Mode (Toggled via CapsLock)
- `q` / `w`: Navigate individual tags in list.
- `Shift + q` / `Shift + Tab`: Navigate tag categories.
- `d` / `Backspace` / `Delete`: Delete focused tag or category.
- `e`: Toggle tag/category visibility hide state.
- `r`: Inline tag rename.
- `o`: Open source permalink thread.
- `k`: Open Wikipedia search page for selected tag.
- `s`: Skip current item.

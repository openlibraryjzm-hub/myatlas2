# Speed Tagger Specifications (`docs/views/tagger.md`)

This document defines the speed tagger keyboard workflow, namespace prefix formatting, real-time category coloring, media queue rendering, Full Media View mode, and SQLite persistence contracts for the **Speed Tagger** view (`view === 'tagger'`).

---

## ⚡ Speed Tagger Workflow & Queue Dynamics

The Speed Tagger interface ([`Tagger.jsx`](../../src/pages/Tagger.jsx) & [`MorphingTaggerPanel.jsx`](../../src/components/MorphingTaggerPanel.jsx)) is engineered for rapid keyboard-driven item tagging and metadata classification.

- **Primary Grid Navigation Target**: Clicking or right-clicking any post card on the Browse Grid ([`grid.md`](grid.md)) transitions directly to the full-page Speed Tagger view with initial focus on the clicked post (`selectedPostId`), starting directly in **Full Media View Mode** (`initialMediaMode = true`).
- **Top-Aligned Viewport Layout**: Displays top-aligned item preview media (`justify-content: flex-start`), title/filename, interactive inline caret input, and a bottom-anchored queue timeline fitted to the lower viewport edge without triggering page vertical scrollbars.
- **Click-and-Drag Drag-Scroll Timeline**: The queue timeline supports smooth horizontal click-and-drag panning (`cursor: grab`/`grabbing`), vertical scroll wheel mapping, and automatic active item centering. Dragging > 5px suppresses item click selection to prevent accidental index jumps while scrolling.
- **Dynamic Category Auto-Coloring & Visual Feedback**:
  - As the user types a tag in the inline input line (e.g. `country:japan` or `location:tokyo`), `Tagger.jsx` checks `getActiveCategories()` in real time.
  - Registered category prefixes instantly tint tag pills and typing line with assigned palette colors.
- **Interactive `source:` Category Hyperlinks**:
  - If a post contains a `source:http...` tag (e.g. `source:https://store.steampowered.com/app/440/Team_Fortress_2/`), `getSourceUrl(tags)` extracts the URL link.
  - The item title in the Tagger header and filename overlay in the Full Media control pill illuminate in vibrant purple (`#7c3aed`) with an external link icon (`<ExternalLink />`).
  - Clicking the title or control pill filename triggers `openExternalUrl(url, event)`, launching the link directly in the user's default external browser while suppressing webview navigation resets.
  - Tag pills matching `source:*` render with sovereign purple styling (`.tag-pill-source`, `.tagger-source-link`).
- **In-Memory Autocomplete Suggestions**: Filters matching tag suggestions 100% in-memory with **0ms disk latency**, capped at 8 items (`.slice(0, 8)`).
- **SQLite Tag Saving & Cache Invalidation**: `ENTER` invokes `updateItemTags(currentPost.id, finalTags)` and invalidates SQLite memory cache (`invalidateItemsCache()`).
- **Auto-Save on Exit**: Exiting Speed Tagger via `Exit Tagger` button or brand logo automatically commits staged tags to SQLite.


---

## 🎬 Full Media View Mode & Control Pill

Entering Tagger initializes in **Full Media View Mode** (`isFullscreenMedia === true` by default). Pressing <kbd>Tab</kbd>, <kbd>Esc</kbd>, <kbd>F</kbd>, or clicking the Close button toggles/exits Full Media View Mode to reveal the Tags View Mode:

- **Seamless Media Navigation**: Allows continuous cycling through queue media assets (<kbd>Q</kbd> = Previous item, <kbd>W</kbd> = Next item) without exiting full view.
- **Centered Transparent Floating Control Pill**: Displays clean clustered top row (`[ ← 14 / 40 → | 🏷 Tags ]`) and bottom row item filename, styled seamlessly with 0% white backdrop bloat.
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

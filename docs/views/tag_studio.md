# Tag Studio Specifications (`docs/views/tag_studio.md`)

This document defines the layout architecture, inline caret tagging workflow, category color engine, in-memory autocomplete, SQLite persistence contracts, and Command Mode (<kbd>CapsLock</kbd>) tag management operations for the **Tag Studio** view within Speed Tagger ([`Tagger.jsx`](../../src/pages/Tagger.jsx)).

---

## ⚡ System Overview & Layout Architecture

Tag Studio is the primary data-entry and metadata classification view of Speed Tagger (`view === 'tagger'`, `isFullscreenMedia === false`).

- **Navigation Target**: Triggered from the Browse Grid ([`grid.md`](grid.md)) by clicking or right-clicking any post card (`selectedPostId`).
- **Top-Aligned Viewport Layout**: Displays item preview media top-aligned (`justify-content: flex-start`), item title/filename, inline caret tagging input, and a bottom-anchored horizontal queue timeline fitted to the lower viewport boundary without page scrollbars.
- **Queue Timeline Interaction**:
  - Drag-scroll horizontal panning (`cursor: grab` / `grabbing`).
  - Scroll wheel mapping and auto-centering of active item (`scrollIntoView`).
  - Panning > 5px suppresses item click selection to prevent accidental index jumps.

---

## 🎨 Dynamic Category Coloring & Hyperlink Parsing

- **Category Palette Auto-Coloring**:
  - As tags are typed into the inline caret prompt (e.g., `country:japan` or `character:hatsune_miku`), `Tagger.jsx` calls `getActiveCategories()` in real time.
  - Matches assign assigned palette colors directly to tag pills and typing buffers.
- **Sovereign Purple `source:` Hyperlinks**:
  - Tags formatted as `source:http...` (e.g. `source:https://store.steampowered.com/app/440/Team_Fortress_2/`) are extracted by `getSourceUrl(tags)`.
  - The item title in the Tagger header illuminates in sovereign purple with an `<ExternalLink />` icon.
  - Clicking the title invokes `openExternalUrl(url, event)`, launching the target thread in the default system browser while preserving webview state.
  - Tag pills with `source:*` receive sovereign purple badge styling (`.tag-pill-source`).

---

## 💾 Autocomplete & SQLite Tag Persistence

- **0ms Autocomplete**: Filtering is performed 100% in-memory against local tag caches with zero disk latency, capped at 8 items (`.slice(0, 8)`).
- **SQLite Commit**: Pressing <kbd>ENTER</kbd> executes `updateItemTags(currentPost.id, finalTags)` and invalidates memory cache via `invalidateItemsCache()`.
- **Auto-Save on Exit**: Exiting Tag Studio via the `Exit Tagger` button or brand logo automatically commits any staged tags to SQLite before unmounting.

---

## ⌨️ Command Mode (<kbd>CapsLock</kbd>)

Pressing <kbd>CapsLock</kbd> toggles **Command Mode**, transforming navigation keys into tag-level inspection and manipulation tools:

| Shortcut | Action |
| :--- | :--- |
| `q` / `w` | Navigate individual tags in the current item's tag list. |
| `Shift + q` / `Shift + Tab` | Navigate tag categories. |
| `d` / `Backspace` / `Delete` | Delete the focused tag or tag category. |
| `e` | Toggle tag/category hidden visibility state. |
| `r` | Trigger inline tag rename prompt. |
| `o` | Open source permalink in external browser. |
| `k` | Open Wikipedia search page for focused tag. |
| `s` | Skip current item without saving changes. |

---

## ⌨️ Tag Studio Standard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `,` (Comma) | Stage current tag input buffer into pill list. |
| `ENTER` | Save staged tags to local SQLite database and advance to next item. |
| `ESC` | Skip current item. |
| `` ` `` (Backtick) | Regress to previous item in queue. |
| `TAB` / `F` | Transition into [Total Fullscreen View Mode](fullscreen_viewer.md). |
| `CapsLock` | Toggle Command Mode. |

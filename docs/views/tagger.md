# Speed Tagger Specifications (`docs/views/tagger.md`)

This document defines the speed tagger keyboard workflow, namespace prefix formatting, real-time category coloring, media queue rendering, and SQLite persistence contracts for the **Speed Tagger** view (`view === 'tagger'`).

---

## ⚡ Speed Tagger Workflow & Queue Dynamics

The Speed Tagger interface ([`Tagger.jsx`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/src/pages/Tagger.jsx)) is engineered for rapid keyboard-driven item tagging and metadata classification.

- **Centered Viewport Layout**: Displays item preview media surrounded by active tag pills, interactive inline caret input, and bottom queue timeline.
- **Current Page Queue Boundary & Highlight Positioning**: When launched from the Browse Grid (via the `<Tag size={14} />` control button), Speed Tagger receives the active page's item array (up to **40 items per page**). If a post card is highlighted (selected in orange/cream on the grid), Speed Tagger automatically starts the queue at that exact post (`selectedPostId`); if no post is highlighted, it defaults to the first item (`index 0`).
- **Dynamic Category Auto-Coloring & Visual Feedback**:
  - As the user types a tag in the inline input line (e.g. `country:japan` or `location:tokyo`), `Tagger.jsx` checks `getActiveCategories()` in real time.
  - If a registered category prefix is matched, the tag pill and typing line **instantly tint with the category's assigned palette color and background tint**, providing 100% immediate confirmation that the tag was recognized as a registered prefix and did not fall back to general tag.
- **In-Memory Google-Style Autocomplete Suggestions**:
  - Pre-caches full tag dictionary on Tagger mount and filters matching suggestions 100% in-memory with **0ms disk latency**, capped at 8 items (`.slice(0, 8)`).
  - Integrates keyboard navigation: `↓` / `↑` highlights suggestions, `TAB` or `ENTER` auto-completes highlighted tag, `ESC` closes popover, and `ENTER` (when no suggestion selected) saves and advances post as normal.
- **SQLite Tag Saving & Cache Invalidation**:
  - Pressing `ENTER` invokes `updateItemTags(currentPost.id, isMediaFile, finalTags)`.
  - Saves updated tags to SQLite (`local_scrapes` or `local_media`) and **invalidates memory cache** (`invalidateItemsCache()`).
- **Auto-Save on Exit & Unmount Guarantee**:
  - Exiting Speed Tagger via the `Exit Tagger` button or navigating away (e.g. clicking the top MyAtlas brand logo) automatically commits any unsaved staged tags or active input line text to SQLite and invalidates memory cache via unmount cleanup hooks.
- **Auto-Refresh Tag Indexing**: Exiting the Tagger automatically triggers a background tag recount (`fetchTags()`), ensuring newly saved tags render in real time across the Browse Grid sidebar Category Index.

---

## 🎬 Video & Image Media Handling in Tagger

- **Native HTML5 Media Decoding**: Both the main item preview container and bottom queue timeline items render media conditionally:
  - **Static Thumbnails & Images**: Standard `<img>` tags for images or posts with pre-rendered `thumbnailUrl`.
  - **Video Formats (`.mp4`, `.webm`, `.mov`, `meta:format:video`)**: HTML5 `<video src={url} muted playsInline loop preload="metadata" />` elements.
- **Queue Timeline Item Rendering**: Timeline thumbnails display native video frames or static thumbnails cleanly without broken image link icons.
- **Fullscreen Overlay**: Pressing `TAB` or `F` opens full-screen media expanded view (`96vw`/`96vh`). Pressing `Esc`, `Tab`, or `F` closes the overlay.

---

## ⌨️ Keyboard Shortcuts & Modes

### 1. Typing Mode (Default)
- `,` (Comma): Stages current tag buffer.
- `ENTER`: Saves staged tags to local SQLite database, invalidates memory cache, and advances to the next item in queue.
- `ESC`: Skips current item without saving.
- `` ` `` (Backtick): Returns to the previous item in queue.
- `TAB` / `F`: Toggles fullscreen media view.
- `CapsLock`: Toggles Command Mode.

### 2. Command Mode (Toggled via CapsLock)
- `q` / `w`: Navigate individual tags in list.
- `Shift + q` / `Shift + Tab`: Navigate tag categories.
- `d` / `Backspace` / `Delete`: Delete focused tag or category.
- `e`: Toggle tag/category visibility hide state.
- `r`: Inline tag rename.
- `o`: Open source permalink thread.
- `k`: Open Wikipedia search page for selected tag.
- `s`: Skip current item.

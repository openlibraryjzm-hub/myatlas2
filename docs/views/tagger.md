# Speed Tagger View Specifications (`docs/views/tagger.md`)

This document serves as the high-level architecture overview and entry point for the **Speed Tagger** view (`view === 'tagger'`). Speed Tagger is composed of two primary sub-view modes: **Tag Studio** and **Improved Total Fullscreen View**.

---

## 🏛️ System Architecture & Sub-Specs

Speed Tagger ([`Tagger.jsx`](../../src/pages/Tagger.jsx)) bridges high-speed keyboard data classification with an edge-to-edge media viewer.

```
Speed Tagger (view === 'tagger')
├── 1. Tag Studio (Default View)       --> see docs/views/tag_studio.md
└── 2. Total Fullscreen Viewer (Tab/F) --> see docs/views/fullscreen_viewer.md
```

### 1. ⚡ [Tag Studio Specification (`docs/views/tag_studio.md`)](tag_studio.md)
The primary workspace for metadata tagging and media queue progression.
- Top-aligned media stage & inline caret input buffer.
- Real-time category auto-coloring & sovereign purple `source:` hyperlinks.
- 0ms in-memory autocomplete popover & SQLite persistence on `ENTER` or exit.
- Command Mode (<kbd>CapsLock</kbd>) for bulk tag inspection, category jumping, rename, and deletion.

### 2. 🎬 [Improved Total Fullscreen View Specification (`docs/views/fullscreen_viewer.md`)](fullscreen_viewer.md)
Distraction-free media viewer mode toggled via <kbd>Tab</kbd>, <kbd>F</kbd>, or clicking the media thumbnail.
- Tauri native window fullscreen integration (`setNativeWindowFullscreen`) hiding application headers and OS window titlebars.
- Smart aspect ratio auto-detection engine:
  - Widescreen media (`width >= height`) -> **Fill Mode (`cover`)**
  - Portrait media (`width < height`) -> **Height-Prioritized Fill Mode (`portrait-fill`)**
  - Fit Mode (`contain`) via manual <kbd>Z</kbd> toggle or double-click.
- 15% side hover chevrons (<kbd>Q</kbd>/<kbd>W</kbd>) and top frosted glass header bar.

---

## 🔄 State Transitions & Shortcuts Summary

```
                       ┌────────────────────────┐
                       │  Browse Grid (Posts)   │
                       └─────┬────────────┬─────┘
           Left Click        │            │        Right Click
           (Fullscreen)      │            │        (Tag Studio)
                             ▼            ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│  Improved Total Fullscreen View  │◄───┤         Tag Studio View          │
│ - Edge-to-edge media viewer      │Tab/│ - Caret tag typing               │
│ - Q / W side chevrons            │ F  │ - Queue timeline & drag-scroll   │
│ - Smart Fill (cover / portrait)  ├───►│ - CapsLock Command Mode          │
└──────────────────────────────────┘Esc └──────────────────────────────────┘
```

---

## ⌨️ Master Keyboard Reference

| View Mode | Shortcut | Action |
| :--- | :--- | :--- |
| **All Modes** | `Tab` / `F` | Toggle between Tag Studio and Total Fullscreen View. |
| **Tag Studio** | `,` (Comma) | Stage tag in typing buffer. |
| **Tag Studio** | `ENTER` | Commit staged tags to SQLite and load next queue item. |
| **Tag Studio** | `ESC` | Skip item without saving. |
| **Tag Studio** | `` ` `` (Backtick) | Regress to previous item. |
| **Tag Studio** | `CapsLock` | Toggle Command Mode (<kbd>q</kbd>/<kbd>w</kbd> tags, <kbd>d</kbd> delete, <kbd>r</kbd> rename, etc.). |
| **Fullscreen** | `q` / `←` | Previous item in queue. |
| **Fullscreen** | `w` / `→` | Next item in queue. |
| **Fullscreen** | `z` / Double-Click | Toggle Fit vs. Smart Fill aspect ratio scaling. |
| **Fullscreen** | `Esc` | Return to Tag Studio. |

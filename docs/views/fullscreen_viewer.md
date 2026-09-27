# Improved Total Fullscreen View Specifications (`docs/views/fullscreen_viewer.md`)

This document defines the layout architecture, window fullscreen integration, side/top hover controls, dynamic aspect ratio engine (Fit vs. Fill), and playback mechanics for the **Improved Total Fullscreen View Mode** in Speed Tagger ([`Tagger.jsx`](../../src/pages/Tagger.jsx)).

---

## 🎬 System Overview & Native Window Fullscreen Integration

Pressing <kbd>Tab</kbd>, <kbd>F</kbd>, or clicking the media thumbnail in [Tag Studio](tag_studio.md) opens **Total Fullscreen View Mode** (`isFullscreenMedia === true`).

- **100% Headerless Viewport Overlay**: Extends across the entire viewport (`top: 0, left: 0, width: 100vw, height: 100vh`, `z-index: 100000`), completely covering the application header ([`Navbar.jsx`](../../src/components/Navbar.jsx)).
- **Tauri Native OS Window Fullscreen**:
  - Uses `setNativeWindowFullscreen(true)` via `@tauri-apps/api/window` to collapse native desktop application window titlebars and borders.
  - Falls back to HTML5 `document.documentElement.requestFullscreen()` in standard web browsers.
  - Supported by `"core:window:allow-set-fullscreen"` permission in [`src-tauri/capabilities/default.json`](../../src-tauri/capabilities/default.json).
- **Suppressed Video Controls Fullscreen**: Native `<video>` controls suppress native fullscreen popouts via `controlsList="nofullscreen"`.

---

## 📐 Dual Aspect Ratio Engine & Smart Auto-Detection

The viewer automatically evaluates media dimensions (`naturalWidth` / `naturalHeight` for images, `videoWidth` / `videoHeight` for videos) upon load to apply optimal scaling:

1. **Widescreen Media (`width >= height`)**:
   - **Auto-Detects**: **Fill Mode (`cover`)**.
   - Expands edge-to-edge across 100vw × 100vh for immersive widescreen presentation.
2. **Portrait / Tall Media (`width < height`)**:
   - **Auto-Detects**: **Height-Prioritized Fill Mode (`portrait-fill`)**.
   - Expands to 100vh top-to-bottom height while scaling width proportionately, avoiding unnatural cropping of portraits, faces, or vertical video text.
3. **Fit Mode (`contain`)**:
   - Scales the entire asset within screen boundaries with letterboxing/pillarboxing.
4. **Manual Mode Toggle**:
   - Pressing <kbd>Z</kbd> or **double-clicking** the media element toggles between Fit Mode (`contain`) and the smart Fill Mode (`cover` or `portrait-fill`).

---

## 🕹️ Hover Zones & UI Controls

- **Side Hover Navigation Zones**:
  - Hovering the left 15% of the screen reveals a left navigation chevron button (`<ChevronLeft />`) for the previous item (<kbd>Q</kbd> / <kbd>←</kbd>).
  - Hovering the right 15% of the screen reveals a right navigation chevron button (`<ChevronRight />`) for the next item (<kbd>W</kbd> / <kbd>→</kbd>).
- **Top Frosted Glass Header Bar**:
  - Hovering over the upper viewport edge slides down a top bar containing:
    - **Back to Tag Studio** button (<kbd>Tab</kbd> / <kbd>Esc</kbd> / <kbd>F</kbd>).
    - Item filename & external source hyperlink (`openExternalUrl`).
    - Queue position counter badge `(Current / Total)`.

---

## ⌨️ Fullscreen Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `q` / `←` | Navigate to Previous item in queue. |
| `w` / `→` | Navigate to Next item in queue. |
| `z` / Double-Click | Toggle between Fit (`contain`) and smart Fill (`cover` / `portrait-fill`). |
| `Tab` / `Esc` / `f` | Exit Total Fullscreen and return to Tag Studio. |

---

## 🔮 Planned Fullscreen Tweaks & Enhancements

This section tracks upcoming enhancements to the Total Fullscreen experience:
- Custom media control bar overlay for video playback, scrubbing, and audio volume state persistence.
- Automatic hover control hide timers during uninterrupted playback.
- Optional media pan and zoom controls for high-resolution images.

# Improved Total Fullscreen View Specifications (`docs/views/fullscreen_viewer.md`)

This document defines the layout architecture, window fullscreen integration, side/top hover controls, dynamic aspect ratio engine (Fit vs. Fill), mouse wheel controls (free image zoom & VLC video volume), and playback mechanics for the **Improved Total Fullscreen View Mode** in Speed Tagger ([`Tagger.jsx`](../../src/pages/Tagger.jsx)). For dedicated mathematical specifications, VLC volume controls, and focal tracking formulas, see [Fullscreen Scroll Controls Specification](fullscreen_scroll_controls.md).

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
4. **Manual Mode & Zoom Reset**:
   - Pressing <kbd>Z</kbd> or **double-clicking** the media element resets zoom back to 1.0x baseline if currently zoomed in/out. When at 1.0x baseline, double-clicking toggles between Fit Mode (`contain`) and smart Fill Mode (`cover` or `portrait-fill`).

---

## 🖱️ Mouse Wheel Controls & Gesture Engine

The fullscreen overlay captures mouse wheel and drag events with non-passive event listeners:

1. **Image Free Zooming**:
   - **Scroll UP**: Multiplies image scale factor (zoom in up to `5.0x`).
   - **Scroll DOWN**: Divides image scale factor (zoom out down to `0.2x`).
   - **Baseline Snap**: Automatically snaps back to 1.0x when scrolling near 1.0x.
   - **Click & Drag Panning**: When `zoomScale > 1.0`, clicking and dragging anywhere on the image pans the viewport (`panOffset: { x, y }`) with responsive `grab` / `grabbing` cursor state.
   - **Auto-Reset**: Switching items (<kbd>Q</kbd> / <kbd>W</kbd>) or exiting fullscreen automatically resets zoom scale to `1.0` and pan offset to `{ x: 0, y: 0 }`.

2. **Video Volume Control (VLC Style)**:
   - **Scroll UP**: Increases video volume by 5% (`+0.05`, clamped to `1.0`). Scrolling up automatically unmutes if muted.
   - **Scroll DOWN**: Decreases video volume by 5% (`-0.05`, clamped to `0.0`).

3. **Floating HUD Indicator Badge**:
   - Scrolling wheel or resetting zoom triggers a floating frosted glass status overlay (`.tagger-fullscreen-hud`) displaying active volume (e.g. `🔊 75%`, `🔇 Muted`) or zoom level (e.g. `🔍 150%`, `100% (Reset)`).
   - Automatically fades out after 1.2 seconds of inactivity.

---

## 🕹️ Hover Zones & UI Controls

- **Side Hover Navigation Zones**:
  - Hovering the left 15% of the screen (bounded vertically between `top: 72px` and `bottom: 80px`) reveals a left navigation chevron button (`<ChevronLeft />`) for the previous item (<kbd>Q</kbd> / <kbd>←</kbd>).
  - Hovering the right 15% of the screen (bounded vertically between `top: 72px` and `bottom: 80px`) reveals a right navigation chevron button (`<ChevronRight />`) for the next item (<kbd>W</kbd> / <kbd>→</kbd>).
  - **Unobstructed Video Controls Access**: The bottom 80px region of the viewport is completely excluded from side hover navigation zones, ensuring native video controls (play/pause, seekbar, volume, timestamp, fullscreen/PiP) are always 100% accessible without accidental queue navigation triggers.
- **Clean Tooltip Design**:
  - All native browser title tooltips across hover navigation controls, media elements, and top header buttons are suppressed for a clean, distraction-free viewing experience (external source hyperlinks retain tooltip context).
- **Mouse Idle Auto-Hide (2.5 Seconds)**: When the mouse is stationary for 2.5 seconds in Total Fullscreen Mode, the mouse cursor (`cursor: none`) and all top/side hover navigation zones automatically hide (`opacity: 0`). Moving the mouse 1 pixel immediately restores cursor visibility and hover zones.
- **Top Frosted Glass Header Bar**:
  - Hovering over the upper viewport edge slides down a top header bar containing:
    - **Browse Grid** button: Primary back button (`<ArrowLeft />`) to auto-save staged metadata and exit back to the main Browse Grid view.
    - **Tag Studio** button: Secondary standalone button (`<Tag />`) to open the Speed Tagger studio workspace (<kbd>Tab</kbd> / <kbd>Esc</kbd> / <kbd>F</kbd>).
    - Item filename & external source hyperlink (`openExternalUrl`).
    - Queue position counter badge `(Current / Total)`.

---

## ⌨️ Fullscreen Keyboard & Gesture Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Scroll Wheel` | Free Zoom Image (0.2x–5.0x) / Adjust Video Volume (VLC Style). |
| `Click + Drag` | Pan zoomed image across viewport. |
| `z` / Double-Click | Reset Zoom to 1.0x (if zoomed) OR toggle Fit (`contain`) vs smart Fill (`cover`/`portrait-fill`). |
| `q` / `←` | Navigate to Previous item in queue (resets zoom/pan). |
| `w` / `→` | Navigate to Next item in queue (resets zoom/pan). |
| `Tab` / `Esc` / `f` | Exit Total Fullscreen and return to Tag Studio. |

---

## 🔮 Planned Fullscreen Tweaks & Enhancements

This section tracks upcoming enhancements to the Total Fullscreen experience:
- Custom media control bar overlay for video playback, scrubbing, and audio volume state persistence.
- Automatic hover control hide timers during uninterrupted playback.


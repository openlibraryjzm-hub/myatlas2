# Fullscreen Media Mouse Wheel & Gesture Specifications (`docs/views/fullscreen_scroll_controls.md`)

This document defines the complete architecture, gesture physics, cursor focal math, audio volume mechanics, and status HUD specifications for mouse wheel scrolling in **Total Fullscreen View Mode** ([`Tagger.jsx`](../../src/pages/Tagger.jsx)).

---

## 📐 Architecture Overview

When Total Fullscreen View is active (`isFullscreenMedia === true`), mouse wheel input (`wheel` events) is intercepted with non-passive listeners on the overlay root (`.tagger-fullscreen-overlay`).

The system automatically dispatches input based on media type:
* **Videos**: Intercepts scroll delta to adjust audio volume VLC-style.
* **Images**: Intercepts scroll delta to zoom in/out with cursor focal tracking and drag-and-drop panning.

```
┌──────────────────────────────────────────────────────────────────┐
│                   Fullscreen Overlay Wheel Event                 │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                  isVideoFormat(url, tags)?
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       ┌───────────────────┐             ┌───────────────────┐
       │   Video Stream    │             │    Image Asset    │
       ├───────────────────┤             ├───────────────────┤
       │ • Volume ± 5%     │             │ • Zoom Scale 0.2x │
       │ • Auto-Unmute     │             │   to 5.0x         │
       │ • Volume HUD Toast│             │ • Cursor Focal    │
       └───────────────────┘             │   Point Math      │
                                         │ • Drag-Pan X / Y  │
                                         │ • Double-Click    │
                                         │   Reset           │
                                         └───────────────────┘
```

---

## 🎬 1. Video Volume Scroll Mechanics (VLC Media Player Style)

### Playback & Audio Controls
* **Scroll Up (`e.deltaY < 0`)**: Increases video volume by 5% (`+0.05`).
  * **Auto-Unmute**: If the video is currently muted (`videoEl.muted === true`), scrolling UP automatically sets `muted = false` and begins increasing volume from 0%.
  * **Upper Bound**: Volume is clamped at `1.0` (100%).
* **Scroll Down (`e.deltaY > 0`)**: Decreases video volume by 5% (`-0.05`).
  * **Lower Bound**: Volume is clamped at `0.0` (0%).

### Floating HUD Status Indicator Badge
Every volume scroll change triggers a temporary floating status badge (`.tagger-fullscreen-hud`):
* **Icons (`lucide-react`)**:
  * `0%` / Muted: `<VolumeX />`
  * `< 50%`: `<Volume1 />`
  * `≥ 50%`: `<Volume2 />`
* **Text Format**: `Muted` or `XX%` (e.g. `75%`).
* **Persistence**: Automatically fades out after **1.2 seconds** of inactivity via timer clear/reset.

---

## 🖼️ 2. Image Free Zoom & Cursor Focal Math

### Baseline Layout Modes & Scale Factor
* **Initial Layout Baseline (`zoomScale = 1.0`)**:
  * The asset's current CSS aspect ratio mode (`cover`, `contain`, `portrait-fill`) acts as the 1.0x baseline scale.
* **Continuous Scale Bounds**:
  * Zoom scale factor ($S$) is bounded between **`0.2x`** (20% min) and **`5.0x`** (500% max).
  * **Zoom In Step**: $S_{new} = \text{clamp}(S_{prev} \times 1.15, 0.2, 5.0)$.
  * **Zoom Out Step**: $S_{new} = \text{clamp}(S_{prev} / 1.15, 0.2, 5.0)$.
  * **Baseline Snap**: If $|S_{new} - 1.0| < 0.04$, scale automatically snaps to `1.0`.

### Cursor Focal Tracking Formula
To ensure zooming scales toward the user's mouse cursor (rather than defaulting to the center of the screen):

1. **Viewport Center Offset**:
   $$M_x = P_{\text{mouse}, x} - \frac{W_{\text{viewport}}}{2}$$
   $$M_y = P_{\text{mouse}, y} - \frac{H_{\text{viewport}}}{2}$$

2. **Pan Offset Recalculation**:
   When scaling from $S_{\text{prev}}$ to $S_{\text{new}}$, the ratio of change is:
   $$R = 1 - \frac{S_{\text{new}}}{S_{\text{prev}}}$$

   The updated pan coordinates ($X_{\text{pan}}, Y_{\text{pan}}$) become:
   $$X_{\text{new}} = X_{\text{prev}} + (M_x - X_{\text{prev}}) \times R$$
   $$Y_{\text{new}} = Y_{\text{prev}} + (M_y - Y_{\text{prev}}) \times R$$

3. **Baseline Reset**:
   If $S_{\text{new}} \le 1.0$, pan offset automatically resets to $(0, 0)$ to keep the unzoomed image centered within viewport bounds.

---

## 🖱️ 3. Click-and-Drag Panning & Double-Click Reset

### Click + Drag Panning
* When `zoomScale > 1.0`, pressing Left Mouse Button (`e.button === 0`) initiates drag panning:
  * Mouse cursor updates to `grab` when hovering zoomed image, and `grabbing` while dragging.
  * Dragging attaches global `window` event listeners (`mousemove`, `mouseup`) to prevent mouse lockups when dragging past image boundaries.
  * Transform transition is set to `none` during active drag for zero latency.

### Double-Click & Key Hotkey (<kbd>Z</kbd>) Dynamics
Double-clicking the image or pressing <kbd>Z</kbd> operates on a 2-tier state machine:
1. **Tier 1 (Zoomed State)**: If `zoomScale !== 1.0` or pan offset is set, double-clicking / pressing <kbd>Z</kbd> resets `zoomScale = 1.0` and pan offset = `{x: 0, y: 0}`, restoring normal view and showing HUD badge `100% (Reset)`.
2. **Tier 2 (Baseline State)**: If already at `1.0x` baseline, double-clicking / pressing <kbd>Z</kbd> toggles between Fit Mode (`contain`) and Fill Mode (`cover` / `portrait-fill`).

### Queue Navigation Auto-Reset
Navigating to the next/previous post (<kbd>Q</kbd> / <kbd>W</kbd>, arrow keys, or queue timeline clicks) automatically resets `zoomScale = 1.0` and `panOffset = { x: 0, y: 0 }`.

---

## 🛠️ 4. Known Edge Cases & Refinement Roadmap

| Edge Case | Description | Recommended Solution |
| :--- | :--- | :--- |
| **Letterbox Offset Drift** | In `contain` (Fit) mode, black bars exist around small images. Viewport center math uses screen center rather than image bounding box center. | Calculate mouse position relative to `getBoundingClientRect()` of the `<img>` element instead of `window.innerWidth / 2`. |
| **Over-Pan Past Image Edges** | Zoomed images can currently be panned infinitely off-screen. | Implement soft rubberband boundaries clamping $(X_{\text{pan}}, Y_{\text{pan}})$ within scaled image dimensions. |
| **Pinch-to-Zoom Touchpad Support** | Trackpad pinch gestures emit `wheel` events with `ctrlKey = true` and continuous small deltas. | Detect `e.ctrlKey` to scale linearly by `e.deltaY * 0.01` for trackpad pinch smoothness. |

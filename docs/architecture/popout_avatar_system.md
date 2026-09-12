# 2.5D Pop-Out Avatar System Specifications (`docs/architecture/popout_avatar_system.md`)

This document defines the technical architecture, 4-layer z-index stack, 4-quadrant polygon clipping system, persistent configuration contract, and configurator modal for the **2.5D Pop-Out Avatar System** across MyAtlas (`PopOutAvatar.jsx`, `PopOutAvatarConfigModal.jsx`, `avatarStorage.js`).

---

## 🎨 System Overview

The 2.5D Pop-Out Avatar System enables transparent character artwork (PNG/WebP) to poke out over top of a circular orb ring stroke. It is deployed as the centerpiece avatar entrance on the **Home Page** (`Home.jsx`, `168px`) and the centered curator avatar showcase card on the **Curator Profile Page** (`Users.jsx`, `160px`).

```
┌─────────────────────────────────────────────────────────────┐
│ 👥 Layer 3: Pop-Out Overlays (Extended Polygon -400%..500%) │  <-- Sits ABOVE Layer 2 (Pops over ring stroke)
├─────────────────────────────────────────────────────────────┤
│ ⭕ Layer 2: Orb Ring Stroke & Accent Glow                    │  <-- Ring stroke (Sits ABOVE Layer 1)
├─────────────────────────────────────────────────────────────┤
│ 🖼️ Layer 1: Base Character Artwork                           │  <-- Clipped inside orb circle (inset 8%)
├─────────────────────────────────────────────────────────────┤
│ 🎨 Layer 0: Orb Background Circle Fill                      │  <-- Solid orb background color (inset 8%)
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 4-Layer Z-Index Rendering Stack (`PopOutAvatar.jsx`)

To achieve the 2.5D pop-out visual effect without box boundary clipping or ring overlap bugs, the avatar renderer constructs a 4-layer z-index stack inside a square container (`size × size`):

| Layer | CSS Selector | Z-Index | Bounds & Positioning | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 0** | `.popout-orb-bg` | `z-index: 0` | `inset: 8%`, `border-radius: 50%` | Renders the solid orb background circle fill (`orbBgColor`). |
| **Layer 1** | `.popout-inner-clipped` | `z-index: 1` | `inset: 8%`, `border-radius: 50%`, `overflow: hidden` | Clips base character artwork inside the circular orb boundary under the ring stroke. |
| **Layer 2** | `.popout-orb-stroke` | `z-index: 2` | `inset: 8%`, `border-radius: 50%`, `border-style: solid` | Renders the transparent ring border stroke and outer glow (`strokeWidth`, `orbColor`, `showGlow`). Sits ABOVE Layer 1 so the stroke neatly frames clipped image sections. |
| **Layer 3** | `.popout-overlays-wrapper` | `z-index: 3` | `inset: 0`, `overflow: visible` | Renders pop-out overlays OVER top of Layer 2 (the ring stroke). |

---

## 💥 Extended 4-Quadrant Polygon System (`QUADRANT_CLIP_PATHS`)

Pop-out overlays in Layer 3 are demarcated into four independent 2D quadrants (`topLeft`, `topRight`, `bottomLeft`, `bottomRight`). 

To prevent flat square container edges from cropping off tall portrait character artwork (e.g. waist, legs, long capes, arms, or weapons), quadrant clip paths use extended coordinate bounds spanning from **`-400%` to `+500%`**:

```javascript
const QUADRANT_CLIP_PATHS = {
  topLeft:     'polygon(-400% -400%, 50% -400%, 50% 50%, -400% 50%)',
  topRight:    'polygon(50% -400%, 500% -400%, 500% 50%, 50% 50%)',
  bottomLeft:  'polygon(-400% 50%, 50% 50%, 50% 500%, -400% 500%)',
  bottomRight: 'polygon(50% 50%, 500% 50%, 500% 500%, 50% 500%)',
};
```

### Behavior:
- **Clipped Mode (`quadrants[key] = false`)**: The quadrant's artwork stays clipped inside Layer 1 beneath the ring stroke.
- **Pop-Out Mode (`quadrants[key] = true`)**: The quadrant's artwork renders in Layer 3 over top of the ring stroke, extending seamlessly past the orb border.

---

## 💾 Configuration & State Persistence (`avatarStorage.js`)

Avatar configurations are stored in browser `localStorage` and synchronized across all active views via window custom events.

- **Storage Key**: `myatlas_popout_avatar_config`
- **Global Event**: `window.dispatchEvent(new CustomEvent('myatlas_avatar_changed', { detail: updatedConfig }))`

### Schema (`DEFAULT_AVATAR_CONFIG`):

```javascript
export const DEFAULT_AVATAR_CONFIG = {
  imageUrl: '/bernstein-261133_1280.png', // Default transparent PNG asset
  orbColor: '#CC5A01',                     // Orb accent ring stroke color
  orbBgColor: '#FDF5E6',                   // Circle background fill color
  strokeWidth: 4,                          // Border stroke width in px
  showGlow: true,                          // Outer glow shadow toggle
  imageScale: 1.2,                         // Image scale multiplier (0.5x to 2.5x)
  imageOffsetX: 0,                         // Horizontal nudge percentage (-40% to +40%)
  imageOffsetY: -5,                        // Vertical nudge percentage (-40% to +40%)
  objectFit: 'contain',                    // Aspect fit ('contain' full image or 'cover' crop fill)
  quadrants: {
    topLeft: true,                         // Top-Left quadrant pop-out state
    topRight: true,                        // Top-Right quadrant pop-out state
    bottomLeft: false,                     // Bottom-Left quadrant pop-out state
    bottomRight: false                     // Bottom-Right quadrant pop-out state
  }
};
```

---

## 🛠️ Configurator Modal (`PopOutAvatarConfigModal.jsx`)

The configurator modal provides an intuitive live studio interface for customizing avatar parameters:

1. **Interactive Live Preview Stage**:
   - Renders `<PopOutAvatar size={340} config={config} />` updating in real-time as controls change.
2. **Avatar Image Source**:
   - URL text input field for external PNG/WebP links.
   - File upload button converting local files to base64 Data URLs via `FileReader`.
   - Preset thumbnail selectors for quick sample assets.
3. **Scale & Aspect Fit Tools**:
   - Continuous scale range slider (`0.5x` to `2.5x`).
   - Quick scale preset tags (`1.0x`, `1.3x`, `1.8x`).
   - Aspect ratio fit mode toggle (`Contain` for full uncropped artwork vs `Cover` for crop fill).
4. **Position Shift Sliders**:
   - Vertical Shift slider (`-40%` to `+40%`, moving character up or down).
   - Horizontal Shift slider (`-40%` to `+40%`, nudging character left or right).
5. **4-Quadrant Pop-Out Controller**:
   - 2×2 grid of tactile buttons (`Top-Left`, `Top-Right`, `Bottom-Left`, `Bottom-Right`) showing active `POP-OUT 💥` or `CLIPPED ⭕` status badges.
6. **Orb Styling & Border Controls**:
   - Preset accent color swatches + HTML5 native color picker (`#CC5A01`, `#EF4444`, `#8B5CF6`, `#10B981`, etc.).
   - Ring border thickness slider (`2px` to `12px`).
   - Outer orb glow shadow toggle checkbox.
7. **Footer Action Controls**:
   - `Reset Defaults`: Restores initial configuration state.
   - `Cancel`: Discards draft changes and closes modal.
   - `Save Avatar Config`: Persists configuration to `localStorage` and broadcasts global update event.

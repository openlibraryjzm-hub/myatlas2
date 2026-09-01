# Landing Page Specifications (`docs/views/landingpage.md`)

This document defines the layout architecture, visual design system, 4x6 hero select grid, dot-separated category bar, pure frontend 3D particle swarm simulation, and navigation control flow for the **Landing Page** (`view === 'landing'`).

---

## 🎨 Theme & Visual Design System

The Landing Page adheres strictly to the application-wide **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Typography**: `Lora` serif title heading (`Atlas Network`), `Plus Jakarta Sans` body typography, and monospace font (`--font-mono`) for category items and text CTA triggers.
- **Accent Color**: Claude warm amber orange (`--accent-color: #CC5A01`, hover light tint `#FDF5E6`).
- **Zero-Scroll Viewport**: Fixed `100vh` viewport height (`overflow: hidden`) with centered vertical gap flow (`gap: 1.15rem`).

---

## 📐 Layout Architecture & 3 Main Sections

```
┌─────────────────────────────────────────────────────────────┐
1                     TOP: TITLE HEADER                       │
│                      Atlas Network                          │
├─────────────────────────────────────────────────────────────┤
2                    MIDDLE SECTION                           │
│              posts  •  followers  •  new  •  bump           │
│                                                             │
│         ┌────┐   ┌────┐   ┌────┐   ┌────┐                   │
│         │    │   │    │   │    │   │    │  (Row 1: 4)       │
│         └────┘   └────┘   └────┘   └────┘                   │
│                                                             │
│    ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐           │
│    │    │  │    │  │    │  │    │  │    │  │    │ (Row 2: 6)│
│    └────┘  └────┘  └────┘  └────┘  └────┘  └────┘           │
├─────────────────────────────────────────────────────────────┤
3                    BOTTOM SECTION                           │
│               Explore 1904 more Atlases                     │
│                  .  •  :  *  .  •  .                        │
│                •  *  .  3D SWARM  *  •                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Section Breakdown

### 1. Top Section: Clean Title Header
- **Title**: Large `Lora` serif title (`Atlas Network`, `2.5rem`, `font-weight: 500`, letter spacing `-0.03em`).
- **Minimalist Aesthetic**: Uncluttered header with zero badges, subtitles, or redundant navigation overlays.

### 2. Middle Section: Categories & 4x6 Hero Select Grid
- **Dot-Separated Categories**: Horizontal text selector (`posts · followers · new · bump`) rendered in monospace font without capsule bubbles or border outlines. Active option ignites in warm amber (`--accent-color: #CC5A01`).
- **Bottom-Heavy Hero Select Grid**:
  - **Row 1**: 4 small square image-only cards (`90px × 90px`).
  - **Row 2**: 6 small square image-only cards (`90px × 90px`).
  - **Design System**: Clean white card background (`--bg-card: #FFFFFF`), 1px solid subtle border (`--border-color: #E6E2D8`), 8px rounded corners, and smooth hover transform (`translateY(-2px)` with shadow elevation).

### 3. Bottom Section: Simple Text CTA & 3D Particle Swarm
- **Capsule-Free Text Link**: Monospace text CTA (`"Explore 1904 more Atlases"`) positioned directly above the particle swarm with zero capsule borders or background fills.
- **Pure Visual 3D Particle Swarm Simulation (`DiscoveryCloudPreview.jsx`)**:
  - **100% Offline Pure Frontend**: 150 simulated particle nodes generated via 3D Fibonacci sphere algorithm and spatial noise with zero backend REST or database calls.
  - **Transparent Canvas Over-Page Rendering**: HTML5 `<canvas>` renders with full transparency (`ctx.clearRect`), floating directly on top of the warm cream backdrop without any enclosed box or border frame.
  - **Constellation Proximity Web**: Calculates 3D distance between floating particles to draw subtle connecting web lines (`opacity: 0.08`).
  - **Unified Warm Amber Palette**: All particles share the same warm amber hue (`rgba(204, 90, 1, alpha)`), orbiting in a slow, continuous 3D loop (`rotY += 0.001`).

---

## 🧭 Navbar Integration & Routing

- **Header Icon Button**: Accessible via the `<LayoutGrid size={16} />` icon in `Navbar.jsx` (`view === 'landing'`).
- **Navbar Hiding Rule**: When `view === 'landing'`, the sticky top `Navbar` and `app-footer` are automatically hidden, providing full viewport immersion.

---

## 📄 Related Documentation
- [Discovery Cloud 3D Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/discovery_cloud.md)
- [Sub-Atlas System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/sub_atlases.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Browse Grid Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)

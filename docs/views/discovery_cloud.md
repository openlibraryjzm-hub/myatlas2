# Discovery Cloud 3D Specifications (`docs/views/discovery_cloud.md`)

This document defines the layout architecture, 3D spatial galaxy visualization, dynamic Fibonacci sphere positioning algorithm, live tag search dimming mechanics, hover raycasting inspection, non-passive scroll lock guarantees, and scale performance strategies for the **Discovery Cloud 3D Explorer** (`view === 'discovery'`).

---

## 🌌 Visual & Spatial Galaxy Concept

The **Discovery Cloud** provides a 3D interactive constellation map for discovering, navigating, and inspecting sovereign sub-atlases across the Atlas Network platform.

```
┌─────────────────────────────────────────────────────────────┐
│                      DISCOVERY CLOUD 3D                     │
│    [ Search tags / slugs...                             ]   │
│    Matched: 4 / 4 Atlases  •  0% Dimmed                     │
│                                                             │
│                    • atlasnetwork.org/space                 │
│                 🪐                                          │
│        • atlasnetwork.org/myatlas   • atlasnetwork.org/military│
│             🌟                            ⚔️                │
│                                                             │
│                    • atlasnetwork.org/eldenring             │
│                         👑                                  │
│                                                             │
│   [Drag: Rotate 3D Cosmos]  [Scroll: Zoom]  [Hover: Inspect]│
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Geometric Fibonacci 3D Placement Algorithm

To position any number of sub-atlases ($N$) gracefully in 3D space without hardcoded categories or overlapping nodes:

1. **Fibonacci Sphere Radial Distribution**:
   - $N = 1$: Single atlas renders at central origin $(0, 0, 0)$.
   - $N > 1$: Points distribute evenly across a 3D sphere using the golden ratio ($\phi = \frac{1 + \sqrt{5}}{2}$):
     $$\theta_i = \frac{2\pi \cdot i}{\phi}, \quad y_i = \left(1 - \frac{i}{N - 1} \cdot 2\right) \cdot r_{max}$$
     $$x_i = \cos(\theta_i) \cdot \sqrt{1 - y_i^2} \cdot r_{max}, \quad z_i = \sin(\theta_i) \cdot \sqrt{1 - y_i^2} \cdot r_{max}$$
2. **Dynamic Base Radius Scaling**:
   - Point star radius scales logarithmically based on post density:
     $$r_{node} = \max(8.0, \min(24.0, 10 + \log_{10}(\text{postCount} + 1) \cdot 4))$$

---

## 🔍 Live Tag Filter & Dimming Mechanics

1. **Illumination vs Dimming**:
   - When a search query or cluster filter is entered, non-matching sub-atlases dim down to **8% opacity** (`rgba(100, 95, 88, 0.08)`).
   - Matching sub-atlases ignite at **95% opacity** in their assigned theme accent color (`atlas.accentColor`), rendering enhanced radii and canvas radial blur glows (`shadowBlur = radius * 2.5`).
2. **Dynamic Unassigned Categorization**:
   - Sub-atlases without explicit backend categories default to `"Unassigned"`, avoiding hardcoded slug mapping assumptions.
3. **Raycast Hover Inspection**:
   - Hovering within 28px of any projected 3D node triggers an interactive floating card (`.dc-hover-card`) displaying display title, slug (`atlasnetwork.org/<slug>`), post count, tags, and a 1-click **"Enter Sub-Atlas"** button.

---

## 🔒 Viewport & Scroll Locking Guarantees

1. **Native Non-Passive Wheel Event Listener**:
   - The `<canvas>` element attaches a native `{ passive: false }` wheel event listener. Calling `e.preventDefault()` and `e.stopPropagation()` locks the browser scrollbar completely, ensuring mouse scrolling strictly zooms the 3D camera distance ($200\text{px} \leftrightarrow 2200\text{px}$).
2. **Footer Exclusion**:
   - The global app footer (`<footer className="app-footer" />`) is omitted when `view === 'discovery'`, ensuring a fixed full-height canvas viewport (`height: calc(100vh - 56px)`).

---

## 🏎️ Scale Performance Strategy (10,000+ Atlases)

1. **Inverted Index Lookup (`Map<Tag, Set<AtlasID>>`)**:
   - Multi-tag boolean searches execute in $< 0.2\text{ms}$ via set intersections, preventing main-thread string matching overhead.
2. **GPU Fragment Shader / BitMask Optimization**:
   - For $N > 50,000$, point colors, opacities, and positions pass directly to WebGL vertex/fragment shaders for 60 FPS rendering.

---

## 📄 Related Documentation
- [Sub-Atlas Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/sub_atlases.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Browse Grid & Left Sidebar Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)

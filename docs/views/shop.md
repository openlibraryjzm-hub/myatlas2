# Shop View Specifications (`docs/views/shop.md`)

This document defines the specifications, layout metrics, top navigation tabs, Minecraft splash text badge styling, and unconstrained viewport for the **Curator Shop** view (`view === 'shop'`).

---

## 🏛️ Overview & Navigation Routing

- **View Identifier**: `view === 'shop'` in `App.jsx`.
- **Top Navbar Integration**: Displays the sticky global navigation header (`Navbar.jsx`). Clicking the top logo returns directly to the Home page (`view = 'home'`).
- **Layout Alignment**: Positioned directly beneath the global navbar with zero top padding offset to ensure seamless tab placement right under the navigation bar.

---

## 📑 Full-Width Top Navigation Tabs Bar (`.shop-tabs-bar`)

A horizontally aligned, 100% full-width tab bar (`width: 100%`) extends across the top of the view containing 4 tab options:

1. **Deckpad** (`id: 'deckpad'`): Hardware accessory tab.
2. **Light Controller Brace** (`id: 'light-brace'`): Lightweight controller mounting brace tab.
3. **Heavy Controller Brace** (`id: 'heavy-brace'`): Heavy-duty controller mounting brace tab.
4. **Todays Three** (`id: 'todays-three'`): Daily featured 3-item curation tab *(renders "FREE!" splash sticker)*.

### Tab Button Styling (`.shop-tab-btn`)
- **Flex Distribution**: Each tab button uses `flex: 1` to evenly distribute across the full width of the screen.
- **Active Indicator**: Active tab renders highlighted text in `--accent-color` (`#8B5CF6`) with a 3px solid bottom border (`border-bottom-color: var(--accent-color)`).
- **Hover Micro-Interactions**: Hovering applies subtle background highlights (`var(--surface-hover)`).

---

## 🏷️ Minecraft Title Screen Style "FREE!" Splash Sticker (`.free-splash-sticker`)

Tabs marked with `hasFreeSticker: true` (e.g. **Todays Three**) render a playful, Minecraft title screen splash text-esque badge:

- **Positioning**: Positioned absolutely in the top right corner (`top: -4px`, `right: calc(50% - 42px)`).
- **Color & Border**: Solid gold background (`#FFD700`), dark text (`#111827`), and dark amber border (`#D97706`).
- **Typography & Rotation**: Tilted at a `-12deg` angle with 900 heavy weight typography and subtle drop shadow (`box-shadow: 1px 2px 4px rgba(0,0,0,0.2)`).
- **Pulse Animation**: Uses `@keyframes minecraftSplashPulse` to gently scale (`1.0` -> `1.12`) and rotate (`-12deg` -> `-9deg`) in a 2.5s infinite loop.

---

## 🖼️ Unconstrained Content Viewport (`.shop-tab-viewport`)

- **Full-Width Spacing**: Spans 100% width (`width: 100%`) without small box boundaries, fixed max-widths, or constrained dashed borders.
- **Active Tab Rendering**: Dynamically renders the preview content for the active tab state (`activeTab`).

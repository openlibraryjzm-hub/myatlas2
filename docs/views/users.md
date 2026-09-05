# Curator Profile Specifications (`docs/views/users.md`)

This document defines the layout architecture, visual design system, pure icon action row, custom Titan Atlas SVG icon specifications, and Steam-inspired showcase bars for the **Curator Profile Page** (`view === 'users'`).

---

## 🎨 Theme & Visual Design System

The Curator Profile page fully adheres to the application-wide **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Accent Palette**: Claude warm amber orange (`--accent-color: #CC5A01`, hover `#B24D00`, light tint `#FDF5E6`).
- **Typography**: `Lora` serif headings for showcase bar titles paired with `Plus Jakarta Sans` body and button labels. Monospace typography used for numerical counters.
- **Card Design System**: Clean white cards (`--bg-card: #FFFFFF`) with 1px subtle borders (`--border-color: #E6E2D8`), 8px rounded corners, and soft elevation shadows.

---

## 📐 Layout Architecture

The Curator Profile view uses a two-column responsive flex layout (`.user-profile-container`, max-width `1180px`, centered with `2.5rem` gap):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CURATOR PROFILE PAGE                            │
├──────────────────────────────┬──────────────────────────────────────────┤
│           LEFT COLUMN        │               RIGHT COLUMN               │
│            (320px)           │                 (Flex 1)                 │
│                              │                                          │
│  ┌────────────────────────┐  │  ┌────────────────────────────────────┐  │
│  │ [ 1:1 Avatar Box ]     │  │  │ 🏆 BADGE SHOWCASE                  │  │
│  │     @curator           │  │  │ [🏛️ Curator] [-placeholder-]        │  │
│  └────────────────────────┘  │  └────────────────────────────────────┘  │
│  [❤️]  [🏛️]  [⚙️]              │  ┌────────────────────────────────────┐  │
│                              │  │ 🌐 ATLAS SHOWCASE                  │  │
│  ┌────────────────────────┐  │  │ [🌐 myatlas] [-placeholder-]        │  │
│  │  Curator Bio Details   │  │  └────────────────────────────────────┘  │
│  │  Local Curator Badge   │  │  ┌────────────────────────────────────┐  │
│  └────────────────────────┘  │  │ 🖼️ POST SHOWCASE                   │  │
│                              │  │ [-placeholder-] [-placeholder-]    │  │
│                              │  └────────────────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 👤 Left Column System (`.user-profile-left`)

The left sidebar has a fixed width of `320px` containing three primary vertical sections:

### 1. Square Profile Avatar Placeholder (`.user-avatar-square-placeholder`)
- **Dimensions**: 1:1 aspect ratio (`320px × 320px`).
- **Style**: White background, 8px rounded corners, 1px solid `--border-color`, soft drop shadow.
- **Content**: User initials (`C`) and `@curator` handle badge.

### 2. Pure Icon-Only Action Row (`.user-options-row.icon-only-row`)
Horizontally aligned row of pure icon buttons positioned directly beneath the profile avatar:

| Icon | Symbol / Component | Target Action | Tooltip Title |
| :--- | :--- | :--- | :--- |
| **Favorites / MyAtlas** | `<Heart size={18} />` | MyAtlas workspace | `MyAtlas` |
| **Mythological Atlas** | `<MythologicalAtlasIcon size={18} />` | Sub-Atlas domain switcher | `Atlases` |
| **Options** | `<Settings size={18} />` | User settings & preferences | `Options` |

#### 🏛️ Custom Mythological Atlas SVG Specifications:
A custom vector SVG icon depicting Titan Atlas braced on his bent back carrying the celestial sphere/boulder:
- **Celestial Sphere**: Circle at `(15.5, 7.5)` with radius `5.5` and subtle globe grid/equator lines (`opacity="0.6"`).
- **Atlas Figure**: Bent head circle at `(7, 11.5)`, curved strained back/torso path, raised bracing arms (`M 9.5 13 L 13 8.5`), bracing legs, and a solid ground line.

### 3. Bio & Details Box (`.user-bio-giant-textbox`)
- Displays display name (`Curator`), handle (`@curator`), and role badge (`Local Curator`).

---

## 🖼️ Right Column Showcase System (`.user-profile-right`)

1. **Badge Showcase (Top Bar)**: Displays `1 Badge` (`🏛️ Curator`).
2. **Atlas Showcase (Middle Bar)**: Displays `1 Featured` (`🌐 myatlas`).
3. **Post Showcase (Bottom Bar)**: Media item showcase slots.

---

## 🧭 Header Navigation & Responsiveness

- **Header Icon**: Accessible via the user profile icon (`<User size={16} />`) in `Navbar.jsx`.
- **Responsive Layout**: On mobile/narrow viewports (`< 900px`), the layout stacks vertically into a single continuous column (`flex-direction: column`).

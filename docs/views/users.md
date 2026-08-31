# User Profile Specifications (`docs/views/users.md`)

This document defines the layout architecture, visual design system, pure icon navigation row, custom SVG icon specifications, and Steam-inspired showcase bars for the **User Profile Page** (`view === 'users'`).

---

## 🎨 Theme & Visual Design System

The User Profile page fully adheres to the application-wide **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Accent Palette**: Claude warm amber orange (`--accent-color: #CC5A01`, hover `#B24D00`, light tint `#FDF5E6`).
- **Typography**: `Lora` serif headings for showcase bar titles paired with `Plus Jakarta Sans` body and button labels. Monospace typography used for numerical counters.
- **Card Design System**: Clean white cards (`--bg-card: #FFFFFF`) with 1px subtle borders (`--border-color: #E6E2D8`), 8px rounded corners, and soft elevation shadows.

---

## 📐 Layout Architecture

The User Profile view uses a two-column responsive flex layout (`.user-profile-container`, max-width `1180px`, centered with `2.5rem` gap):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER PROFILE PAGE                               │
├──────────────────────────────┬──────────────────────────────────────────┤
│           LEFT COLUMN        │               RIGHT COLUMN               │
│            (320px)           │                 (Flex 1)                 │
│                              │                                          │
│  ┌────────────────────────┐  │  ┌────────────────────────────────────┐  │
│  │ [ 1:1 Blank Avatar ]   │  │  │ 🏆 BADGE SHOWCASE                  │  │
│  │     -placeholder-      │  │  │ [-placeholder-] [-placeholder-]    │  │
│  └────────────────────────┘  │  └────────────────────────────────────┘  │
│  [❤️]  [🏛️]  [⚙️]  [🚪]       │  ┌────────────────────────────────────┐  │
│                              │  │ 🌐 ATLAS SHOWCASE                  │  │
│  ┌────────────────────────┐  │  │ [-placeholder-] [-placeholder-]    │  │
│  │                        │  │  └────────────────────────────────────┘  │
│  │     -placeholder-      │  │  ┌────────────────────────────────────┐  │
│  │                        │  │  │ 🖼️ POST SHOWCASE                   │  │
│  └────────────────────────┘  │  │ [-placeholder-] [-placeholder-]    │  │
│                              │  └────────────────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 👤 Left Column System (`.user-profile-left`)

The left sidebar has a fixed width of `320px` containing three primary vertical sections:

### 1. Square Profile Avatar Placeholder (`.user-avatar-square-placeholder`)
- **Dimensions**: 1:1 aspect ratio (`320px × 320px`).
- **Style**: White background, 8px rounded corners, 1px solid `--border-color`, soft drop shadow (`0 2px 8px rgba(30, 29, 27, 0.04)`).
- **Placeholder**: Centered `-placeholder-` text in `--text-tertiary` monospace/sans typography.

### 2. Pure Icon-Only Action Row (`.user-options-row.icon-only-row`)
Horizontally aligned row of four pure icon buttons positioned directly beneath the profile avatar:

| Icon | Symbol / Component | Target Action | Tooltip Title |
| :--- | :--- | :--- | :--- |
| **Favorites / MyAtlas** | `<Heart size={18} />` | Navigate to user favorites / MyAtlas scope | `MyAtlas` |
| **Mythological Atlas** | `<MythologicalAtlasIcon size={18} />` | Sub-Atlas domain switcher | `Atlases` |
| **Options** | `<Settings size={18} />` | User settings & preferences | `Options` |
| **Log Out** | `<LogOut size={18} />` | Session logout trigger | `Log Out` |

#### 🏛️ Custom Mythological Atlas SVG Specifications:
A custom vector SVG icon depicting Titan Atlas braced on his bent back carrying the celestial sphere/boulder:
- **Celestial Sphere**: Circle at `(15.5, 7.5)` with radius `5.5` and subtle globe grid/equator lines (`opacity="0.6"`).
- **Atlas Figure**: Bent head circle at `(7, 11.5)`, curved strained back/torso path, raised bracing arms (`M 9.5 13 L 13 8.5`), bracing legs, and a solid ground line.

### 3. Giant Bio / Text Box Container (`.user-bio-giant-textbox`)
- **Dimensions**: Full width (`320px`), minimum height `240px`.
- **Style**: White background, 8px rounded corners, 1px solid `--border-color`.
- **Content**: Centered `-placeholder-` text with `1.1rem` font size and `0.04em` letter spacing.

---

## 🖼️ Right Column Showcase System (`.user-profile-right`)

The right side features 3 stacked horizontal showcase bars inspired by Steam profile item showcases, adapted to the warm Claude design language:

### 1. Badge Showcase (Top Bar)
- **Header**: Icon `<Award size={16} />`, Lora title `"Badge Showcase"`, counter badge `"0 Badges"`.
- **Grid Layout**: 5 horizontal blank showcase slot cards (`.showcase-blank-card`, height `90px`, 1px dashed border) displaying `-placeholder-`.

### 2. Atlas Showcase (Middle Bar)
- **Header**: Icon `<Globe size={16} />`, Lora title `"Atlas Showcase"`, counter badge `"0 Featured"`.
- **Grid Layout**: 3 wide blank showcase slot cards (`.showcase-wide-card`, height `100px`, 1px dashed border) displaying `-placeholder-`.

### 3. Post Showcase (Bottom Bar)
- **Header**: Icon `<ImageIcon size={16} />`, Lora title `"Post Showcase"`, counter badge `"0 Items"`.
- **Grid Layout**: 4 media showcase slot cards (`.showcase-post-card`, height `120px`, 1px dashed border) displaying `-placeholder-`.

---

## 🧭 Header Navigation & Responsiveness

- **Header Icon**: Accessible via the right-most user profile icon (`<User size={16} />`) in `Navbar.jsx` (`nav-right-group`).
- **Responsive Layout**: On mobile/narrow viewports (`< 900px`), the layout stacks vertically into a single continuous column (`flex-direction: column`).

# Curator Profile Specifications (`docs/views/users.md`)

This document defines the layout architecture, visual design system, action bar, mode switcher with embedded count line dividers, and JEI / NEI high-density item matrix for the **Curator Profile Page** (`view === 'users'`).

---

## 🎨 Theme & Visual Design System

The Curator Profile page fully adheres to the application-wide **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Accent Palette**: Claude warm amber orange (`--accent-color: #CC5A01`, hover `#B24D00`, light tint `#FDF5E6`).
- **Typography**: `Lora` serif headings for user titles paired with `Plus Jakarta Sans` body and button labels. Monospace typography used for numerical counters.
- **Floating Cardless Architecture**:
  - The left sidebar options bar (`.user-action-icons-bar`), bio box (`.user-bio-giant-textbox`), and right grid container (`.jei-card-container`) feature `background: transparent`, `border: none`, and `box-shadow: none`, floating seamlessly on the primary cream page background.
  - The profile picture box (`.user-avatar-square-placeholder`) remains a crisp white card (`--bg-card: #FFFFFF`) with a subtle border (`--border-color: #E6E2D8`), 8px rounded corners, and soft drop shadow.

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
│  │ [ 1:1 Avatar Box ]     │  │  │  🌐    🏆    ✨    👥    👤+       │  │
│  │     @curator           │  │  │ ---1,000---1,000---1,000---1,000---│  │
│  └────────────────────────┘  │  ├────────────────────────────────────┤  │
│   📄   ❤️   ⚙️   🛍️   🚪   │  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │  │
│                              │  │ │🌐│ │💎│ │📺│ │📚│ │🎮│ │🛠️│ │⚡│ │  │
│  ┌────────────────────────┐  │  │ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ │  │
│  │  Curator Bio Details / │  │  │ High-Density Minecraft JEI/NEI Grid│  │
│  │  Selected Item Specs   │  │  ├────────────────────────────────────┤  │
│  └────────────────────────┘  │  │ Showing 1-200 of 1,000  ◄ Page 1 ►  │  │
│                              │  └────────────────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 👤 Left Column System (`.user-profile-left`)

The left sidebar has a fixed width of `320px` containing three vertical sections:

### 1. Square Profile Avatar Box (`.user-avatar-square-placeholder`)
- **Dimensions**: 1:1 aspect ratio (`320px × 320px`).
- **Style**: White background (`--bg-card`), 8px rounded corners, 1px solid `--border-color`, soft drop shadow.
- **Content**: User initials badge (e.g. `C`) and handle badge (e.g. `@curator`), or full-bleed user avatar image if set.

### 2. Action Icons Bar (`.user-action-icons-bar`)
Horizontally aligned row of clean Lucide SVG action icon buttons positioned directly beneath the profile avatar box:

| Icon | Lucide Component | Target Action | Native Tooltip |
| :--- | :--- | :--- | :--- |
| **Posts / Submitted** | `<FileText size={20} />` | Submitted media & posts | `Posts / Submitted` |
| **Favorites** | `<Heart size={20} />` | Favorite media collection | `Favorites` |
| **Settings** | `<Settings size={20} />` | User settings & preferences | `Settings` |
| **Shop** | `<ShoppingBag size={20} />` | Marketplace & shop | `Shop` |
| **Logout** | `<LogOut size={20} />` | End curator session | `Logout` |

- **Style**: Floating transparent background, smooth scale transitions (`scale(1.15)` on hover), dark stroke colors (`--text-secondary` → `--accent-color`), with red highlight on hover for the logout action.

### 3. Bio & Selected Item Details Box (`.user-bio-giant-textbox`)
- **Default State**: Displays user display name (`Curator`), handle (`@curator`), role badge (`Local Curator`), and interaction hint text.
- **Selected State**: When an item is clicked in the right JEI grid, dynamically renders the item's icon/initial, name, rarity/category badge, description, and status/count metadata, along with a clear button (`✕`) to return to default bio view.

---

## 🎮 Right Column JEI / NEI Item Matrix & Mode Switcher (`.user-profile-right`)

The right column houses the high-density inventory grid and category mode navigation:

### 1. 5-Segment Mode Switcher Bar (`.jei-mode-switcher-bar`)
Horizontal tab switcher divided into 5 equal segments (`20%` width each):

| Mode Key | Lucide Icon | Native Title | Item Count | Palette Theme |
| :--- | :--- | :--- | :--- | :--- |
| `atlases` | `<Globe size={26} />` | `Atlases` | 1,000 | Warm Amber / Cyber / Emerald / Violet / Crimson |
| `badges` | `<Award size={26} />` | `Badges` | 1,000 | Gold / Purple / Teal / Rose / Blue |
| `stickers` | `<Sparkles size={26} />` | `Stickers` | 1,000 | Red-Yellow / Violet-Pink / Emerald / Indigo / Amber |
| `followers` | `<UsersIcon size={26} />` | `Followers` | 1,000 | Multi-spectrum curator palettes |
| `following` | `<UserPlus size={26} />` | `Following` | 1,000 | Verified channel color spectrums |

#### Icon-Only & Centered Line Divider Counter Design (`--- 1,000 ---`):
- **Tabs**: Icon-only navigation (text labels removed from the tab row for clean minimal aesthetic; accessible via hover `title` tooltips).
- **Divider Line (`.tab-divider-line`)**: Each tab segment features a centered horizontal divider line spanning across its base.
- **Counter Badge (`.segment-count-badge`)**: Positioned precisely in the horizontal center of the divider line, rendering formatted count strings (e.g. `1,000`).
- **Active State Highlights**: Active tab segment highlights both its icon and line counter with Claude warm amber (`var(--accent-color)` / `#CC5A01`).

### 2. High-Density Slot Grid (`.jei-grid-viewport`)
- **Grid Layout**: Matrix of square slots (`repeat(auto-fill, minmax(46px, 1fr))`, 6px gap).
- **Pagination**: 200 items rendered per page across 5 pages (1,000 total items per mode).
- **Interactivity**: Slot hover zoom (`1.15x`), inset shadow, and custom CSS accent variable glow (`--slot-accent`). Clicking a slot toggles detail inspection in the left bio box.

### 3. Pagination Footer (`.jei-grid-footer`)
- **Status Indicator**: Displays item range (e.g. `Showing 1–200 of 1000 Atlases`).
- **Controls**: `◄ Prev` and `Next ►` buttons with active page indicator (`Page 1 of 5`).

---

## 🧭 Header Navigation & Responsiveness

- **Navbar Integration**: Accessible via the user profile icon (`<User size={16} />`) in `Navbar.jsx`.
- **Zero Scrollbar Fit**: Optimized height calculations ensure the view fills available viewport space without creating outer body scrollbars.
- **Responsive Layout**: On viewports `< 900px`, layout automatically stacks vertically into a single column (`flex-direction: column`).


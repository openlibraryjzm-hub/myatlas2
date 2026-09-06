# Curator Profile Specifications (`docs/views/users.md`)

This document defines the layout architecture, visual design system, action bar, mode switcher with embedded count line dividers, and JEI / NEI high-density item matrix for the **Curator Profile Page** (`view === 'users'`).

---

## 🎨 Theme & Visual Design System

The Curator Profile page fully adheres to the application-wide **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Accent Palette**: Claude warm amber orange (`--accent-color: #CC5A01`, hover `#B24D00`, light tint `#FDF5E6`).
- **Typography**: `Lora` serif headings for user titles paired with `Plus Jakarta Sans` body and button labels. Monospace typography used for numerical counters.
- **Floating Cardless Architecture**:
  - The left sidebar profile card (`.twitter-profile-card`), Gelbooru account links stack (`.user-action-vertical-stack`), and right grid container (`.jei-card-container`) feature `background: transparent`, `border: none`, and `box-shadow: none`, floating seamlessly on the primary cream page background (`#FBFAF7`).
  - The cover banner (`.twitter-card-banner`) features a warm amber gradient with rounded corners (`10px`), while the circular profile picture (`.twitter-avatar-circle`) uses a 3px ring matching the primary page background (`--bg-primary`).

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
│  │ [COVER BANNER ~80px]   │  │  │  🌐    💬    🏆    ✨    👥       │  │
│  │ (👤)  Curator @curator │  │  │ ---ATLAS--FORUMS-BADGES-LINKS-FRIENDS │  │
│  │ "Short curator bio..." │  │  ├────────────────────────────────────┤  │
│  │ 📅Joined 👥1,000 Friends│  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │  │
│  └────────────────────────┘  │  │ │🌐│ │💎│ │📺│ │📚│ │🎮│ │🛠️│ │⚡│ │  │
│  │ 📄 Posts / Submitted   │  │  │ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ │  │
│  │ ❤️ Favorites          │  │  │ High-Density Minecraft JEI/NEI Grid│  │
│  │ 🛍️ Curator Shop        │  │  │ [ 💬 Floating Rich Hover Tooltip ] │  │
│  └────────────────────────┘  │  ├────────────────────────────────────┤  │
│                              │  │ Showing 1-200 of 1,000  ◄ Page 1 ►  │  │
│                              │  └────────────────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 👤 Left Column System (`.user-profile-left`)

### 1. Twitter / X Style Curator Profile Card (`.twitter-profile-card`)
- **Dimensions**: Strictly bounded within the 320px left column.
- **Style**: Floating cardless layout on page background (`background: transparent`, `border: none`, `box-shadow: none`).
- **Content**:
  - **Cover Banner**: Warm amber gradient cover banner (`height: 80px`).
  - **Overlapping Avatar Circle**: 60px circular avatar with a 3px border ring, overlapping 50% of the banner bottom edge (`margin-top: -30px`).
  - **User Identity**: Display name (`Curator`) and handle badge (`@curator`).
  - **Short Bio Snippet**: 1–2 line curator bio snippet.
  - **Joined Date & Inline Friends Counter**: `<Calendar size={13} /> Joined Sep 2026` aligned horizontally on the same line with **`1,000 Friends`**.

### 2. Gelbooru-Style Account Links & Descriptions (`.user-action-vertical-stack`)
Vertically stacked list of Gelbooru-inspired hyperlink titles with accompanying description text:

| Hyperlink Title | Lucide Icon | Accompanying Description Text |
| :--- | :--- | :--- |
| **Posts / Submitted** | `<FileText size={14} />` | View your uploaded local media, scrapes, and tagged posts across your hard drive archive. |
| **My Favorites** | `<Heart size={14} />` | View a condensed list of all your favorited photos and videos on your local atlas. |
| **Curator Shop** | `<ShoppingBag size={14} />` | Browse Valve hardware, custom 3D printed accessories, and handmade add-ons crafted by yours truly. |
| **Saved Searches** | `<Bookmark size={14} />` | All of the tag searches you have bookmarked on your atlas in a single area. |
| **Options & Blacklists** | `<SlidersHorizontal size={14} />` | Account options such as tag blacklists, auto-tagging rules, and SQLite cache preferences. |
| **Logout** | `<LogOut size={14} />` | End your active curator session and clear authentication cookies for this account. |

- **Style**: Floating cardless layout directly on the page background (`background: transparent`, `border: none`, `box-shadow: none`), featuring amber links (`var(--accent-color)`), red hover accent for Logout (`#EF4444`), hover underline effect, and compact secondary descriptions (`--text-secondary`).

---

## 💬 Floating JEI Hover Tooltip System (`.jei-hover-tooltip`)
- **Trigger**: Mouse hover over any grid slot in the 1,000-item matrix.
- **Positioning**: Fixed position following mouse coordinates with boundary-clamp prevention (`Math.min(x, window.innerWidth - 260)`).
- **Contents**: Item icon/initial badge, item title, category/rarity pill badge, description, and item statistics/status.

---

## 🎮 Right Column JEI / NEI Item Matrix & Mode Switcher (`.user-profile-right`)

The right column houses the category mode navigation and high-density inventory grid / bio editor viewport:

### 1. 5-Segment Single-Row Mode Switcher Bar (`.jei-mode-switcher-bar`)
Tab switcher arranged in a single horizontal row (`20%` width per segment):

| Mode Key | Lucide Icon | Native Title | Line Divider Badge | Viewport Content |
| :--- | :--- | :--- | :--- | :--- |
| `atlases` | `<Globe size={26} />` | `Atlases` | `ATLAS` | 46px High-Density Item Slot Grid |
| `forums` | `<MessageSquare size={26} />` | `Forums` | `FORUMS` | 46px Forum Thread Slot Grid |
| `badges` | `<Award size={26} />` | `Badges` | `BADGES` | 46px High-Density Item Slot Grid |
| `stickers` | `<Sparkles size={26} />` | `Stickers` | `LINKS` | 46px High-Density Item Slot Grid |
| `followers` | `<UsersIcon size={26} />` | `Friends & Network` | `FRIENDS` | 46px Unified Friends Slot Grid |

#### Icon-Only & Centered Line Divider Badge Design (`--- ATLAS ---` / `--- FRIENDS ---`):
- **Tabs**: Icon-only navigation (text labels accessible via hover `title` tooltips).
- **Divider Line (`.tab-divider-line`)**: Centered horizontal line with custom text badge (`ATLAS`, `FORUMS`, `BADGES`, `LINKS`, `FRIENDS`).
- **Active State Highlights**: Active tab segment highlights both its icon and line badge with Claude warm amber (`var(--accent-color)` / `#CC5A01`).

### 2. High-Density Slot Grid (`.jei-grid-viewport`)
- Rendered for all 5 item modes (`atlases`, `forums`, `badges`, `stickers`, `followers`).
- **Grid Layout**: Matrix of square slots (`repeat(auto-fill, minmax(46px, 1fr))`, 6px gap).
- **Pagination**: 200 items rendered per page across 5 pages (1,000 total items per mode).

### 3. Pagination Footer (`.jei-grid-footer`)
- **Status Indicator**: Displays item range (e.g. `Showing 1–200 of 1000 Atlases`).
- **Controls**: `◄ Prev` and `Next ►` buttons with active page indicator (`Page 1 of 5`).

---

## 🧭 Header Navigation & Responsiveness

- **Navbar Integration**: Accessible via the user profile icon (`<User size={16} />`) in `Navbar.jsx`.
- **Zero Scrollbar Fit**: Optimized height calculations ensure the view fills available viewport space without creating outer body scrollbars.
- **Responsive Layout**: On viewports `< 900px`, layout automatically stacks vertically into a single column (`flex-direction: column`).


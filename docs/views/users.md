# Curator Profile Specifications (`docs/views/users.md`)

This document defines the layout architecture, visual design system, action bar, mode switcher with embedded count line dividers, and JEI / NEI high-density item matrix for the **Curator Profile Page** (`view === 'users'`).

---

## 🎨 Theme & Visual Design System

The Curator Profile page fully adheres to the application-wide **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Accent Palette**: Claude warm amber orange (`--accent-color: #CC5A01`, hover `#B24D00`, light tint `#FDF5E6`).
- **Typography**: `Lora` serif headings for user titles paired with `Plus Jakarta Sans` body and button labels. Monospace typography used for numerical counters.
- **Floating Cardless Architecture**:
  - The left column orb showcase card (`.orb-showcase-card`) and right grid container (`.jei-card-container`) feature `background: transparent`, `border: none`, and `box-shadow: none`, floating seamlessly on the primary cream page background (`#FBFAF7`).
  - Highlights the centerpiece 160px 2.5D Orb Avatar (`PopOutAvatar.jsx`) with customizable orb accent colors (`#CC5A01`), ring stroke thickness, outer glow, image positioning, and 4-quadrant pop-out overlays.

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
│  │ 🔮 160px 2.5D Orb Stage│  │  │  🌐    💬    🏆    ✨    👥       │  │
│  │    (Click to Config)   │  │  │ ---ATLAS--FORUMS-BADGES-LINKS-FRIENDS │  │
│  │    Curator @curator    │  │  ├────────────────────────────────────┤  │
│  │ [✨ Configure Avatar]  │  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │  │
│  └────────────────────────┘  │  │ │🌐│ │💎│ │📺│ │📚│ │🎮│ │🛠️│ │⚡│ │  │
│                              │  │ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ │  │
│                              │  │ High-Density Minecraft JEI/NEI Grid│  │
│                              │  │ [ 💬 Floating Rich Hover Tooltip ] │  │
│                              │  ├────────────────────────────────────┤  │
│                              │  │ Showing 1-200 of 1,000  ◄ Page 1 ►  │  │
│                              │  └────────────────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 👤 Left Column System (`.user-profile-left`)

### 1. Minimalist 2.5D Orb Showcase Card (`.orb-showcase-card`)
- **Dimensions**: Centered within the 320px left column.
- **Interactive Stage**: Houses a prominent **160px 2.5D Pop-Out Avatar** (`<PopOutAvatar size={160} config={avatarConfig} />`).
- **Trigger**: Clicking either the avatar stage (`.orb-avatar-stage`) or the `"Configure Avatar"` action button (`.configure-avatar-btn`) launches the **Pop-Out Avatar Configurator Modal** (`PopOutAvatarConfigModal.jsx`).
- **User Identity**: Display name (`Curator`) rendered in `Lora` serif heading style alongside the handle badge (`@curator`).
- **Action Button**: `<Sparkles size={14} /> Configure Avatar` pill button featuring warm amber hover transitions.

### 2. Avatar Configurator Modal Workflow (`PopOutAvatarConfigModal.jsx`)
When triggered from the Curator Profile page, the modal overlay enables live customization:
- **340px Interactive Studio Stage**: Renders `<PopOutAvatar size={340} config={config} />` updating in real-time as controls adjust.
- **Image Source**: URL text input field and local file uploader (`FileReader` base64 Data URL conversion).
- **Scale & Aspect Fit**: Continuous slider (`0.5x` to `2.5x`) and `contain` vs `cover` aspect fit toggle.
- **XY Shift Sliders**: Horizontal & Vertical position shift controls (`-40%` to `+40%`).
- **4-Quadrant Pop-Out Matrix**: 2×2 toggle grid (`topLeft`, `topRight`, `bottomLeft`, `bottomRight`) controlling extended clip paths (`-400%` to `+500%`).
- **Orb Styling**: Color palette swatches + native color picker, border stroke thickness (`2px` to `12px`), and outer glow shadow toggle.
- **State Persistence**: Saving writes to `localStorage` key `myatlas_popout_avatar_config` and broadcasts custom window event `myatlas_avatar_changed` to update all active views synchronously.

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


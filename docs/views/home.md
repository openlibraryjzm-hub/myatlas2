# Home View Specifications (`docs/views/home.md`)

This document defines the specifications, layout metrics, interactive state machine, and minimalist typography for the **Home Page** view (`view === 'home'`).

---

## 🎨 Dynamic Atlas Branding & Layout

- **Header Hiding**: On the home page (`view === 'home'`), the global sticky navbar (`Navbar.jsx`) is hidden entirely.
- **Dynamic Atlas Title (Option A Word-Splitting)**:
  - Renders `<h1 className="home-title">` dynamically based on `activeAtlasDetails.title` (e.g. *"my atlas"*, *"youtube atlas"*, *"amber atlas"*).
  - **Multi-Word Titles** (e.g. *"youtube atlas"*): The first word (`youtube`) is highlighted in the active atlas's `--accent-color` (`#EF4444`), while `"atlas"` renders in standard dark heading text.
- **Atlas Isolated Post Counter Subtitle**:
  - Positioned directly beneath the main title (e.g. `1,525 >`).
  - Displays the total count of indexed items **strictly for the active atlas**.
  - Clicking the numeric counter transitions directly to the Browse Grid view (`view = 'posts'`).
- **Dynamic Theme Accent Palette**: Injects `--accent-color` into CSS variables on document root (`document.documentElement`), re-skinning buttons, caret borders, and accents to match the active atlas theme.

---

## 🔍 Minimalist Search Input

- **Blinking Caret Input**: Centered search input container with an active blinking cursor caret (`autoFocus`).
- **No Pre-Typed Text**: No greyed-out placeholder strings or pre-typed suggestions in the input field to preserve maximum minimalist clarity.
- **Keyboard Submission**: Pressing `Enter` triggers tag/keyword search and navigates directly to the Browse Grid view (`view = 'posts'`).

---

## 🏛️ Fixed 5 Sub-Atlas Options Row

Centered below the search input, a spatially fixed row of 5 tactile sub-atlas switcher links renders high-resolution transparent PNG/WebP graphics or custom vector icons stacked above monospace text labels (`34px × 34px`):

1. **myatlas** (`myatlas`): `/aesthetic-value-of-vintage-keys-free-png.webp` — Accent: `#CC5A01`
2. **Amber** (`amberatlas`): `/bernstein-261133_1280.png` — Accent: `#D97706`
3. **Youtube** (`youtubeatlas`): `/pngtree-a-straight-shot-of-a-realistic-eighties-crt-television-set-png-image_19729924.webp` — Accent: `#EF4444`
4. **Shop** (`shopatlas`): Generic Shop Bag vector SVG — Accent: `#8B5CF6`
5. **Support** (`supportatlas`): Generic Support Lifebuoy vector SVG — Accent: `#10B981`

### Navigation Behavior:
- **Atlas Archives (`myatlas`, `amberatlas`, `youtubeatlas`)**: Clicking reskins the active atlas in-place (`currentAtlas`), updating the homepage title, accent colors, post counter, and active text highlight without shifting button positions.
- **Dedicated Standalone Pages (`Shop`, `Support`)**:
  - **Shop**: Clicking navigates directly to the dedicated Shop view (`view = 'shop'`).
  - **Support**: Clicking navigates directly to the dedicated Support view (`view = 'support'`).

---

## 👤 Bottom Centered Prominent 2.5D Pop-Out Avatar Entrance

- **Positioning**: Centered below the 5 sub-atlas option links (`.home-account-container`).
- **Visual Design**: Displays a prominent centerpiece **168px 2.5D Pop-Out Avatar** (`<PopOutAvatar size={168} config={avatarConfig} />`) inside an interactive stage (`.home-avatar-stage`) stacked above the `"Curator Profile"` serif label.
- **Real-Time Synchronization**: Listens for global `myatlas_avatar_changed` custom events on `window`, instantly updating character artwork, orb color, scale, positioning shifts, and 4-quadrant pop-out clipping when edited via the configurator modal.
- **Navigation**: Clicking anywhere on the avatar stage or text label transitions directly to the Curator Profile view (`view === 'users'`).

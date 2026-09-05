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

## 🏛️ Fixed 6 Sub-Atlas Options Row

Centered below the search input, a spatially fixed row of 6 tactile sub-atlas switcher links renders high-resolution transparent PNG/WebP graphics stacked above monospace text labels (`34px × 34px`):

1. **myatlas** (`myatlas`): `/aesthetic-value-of-vintage-keys-free-png.webp` — Accent: `#CC5A01`
2. **Amber** (`amberatlas`): `/bernstein-261133_1280.png` — Accent: `#D97706`
3. **Youtube** (`youtubeatlas`): `/pngtree-a-straight-shot-of-a-realistic-eighties-crt-television-set-png-image_19729924.webp` — Accent: `#EF4444`
4. **Wiki** (`wikiatlas`): `/pngtree-stack-of-books-image-png-image_17810565.png` — Accent: `#4F46E5`
5. **Games** (`gamesatlas`): `/Game-Boy-FL.png` — Accent: `#2563EB`
6. **Tools** (`toolsatlas`): `/pngtree-work-and-repair-tools-png-image_14699823.png` — Accent: `#16A34A`

* Clicking any atlas switcher link transitions `currentAtlas` in-place, reskinning the homepage title, accent colors, post counter, and active text highlight without shifting button positions.

---

## 👤 Bottom Centered Account Button

- Positioned centered below the 6 sub-atlas option links.
- Displays `AccountRingIcon` (`26px`) + `"Account"` text label.
- Clicking transitions to the Curator Profile view (`view === 'users'`).

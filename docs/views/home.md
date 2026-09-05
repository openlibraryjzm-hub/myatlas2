# Home View Specifications (`docs/views/home.md`)

This document defines the specifications, layout metrics, interactive state machine, and minimalist typography for the **Home Page** view (`view === 'home'`).

---

## 🎨 Dynamic Atlas Branding & Layout

- **Header Hiding**: On the home page (`view === 'home'`), the global sticky navbar (`Navbar.jsx`) is hidden entirely.
- **Dynamic Atlas Title (Option A Word-Splitting)**:
  - Renders `<h1 className="home-title">` dynamically based on `activeAtlasDetails.title`.
  - **Multi-Word Titles** (e.g. *"Space & Astronomy Archive"*): The first word is highlighted in the active atlas's `--accent-color`, while remaining words render in standard dark heading text.
  - **Single-Word Titles** (e.g. *"Military"*): The entire word is highlighted in the active `--accent-color`.
- **Dynamic Theme Accent Palette**: Injects `--accent-color` into CSS variables on document root (`document.documentElement`), re-skinning buttons and accents to match the active atlas theme.

---

## 🔍 Minimalist Search Input

- **Blinking Caret Input**: Centered search input container with an active blinking cursor caret (`autoFocus`).
- **No Pre-Typed Text**: No greyed-out placeholder strings or pre-typed suggestions in the input field to preserve maximum minimalist clarity.
- **Keyboard Submission**: Pressing `Enter` triggers tag/keyword search and navigates directly to the Browse Grid view (`view = 'posts'`).

---

## 🖼️ Option Quick-Links Bar

Centered below the search input, a row of 6 tactile option quick-links renders high-resolution transparent PNG/WebP graphics stacked above monospace text labels (`34px × 34px`):

1. **Amber**: `/bernstein-261133_1280.png` — Triggers `amber` tag search.
2. **Youtube**: `/pngtree-a-straight-shot-of-a-realistic-eighties-crt-television-set-png-image_19729924.webp` — Triggers `youtube` tag search.
3. **Wiki**: `/pngtree-stack-of-books-image-png-image_17810565.png` — Triggers `wiki` tag search.
4. **Games**: `/Game-Boy-FL.png` — Triggers `games` tag search.
5. **Tools**: `/pngtree-work-and-repair-tools-png-image_14699823.png` — Triggers `tools` tag search.
6. **Account**: `AccountRingIcon` — Switches view context to Curator Profile (`view = 'users'`).

---

## 📊 Atlas Isolated Post Counter

- **Atlas Scoped Count**: Displays the total count of indexed items **strictly for the active atlas** (e.g. `1,525` for `myatlas`).
- **Hover Transition**: Hovering over the counter reveals a smooth sliding `>` arrow text indicator styled in the atlas accent color.
- **Navigation**: Clicking the numeric counter transitions the user directly to the Browse Grid view (`view = 'posts'`).

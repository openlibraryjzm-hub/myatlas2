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

## 📊 Atlas Isolated Post Counter

- **Atlas Scoped Count**: Displays the total count of indexed items **strictly for the active atlas** (e.g. `1,525` for `myatlas`).
- **Hover Transition**: Hovering over the counter reveals a smooth sliding `>` arrow text indicator styled in the atlas accent color.
- **Navigation**: Clicking the numeric counter transitions the user directly to the Browse Grid view (`view = 'posts'`).

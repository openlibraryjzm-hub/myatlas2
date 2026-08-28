# Home View Specifications (`docs/views/home.md`)

This document defines the specifications, layout metrics, interactive state machine, and minimalist typography for the **Home Page** view (`view === 'home'`).

---

## 🎨 Layout & Header Integration

- **Header Hiding**: On the home page (`view === 'home'`), the global sticky navbar (`Navbar.jsx`) is hidden entirely.
- **Centered Typography**: Renders a large centered brand title (`myatlas`) styled in Lora serif and Plus Jakarta Sans.
- **Options Bar**: Positioned directly underneath the main title, displaying minimal quick links (e.g. `Manifesto`).

---

## 🔍 Minimalist Search Input

- **Blinking Caret Input**: Centered search input container with an active blinking cursor caret (`autoFocus`).
- **No Pre-Typed Text**: No greyed-out placeholder strings or pre-typed suggestions in the input field to preserve maximum minimalist clarity.
- **Keyboard Submission**: Pressing `Enter` triggers tag/keyword search and navigates directly to the Browse Grid view (`view = 'posts'`).

---

## 📊 Plain Numeric Post Counter

- **Numeric Metric Display**: Displays the total count of indexed local items at the bottom of the home screen as a **plain number** (e.g. `596` or `0`).
- **Hover Transition**: Hovering over the counter reveals a smooth sliding `>` arrow text indicator.
- **Navigation**: Clicking the numeric counter transitions the user directly to the Browse Grid view (`view = 'posts'`).

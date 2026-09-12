# Support View Specifications (`docs/views/support.md`)

This document defines the specifications, split 2-column layout, Amberlyn portrait video player, extra-large pop-out circular icons, avatar image mappings, and category link stacks for the **Support & Community** view (`view === 'support'`).

---

## 🏛️ Overview & Navigation Routing

- **View Identifier**: `view === 'support'` in `App.jsx`.
- **Top Navbar Integration**: Displays the sticky global navigation header (`Navbar.jsx`). Clicking the top logo returns directly to the Home page (`view = 'home'`).
- **Layout Architecture**: Uses a responsive 2-column grid layout (`grid-template-columns: 1fr 380px` on desktop, wrapping to single column at `< 900px`).

---

## 📹 Meet Amberlyn! Portrait Video Player (`.amberlyn-card`)

Positioned sticky in the right column (`position: sticky`, `top: 5.5rem`):

- **Spokesperson Card Header**: Displays title *"Meet Amberlyn!"* with a gold sparkle icon (`#F59E0B`) and subtitle *"Official MyAtlas Spokesperson"*.
- **9:16 Aspect Ratio Video Container**: Hosts `/grok-video-fd9de787-7c19-4bb6-8c15-8cb10d0817e8.mp4` with `autoPlay loop muted playsInline` inside a 9:16 portrait video element (`object-fit: cover`).
- **Interactive Audio Overlay (`.amberlyn-audio-btn`)**: Overlaid in the bottom right corner with glassmorphism styling (`backdrop-filter: blur(8px)`, `background: rgba(17,24,39,0.75)`). Clicking toggles video sound between `Muted` and `Unmute`.

---

## 🔘 Extra-Large Circular Pop-Out Card Icons (`.support-link-icon-box`)

All link cards feature tactile circular pop-out icon badges designed to overtake the card box height:

- **Dimensions**: Fixed **82px × 82px** circular badges (`border-radius: 50%`).
- **Positioning**: Positioned absolutely (`left: -28px`, `top: 50%`, `transform: translateY(-50%)`) so they extend beyond the left edge and vertical height of the horizontal card container (`min-height: 86px`, `padding-left: 5.5rem`).
- **Border & Shadow**: Encased in a 4px solid container background border (`border: 4px solid var(--card-bg)`) with a deep drop shadow (`box-shadow: 0 8px 22px rgba(0,0,0,0.18)`).
- **Hover Animation**: Hovering scales the icon badge to `1.08` with an expanded shadow (`box-shadow: 0 12px 28px rgba(0,0,0,0.25)`).

---

## 🖼️ Social Avatar Image Mappings

Avatar image elements fill the 82px circular badge (`width: 100%`, `height: 100%`, `object-fit: cover`, `border-radius: 50%`):

1. **YouTube Channel** (`.youtube-avatar-img`): `/brain-topics.jpg` — `object-position: center`.
2. **Discord Community** (`.discord-avatar-img`): `/vlcsnap-2026-09-12-11h50m30s905.png` — `object-position: center`.
3. **Twitter / X** (`.twitter-avatar-img`): `/Screenshot_20260902_174819_Gallery.jpg` — Fine-tuned to `object-position: center 37.5%` for precise vertical subject framing within the circle.

---

## 📚 Link Stack Categories (Left Column)

Organized into 3 distinct sections (top to bottom):

### 1. Join the Community
- **YouTube Channel**: `/brain-topics.jpg` avatar — Accent: `#FF0000`.
- **Discord Community**: `/vlcsnap-2026-09-12-11h50m30s905.png` avatar — Accent: `#5865F2`.
- **Twitter / X**: `/Screenshot_20260902_174819_Gallery.jpg` avatar — Accent: `#1DA1F2`.

### 2. Support Development
- **Patreon Supporter**: Heart icon — Accent: `#FF424D`.
- **Buy Me a Coffee**: Coffee icon — Accent: `#D97706`.

### 3. Steal the Code
- **GitHub Profile & Repository**: GitHub logo — Accent: `#111827`. Links to open-source repository for forking, C# sidecar inspection, and pull requests.

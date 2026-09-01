# Atlas Settings & Moderation Specifications (`docs/views/atlas_management.md`)

This document defines the layout architecture, visual design system, Owner Litmus Test card mechanics, live theme preview banner, and header integration for the **Atlas Settings & Moderation Studio** (`view === 'atlas-settings'`).

---

## 🎨 Visual Design System & Aesthetic

The Atlas Settings page adheres strictly to the **Claude.ai visual aesthetic**:
- **Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`).
- **Card Container**: White card (`--bg-card: #FFFFFF`) with 1px border (`--border-color: #E6E2D8`), 12px rounded corners, and soft elevation shadow (`0 4px 24px rgba(30, 29, 27, 0.05)`).
- **Typography**: Lora serif headings paired with Plus Jakarta Sans labels and Monospace typography for route slugs (`atlasnetwork.org/<slug>`).

---

## 📐 Component Architecture

The Atlas Management view centers a single responsive studio card (`.as-settings-card`, max-width `640px`):

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ ATLAS SETTINGS & MODERATION STUDIO                       │
│    atlasnetwork.org/space                                   │
├─────────────────────────────────────────────────────────────┤
│  👑 OWNER RECOGNITION CARD (LITMUS TEST)                   │
│  "Owner & Primary Moderator (Full Management Access)"       │
├─────────────────────────────────────────────────────────────┤
│  🌐 LIVE LOGO PREVIEW BANNER                                │
│  [ Space Archive ] (Warm Amber #CC5A01)                     │
├─────────────────────────────────────────────────────────────┤
│  FORM CONTROLS                                              │
│  • Display Title:     [ Space & Astronomy Archive         ] │
│  • Description:       [ Media and booru tags for space... ] │
│  • Theme Palette:     [ Warm Amber ] [ Sky Blue ] [ Teal ]  │
│                       [ Cancel ]  [ Save Settings ]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Owner Recognition Litmus Test Mechanics

Ownership recognition determines whether management controls are active or locked based on `currentUser`:

```javascript
const isOwner = currentUser && (
  (activeAtlasDetails.ownerUserId && currentUser.id === activeAtlasDetails.ownerUserId) ||
  (currentUser.username && currentUser.username.toLowerCase() === activeAtlasDetails.ownerUsername?.toLowerCase()) ||
  (currentAtlas === 'myatlas' && currentUser.username === 'curator')
);
```

### 1. Logged In as Owner (`isOwner === true`)
- **Badge**: `👑 Owner & Primary Moderator (Full Management Access)` illuminated in active theme accent color (`.as-litmus-card.is-owner`).
- **Controls**: Inputs for Display Title, Description, and Accent Color Palette are fully interactive.
- **Save Action**: Displays active **"Save Settings"** button (`.as-save-btn`).

### 2. Logged In as Non-Owner (`isOwner === false`)
- **Badge**: `👤 Member Access Only` displayed with subtle border (`.as-litmus-card.is-member`).
- **Description**: Displays *"This Sub-Atlas is owned and moderated by @ownerUsername. Management settings are read-only."*
- **Controls**: Form inputs are disabled with clear lock icons (`<Lock size={12} />`).
- **Save Action**: Save button is hidden.

---

## 🎨 Live Logo Preview Banner (`.as-preview-banner`)

Renders a live preview of Option A dynamic logo word-splitting using `renderDynamicTitle(title, accentColor)`:
- The first word of the display title highlights in the chosen accent color (`accentColor`).
- Additional words render in standard text.

---

## 🧭 Header Navigation & Gear Control (`Navbar.jsx`)

- **Header Gear Button**: Renders a discreet `<Settings size={15} />` gear button right next to the active sub-atlas pill (`atlasnetwork.org/<slug>`) in the sticky top header.
- **Hover Label**: Displays `atlas settings & moderation`.
- **Navigation Route**: Clicking the gear button sets `view = 'atlas-settings'`.

---

## 📄 Related Documentation
- [Account & Authentication Backend Engine](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/accountbackend.md)
- [Sub-Atlas System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/sub_atlases.md)
- [User Profile Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/users.md)
- [Browse Grid & Left Sidebar Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)

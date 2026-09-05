# Shop Atlases Page Specifications (`docs/views/shop.md`)

This document defines the technical specifications, layout metrics, Super Smash Bros. Ultimate Character Select Screen (CSS) 13x6 roster grid, 310px doubled bottom showcase previewer, zero-scroll viewport budget, and interactive state machine for the **Shop Atlases Page** (`view === 'shop'`).

---

## 🎨 Super Smash Bros. Ultimate Character Select Screen (CSS) Architecture

The Shop Atlases page accurately replicates the layout architecture of the **Super Smash Bros. Ultimate Character Select Screen**:
- **Zero-Scroll Viewport (`100vh`)**: Fixed viewport height (`height: 100vh; overflow: hidden;`) with 0px vertical scrolling.
- **Navbar Hiding Rule**: Global sticky header (`Navbar.jsx`) and app footer are hidden on `view === 'shop'`.
- **Top Header Bar**:
  - **Large Back Arrow**: Navigates directly back to the Home page (`view === 'home'`).
  - **Large Preset Dropdown Selector**: Custom styled dropdown selector displaying active preset configuration (default: `"Default"`).
  - **Shop Atlases Badge**: Monospace accent badge indicating active view context.

---

## 🕹️ Roster Grid (13 Columns × 6 Rows = 78 Slots)

The roster grid is formatted into an authentic 13-column × 6-row grid (`grid-template-columns: repeat(13, 1fr)`):
- **78 Total Slots**:
  - **17 Defined Active Shop Atlases**: Featuring representative background imagery, custom vector/emoji icon badges, and title text overlaid on a dark gradient band at the bottom.
  - **61 Placeholder Slots**: Locked slots displaying `-placeholder-` monospace text and lock icons.
- **Dynamic Title Typography Sizing**:
  - `.size-short` ($\le 6$ chars, e.g., *Tools*, *Media*, *Learn*, *Print*): Enlarged to `1.08rem` with `font-weight: 900` to fill slot width without wrapping.
  - `.size-medium` ($7 - 11$ chars, e.g., *Minecraft*, *Nexus Mods*): Set to `0.88rem`.
  - `.size-long` ($\ge 12$ chars, e.g., *Steam Workshop*, *Team Fortress 2*): Scaled to `0.75rem` with compact `1.02` line-height for clean 2-line stacking.
  - **High-Contrast Text Stroke**: `-1.5px` outer text shadow outline ensures maximum legibility over background imagery.
- **Active Slot Hover Feedback**:
  - Elevates card depth (`transform: scale(1.12)`).
  - Ignites active accent color border outline (`border-color: var(--accent-color)`).
  - Elevates z-index above neighboring slots.

---

## 📋 Defined 17 Shop Atlas Domains

1. **Tools** (`shop:tools`, `#2563EB`): Software, Web Utilities & Desktop Apps (Toolfolio style).
2. **Addons** (`shop:addons`, `#7C3AED`): Plugins & extensions for Blender, Unity, Unreal Engine & VSCode.
3. **Assets** (`shop:assets`, `#06B6D4`): 3D Models, PBR Textures, HDRI maps, poly meshes & SFX.
4. **Media** (`shop:media`, `#F97316`): Cinematic stock footage, royalty-free music & vector graphics.
5. **Deals** (`shop:deals`, `#EF4444`): Exclusive discount codes, software bundle offers & price drops.
6. **Learn** (`shop:learn`, `#10B981`): Interactive masterclasses, video courses & skill workshops.
7. **Print** (`shop:print`, `#0D9488`): 3D print STL files, CAD schematics & printable blueprints.
8. **Steam Workshop** (`shop:steam_workshop`, `#66C0F4`): Steam Workshop collections, community mods & maps.
9. **Nexus Mods** (`shop:nexus_mods`, `#DA8A00`): PC game mods, ENB graphics presets & overhauls.
10. **Minecraft** (`shop:minecraft`, `#16A34A`): Texture packs, RT shaders, player skins & Marketplace items.
11. **Team Fortress 2** (`shop:tf2`, `#D97706`): Mann Co. Store cosmetics, unusual hats, taunts & keys.
12. **Overwatch** (`shop:overwatch`, `#F59E0B`): Hero legendary skins, victory poses & Battle Passes.
13. **Marvel Rivals** (`shop:marvel_rivals`, `#8B5CF6`): Multiverse character skins, emotes & hero gear.
14. **Roblox** (`shop:roblox`, `#E11D48`): Avatar UGC cosmetics, clothing items & gamepasses.
15. **Fallout 76** (`shop:fallout76`, `#EAB308`): Atomic Shop C.A.M.P. decor, power armor skins & Vault items.
16. **Halo Infinite** (`shop:halo_infinite`, `#15803D`): Spartan armor coatings, visor colors & customization.
17. **League of Legends** (`shop:league`, `#2563EB`): Champion skins, Hextech chests, chromas & passes.

---

## 📺 Bottom Showcase Previewer Section

The bottom section replicates the Smash Ultimate player selection preview showcase:
- **Height**: Doubled to `310px` for prominent visual impact.
- **Portrait Box**: `280px × 260px` prominent item portrait frame with a `38px` circular badge overlay.
- **Details Box**: Domain category tag, large `2rem` title, subtitle, and detailed domain description.
- **Action CTA**: **ENTER ATLAS** button in the domain's signature accent color. Clicking navigates directly to the Browse Grid view (`view = 'posts'`) filtered by that shop domain tag.

---

## 🖼️ Custom Local Image Overrides (`public/shop/`)

Users can supply their own custom high-resolution cover images for any Shop item by dropping files into `public/shop/`.

- **Supported Formats & Naming Variants**: `<id>2.jpg`, `<id>2.png`, `<id>.jpg`, `<id>.png`, `<id>.jpeg`, `<id>.webp` (e.g., `tools2.jpg`, `minecraft.jpg`, `tf2.webp`).
- **Resolution Order**: The system automatically checks for local files in `public/shop/` first before falling back to the default remote Unsplash image.

---

## 📄 Related Documentation
- [Sub-Atlas System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/sub_atlases.md)
- [System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/architecture.md)
- [Home View Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/home.md)
- [Browse Grid Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/grid.md)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_TIMESTAMP = '2026-08-16_13-15-00';
const ATLAS_TAG = 'meta:atlas:toolatlas';

const DESIGN_CREATIVE_TOOLS = [
  // UI/UX & Vector Design
  {
    title: "Figma",
    author: "Figma Inc",
    score: 9970,
    url: "https://cdn.simpleicons.org/figma/f24e1e",
    thumbnail: "https://cdn.simpleicons.org/figma/f24e1e",
    permalink: "https://www.figma.com",
    colorTheme: { bg: "#1e1e1e", text: "#f24e1e", accent: "#f24e1e", description: "The collaborative interface design tool powered by real-time cloud editing." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:figma_inc", "design", "ui_ux", "prototyping", "collaborative"]
  },
  {
    title: "Penpot",
    author: "Penpot Team",
    score: 9520,
    url: "https://cdn.simpleicons.org/penpot/000000",
    thumbnail: "https://cdn.simpleicons.org/penpot/000000",
    permalink: "https://penpot.app",
    colorTheme: { bg: "#18181b", text: "#38bdf8", accent: "#38bdf8", description: "The open source design and prototyping tool for cross-domain teams based on SVG." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:penpot_team", "design", "ui_ux", "open_source", "svg"]
  },
  {
    title: "Framer",
    author: "Framer B.V.",
    score: 9780,
    url: "https://cdn.simpleicons.org/framer/0055ff",
    thumbnail: "https://cdn.simpleicons.org/framer/0055ff",
    permalink: "https://www.framer.com",
    colorTheme: { bg: "#0d0d0d", text: "#0055ff", accent: "#0055ff", description: "Design and publish stunning interactive websites with zero code required." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:framer_bv", "website_builder", "design", "prototyping", "interactive"]
  },
  {
    title: "Rive",
    author: "Rive Inc",
    score: 9460,
    url: "https://cdn.simpleicons.org/rive/000000",
    thumbnail: "https://cdn.simpleicons.org/rive/000000",
    permalink: "https://rive.app",
    colorTheme: { bg: "#121216", text: "#a855f7", accent: "#a855f7", description: "Build real-time interactive vector graphics and animations for apps and games." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:animation", "artist:rive_inc", "animation", "vector", "interactive", "games"]
  },
  {
    title: "Spline 3D",
    author: "Spline Inc",
    score: 9610,
    url: "https://cdn.simpleicons.org/spline/000000",
    thumbnail: "https://cdn.simpleicons.org/spline/000000",
    permalink: "https://spline.design",
    colorTheme: { bg: "#0c0d12", text: "#ff3366", accent: "#ff3366", description: "3D design tool in the browser with real-time collaboration and interactive 3D WebGL." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:3d", "artist:spline_inc", "3d", "webgl", "browser_3d", "interactive"]
  },
  {
    title: "Canva",
    author: "Canva",
    score: 9940,
    url: "https://cdn.simpleicons.org/canva/00c4cc",
    thumbnail: "https://cdn.simpleicons.org/canva/00c4cc",
    permalink: "https://www.canva.com",
    colorTheme: { bg: "#0a192f", text: "#00c4cc", accent: "#00c4cc", description: "Online graphic design platform for creating social media graphics and presentations." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:canva", "graphic_design", "templates", "social_media"]
  },
  {
    title: "Sketch",
    author: "Sketch B.V.",
    score: 9380,
    url: "https://cdn.simpleicons.org/sketch/fda100",
    thumbnail: "https://cdn.simpleicons.org/sketch/fda100",
    permalink: "https://www.sketch.com",
    colorTheme: { bg: "#1f1f1f", text: "#fda100", accent: "#fda100", description: "The all-in-one designer toolkit for digital product UI and macOS design systems." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:sketch_bv", "ui_ux", "mac_app", "vector"]
  },

  // Adobe Creative Suite
  {
    title: "Adobe Creative Cloud",
    author: "Adobe Inc",
    score: 9980,
    url: "https://cdn.simpleicons.org/adobe/ff0000",
    thumbnail: "https://cdn.simpleicons.org/adobe/ff0000",
    permalink: "https://www.adobe.com",
    colorTheme: { bg: "#141414", text: "#ff0000", accent: "#ff0000", description: "Industry-standard creative software suite for photography, video, and design." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:adobe_inc", "creative_suite", "graphics", "video"]
  },
  {
    title: "Adobe Photoshop",
    author: "Adobe Inc",
    score: 9960,
    url: "https://cdn.simpleicons.org/adobephotoshop/31a8ff",
    thumbnail: "https://cdn.simpleicons.org/adobephotoshop/31a8ff",
    permalink: "https://www.adobe.com/products/photoshop.html",
    colorTheme: { bg: "#001e36", text: "#31a8ff", accent: "#31a8ff", description: "The world's premier raster graphics editor for photo manipulation and digital art." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:adobe_inc", "photo_editing", "raster", "digital_art"]
  },
  {
    title: "Adobe Illustrator",
    author: "Adobe Inc",
    score: 9940,
    url: "https://cdn.simpleicons.org/adobeillustrator/ff9a00",
    thumbnail: "https://cdn.simpleicons.org/adobeillustrator/ff9a00",
    permalink: "https://www.adobe.com/products/illustrator.html",
    colorTheme: { bg: "#330000", text: "#ff9a00", accent: "#ff9a00", description: "Industry-standard vector graphics software for logos, icons, and illustrations." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:adobe_inc", "vector", "illustration", "logos"]
  },
  {
    title: "Adobe XD",
    author: "Adobe Inc",
    score: 9120,
    url: "https://cdn.simpleicons.org/adobexd/ff61f6",
    thumbnail: "https://cdn.simpleicons.org/adobexd/ff61f6",
    permalink: "https://www.adobe.com/products/xd.html",
    colorTheme: { bg: "#2e001f", text: "#ff61f6", accent: "#ff61f6", description: "Vector-based user experience design tool for web apps and mobile interfaces." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:adobe_inc", "ui_ux", "prototyping", "wireframes"]
  },
  {
    title: "Adobe After Effects",
    author: "Adobe Inc",
    score: 9850,
    url: "https://cdn.simpleicons.org/adobeaftereffects/9999ff",
    thumbnail: "https://cdn.simpleicons.org/adobeaftereffects/9999ff",
    permalink: "https://www.adobe.com/products/aftereffects.html",
    colorTheme: { bg: "#00005c", text: "#9999ff", accent: "#9999ff", description: "Digital visual effects, motion graphics, and compositing software." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:animation", "artist:adobe_inc", "motion_graphics", "vfx", "video"]
  },
  {
    title: "Adobe Premiere Pro",
    author: "Adobe Inc",
    score: 9890,
    url: "https://cdn.simpleicons.org/adobepremierepro/9999ff",
    thumbnail: "https://cdn.simpleicons.org/adobepremierepro/9999ff",
    permalink: "https://www.adobe.com/products/premiere.html",
    colorTheme: { bg: "#00005c", text: "#ea77ff", accent: "#ea77ff", description: "Timeline-based professional video editing software application." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:animation", "artist:adobe_inc", "video_editing", "timeline", "film"]
  },

  // 3D & Animation Engines
  {
    title: "Blender",
    author: "Blender Foundation",
    score: 9950,
    url: "https://cdn.simpleicons.org/blender/e87d0d",
    thumbnail: "https://cdn.simpleicons.org/blender/e87d0d",
    permalink: "https://www.blender.org",
    colorTheme: { bg: "#0d1b2a", text: "#e87d0d", accent: "#e87d0d", description: "Free and open source 3D creation suite for modeling, rigging, rendering, and VFX." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:3d", "artist:blender_foundation", "3d", "modeling", "vfx", "open_source"]
  },
  {
    title: "Cinema 4D",
    author: "Maxon",
    score: 9430,
    url: "https://cdn.simpleicons.org/cinema4d/22579b",
    thumbnail: "https://cdn.simpleicons.org/cinema4d/22579b",
    permalink: "https://www.maxon.net/cinema-4d",
    colorTheme: { bg: "#0c1829", text: "#22579b", accent: "#22579b", description: "Professional 3D modeling, animation, simulation and rendering software solution." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:3d", "artist:maxon", "3d", "motion_graphics", "rendering"]
  },
  {
    title: "Unreal Engine",
    author: "Epic Games",
    score: 9910,
    url: "https://cdn.simpleicons.org/unrealengine/0e1128",
    thumbnail: "https://cdn.simpleicons.org/unrealengine/0e1128",
    permalink: "https://www.unrealengine.com",
    colorTheme: { bg: "#0e1128", text: "#ffffff", accent: "#38bdf8", description: "The world's most open and advanced real-time 3D creation tool for games and film." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:3d", "artist:epic_games", "game_engine", "3d", "realtime"]
  },
  {
    title: "Unity",
    author: "Unity Technologies",
    score: 9880,
    url: "https://cdn.simpleicons.org/unity/000000",
    thumbnail: "https://cdn.simpleicons.org/unity/000000",
    permalink: "https://unity.com",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#000000", description: "Leading platform for creating real-time 2D, 3D, VR, and AR interactive experiences." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:3d", "artist:unity_technologies", "game_engine", "3d", "2d"]
  },
  {
    title: "Three.js",
    author: "Ricardo Cabello",
    score: 9750,
    url: "https://cdn.simpleicons.org/threedotjs/000000",
    thumbnail: "https://cdn.simpleicons.org/threedotjs/000000",
    permalink: "https://threejs.org",
    colorTheme: { bg: "#000000", text: "#ffffff", accent: "#00e5ff", description: "JavaScript 3D library that creates WebGL scenes directly in web browsers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:3d", "artist:ricardo_cabello", "3d", "webgl", "javascript", "open_source"]
  },

  // UI Component Libraries & Design Systems
  {
    title: "Shadcn UI",
    author: "shadcn",
    score: 9920,
    url: "https://cdn.simpleicons.org/shadcnui/000000",
    thumbnail: "https://cdn.simpleicons.org/shadcnui/000000",
    permalink: "https://ui.shadcn.com",
    colorTheme: { bg: "#09090b", text: "#ffffff", accent: "#ffffff", description: "Beautifully designed accessible components that you copy and paste into your React apps." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:shadcn", "components", "react", "tailwind", "open_source"]
  },
  {
    title: "Radix UI",
    author: "WorkOS",
    score: 9680,
    url: "https://cdn.simpleicons.org/radixui/161618",
    thumbnail: "https://cdn.simpleicons.org/radixui/161618",
    permalink: "https://www.radix-ui.com",
    colorTheme: { bg: "#161618", text: "#ffffff", accent: "#705df2", description: "Unstyled, accessible UI component primitives for building high-quality design systems." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:workos", "primitives", "accessibility", "react"]
  },
  {
    title: "Chakra UI",
    author: "Chakra UI Team",
    score: 9540,
    url: "https://cdn.simpleicons.org/chakraui/319795",
    thumbnail: "https://cdn.simpleicons.org/chakraui/319795",
    permalink: "https://chakra-ui.com",
    colorTheme: { bg: "#0d1b2a", text: "#319795", accent: "#319795", description: "Simple, modular and accessible component library that gives you building blocks for React." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:chakra_team", "components", "react", "ui"]
  },
  {
    title: "MUI (Material UI)",
    author: "Material UI Inc",
    score: 9790,
    url: "https://cdn.simpleicons.org/mui/007fff",
    thumbnail: "https://cdn.simpleicons.org/mui/007fff",
    permalink: "https://mui.com",
    colorTheme: { bg: "#0a192f", text: "#007fff", accent: "#007fff", description: "React UI library that implements Google's Material Design system." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:material_ui", "material_design", "react", "components"]
  },
  {
    title: "Storybook",
    author: "Chromatic",
    score: 9710,
    url: "https://cdn.simpleicons.org/storybook/ff4785",
    thumbnail: "https://cdn.simpleicons.org/storybook/ff4785",
    permalink: "https://storybook.js.org",
    colorTheme: { bg: "#1c1422", text: "#ff4785", accent: "#ff4785", description: "Frontend workshop for building UI components and pages in isolation." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:chromatic", "ui_workshop", "testing", "design_systems"]
  },

  // Stock Photos & Media Assets
  {
    title: "Unsplash",
    author: "Getty Images",
    score: 9930,
    url: "https://cdn.simpleicons.org/unsplash/000000",
    thumbnail: "https://cdn.simpleicons.org/unsplash/000000",
    permalink: "https://unsplash.com",
    colorTheme: { bg: "#111111", text: "#ffffff", accent: "#ffffff", description: "Beautiful, free high-resolution photos donated by a community of photographers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:getty_images", "stock_photos", "photography", "media"]
  },
  {
    title: "Pexels",
    author: "Canva",
    score: 9820,
    url: "https://cdn.simpleicons.org/pexels/05a081",
    thumbnail: "https://cdn.simpleicons.org/pexels/05a081",
    permalink: "https://www.pexels.com",
    colorTheme: { bg: "#091a15", text: "#05a081", accent: "#05a081", description: "Free stock photos and royalty free videos shared by talented creators." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:canva", "stock_photos", "stock_videos", "media"]
  },
  {
    title: "LottieFiles",
    author: "Design Barn",
    score: 9640,
    url: "https://cdn.simpleicons.org/lottiefiles/00ddb3",
    thumbnail: "https://cdn.simpleicons.org/lottiefiles/00ddb3",
    permalink: "https://lottiefiles.com",
    colorTheme: { bg: "#061a15", text: "#00ddb3", accent: "#00ddb3", description: "Lightweight vector micro-animations for web and mobile interfaces." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:animation", "artist:design_barn", "lottie", "micro_interactions", "animation"]
  },

  // Icons & Typography
  {
    title: "Lucide Icons",
    author: "Lucide Contributors",
    score: 9870,
    url: "https://cdn.simpleicons.org/lucide/f56565",
    thumbnail: "https://cdn.simpleicons.org/lucide/f56565",
    permalink: "https://lucide.dev",
    colorTheme: { bg: "#1f1111", text: "#f56565", accent: "#f56565", description: "Beautiful & consistent open-source icon suite designed for modern web applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:lucide_contributors", "icons", "svg", "open_source"]
  },
  {
    title: "Font Awesome",
    author: "Fonticons Inc",
    score: 9910,
    url: "https://cdn.simpleicons.org/fontawesome/528dd7",
    thumbnail: "https://cdn.simpleicons.org/fontawesome/528dd7",
    permalink: "https://fontawesome.com",
    colorTheme: { bg: "#0d1b2a", text: "#528dd7", accent: "#528dd7", description: "The internet's icon library and toolkit, used by millions of web developers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:fonticons_inc", "icons", "fonts", "svg"]
  },
  {
    title: "Simple Icons",
    author: "Simple Icons Team",
    score: 9960,
    url: "https://cdn.simpleicons.org/simpleicons/111111",
    thumbnail: "https://cdn.simpleicons.org/simpleicons/111111",
    permalink: "https://simpleicons.org",
    colorTheme: { bg: "#111111", text: "#ffffff", accent: "#38bdf8", description: "Over 3,000 Free SVG brand icons for popular software, developer tools and services." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:simple_icons_team", "icons", "brands", "svg", "open_source"]
  },
  {
    title: "Google Fonts",
    author: "Google",
    score: 9980,
    url: "https://cdn.simpleicons.org/googlefonts/4285f4",
    thumbnail: "https://cdn.simpleicons.org/googlefonts/4285f4",
    permalink: "https://fonts.google.com",
    colorTheme: { bg: "#0d1b2a", text: "#4285f4", accent: "#4285f4", description: "Library of 1,500+ open source font families and API for web typography." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:typography", "artist:google", "fonts", "typography", "web_fonts"]
  },
  {
    title: "Fontshare",
    author: "Indian Type Foundry",
    score: 9610,
    url: "https://cdn.simpleicons.org/fontshare/ff4500",
    thumbnail: "https://cdn.simpleicons.org/fontshare/ff4500",
    permalink: "https://www.fontshare.com",
    colorTheme: { bg: "#1a0b05", text: "#ff4500", accent: "#ff4500", description: "Free font service offering high-quality professional font families for modern design." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:typography", "artist:itf", "fonts", "typography", "design"]
  },

  // Color & Palette Utilities
  {
    title: "Coolors",
    author: "Coolors",
    score: 9750,
    url: "https://cdn.simpleicons.org/coolors/0066ff",
    thumbnail: "https://cdn.simpleicons.org/coolors/0066ff",
    permalink: "https://coolors.co",
    colorTheme: { bg: "#001a40", text: "#0066ff", accent: "#0066ff", description: "Super fast color schemes generator for designers and artists." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:color", "artist:coolors", "color", "palettes", "generator"]
  },

  // Wireframing & Whiteboarding
  {
    title: "Balsamiq",
    author: "Balsamiq Studios",
    score: 9320,
    url: "https://cdn.simpleicons.org/balsamiq/cc0000",
    thumbnail: "https://cdn.simpleicons.org/balsamiq/cc0000",
    permalink: "https://balsamiq.com",
    colorTheme: { bg: "#260000", text: "#cc0000", accent: "#cc0000", description: "Rapid low-fidelity wireframing tool that reproduces the experience of sketching on a whiteboard." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:balsamiq_studios", "wireframing", "sketching", "ui_ux"]
  },
  {
    title: "InVision",
    author: "InVisionApp Inc",
    score: 9280,
    url: "https://cdn.simpleicons.org/invision/ff3366",
    thumbnail: "https://cdn.simpleicons.org/invision/ff3366",
    permalink: "https://www.invisionapp.com",
    colorTheme: { bg: "#260810", text: "#ff3366", accent: "#ff3366", description: "Digital product design platform powering collaborative wireframes and prototypes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:invisionapp", "prototyping", "wireframes", "collaboration"]
  },
  {
    title: "Zeplin",
    author: "Zeplin Inc",
    score: 9350,
    url: "https://cdn.simpleicons.org/zeplin/fba92c",
    thumbnail: "https://cdn.simpleicons.org/zeplin/fba92c",
    permalink: "https://zeplin.io",
    colorTheme: { bg: "#1f1708", text: "#fba92c", accent: "#fba92c", description: "Connected workspace for product teams to hand off designs and export assets to developers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:zeplin_inc", "handoff", "specs", "design_system"]
  },
  {
    title: "Lucidchart",
    author: "Lucid Software",
    score: 9550,
    url: "https://cdn.simpleicons.org/lucidchart/f96b27",
    thumbnail: "https://cdn.simpleicons.org/lucidchart/f96b27",
    permalink: "https://www.lucidchart.com",
    colorTheme: { bg: "#1f0f05", text: "#f96b27", accent: "#f96b27", description: "Diagramming application that allows teams to collaborate on flowcharts and architecture." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:lucid_software", "diagrams", "flowcharts", "architecture"]
  },
  {
    title: "Miro",
    author: "RealtimeBoard Inc",
    score: 9810,
    url: "https://cdn.simpleicons.org/miro/050038",
    thumbnail: "https://cdn.simpleicons.org/miro/050038",
    permalink: "https://miro.com",
    colorTheme: { bg: "#0d0a26", text: "#ffd02f", accent: "#ffd02f", description: "The visual workspace for innovation that enables distributed teams to collaborate." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:realtimeboard", "whiteboard", "diagrams", "collaboration"]
  },

  // Affinity Suite & Open Source Art Apps
  {
    title: "Affinity Suite",
    author: "Serif",
    score: 9680,
    url: "https://cdn.simpleicons.org/affinity/222222",
    thumbnail: "https://cdn.simpleicons.org/affinity/222222",
    permalink: "https://affinity.serif.com",
    colorTheme: { bg: "#141414", text: "#1b82e6", accent: "#1b82e6", description: "Award-winning creative suite of vector, photo editing, and publishing software without subscriptions." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:serif", "vector", "photo_editing", "publishing"]
  },
  {
    title: "Affinity Designer",
    author: "Serif",
    score: 9620,
    url: "https://cdn.simpleicons.org/affinitydesigner/1b82e6",
    thumbnail: "https://cdn.simpleicons.org/affinitydesigner/1b82e6",
    permalink: "https://affinity.serif.com/designer",
    colorTheme: { bg: "#051526", text: "#1b82e6", accent: "#1b82e6", description: "Vector graphics software for desktop and iPad for concept art, logos, and UI." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:serif", "vector", "illustration", "desktop"]
  },
  {
    title: "Affinity Photo",
    author: "Serif",
    score: 9540,
    url: "https://cdn.simpleicons.org/affinityphoto/8e2cb9",
    thumbnail: "https://cdn.simpleicons.org/affinityphoto/8e2cb9",
    permalink: "https://affinity.serif.com/photo",
    colorTheme: { bg: "#180721", text: "#8e2cb9", accent: "#8e2cb9", description: "Professional photo editing software with full raw editing and retouching tools." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:serif", "photo_editing", "raw", "retouching"]
  },
  {
    title: "Affinity Publisher",
    author: "Serif",
    score: 9450,
    url: "https://cdn.simpleicons.org/affinitypublisher/d9326f",
    thumbnail: "https://cdn.simpleicons.org/affinitypublisher/d9326f",
    permalink: "https://affinity.serif.com/publisher",
    colorTheme: { bg: "#210710", text: "#d9326f", accent: "#d9326f", description: "Next-generation page layout software for magazines, books, and digital media." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:serif", "layout", "publishing", "print"]
  },
  {
    title: "GIMP",
    author: "GIMP Team",
    score: 9590,
    url: "https://cdn.simpleicons.org/gimp/5c5543",
    thumbnail: "https://cdn.simpleicons.org/gimp/5c5543",
    permalink: "https://www.gimp.org",
    colorTheme: { bg: "#12110e", text: "#a89b80", accent: "#a89b80", description: "Cross-platform open source image editor used for image retouching and photo editing." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:gimp_team", "photo_editing", "raster", "open_source"]
  },
  {
    title: "Inkscape",
    author: "Inkscape Project",
    score: 9510,
    url: "https://cdn.simpleicons.org/inkscape/000000",
    thumbnail: "https://cdn.simpleicons.org/inkscape/000000",
    permalink: "https://inkscape.org",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#38bdf8", description: "Free and open source vector graphics editor offering SVG format compliance." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:inkscape_project", "vector", "svg", "open_source"]
  },
  {
    title: "Krita",
    author: "Krita Foundation",
    score: 9630,
    url: "https://cdn.simpleicons.org/krita/33bbff",
    thumbnail: "https://cdn.simpleicons.org/krita/33bbff",
    permalink: "https://krita.org",
    colorTheme: { bg: "#061521", text: "#33bbff", accent: "#33bbff", description: "Professional free and open source painting program created for digital artists." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:krita_foundation", "digital_art", "painting", "illustration", "open_source"]
  },

  // Web Builders & SVG Optimizer
  {
    title: "Webflow",
    author: "Webflow Inc",
    score: 9870,
    url: "https://cdn.simpleicons.org/webflow/4353ff",
    thumbnail: "https://cdn.simpleicons.org/webflow/4353ff",
    permalink: "https://webflow.com",
    colorTheme: { bg: "#0b0f2e", text: "#4353ff", accent: "#4353ff", description: "Build custom, production-grade responsive websites visually without writing code." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:webflow_inc", "website_builder", "no_code", "visual_editor"]
  },
  {
    title: "SVGO",
    author: "SVGO Team",
    score: 9420,
    url: "https://cdn.simpleicons.org/svgo/000000",
    thumbnail: "https://cdn.simpleicons.org/svgo/000000",
    permalink: "https://github.com/svg/svgo",
    colorTheme: { bg: "#18181b", text: "#38bdf8", accent: "#38bdf8", description: "Node.js-based tool for optimizing SVG vector graphics files automatically." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:svgo_team", "svg", "optimizer", "open_source", "cli"]
  },
  {
    title: "Iconify",
    author: "Iconify Team",
    score: 9680,
    url: "https://cdn.simpleicons.org/iconify/1769aa",
    thumbnail: "https://cdn.simpleicons.org/iconify/1769aa",
    permalink: "https://iconify.design",
    colorTheme: { bg: "#0d1b2a", text: "#1769aa", accent: "#1769aa", description: "Unified open-source icon framework with over 150,000+ vector icons." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:iconify_team", "icons", "svg", "framework", "open_source"]
  },
  {
    title: "IconJar",
    author: "IconJar B.V.",
    score: 9280,
    url: "https://cdn.simpleicons.org/iconjar/171717",
    thumbnail: "https://cdn.simpleicons.org/iconjar/171717",
    permalink: "https://geticonjar.com",
    colorTheme: { bg: "#171717", text: "#38bdf8", accent: "#38bdf8", description: "Organize, search, and export vector icon sets cleanly on macOS." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:design", "artist:iconjar_bv", "icons", "organizer", "mac_app"]
  },
  {
    title: "Whimsical",
    author: "Whimsical Inc",
    score: 9620,
    url: "https://cdn.simpleicons.org/whimsical/ae50bb",
    thumbnail: "https://cdn.simpleicons.org/whimsical/ae50bb",
    permalink: "https://whimsical.com",
    colorTheme: { bg: "#1a0f24", text: "#ae50bb", accent: "#ae50bb", description: "The visual workspace for docs, flowcharts, wireframes, mind maps, and whiteboards." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:whimsical_inc", "wireframing", "flowcharts", "whiteboard", "docs"]
  },
  {
    title: "Excalidraw",
    author: "Excalidraw Team",
    score: 9860,
    url: "https://cdn.simpleicons.org/excalidraw/6965db",
    thumbnail: "https://cdn.simpleicons.org/excalidraw/6965db",
    permalink: "https://excalidraw.com",
    colorTheme: { bg: "#121212", text: "#6965db", accent: "#6965db", description: "Virtual hand-drawn style whiteboard for sketching diagrams and wireframes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:design", "artist:excalidraw_team", "whiteboard", "sketching", "diagrams", "open_source"]
  }
];

const posts = DESIGN_CREATIVE_TOOLS.map((t, idx) => ({
  title: t.title,
  subreddit: 'toolatlas',
  author: t.author,
  score: t.score,
  width: 500,
  height: 500,
  created_iso: new Date(Date.now() - (idx * 3600000)).toISOString(),
  url: t.url,
  thumbnail: t.thumbnail,
  permalink: t.permalink,
  derivedTags: t.tags,
  colorTheme: t.colorTheme
}));

const outputPath = path.join(__dirname, 'toolfolio_50_batch2_design.json');
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');

console.log(`Successfully generated ${posts.length} clean design & creative tool entries to ${outputPath}`);
console.log(`Batch upload timestamp: meta:upload:${BATCH_TIMESTAMP}`);

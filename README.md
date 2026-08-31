# MyAtlas

A minimalist, high-density **local hard drive media & booru manager** designed in the **Claude.ai** visual aesthetic (warm creams, Lora serif headings, Plus Jakarta Sans typography, and amber accents).

Engineered for 100% offline hard drive media curation, speed tagging, instant WebP thumbnail caching, folder directory indexing, and local booru classification across photos (`.jpg`, `.png`, `.webp`, `.gif`) and videos (`.mp4`, `.webm`, `.mov`, `.mkv`, `.avi`).

---

## 🚀 Tech Stack

- **Frontend Core**: React 19 (JSX), Vite 8, Vanilla CSS (custom design system tokens in `index.css`).
- **Icons**: `lucide-react`.
- **Desktop Runtime**: Tauri v2 (`@tauri-apps/api`).
- **Backend Micro-Server**: C# .NET 8 Minimal WebAPI (`MyAtlas.Backend`) bound to `http://127.0.0.1:7171`.
- **Database Layer**: Embedded SQLite (`myatlas_server.db` and `myatlas_local.db`).
- **Thumbnail Engine**: ImageSharp + Windows Shell P/Invoke STA frame extractor (300px WebP cache at `%AppData%/MyAtlas/Cache/`).

---

## 📂 Project Architecture & Documentation Layout

Documentation is maintained in the [`docs/`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/) directory:

```
my atlas 2/
├── README.md               # Quickstart & project overview
├── docs/
│   ├── big_picture_dream.md # Grand vision strategy: offline desktop app to public "Reddit for Boorus" platform
│   ├── sub_atlases.md      # Sub-Atlas domain architecture: hyperminimalist router, creator & backend scoping
│   ├── architecture.md     # Desktop app runtime, C# sidecar engine, WebP proxy & STA video frame extractor
│   ├── taxonomy.md         # Tag categories, boolean namespaces & expandable slot config
│   ├── storage/
│   │   ├── sqlite.md       # SQLite schema, dual storage model & reset endpoints
│   │   └── file_loader.md  # Asset protocol, HTTP 206 range streaming & WebP thumbnail routing
│   └── views/
│       ├── grid.md         # Browse Grid specs, Category Index sidebar, 1-click drill-down & priority waterfall
│       ├── viewer_overlay.md # Seamless Morphing Overlay Viewer specs, Media vs Tags morphing & 40-item queue
│       ├── tagger.md       # Speed tagging specs, auto-save on exit, queue timeline & category auto-coloring
│       ├── upload.md       # Hard drive folder scanner, local file ingestion & background pre-caching
│       ├── deletor.md      # Mass Deletor Studio specs & batch tag pruning
│       ├── categories.md   # Tag Categories Directory specs, namespace management & scalability truncation
│       └── discovery_cloud.md # Discovery Cloud 3D specs, Fibonacci distribution, filter dimming & scroll lock
└── src/
    ├── main.jsx            # Application entry mount
    ├── index.css           # Claude visual tokens and design system metrics
    ├── services/
    │   ├── api.js          # REST API client for C# backend (port 7171)
    │   └── localDb.js      # Local SQLite database service & WebP proxy router
    ├── utils/
    │   └── localFiles.js   # Local filesystem loader & Tauri asset protocols
    ├── components/
    │   ├── Navbar.jsx      # Sticky header with search utility & brand logo
    │   └── PostCard.jsx    # High-density card, WebP thumbnail rendering & video hover player
    └── pages/
        ├── Home.jsx        # Minimalist home view with search input
        ├── Posts.jsx       # Browse Grid view with scale slider (4c-10c) & 3-col tag matrix
        ├── Tagger.jsx      # Speed tagging interface with category slots
        ├── Upload.jsx      # Hard drive folder scanner & local file batch ingestion
        ├── Deletor.jsx     # Mass Deletor Studio for batch tag pruning
        └── Categories.jsx  # Tag Categories Directory for inspecting & managing namespaces
```

---

## 🛠️ Development Commands

- **Run Web Dev Server**: `npm run dev` (starts Vite at `http://localhost:5173/`).
- **Run C# Backend Engine**: `npm run backend` (starts C# WebAPI at `http://127.0.0.1:7171/`).
- **Run Full Desktop App (Concurrent)**: `npm run tauri:dev` (launches C# backend and Tauri window simultaneously).
- **Validate & Build Production Bundle**: `npm run build`.

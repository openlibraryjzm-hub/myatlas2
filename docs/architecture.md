# System Architecture: Local Desktop & Sidecar Engine (`docs/architecture.md`)

This document defines the system architecture, component boundaries, C# sidecar backend engine, media streaming protocols, thumbnail pre-caching pipeline, cache invalidation contracts, and offline privacy model for **MyAtlas**.

---

## 🏛️ System Overview

MyAtlas is engineered as a **High-Performance Local Media Booru & Bookmark Manager**. It combines a React 19 / Vite 8 frontend shell wrapped in a Tauri v2 desktop container, powered by a C# .NET 8 Minimal WebAPI sidecar engine (`MyAtlas.Backend`).

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 + Vite 8 UI                     │
│    (Claude Aesthetic, Grid, Tagger, Deletor, Lucide Icons)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (http://127.0.0.1:7171)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 C# .NET 8 High-Speed Backend                │
│                   (`backend/MyAtlas.Backend`)               │
├─────────────────────────────────────────────────────────────┤
│ • Kestrel Local Micro-Server (`127.0.0.1:7171`)             │
│ • SQLite Database Engine (`myatlas_server.db` / `local_items`) │
│ • Native SQL Pagination (`LIMIT 40 OFFSET`)                 │
│ • WebP Thumbnail Proxy & Parallel Pre-Caching Engine        │
│ • Windows Shell P/Invoke STA Video Frame Extractor           │
│ • HTTP 206 Partial Content Video Range Streamer             │
│ • Multi-Threaded Folder Disk Scanner (`/api/scan`)          │
│ • 100% Offline Capable & Zero Remote Data Transmission      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ C# Backend Engine (`MyAtlas.Backend`)

- **Host Binding**: `http://127.0.0.1:7171`
- **Database Engine (`myatlas_server.db`)**: Embedded SQLite store operating on `local_items`. Serves high-speed tag queries, boolean tag filtering, pagination, and instant total counts.
- **Server-Side WebP Thumbnail Proxy (`GET /api/thumbnail/{**id}`)**:
  - Automatically resizes and caches 300px WebP thumbnails to disk (`%AppData%/MyAtlas/Cache/{id}.webp`).
  - Serves ~15KB WebP thumbnails in **< 1ms** directly from disk with `Cache-Control: public, max-age=31536000, immutable`.
  - Filters out self-referencing localhost API URLs to prevent recursive request deadlocks.
  - Returns `Results.NotFound()` (404 in 3ms) on missing assets to release browser connection slots instantly.
- **Windows Shell P/Invoke STA Video Frame Extractor (`WindowsThumbnailProvider`)**:
  - Leverages native Windows `IShellItemImageFactory` via P/Invoke (`SHCreateItemFromParsingName`).
  - Runs inside a dedicated `ApartmentState.STA` thread runner to satisfy Windows COM requirements.
  - Extracts frame 0 of any `.mp4`, `.mov`, `.webm`, `.mkv`, or `.avi` video file and converts BGRA32 pixel buffers directly to WebP images via ImageSharp.
- **Parallel Background Thumbnail Pre-Caching (`POST /api/precache`, `/api/import`, `/api/scan`)**:
  - Spawns parallel background worker threads (`Parallel.ForEach` with `MaxDegreeOfParallelism = 6`) to pre-build 300px WebP thumbnails at scan and import time.
- **HTTP 206 Video Range Streamer (`GET /api/stream/{id}`)**:
  - Streams local video files over HTTP using `206 Partial Content` headers.
  - Enables instant video seeking and scrubbing with zero webview memory bloat.

---

## 💾 Storage Partitioning & Cache Invalidation Contract

| Layer | Storage Location | Data Scope & Responsibility |
| :--- | :--- | :--- |
| **C# Backend Store** | `%AppData%/MyAtlas/myatlas_server.db` | Primary SQLite index (`local_items`) for high-speed pagination, tag matrices, and WebP thumbnail routing. |
| **Tauri SQLite Store** | `%AppData%/Roaming/com.tauri.dev/myatlas_local.db` | Local client tables (`local_scrapes`, `local_media`). |
| **Thumbnail Disk Cache** | `%AppData%/MyAtlas/Cache/*.webp` | Pre-generated 300px WebP thumbnail images for photos and videos. |

### 🛑 SQLite Memory Cache Invalidation Rule
To prevent stale in-memory items from overwriting newly saved tags or metadata:
- Every SQLite mutation function (`updateItemTags`, `addLocalMediaFile`, `importScrapedJsonArray`, `clearLocalDatabase`) **must invoke `invalidateItemsCache()`**.
- `getAllItems({ forceRefresh: true })` bypasses memory cache and fetches fresh records directly from SQLite.

---

## 🖼️ Media Protocols & Priority Waterfall

1. **Pre-Generated WebP Data URLs**: Local media items (photos and videos) uploaded with generated 300px WebP base64 thumbnails (`data:image/webp;base64,...` generated via offscreen HTML5 `<canvas>` in Chromium) render **instantly on frame 1** with 0ms latency, zero server requests, and 0 video decoder CPU overhead.
2. **Local WebP Proxy Protocol**: Scraped web post thumbnails route through `http://127.0.0.1:7171/api/thumbnail/{id}` when the C# backend is online, fetching 15KB WebP images in **< 1ms** from disk cache.
3. **Native Webview Asset Protocol**: Local hard drive files use `formatLocalAssetUrl(filePath)` (`asset://localhost/C:/...`) for native desktop media rendering.
4. **HTTP 206 Video Streamer Protocol**: Local video files (`.mp4`, `.webm`, `.mov`) stream in the Fullscreen Viewer via `/api/stream/{id}` with `206 Partial Content` headers for instant scrub-seeking.
5. **Priority Image Waterfall**:
   - **Rows 1 & 2 (Cards 0–15)**: Assigned `fetchPriority="high"` and `loading="eager"` for immediate top-of-fold rendering.
   - **Rows 3+ (Cards 16+)**: Assigned `fetchPriority="low"` and `loading="lazy"` to defer off-screen network requests.
6. **Instant Image Cache Detection**: `PostCard.jsx` checks `imgRef.current.complete` on mount. If an image is already in browser memory or disk cache, `isImgLoaded` sets to `true` synchronously, removing artificial fade delays and staggered pop-ins.

---

## 🔒 Privacy & Offline Guarantees

1. **100% Offline Capability**: All database indexing, search, tagging, thumbnail extraction, and media streaming operate locally without internet connectivity.
2. **Zero Remote Data Leaks**: Personal archives, hard drive paths, and bookmarks are never transmitted to external cloud servers.

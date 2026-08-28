# Local Media Binary Loader & WebP Proxy Protocol (`docs/storage/file_loader.md`)

This document defines the local filesystem loader, MIME resolution, Tauri asset protocols, HTTP 206 range streaming, and WebP thumbnail routing provided by MyAtlas.

---

## 🖼️ Media Loader Architecture

Browser webviews block raw local file system paths (e.g. `C:\Pictures\image.png`). MyAtlas uses a three-tier strategy to stream assets:

```
┌────────────────────────────────────────────────────────┐
│                   Local Media Asset                    │
│           ("C:/Videos/sample_clip.mp4")                │
└───────────────────────────┬────────────────────────────┘
                            │
               Media Request Type Check
                            │
      ┌─────────────────────┼─────────────────────┐
      ▼                     ▼                     ▼
C# WebP Proxy        C# Range Streamer     Tauri Asset Protocol
(/api/thumbnail/{id})   (/api/stream/{id})       (convertFileSrc)
      │                     │                     │
      ▼                     ▼                     ▼
10KB WebP Image       HTTP 206 Stream      http://asset.localhost/
(Direct 0.5ms Cache)  (Instant Scrubbing)   (Direct WebView Protocol)
```

---

## 🛠️ Key Protocols & Utilities

- **Server-Side WebP Proxy (`http://127.0.0.1:7171/api/thumbnail/{id}`)**:
  - Automatically requested by card thumbnails when C# backend is active.
  - Serves pre-cached 300px WebP images directly from disk in **0.5ms**.
- **HTTP 206 Range Streamer (`http://127.0.0.1:7171/api/stream/{id}`)**:
  - Serves video streams using HTTP `206 Partial Content` headers.
  - Allows instant seeking, scrubbing, and frame decoding without loading full video binaries into webview memory.
- **`formatLocalAssetUrl(filePath)`**:
  - Tauri asset protocol helper calling `convertFileSrc(filePath)` from `@tauri-apps/api/core`.
- **`getLocalFileAsBlobUrl(filePath)`**:
  - Fallback loader reading binary files via `@tauri-apps/plugin-fs` `readFile()` and creating browser Blob URLs.
- **MIME Resolution**: Resolves MIME types automatically by file extension (`.png` $\rightarrow$ `image/png`, `.jpg` $\rightarrow$ `image/jpeg`, `.gif` $\rightarrow$ `image/gif`, `.mp4` $\rightarrow$ `video/mp4`, `.webm` $\rightarrow$ `video/webm`).

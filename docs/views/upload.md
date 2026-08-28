# Ingestion & Upload Manager Specifications (`docs/views/upload.md`)

This document defines specifications for local disk media file scanning and hard drive batch ingestion (`view === 'upload'`).

---

## 📥 Ingestion Modes

The Ingestion Manager supports two primary local hard drive data sources:

1. **Local Disk Directory Scanner**: Select local folders or directories (`.jpg`, `.png`, `.webp`, `.gif`, `.mp4`, `.webm`, `.mov`, `.mkv`, `.avi`) using native Tauri directory pickers (`selectLocalDirectory` / `scanServerFolder`).
2. **Local Batch File Selector**: Select individual media files or batches directly from disk using Tauri file pickers (`selectLocalFiles`).

---

## 🛠️ Item Processing & Normalization

- **Extension Normalization**: Resolves file extensions from path endings (`jpeg` $\rightarrow$ `jpg`, `gifv` $\rightarrow$ `gif`, `mp4` default for video).
- **Auto Timestamp Tagging**: Automatically generates `meta:upload:YYYY-MM-DD_HH-mm-ss` batch timestamp tags for all local file selections and folder scans.
- **Parent Folder Metadata Tagging**: Automatically extracts the immediate containing parent folder name on PC at upload time (e.g. `C:\Downloads\SciFi\img.jpg` $\rightarrow$ `meta:folder:scifi` and `folder:scifi`), grouping items by their original disk location.
- **Batch Namespace Tagging Panel**:
  - **Atlas Tag Input**: Dedicated pre-filled `atlas:` input box generating `meta:atlas:value` and `atlas:value` tags across all items in the batch.
  - **Free-Form Namespace Input**: Input box accepting any number of custom `namespace:value` tags (comma or space separated, e.g. `medium:3d, genre:sci-fi, mood:dark`).
  - Active batch tags render live tag pills in the preview panel and on preview cards prior to database commit.
- **Client-Side WebP Thumbnail Generator**: Executes `generateWebpThumbnail` (for photos) and `generateVideoWebpThumbnail` (for `.mp4`, `.webm`, `.mov`, `.mkv` videos via an offscreen HTML5 `<video>` and `<canvas>`) to generate 300px 75% quality **Base64 WebP thumbnails (~15 KB)** prior to database insertion.
- **Derived Tags Generation**: Automatically extracts format tags (`meta:format:image`/`video`), extension tags (`meta:extension:png`), folder tags (`folder:name`), and user batch tags.
- **Interactive Exclusion**: Renders preview cards with an `×` remove button to discard unwanted items prior to database commit.
- **Local SQLite & Server Commit**: Ingests items directly into `local_media` in `myatlas_local.db` and syncs with C# backend when online.

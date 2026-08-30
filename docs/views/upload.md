# Ingestion & Upload Manager Specifications (`docs/views/upload.md`)

This document defines specifications for local disk media file scanning, manifest sidecar processing, and hard drive batch ingestion (`view === 'upload'`).

---

## 📥 Ingestion Modes

The Ingestion Manager supports three primary local hard drive data sources:

1. **Local Batch File Selector**: Select individual media files or batches directly from disk using Tauri file pickers (`selectLocalFiles`).
2. **Local Directory & Manifest Ingestion**: Select folders containing media files and an optional `manifest.json` metadata sidecar file (see [`docs/ingestion_manifest_workflow.md`](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/ingestion_manifest_workflow.md)).
3. **Scraped JSON Archive Ingestion**: Drop or select scraped JSON archives (Reddit saves, Twitter bookmarks) for bulk ingestion.

---

## 🛠️ Item Processing & Normalization

- **Manifest Auto-Detection**: When local files are selected, the Upload engine automatically checks for a `manifest.json` file in the parent folder. If present, it maps enriched booru tags (`class:`, `slot:`, `kind:`, `update:`, `env:`, `gamemode:`, `hazard:`, `year:`) directly to matching file entries.
- **Auto Category Registration**: Automatically registers newly encountered tag namespaces into the app's taxonomy registry via `ensureTagCategoriesExist(tags)`, creating sovereign category headers with auto-assigned palette colors.
- **Extension Normalization**: Resolves file extensions from path endings (`jpeg` $\rightarrow$ `jpg`, `gifv` $\rightarrow$ `gif`, `mp4` default for video).
- **Auto Timestamp Tagging**: Automatically generates `meta:upload:YYYY-MM-DD_HH-mm-ss` batch timestamp tags for all local file selections and folder scans.
- **Parent Folder Metadata Tagging**: Automatically extracts the immediate containing parent folder name on PC at upload time (e.g. `C:\Downloads\SciFi\img.jpg` $\rightarrow$ `meta:folder:scifi` and `folder:scifi`), grouping items by their original disk location.
- **Batch Namespace Tagging Panel**:
  - **Atlas Tag Input**: Dedicated pre-filled `atlas:` input box generating `meta:atlas:value` and `atlas:value` tags across all items in the batch.
  - **Free-Form Namespace Input**: Input box accepting any number of custom `namespace:value` tags (comma or space separated, e.g. `medium:3d, genre:sci-fi, mood:dark`).
  - Active batch tags render live tag pills in the preview panel and on preview cards prior to database commit.
- **Client-Side WebP Thumbnail Generator**: Executes `generateWebpThumbnail` (for photos) and `generateVideoWebpThumbnail` (for `.mp4`, `.webm`, `.mov`, `.mkv` videos via an offscreen HTML5 `<video>` and `<canvas>`) to generate 300px 75% quality **Base64 WebP thumbnails (~15 KB)** prior to database insertion.
- **Derived Tags Generation**: Automatically extracts format tags (`meta:format:image`/`video`), extension tags (`meta:extension:png`), folder tags (`folder:name`), manifest tags, and user batch tags.
- **Target Sub-Atlas Archive Destination Selector**: Explicit header panel allowing users to select or switch the destination sub-atlas (e.g. `myatlas`, `space`, `military`, `nasa`) for the upload batch. Ingested items are tagged with `atlas_id: selectedAtlasSlug`.
- **Interactive Exclusion**: Renders preview cards with an `×` remove button to discard unwanted items prior to database commit.
- **Local SQLite & Server Commit**: Ingests items directly into `local_media` or `local_scrapes` with `atlas_id` scoping in `myatlas_local.db` and syncs with C# backend when online.

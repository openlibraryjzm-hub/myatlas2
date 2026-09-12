# Ingestion & Upload Manager Specifications (`docs/views/upload.md`)

This document defines specifications for local hard drive media file indexing, manifest sidecar metadata processing, scraped JSON ingestion, and YouTube video link ingestion (`view === 'upload'`).

---

## 📥 Ingestion Modes

The Ingestion Manager supports four primary ingestion modes selectable via the source mode switcher bar:

1. **Local Batch File Selector (`local_files`)**: Select individual media files or batches directly from disk using Tauri native file pickers (`selectLocalFiles`). Generates client-side 300px WebP thumbnails and extracts parent folder tags.
2. **YouTube Video Links Ingestion (`youtube`)**: Ingest YouTube videos directly by pasting multi-line URLs or 11-character Video IDs. Automatically extracts video titles, channels, publish dates, video durations, and creator tags, uploading high-res thumbnails directly to Supabase Storage (`atlas-media/youtubeatlas/<id>.jpg`).
3. **Scraped JSON Archive Ingestion (`json`)**: Drop or select scraped JSON archives (Reddit saves, Twitter bookmarks, Toolfolio batches, generic Booru JSON arrays) for bulk database ingestion.
4. **Local Directory & Manifest Ingestion**: Select folders containing media files and an optional `manifest.json` metadata sidecar file (see [`docs/ingestion_manifest_workflow.md`](../ingestion_manifest_workflow.md)).

---

## 📺 YouTube Video Ingestion & API Settings (`uploadType === 'youtube'`)

### 1. API Key Settings Panel
- **Key Storage**: Persisted in browser `localStorage` (`myatlas_youtube_api_key`) via `getYoutubeApiKey()` and `setYoutubeApiKey(key)`.
- **Status Badges**:
  - `🔑 YouTube Data API Active`: API key configured; fetches full channel creator tags, publish dates, and video duration metrics via YouTube Data API v3.
  - `🌐 oEmbed Fallback Active`: No API key configured; queries public `youtube.com/oembed` endpoint for basic title, author, and thumbnail without requiring API credentials.

### 2. Multi-Line Textarea Link Input & Parser
- **Real-Time Parser (`parseMultipleYoutubeLinks`)**: Parses multi-line inputs on each stroke, extracting 11-character Video IDs from standard watch links (`watch?v=`), shortlinks (`youtu.be/`), Shorts (`shorts/`), embed URLs, and raw IDs.
- **Link Status Feedback**: Renders live link counters (e.g. `12 valid video link(s) detected (2 invalid)`) alongside interactive video ID chip badges below the input textarea.

### 3. Metadata Fetching & Taxonomy Auto-Tagging
- **Batch Processing (`fetchYoutubeMetadataBatch`)**: Requests metadata for all valid IDs in chunked API batches (up to 50 IDs per API call).
- **Taxonomy Tag Generation (`buildYoutubeTaxonomyTags`)**:
  - `source:https://www.youtube.com/watch?v=<video_id>` & `source:youtube`
  - `creator:<channel_name>` & `artist:<channel_name>`
  - `meta:youtube`, `meta:format:video`, `meta:published:<YYYY-MM-DD>`, `meta:duration:<time>`
  - `year:<YYYY>` & creator video tags (`snippet.tags`)
  - Auto-generated batch timestamp tag: `meta:upload:YYYY-MM-DD_HH-mm-ss`

---

## 🛠️ Item Processing, Normalization & Tagging

- **Target Sub-Atlas Destination Selector**: Explicit header panel allowing users to set the destination sub-atlas slug (`selectedAtlasSlug`, e.g. `myatlas`, `youtubeatlas`, `amberatlas`). Ingested items are tagged with `atlas_id: selectedAtlasSlug`.
- **Manifest Auto-Detection**: When local files are selected, the Upload engine checks for a `manifest.json` file in the parent folder. If present, it maps enriched booru tags (`class:`, `slot:`, `kind:`, `update:`, `env:`, `gamemode:`, `hazard:`, `year:`) directly to matching file entries.
- **Auto Category Registration**: Automatically registers newly encountered tag namespaces into the app's taxonomy registry via `ensureTagCategoriesExist(tags)`, creating category headers with auto-assigned palette colors.
- **Extension Normalization**: Resolves file extensions from path endings (`jpeg` $\rightarrow$ `jpg`, `gifv` $\rightarrow$ `gif`, `mp4` default for video).
- **Auto Timestamp Tagging**: Automatically generates `meta:upload:YYYY-MM-DD_HH-mm-ss` batch timestamp tags for all ingestion modes.
- **Parent Folder Metadata Tagging**: Automatically extracts the immediate parent folder name on PC at upload time (e.g. `C:\Downloads\SciFi\img.jpg` $\rightarrow$ `meta:folder:scifi` and `folder:scifi`).
- **Batch Namespace Tagging Panel**:
  - **Atlas Tag Input**: Dedicated pre-filled `atlas:` input box generating `meta:atlas:value` and `atlas:value` tags across all items in the batch.
  - **Free-Form Namespace Input**: Input box accepting custom `namespace:value` tags (comma or space separated, e.g. `medium:3d, genre:sci-fi, mood:dark`).
  - Active batch tags render live tag pills in the preview panel and preview cards prior to database commit.
- **Client-Side WebP Thumbnail Generator**: Executes `generateWebpThumbnail` (for photos) and `generateVideoWebpThumbnail` (for `.mp4`, `.webm`, `.mov`, `.mkv` videos via an offscreen HTML5 `<video>` and `<canvas>`) to generate 300px 75% quality **Base64 WebP thumbnails (~15 KB)** prior to database insertion.
- **Interactive Card Exclusion**: Renders preview cards with an `×` remove button to discard unwanted items prior to database commit.

---

## 💾 Dual Destination Commit Engine

1. **Local Workspace (`myatlas`)**: Ingests items directly into `local_media` or `local_scrapes` with `atlas_id` scoping in `myatlas_local.db` and syncs with the local C# backend.
2. **Cloud Sub-Atlases (`youtubeatlas` / non-`myatlas`)**:
   - **Thumbnail Storage Ingestion**: Thumbnail images download client-side and upload directly to Supabase Storage bucket `atlas-media` via `uploadMediaToSupabaseStorage` (stored at `atlas-media/youtubeatlas/<id>.jpg`), returning public Supabase CDN URLs (`https://<project-ref>.supabase.co/storage/v1/object/public/atlas-media/youtubeatlas/<id>.jpg`).
   - **Database Insertion**: Post metadata, Supabase CDN thumbnail URLs, YouTube watch URLs (`secondary_url`), and Booru taxonomy tag arrays insert into the Supabase Postgres database `posts` table via `commitPostsToSupabase`.

---

## 📄 Related Documentation
- [YouTube Atlas Specifications](../youtubeatlas.md)
- [Sub-Atlas System Architecture](../sub_atlases.md)
- [Tagging & Category Taxonomy](../taxonomy.md)
- [Ingestion & Manifest Workflow](../ingestion_manifest_workflow.md)

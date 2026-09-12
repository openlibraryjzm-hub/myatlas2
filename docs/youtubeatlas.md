# YouTube Atlas Architecture & Ingestion Specifications (`docs/youtubeatlas.md`)

This document defines the technical specifications, YouTube Data API v3 integration, oEmbed fallback mechanism, Booru taxonomy auto-tagging rules, Supabase Cloud storage pipeline, and UI rendering mechanics for **YouTube Atlas** (`youtubeatlas`).

---

## 🏛️ System Overview

**YouTube Atlas** (`youtubeatlas`) is a domain Sub-Atlas focused on YouTube video collections (`#EF4444` accent). It indexes YouTube videos as curated Booru post records, combining high-resolution thumbnail rendering with instant external web link navigation.

```
┌─────────────────────────────────────────────────────────────┐
│                    YouTube Video Input                      │
│      (URLs, watch?v=, shortlinks, shorts, or raw Video IDs) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             YouTube API Engine (`youtubeApi.js`)            │
├─────────────────────────────────────────────────────────────┤
│ • YouTube Data API v3 (chunked requests up to 50 IDs)       │
│ • oEmbed API Fallback (`youtube.com/oembed`)                │
│ • Booru Taxonomy Auto-Tagging (`buildYoutubeTaxonomyTags`)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│   Supabase Storage CDN      │ │   Supabase Postgres DB      │
│  (`atlas-media/youtubeatlas/│ │   (`posts` table record with│
│   <video_id>.jpg`)          │ │    `atlas_id = youtubeatlas`)│
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## ⚡ YouTube API & Metadata Extraction Pipeline (`src/services/youtubeApi.js`)

### 1. API Key Configuration & Storage
- **Storage**: Key stored persistently in browser `localStorage` (`myatlas_youtube_api_key`).
- **Management**: Managed via `getYoutubeApiKey()` and `setYoutubeApiKey(key)` getters/setters.
- **Upload UI Status Indicator**:
  - `🔑 YouTube Data API Active`: API key detected; extracts creator video tags, published date, and duration.
  - `🌐 oEmbed Fallback Active`: No API key set; queries public `youtube.com/oembed` endpoint for basic title, author, and thumbnail without key requirements.

### 2. URL & Video ID Parsing (`parseYoutubeVideoId`, `parseMultipleYoutubeLinks`)
Extracts 11-character YouTube Video IDs from:
- Standard watch URLs: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Shortened URLs: `https://youtu.be/dQw4w9WgXcQ`
- YouTube Shorts: `https://www.youtube.com/shorts/dQw4w9WgXcQ`
- Embed URLs: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- Raw 11-character Video IDs: `dQw4w9WgXcQ`

### 3. Dual Fetch Engine (`fetchYoutubeMetadataBatch`)
- **Primary Data API v3 Route**: Batches IDs into chunks of 50 per HTTP request to `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=...&key=...`.
- **Secondary oEmbed Route**: If no API key is configured or the API request fails, queries `https://www.youtube.com/oembed?url=...&format=json` in parallel per URL.

---

## 🏷️ Booru Taxonomy Mapping (`buildYoutubeTaxonomyTags`)

Extracted video metadata maps directly to the fixed 7-category taxonomy schema in [`docs/taxonomy.md`](taxonomy.md):

| Category | Prefix | Tag Generation Logic | Example Generated Tags |
| :--- | :--- | :--- | :--- |
| **Source** | `source:` | `source:https://www.youtube.com/watch?v=<video_id>`, `source:youtube` | `source:https://www.youtube.com/watch?v=dQw4w9WgXcQ`, `source:youtube` |
| **Creator** | `creator:`, `artist:` | `creator:<channel_title_normalized>`, `artist:<channel_title_normalized>` | `creator:veritasium`, `artist:veritasium` |
| **Metadata** | `meta:` | `meta:youtube`, `meta:format:video`, `meta:published:<YYYY-MM-DD>`, `meta:duration:<time>` | `meta:youtube`, `meta:format:video`, `meta:published:2024-03-15`, `meta:duration:10m24s` |
| **General** | *(none)* | `year:<published_year>`, creator-defined video tags (`snippet.tags`) | `year:2024`, `physics`, `science`, `experiment` |

---

## ☁️ Supabase Cloud Storage & Database Architecture

Curated YouTube posts in `youtubeatlas` are hosted on Supabase:

1. **Thumbnail CDN Ingestion (`uploadMediaToSupabaseStorage`)**:
   - Downloads the highest available YouTube thumbnail resolution (`maxresdefault.jpg` or `sddefault.jpg`).
   - Converts the image data into a binary Blob client-side and uploads to Supabase Storage bucket `atlas-media` under `youtubeatlas/<video_id>.jpg`.
   - Returns a public Supabase CDN URL (`https://<project-ref>.supabase.co/storage/v1/object/public/atlas-media/youtubeatlas/<video_id>.jpg`).
2. **Post Record Insertion (`commitPostsToSupabase`)**:
   - `id`: Video ID (e.g. `dQw4w9WgXcQ`).
   - `atlas_id`: `'youtubeatlas'`
   - `name`: Video title.
   - `tagline`: Channel name.
   - `website`: Supabase Storage public CDN thumbnail URL.
   - `secondary_url`: Direct YouTube watch link (`https://www.youtube.com/watch?v=<video_id>`).
   - `tags`: Array of normalized Booru taxonomy tags.

---

## 🖼️ UI Rendering & Navigation Mechanics

### 1. Browse Grid Card Behavior (`PostCard.jsx`)
- **Remote CDN Image Priority**: `isYoutubePost` items render `thumbnail` or `url` directly from Supabase CDN, bypassing local C# server 404s.
- **Red YouTube Platform Badge**: Displays a red `YOUTUBE` badge overlay in the bottom-right corner.
- **Static Hover Preview**: Exempt from HTML5 `<video>` hover preview loops (`isLocalVideo = isVideo && !isYoutubePost`), preserving the thumbnail image when hovered.
- **Grid Click Navigation**: Clicking a YouTube card on the Browse Grid triggers `onPostClick` / `onNavigateTagger`, opening the full post in the **Speed Tagger** (`Tagger.jsx`) or Overlay Viewer.

### 2. Full Post View & Speed Tagger (`Tagger.jsx` & `MorphingTaggerPanel.jsx`)
- **Media Container**: Renders the high-resolution thumbnail image (does not load embedded iframe/video players).
- **Hyperlinked Header Title**:
  - `activeSourceUrl` resolves `getSourceUrl(tags)` $\rightarrow$ `source:https://www.youtube.com/watch?v=...`.
  - Item title/filename renders as a purple hyperlinked text header with an external link icon (`<ExternalLink />`).
  - Clicking the header title triggers `openExternalUrl(sourceUrl)`, launching the YouTube video in the user's default external browser.

---

## 📄 Related Documentation
- [Sub-Atlas System Architecture](sub_atlases.md)
- [Tagging & Category Taxonomy](taxonomy.md)
- [Ingestion & Upload Manager Specifications](views/upload.md)
- [Browse Grid & Left Sidebar Specifications](views/grid.md)
- [Speed Tagger Specifications](views/tagger.md)

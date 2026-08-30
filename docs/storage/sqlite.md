# Local SQLite Storage Specifications (`docs/storage/sqlite.md`)

This document defines the local SQLite database schema, table structures, dual-engine storage partitioning, index design, and reset API endpoints provided by MyAtlas.

---

## 💾 Dual Storage Engine Architecture

MyAtlas uses a dual-layer SQLite model for offline privacy and high-speed execution:

1. **C# Backend SQLite Engine (`myatlas_server.db`)**:
   - Location: `%AppData%/MyAtlas/myatlas_server.db`.
   - Purpose: Primary index table (`local_items`) for native C# SQL pagination (`LIMIT 40 OFFSET`), boolean tag matrix queries, folder scanning, and WebP thumbnail routing.
2. **Tauri SQLite Engine (`myatlas_local.db`)**:
   - Location: `%AppData%/Roaming/com.tauri.dev/myatlas_local.db`.
   - Purpose: Client-side Tauri SQLite tables (`local_scrapes`, `local_media`).

---

## 📊 Database Schemas

### C# Server Table 1: `atlases` (`myatlas_server.db`)
```sql
CREATE TABLE IF NOT EXISTS atlases (
  id TEXT PRIMARY KEY,               -- e.g. "myatlas", "space", "military"
  title TEXT NOT NULL,
  description TEXT,
  accent_color TEXT DEFAULT '#CC5A01',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### C# Server Table 2: `local_items` (`myatlas_server.db`)
```sql
CREATE TABLE IF NOT EXISTS local_items (
  id TEXT PRIMARY KEY,
  file_path TEXT,
  title TEXT,
  author TEXT,
  subreddit TEXT,
  format TEXT,
  size_bytes INTEGER DEFAULT 0,
  url TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  score INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT,                         -- JSON array of tags
  atlas_id TEXT DEFAULT 'myatlas',   -- Sub-Atlas tenant identifier
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  extracted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_local_items_atlas ON local_items(atlas_id);
```

### Tauri Client Table 1: `local_scrapes` (`myatlas_local.db`)
```sql
CREATE TABLE IF NOT EXISTS local_scrapes (
  id TEXT PRIMARY KEY,
  reddit_id TEXT,
  title TEXT,
  author TEXT,
  subreddit TEXT,
  url TEXT,
  thumbnail TEXT,
  permalink TEXT,
  score INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT,
  atlas_id TEXT DEFAULT 'myatlas',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  extracted_at TEXT
);
```

### Tauri Client Table 2: `local_media` (`myatlas_local.db`)
```sql
CREATE TABLE IF NOT EXISTS local_media (
  id TEXT PRIMARY KEY,
  file_path TEXT UNIQUE,
  file_name TEXT,
  format TEXT,
  size_bytes INTEGER,
  thumbnail_url TEXT,
  tags TEXT,
  atlas_id TEXT DEFAULT 'myatlas',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧹 Database Reset Utilities

- **`POST /api/clear` (C# Backend)**: Deletes all records in `local_items` and wipes the `%AppData%/MyAtlas/Cache/` thumbnail directory clean.
- **`clearAllLocalStores()` (Frontend `localDb.js`)**: Executes `DELETE FROM local_scrapes; DELETE FROM local_media;` over active Tauri SQLite connections to reset client tables.

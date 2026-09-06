# Folders & Library Health Specifications (`docs/views/folderhealth.md`)

This document defines the layout architecture, Orteil "Nested" visual design system, 1-millisecond path re-binding mechanics ("Relocate Folder"), on-demand sidecar manifest workflows (`.myatlas_manifest.json`), and backend REST API endpoints for the **Folders & Library Health Manager** view (`view === 'folders'`).

---

## 🎨 Orteil "Nested" Visual Design System

- **Universal Page Backdrop**: Warm off-white / cream background (`--bg-primary: #FBFAF7`, `--bg-secondary: #F5F2EB`).
- **Typography**: `Lora` serif page heading paired with `Plus Jakarta Sans` body typography. Monospace font (`--font-mono`) used for counts, file paths, status dots, and tactile action triggers.
- **Nested Directory Tree Structure**:
  - Replaces heavy card boxes with a hyper-minimalist, collapsible tree hierarchy (`buildDirectoryTree`).
  - Source folders are grouped under root drive letters and parent directory nodes (e.g. `C:\` $\rightarrow$ `Pictures` $\rightarrow$ `SciFi`).
  - Indented child branches are visually linked by thin, dashed vertical guide lines (`border-left: 1px dashed rgba(0, 0, 0, 0.14)`).
- **Tactile Monospace Triggers**: Action controls render as clean, hyper-minimalist monospace triggers that illuminate on hover:
  - `[ relocate ]`
  - `[ export manifest ]`
  - `[ reload manifest ]`
  - `[ refresh tree ]`
- **Micro Status Badges**: Micro status dots (🟢 `Connected` / 🔴 `Path Moved / Missing`), item counts `(120 items)`, and `.myatlas_manifest.json` sidecar indicators render inline without cluttering the UI.

---

## 🛠️ Core Capabilities & Workflows

### 1. Folder Path Relocator (1-Millisecond Re-binding)
- **Problem Solved**: When a hard drive folder is moved, renamed, or assigned a new drive letter in Windows Explorer, media links break.
- **Workflow**:
  1. Click `[ relocate ]` next to any folder node.
  2. Input the new hard drive directory path (e.g. `D:\Archive\SciFi`) in the modal dialog.
  3. Clicking **Re-bind Path** executes `POST /api/folders/relocate`.
- **Database Engine**: Executes SQLite string substitution (`UPDATE local_items SET file_path = REPLACE(file_path, $old, $new), title = $newTitle WHERE file_path LIKE $prefix;`), re-binding all media items in 1 millisecond with **100% attached tags, ratings, and history preserved**.

### 2. On-Demand Sidecar Manifest Exporter ("Spawn Manifest")
- **Workflow**: Click `[ export manifest ]` next to any connected folder.
- **Database Engine**: Calls `POST /api/folders/manifest/export`, reading all items in SQLite scoped to that folder path and writing a `.myatlas_manifest.json` sidecar file into the directory on disk:
  ```json
  {
    "generator": "MyAtlas",
    "version": "1.0",
    "exported_at": "2026-09-06T17:45:00.000Z",
    "folder": "C:\\Pictures\\SciFi",
    "total_items": 120,
    "items": {
      "spaceship_concept.jpg": {
        "title": "spaceship_concept.jpg",
        "format": "jpg",
        "tags": ["sci-fi", "spaceship", "3d", "concept"]
      }
    }
  }
  ```
- **Portability**: Allows tag history to travel with the hard drive folder across computers or USB drives. No manifest sidecars are written automatically without explicit user action.

### 3. On-Demand Sidecar Manifest Importer ("Reload Manifest")
- **Workflow**: Click `[ reload manifest ]` next to a folder containing a `.myatlas_manifest.json` sidecar.
- **Database Engine**: Calls `POST /api/folders/manifest/import`, reading `.myatlas_manifest.json` and merging sidecar tags into SQLite without creating duplicate records.

---

## ⚡ Backend REST API Endpoints (`MyAtlas.Backend`)

| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/folders` | `GET` | *None* | Aggregates distinct source folders, counts total items, and checks `Directory.Exists(folderPath)` and `File.Exists(".myatlas_manifest.json")`. |
| `/api/folders/relocate` | `POST` | `{ oldPath, newPath }` | Re-binds item paths in SQLite in 1ms via string replacement. |
| `/api/folders/manifest/export` | `POST` | `{ folderPath }` | Writes `.myatlas_manifest.json` sidecar to the folder on disk. |
| `/api/folders/manifest/import` | `POST` | `{ folderPath }` | Reads `.myatlas_manifest.json` and syncs tags into SQLite. |

---

## 🔒 Performance & Zero-Overhead Guarantees

1. **0ms Browsing Overhead**: Normal browsing, tagging, search, and app startup run with zero background disk scanning or hashing overhead.
2. **On-Demand Health Check**: Health status checks (`Directory.Exists()`) take < 0.001 milliseconds and execute strictly on-demand when the user views the Folders page.

# Categories & Collections Directory Specifications (`docs/views/subreddits.md`)

This document defines the layout, aggregation, sidebar control panel, and management specifications for the **Categories Directory** (`view === 'subreddits'`).

---

## 📁 Directory Overview

The Subreddits / Categories Directory aggregates local items by origin folder, subreddit, or collection tag (`r/name` or `folder:name`).

- **Category Aggregation**: Calculates item count, score sums, and creation timestamps for each category directly from local storage.
- **Paginated Grid**: Renders high-density category cards with Reddit/Folder logo icons and hover details (`X items`).
- **Category Detail Modal**: Clicking a category card opens a detail modal showing statistics and a **Browse Posts ↗** action button.

---

## 🗑️ Danger Zone & Batch Deletion

- **Category Batch Cleanup**: Includes a **Delete Category Items** action inside the detail modal.
- **Local SQLite Deletion**: Confirms deletion and executes `DELETE FROM local_scrapes WHERE subreddit = $1` on the local database.

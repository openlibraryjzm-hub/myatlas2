# Users Directory Specifications (`docs/views/users.md`)

This document defines the layout, search filtering, and author aggregation specifications for the **Users & Authors Directory** (`view === 'users'`).

---

## 👤 Directory Overview

The Users Directory provides a centralized catalog of content creators, authors, and artists (`u/username` or `artist:username`) indexed in the local database.

- **Author Aggregation**: Groups items by author/artist tag across local SQLite tables (`local_scrapes` and `local_media`).
- **Real-Time Filtering**: Provides instant inline text filtering by author name or creator handle.
- **Item Count Badges**: Renders item frequency badges per creator.
- **Click Navigation**: Clicking any author card applies an `artist:` or `u/` filter tag and navigates directly to the filtered Browse Grid (`view = 'posts'`).

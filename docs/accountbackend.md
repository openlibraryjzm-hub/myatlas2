# Account & Authentication Backend Engine (`docs/accountbackend.md`)

This document defines the technical specifications, database schema, local password hashing pipeline, session authentication flow, and Discord-style membership role model for **MyAtlas**.

---

## 🏛️ System Architecture Overview

The account system operates on an offline-first, local-to-cloud relational data model. In Phase 1 (Local Desktop), user identities and Sub-Atlas role memberships are managed locally inside `myatlas_server.db` (C# .NET 8 Minimal WebAPI).

```
┌─────────────────────────────────────────────────────────────┐
│                 React 19 Frontend Shell                     │
│    (currentUser Context State • Sign In / Register Forms)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (http://127.0.0.1:7171)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             C# Backend Account & Auth Engine                │
│                 (`MyAtlas.Backend/Program.cs`)              │
├─────────────────────────────────────────────────────────────┤
│ • `users` table (ID, username, display_name, password_hash) │
│ • SHA-256 salted password hashing (`HashUserPassword`)      │
│ • `atlas_members` table (atlas_id, user_id, role)          │
│ • `atlases.owner_user_id` foreign key association            │
│ • 100% Offline & 1-to-1 Supabase Auth Schema Parity        │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 SQLite Database Schema (`myatlas_server.db`)

### 1. `users` Table
Stores registered local user identities:
```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Default Seed Account
The primary default curator account is auto-seeded on database initialization:
- **`id`**: `usr_curator`
- **`username`**: `curator`
- **`display_name`**: `Curator`
- **`password_hash`**: SHA-256 salted hash of `crocattack67`

### 3. `atlas_members` Table
Stores member and moderator role relationships between users and sub-atlases:
```sql
CREATE TABLE IF NOT EXISTS atlas_members (
    atlas_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(atlas_id, user_id)
);
```

#### Role Hierarchy:
- **`owner`** 👑: Atlas Creator / Natural Moderator. Full rights to edit settings, customize palettes, manage members, and delete the atlas.
- **`administrator`** 🛡️: Can manage atlas settings and moderate media.
- **`moderator`** 🛡️: Can edit/delete posts and manage tags within that specific atlas.
- **`contributor`** ✍️: Can upload media and add tags.
- **`member`** 👤: Read-only browse and search access.

### 4. `atlases.owner_user_id` Foreign Key
The `atlases` table includes an explicit `owner_user_id` column linked to `users.id`:
```sql
ALTER TABLE atlases ADD COLUMN owner_user_id TEXT DEFAULT 'usr_curator';
```

---

## 🔒 Local Password Hashing & Security Model

Password authentication uses **SHA-256 hashing with static application salting**:
```csharp
static string HashUserPassword(string rawPassword)
{
    if (string.IsNullOrEmpty(rawPassword)) return "";
    using var sha = System.Security.Cryptography.SHA256.Create();
    byte[] b = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes("myatlas_salt_" + rawPassword));
    return Convert.ToHexString(b);
}
```

### Cloud Conversion Guarantee (Phase 2):
When transitioning online to Supabase / PostgreSQL:
- The `users` table maps directly to Supabase Authentication (`auth.users` & public profiles).
- The `atlas_members` role matrix converts 1-to-1 into PostgreSQL **Row-Level Security (RLS)** policies.

---

## ⚡ REST API Endpoints

| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET /api/users` | `GET` | — | Returns list of all registered local users. |
| `GET /api/users/{username}` | `GET` | — | Returns profile details for a single user by handle. |
| `POST /api/users/login` | `POST` | `{ username, password }` | Verifies password hash and returns active user object. |
| `POST /api/users/register` | `POST` | `{ username, displayName, password }` | Creates user record and generates `usr_<username>_<guid>` ID. |
| `GET /api/atlases` | `GET` | — | Returns sub-atlases with post counts, `ownerUserId`, and `ownerUsername`. |
| `POST /api/atlases` | `POST` | `{ id, title, description, accentColor, ownerUserId }` | Registers sub-atlas and inserts creator as `owner` in `atlas_members`. |

---

## 📄 Related Documentation
- [Sub-Atlas System Architecture](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/sub_atlases.md)
- [Atlas Settings & Moderation Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/atlas_management.md)
- [User Profile Specifications](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/views/users.md)
- [Big Picture Vision & Cloud Strategy](file:///c:/Users/jodyn/Desktop/my%20atlas%202/docs/big_picture_dream.md)

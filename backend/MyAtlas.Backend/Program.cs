using System.Text.Json;
using System.Runtime.InteropServices;
using Microsoft.Data.Sqlite;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on 127.0.0.1:7171
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(7171);
});

// Configure CORS for Tauri and React Vite local dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");

// Initialize Database & Cache Paths
string appDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MyAtlas");
Directory.CreateDirectory(appDataDir);
string cacheDir = Path.Combine(appDataDir, "Cache");
Directory.CreateDirectory(cacheDir);
string dbPath = Path.Combine(appDataDir, "myatlas_server.db");

var connectionStringBuilder = new SqliteConnectionStringBuilder
{
    DataSource = dbPath,
    Mode = SqliteOpenMode.ReadWriteCreate,
    Cache = SqliteCacheMode.Shared,
    DefaultTimeout = 30
};
string connectionString = connectionStringBuilder.ToString();

// Initialize SQLite Tables & Enable WAL Mode
using (var connection = new SqliteConnection(connectionString))
{
    connection.Open();
    using (var pragmaCmd = connection.CreateCommand())
    {
        pragmaCmd.CommandText = "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=10000;";
        pragmaCmd.ExecuteNonQuery();
    }
    var command = connection.CreateCommand();
    command.CommandText = @"
        CREATE TABLE IF NOT EXISTS atlases (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            accent_color TEXT DEFAULT '#CC5A01',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT OR IGNORE INTO atlases (id, title, description, accent_color) 
        VALUES ('myatlas', 'My Atlas', 'Default main atlas archive', '#CC5A01');

        CREATE TABLE IF NOT EXISTS local_items (
            id TEXT PRIMARY KEY,
            file_path TEXT UNIQUE,
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
            tags TEXT,
            atlas_id TEXT DEFAULT 'myatlas',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            extracted_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_local_items_created ON local_items(created_at DESC);
    ";
    command.ExecuteNonQuery();

    try
    {
        using (var alterCmd = connection.CreateCommand())
        {
            alterCmd.CommandText = "ALTER TABLE local_items ADD COLUMN atlas_id TEXT DEFAULT 'myatlas';";
            alterCmd.ExecuteNonQuery();
        }
    }
    catch { /* Column already exists */ }

    using (var idxCmd = connection.CreateCommand())
    {
        idxCmd.CommandText = "CREATE INDEX IF NOT EXISTS idx_local_items_atlas ON local_items(atlas_id);";
        idxCmd.ExecuteNonQuery();
    }

    // Auto-sync existing local_media items from myatlas_local.db into myatlas_server.db
    try
    {
        string tauriDbPath = Path.Combine(appDataDir, "..", "com.tauri.dev", "myatlas_local.db");
        if (File.Exists(tauriDbPath))
        {
            using var tauriConn = new SqliteConnection($"Data Source={tauriDbPath}");
            tauriConn.Open();

            using var cmdRead = tauriConn.CreateCommand();
            cmdRead.CommandText = "SELECT id, file_path, file_name, format, size_bytes, thumbnail_url, tags, created_at FROM local_media;";
            
            var mediaItems = new List<(string id, string path, string name, string format, long size, string thumb, string tags, string created)>();
            using (var reader = cmdRead.ExecuteReader())
            {
                while (reader.Read())
                {
                    mediaItems.Add((
                        reader.GetString(0),
                        reader.IsDBNull(1) ? "" : reader.GetString(1),
                        reader.IsDBNull(2) ? "Untitled" : reader.GetString(2),
                        reader.IsDBNull(3) ? "jpg" : reader.GetString(3),
                        reader.IsDBNull(4) ? 0L : reader.GetInt64(4),
                        reader.IsDBNull(5) ? "" : reader.GetString(5),
                        reader.IsDBNull(6) ? "[]" : reader.GetString(6),
                        reader.IsDBNull(7) ? DateTime.UtcNow.ToString("o") : reader.GetString(7)
                    ));
                }
            }

            if (mediaItems.Count > 0)
            {
                using var tx = connection.BeginTransaction();
                using var insertCmd = connection.CreateCommand();
                insertCmd.Transaction = tx;
                insertCmd.CommandText = @"
                    INSERT OR REPLACE INTO local_items 
                    (id, file_path, title, author, subreddit, format, size_bytes, url, thumbnail_url, tags, created_at)
                    VALUES ($id, $file_path, $title, 'local_creator', 'localatlas', $format, $size_bytes, $url, $thumbnail_url, $tags, $created_at);
                ";

                var pId = insertCmd.Parameters.Add("$id", SqliteType.Text);
                var pPath = insertCmd.Parameters.Add("$file_path", SqliteType.Text);
                var pTitle = insertCmd.Parameters.Add("$title", SqliteType.Text);
                var pFormat = insertCmd.Parameters.Add("$format", SqliteType.Text);
                var pSize = insertCmd.Parameters.Add("$size_bytes", SqliteType.Integer);
                var pUrl = insertCmd.Parameters.Add("$url", SqliteType.Text);
                var pThumb = insertCmd.Parameters.Add("$thumbnail_url", SqliteType.Text);
                var pTags = insertCmd.Parameters.Add("$tags", SqliteType.Text);
                var pCreated = insertCmd.Parameters.Add("$created_at", SqliteType.Text);

                foreach (var item in mediaItems)
                {
                    pId.Value = item.id;
                    pPath.Value = item.path;
                    pTitle.Value = item.name;
                    pFormat.Value = item.format;
                    pSize.Value = item.size;
                    pUrl.Value = $"http://127.0.0.1:7171/api/stream/{item.id}";
                    pThumb.Value = $"http://127.0.0.1:7171/api/thumbnail/{item.id}";
                    pTags.Value = item.tags;
                    pCreated.Value = item.created;
                    insertCmd.ExecuteNonQuery();
                }

                tx.Commit();

                var itemsToPreCache = mediaItems.Select(m => (m.id, m.path)).ToList();
                Task.Run(() =>
                {
                    Parallel.ForEach(itemsToPreCache, new ParallelOptions { MaxDegreeOfParallelism = 8 }, item =>
                    {
                        PreGenerateWebpThumbnail(item.id, item.path, cacheDir);
                    });
                });
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error auto-syncing from myatlas_local.db: {ex.Message}");
    }
}

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// Health Check
app.MapGet("/health", () => Results.Ok(new { status = "ok", version = "1.0.0", port = 7171 }));

// Debug Counts Endpoint
app.MapGet("/api/debug-counts", () =>
{
    string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
    var counts = new Dictionary<string, object>();

    string db1 = Path.Combine(appData, "MyAtlas", "myatlas_server.db");
    if (File.Exists(db1))
    {
        using var conn = new SqliteConnection($"Data Source={db1}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM local_items";
        counts["myatlas_server.db:local_items"] = cmd.ExecuteScalar() ?? 0;
    }

    string db2 = Path.Combine(appData, "com.tauri.dev", "myatlas_local.db");
    if (File.Exists(db2))
    {
        using var conn = new SqliteConnection($"Data Source={db2}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        try
        {
            cmd.CommandText = "SELECT COUNT(*) FROM local_scrapes";
            counts["myatlas_local.db:local_scrapes"] = cmd.ExecuteScalar() ?? 0;
        }
        catch (Exception ex) { counts["myatlas_local.db:local_scrapes_err"] = ex.Message; }

        try
        {
            cmd.CommandText = "SELECT COUNT(*) FROM local_media";
            counts["myatlas_local.db:local_media"] = cmd.ExecuteScalar() ?? 0;
        }
        catch (Exception ex) { counts["myatlas_local.db:local_media_err"] = ex.Message; }
    }

    string db3 = Path.Combine(appData, "com.myatlas.desktop", "myatlas_v1.db");
    if (File.Exists(db3))
    {
        using var conn = new SqliteConnection($"Data Source={db3}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        try
        {
            cmd.CommandText = "SELECT name FROM sqlite_master WHERE type='table'";
            using var reader = cmd.ExecuteReader();
            var tables = new List<string>();
            while (reader.Read()) tables.Add(reader.GetString(0));
            foreach (var tbl in tables)
            {
                using var cmd2 = conn.CreateCommand();
                cmd2.CommandText = $"SELECT COUNT(*) FROM {tbl}";
                counts[$"myatlas_v1.db:{tbl}"] = cmd2.ExecuteScalar() ?? 0;
            }
        }
        catch (Exception ex) { counts["myatlas_v1.db_err"] = ex.Message; }
    }

    return Results.Ok(counts);
});

// Stats Endpoint
app.MapGet("/api/stats", () =>
{
    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var cmd = conn.CreateCommand();

    cmd.CommandText = "SELECT COUNT(*) FROM local_items;";
    long totalCount = (long)(cmd.ExecuteScalar() ?? 0L);

    cmd.CommandText = "SELECT tags FROM local_items;";
    var subs = new HashSet<string>();
    var users = new HashSet<string>();

    using (var reader = cmd.ExecuteReader())
    {
        while (reader.Read())
        {
            var rawTags = reader.IsDBNull(0) ? null : reader.GetString(0);
            if (!string.IsNullOrEmpty(rawTags))
            {
                try
                {
                    var tags = JsonSerializer.Deserialize<List<string>>(rawTags);
                    if (tags != null)
                    {
                        foreach (var tag in tags)
                        {
                            if (tag.StartsWith("r/")) subs.Add(tag);
                            if (tag.StartsWith("u/")) users.Add(tag);
                        }
                    }
                }
                catch { }
            }
        }
    }

    return Results.Ok(new
    {
        totalCount,
        subredditsCount = subs.Count,
        usersCount = users.Count,
        savesCount = 0
    });
});

// List All Sub-Atlases with Post Counts
app.MapGet("/api/atlases", () =>
{
    using var conn = new SqliteConnection(connectionString);
    conn.Open();

    var result = new List<object>();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT a.id, a.title, a.description, a.accent_color, a.created_at, COUNT(l.id) as item_count
        FROM atlases a
        LEFT JOIN local_items l ON a.id = l.atlas_id
        GROUP BY a.id, a.title, a.description, a.accent_color, a.created_at
        ORDER BY a.created_at ASC;
    ";

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new
        {
            id = reader.GetString(0),
            title = reader.GetString(1),
            description = reader.IsDBNull(2) ? "" : reader.GetString(2),
            accentColor = reader.IsDBNull(3) ? "#CC5A01" : reader.GetString(3),
            createdAt = reader.IsDBNull(4) ? "" : reader.GetString(4),
            itemCount = reader.GetInt64(5)
        });
    }

    return Results.Ok(result);
});

// Get Single Sub-Atlas Details
app.MapGet("/api/atlases/{id}", (string id) =>
{
    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT a.id, a.title, a.description, a.accent_color, a.created_at, COUNT(l.id) as item_count
        FROM atlases a
        LEFT JOIN local_items l ON a.id = l.atlas_id
        WHERE LOWER(a.id) = LOWER($id)
        GROUP BY a.id, a.title, a.description, a.accent_color, a.created_at;
    ";
    cmd.Parameters.AddWithValue("$id", id.Trim());

    using var reader = cmd.ExecuteReader();
    if (reader.Read())
    {
        return Results.Ok(new
        {
            id = reader.GetString(0),
            title = reader.GetString(1),
            description = reader.IsDBNull(2) ? "" : reader.GetString(2),
            accentColor = reader.IsDBNull(3) ? "#CC5A01" : reader.GetString(3),
            createdAt = reader.IsDBNull(4) ? "" : reader.GetString(4),
            itemCount = reader.GetInt64(5)
        });
    }
    return Results.NotFound(new { error = $"Atlas '{id}' not found" });
});

// Create or Update Sub-Atlas
app.MapPost("/api/atlases", async (HttpRequest request) =>
{
    try
    {
        using var reader = new StreamReader(request.Body);
        var bodyText = await reader.ReadToEndAsync();
        using var doc = JsonDocument.Parse(bodyText);
        var root = doc.RootElement;

        string id = root.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : (root.TryGetProperty("slug", out var slugProp) ? slugProp.GetString() ?? "" : "");
        id = id.Trim().ToLower().Replace(" ", "_");
        if (string.IsNullOrEmpty(id)) return Results.BadRequest(new { error = "Atlas ID/slug is required" });

        string title = root.TryGetProperty("title", out var titleProp) ? titleProp.GetString() ?? id : id;
        string description = root.TryGetProperty("description", out var descProp) ? descProp.GetString() ?? "" : "";
        string accentColor = root.TryGetProperty("accentColor", out var colorProp) ? colorProp.GetString() ?? "#CC5A01" : "#CC5A01";

        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO atlases (id, title, description, accent_color)
            VALUES ($id, $title, $description, $color)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                accent_color = excluded.accent_color;
        ";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.Parameters.AddWithValue("$title", title);
        cmd.Parameters.AddWithValue("$description", description);
        cmd.Parameters.AddWithValue("$color", accentColor);
        cmd.ExecuteNonQuery();

        return Results.Ok(new { success = true, id, title, description, accentColor });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// Delete Sub-Atlas (reassigns posts to 'myatlas')
app.MapDelete("/api/atlases/{id}", (string id) =>
{
    if (id.Equals("myatlas", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { error = "Cannot delete default 'myatlas' atlas" });
    }

    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var tx = conn.BeginTransaction();

    using (var reassignCmd = conn.CreateCommand())
    {
        reassignCmd.Transaction = tx;
        reassignCmd.CommandText = "UPDATE local_items SET atlas_id = 'myatlas' WHERE LOWER(atlas_id) = LOWER($id);";
        reassignCmd.Parameters.AddWithValue("$id", id);
        reassignCmd.ExecuteNonQuery();
    }

    using (var deleteCmd = conn.CreateCommand())
    {
        deleteCmd.Transaction = tx;
        deleteCmd.CommandText = "DELETE FROM atlases WHERE LOWER(id) = LOWER($id);";
        deleteCmd.Parameters.AddWithValue("$id", id);
        deleteCmd.ExecuteNonQuery();
    }

    tx.Commit();
    return Results.Ok(new { success = true, id });
});

// Paginated & Filtered Posts
app.MapGet("/api/posts", (int page = 1, int limit = 40, string? search = null, string? tags = null, string? atlas = null, string? atlas_id = null) =>
{
    page = Math.Max(1, page);
    limit = Math.Clamp(limit, 1, 10000);
    string? activeAtlas = !string.IsNullOrEmpty(atlas_id) ? atlas_id : atlas;

    var activeFilters = (tags ?? "").Split(new[] { ' ', ',' }, StringSplitOptions.RemoveEmptyEntries)
                                    .Select(t => t.Trim().ToLower())
                                    .ToList();

    using var conn = new SqliteConnection(connectionString);
    conn.Open();

    // 1. Build dynamic WHERE clause
    var conditions = new List<string>();
    if (!string.IsNullOrWhiteSpace(activeAtlas))
    {
        conditions.Add("LOWER(atlas_id) = $atlas_id");
    }
    if (!string.IsNullOrWhiteSpace(search))
    {
        conditions.Add("(LOWER(title) LIKE $search OR LOWER(author) LIKE $search OR LOWER(subreddit) LIKE $search OR EXISTS (SELECT 1 FROM json_each(local_items.tags) WHERE LOWER(value) LIKE $search))");
    }
    for (int i = 0; i < activeFilters.Count; i++)
    {
        conditions.Add($"(EXISTS (SELECT 1 FROM json_each(local_items.tags) WHERE LOWER(value) = $tag_{i} OR LOWER(value) LIKE '%:' || $tag_{i} OR LOWER(value) LIKE '%/' || $tag_{i}) OR LOWER(title) LIKE $tag_like_{i} OR LOWER(author) LIKE $tag_like_{i} OR LOWER(subreddit) LIKE $tag_like_{i})");
    }

    string whereClause = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";

    void BindParameters(SqliteCommand cmd)
    {
        if (!string.IsNullOrWhiteSpace(activeAtlas))
        {
            cmd.Parameters.AddWithValue("$atlas_id", activeAtlas.Trim().ToLower());
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            cmd.Parameters.AddWithValue("$search", $"%{search.Trim().ToLower()}%");
        }
        for (int i = 0; i < activeFilters.Count; i++)
        {
            cmd.Parameters.AddWithValue($"$tag_{i}", activeFilters[i]);
            cmd.Parameters.AddWithValue($"$tag_like_{i}", $"%{activeFilters[i]}%");
        }
    }

    // 2. Count total matching rows natively in SQL
    long totalFiltered = 0;
    using (var countCmd = conn.CreateCommand())
    {
        countCmd.CommandText = $"SELECT COUNT(*) FROM local_items {whereClause};";
        BindParameters(countCmd);
        totalFiltered = (long)(countCmd.ExecuteScalar() ?? 0L);
    }

    // 3. Fetch paginated records directly via SQL LIMIT / OFFSET
    int offset = (page - 1) * limit;
    var items = new List<object>();

    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = $"SELECT * FROM local_items {whereClause} ORDER BY created_at DESC LIMIT $limit OFFSET $offset;";
        BindParameters(cmd);
        cmd.Parameters.AddWithValue("$limit", limit);
        cmd.Parameters.AddWithValue("$offset", offset);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var id = reader.GetString(0);
            var filePath = reader.IsDBNull(1) ? "" : reader.GetString(1);
            var title = reader.IsDBNull(2) ? "Untitled" : reader.GetString(2);
            var author = reader.IsDBNull(3) ? "unknown" : reader.GetString(3);
            var subreddit = reader.IsDBNull(4) ? "imported" : reader.GetString(4);
            var format = reader.IsDBNull(5) ? "jpg" : reader.GetString(5);
            var sizeBytes = reader.IsDBNull(6) ? 0L : reader.GetInt64(6);
            var url = reader.IsDBNull(7) ? "" : reader.GetString(7);
            var thumbnail = reader.IsDBNull(8) ? "" : reader.GetString(8);
            var permalink = reader.IsDBNull(9) ? "" : reader.GetString(9);
            var score = reader.IsDBNull(10) ? 0 : reader.GetInt32(10);
            var commentsCount = reader.IsDBNull(11) ? 0 : reader.GetInt32(11);
            var rawTags = reader.IsDBNull(12) ? "[]" : reader.GetString(12);
            var atlasId = reader.FieldCount > 13 && !reader.IsDBNull(13) ? reader.GetString(13) : "myatlas";

            List<string> itemTags = new();
            try { itemTags = JsonSerializer.Deserialize<List<string>>(rawTags) ?? new(); } catch { }

            items.Add(new
            {
                id,
                filePath,
                title,
                author,
                subreddit,
                format,
                sizeBytes,
                url = !string.IsNullOrEmpty(url) ? url : $"http://127.0.0.1:7171/api/stream/{id}",
                thumbnail = !string.IsNullOrEmpty(thumbnail) ? thumbnail : $"http://127.0.0.1:7171/api/thumbnail/{id}",
                permalink,
                score,
                commentsCount,
                tags = itemTags,
                atlas_id = atlasId
            });
        }
    }

    return Results.Ok(new
    {
        total = totalFiltered,
        page,
        limit,
        posts = items
    });
});

// Update Item Tags
app.MapPost("/api/posts/{id}/tags", async (string id, HttpRequest request) =>
{
    try
    {
        using var reader = new StreamReader(request.Body);
        var bodyText = await reader.ReadToEndAsync();
        var newTags = JsonSerializer.Deserialize<List<string>>(bodyText) ?? new List<string>();

        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE local_items SET tags = $tags WHERE id = $id;";
        cmd.Parameters.AddWithValue("$tags", JsonSerializer.Serialize(newTags));
        cmd.Parameters.AddWithValue("$id", id);
        int affected = cmd.ExecuteNonQuery();

        return Results.Ok(new { success = true, id, tags = newTags, affected });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { success = false, error = ex.Message });
    }
});

// Tags Matrix Statistics
app.MapGet("/api/tags", () =>
{
    var tagCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT tags FROM local_items;";

    using (var reader = cmd.ExecuteReader())
    {
        while (reader.Read())
        {
            var raw = reader.IsDBNull(0) ? null : reader.GetString(0);
            if (!string.IsNullOrEmpty(raw))
            {
                try
                {
                    var tags = JsonSerializer.Deserialize<List<string>>(raw);
                    if (tags != null)
                    {
                        foreach (var tag in tags)
                        {
                            tagCounts[tag] = tagCounts.GetValueOrDefault(tag, 0) + 1;
                        }
                    }
                }
                catch { }
            }
        }
    }

    var result = tagCounts.Select(kv => new { name = kv.Key, count = kv.Value }).ToList();
    return Results.Ok(result);
});

// Video & Media Stream Endpoint (Supports HTTP 206 Range Processing for Instant Seeking)
app.MapGet("/api/stream/{id}", (string id) =>
{
    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT file_path, url, format FROM local_items WHERE id = $id LIMIT 1;";
    cmd.Parameters.AddWithValue("$id", id);

    using var reader = cmd.ExecuteReader();
    if (!reader.Read()) return Results.NotFound();

    var filePath = reader.IsDBNull(0) ? "" : reader.GetString(0);
    var url = reader.IsDBNull(1) ? "" : reader.GetString(1);
    var format = reader.IsDBNull(2) ? "mp4" : reader.GetString(2).ToLower();

    var targetPath = !string.IsNullOrEmpty(filePath) && File.Exists(filePath) ? filePath : url;
    if (targetPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || targetPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
    {
        return Results.Redirect(targetPath);
    }
    if (!File.Exists(targetPath)) return Results.NotFound();

    string contentType = format switch
    {
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "mov" => "video/quicktime",
        "png" => "image/png",
        "jpg" or "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "application/octet-stream"
    };

    return Results.File(targetPath, contentType, enableRangeProcessing: true);
});

// Fast 300px Static WebP Thumbnail Generator & Proxy Cache
app.MapGet("/api/thumbnail/{**id}", async (HttpContext context, string id) =>
{
    if (string.IsNullOrEmpty(id)) return Results.NotFound();
    id = Uri.UnescapeDataString(id);

    context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
    string cacheKey = string.Join("_", id.Split(Path.GetInvalidFileNameChars())).Replace(":", "_").Replace("/", "_").Replace("\\", "_");
    if (cacheKey.Length > 120) cacheKey = $"hash_{Math.Abs(id.GetHashCode())}_{cacheKey[..100]}";
    string cachedWebpPath = Path.Combine(cacheDir, $"{cacheKey}.webp");
    if (File.Exists(cachedWebpPath) && new FileInfo(cachedWebpPath).Length > 0)
    {
        return Results.File(cachedWebpPath, "image/webp");
    }

    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT file_path, url, thumbnail_url, format FROM local_items WHERE id = $id OR file_path = $id LIMIT 1;";
    cmd.Parameters.AddWithValue("$id", id);

    using var reader = cmd.ExecuteReader();
    string filePath = "";
    string url = "";
    string thumbnailUrl = "";

    if (reader.Read())
    {
        filePath = reader.IsDBNull(0) ? "" : reader.GetString(0);
        url = reader.IsDBNull(1) ? "" : reader.GetString(1);
        thumbnailUrl = reader.IsDBNull(2) ? "" : reader.GetString(2);
    }
    else if (File.Exists(id))
    {
        filePath = id;
    }

    string targetUrl = "";
    if (!string.IsNullOrEmpty(thumbnailUrl) && !thumbnailUrl.Contains("/api/thumbnail/") && !thumbnailUrl.StartsWith("blob:", StringComparison.OrdinalIgnoreCase))
    {
        targetUrl = thumbnailUrl;
    }
    else if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath))
    {
        targetUrl = filePath;
    }
    else if (!string.IsNullOrEmpty(url) && !url.Contains("/api/") && !url.StartsWith("blob:", StringComparison.OrdinalIgnoreCase))
    {
        targetUrl = url;
    }

    if (string.IsNullOrEmpty(targetUrl)) return Results.NotFound();

    try
    {
        if (File.Exists(targetUrl))
        {
            var ext = Path.GetExtension(targetUrl).ToLower();
            if (ext is ".mp4" or ".webm" or ".mov" or ".mkv" or ".avi")
            {
                using var videoImg = WindowsThumbnailProvider.GetVideoFrameImage(targetUrl, 300);
                if (videoImg != null)
                {
                    videoImg.Mutate(x => x.Resize(new ResizeOptions { Size = new SixLabors.ImageSharp.Size(300, 300), Mode = ResizeMode.Max }));
                    await videoImg.SaveAsWebpAsync(cachedWebpPath);
                    return Results.File(cachedWebpPath, "image/webp");
                }
                return Results.NotFound();
            }
            else
            {
                byte[] imageBytes = await File.ReadAllBytesAsync(targetUrl);
                if (imageBytes.Length > 0)
                {
                    using var image = Image.Load(imageBytes);
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new SixLabors.ImageSharp.Size(300, 300),
                        Mode = ResizeMode.Max
                    }));
                    await image.SaveAsWebpAsync(cachedWebpPath);
                    return Results.File(cachedWebpPath, "image/webp");
                }
            }
        }
        return Results.NotFound();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error generating WebP thumbnail for {id}: {ex.Message}");
        return Results.NotFound();
    }
});

void PreGenerateWebpThumbnail(string id, string targetUrl, string cacheDir)
{
    if (string.IsNullOrEmpty(targetUrl) || string.IsNullOrEmpty(id) || targetUrl.Contains("/api/thumbnail/") || targetUrl.StartsWith("blob:", StringComparison.OrdinalIgnoreCase)) return;
    string cacheKey = string.Join("_", id.Split(Path.GetInvalidFileNameChars())).Replace(":", "_").Replace("/", "_").Replace("\\", "_");
    if (cacheKey.Length > 120) cacheKey = $"hash_{Math.Abs(id.GetHashCode())}_{cacheKey[..100]}";
    string cachedWebpPath = Path.Combine(cacheDir, $"{cacheKey}.webp");
    if (File.Exists(cachedWebpPath) && new FileInfo(cachedWebpPath).Length > 0) return;

    try
    {
        if (File.Exists(targetUrl))
        {
            var ext = Path.GetExtension(targetUrl).ToLower();
            if (ext is ".mp4" or ".webm" or ".mov" or ".mkv" or ".avi")
            {
                using var videoImg = WindowsThumbnailProvider.GetVideoFrameImage(targetUrl, 300);
                if (videoImg != null)
                {
                    videoImg.Mutate(x => x.Resize(new ResizeOptions { Size = new SixLabors.ImageSharp.Size(300, 300), Mode = ResizeMode.Max }));
                    videoImg.SaveAsWebp(cachedWebpPath);
                }
            }
            else
            {
                byte[] imageBytes = File.ReadAllBytes(targetUrl);
                if (imageBytes.Length > 0)
                {
                    using var image = Image.Load(imageBytes);
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new SixLabors.ImageSharp.Size(300, 300),
                        Mode = ResizeMode.Max
                    }));
                    image.SaveAsWebp(cachedWebpPath);
                }
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error pre-generating WebP thumbnail for {id}: {ex.Message}");
    }
}

// Batch Import JSON Scrape Items Endpoint
app.MapPost("/api/import", async (HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    var bodyText = await reader.ReadToEndAsync();

    using var doc = JsonDocument.Parse(bodyText);
    List<JsonElement> items = new();
    try
    {
        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
            items = doc.RootElement.EnumerateArray().ToList();
        }
        else if (doc.RootElement.TryGetProperty("posts", out var postsProp) && postsProp.ValueKind == JsonValueKind.Array)
        {
            items = postsProp.EnumerateArray().ToList();
        }
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = $"Invalid JSON payload: {ex.Message}" });
    }

    if (items.Count == 0)
    {
        return Results.Ok(new { success = true, count = 0 });
    }

    int importedCount = 0;
    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var tx = conn.BeginTransaction();
    using var cmd = conn.CreateCommand();
    cmd.Transaction = tx;
    cmd.CommandText = @"
        INSERT OR REPLACE INTO local_items 
        (id, file_path, title, author, subreddit, format, size_bytes, url, thumbnail_url, permalink, score, comments_count, tags, atlas_id, extracted_at)
        VALUES ($id, $file_path, $title, $author, $subreddit, $format, $size_bytes, $url, $thumbnail_url, $permalink, $score, $comments_count, $tags, $atlas_id, $extracted_at);
    ";

    var pId = cmd.Parameters.Add("$id", SqliteType.Text);
    var pPath = cmd.Parameters.Add("$file_path", SqliteType.Text);
    var pTitle = cmd.Parameters.Add("$title", SqliteType.Text);
    var pAuthor = cmd.Parameters.Add("$author", SqliteType.Text);
    var pSub = cmd.Parameters.Add("$subreddit", SqliteType.Text);
    var pFormat = cmd.Parameters.Add("$format", SqliteType.Text);
    var pSize = cmd.Parameters.Add("$size_bytes", SqliteType.Integer);
    var pUrl = cmd.Parameters.Add("$url", SqliteType.Text);
    var pThumb = cmd.Parameters.Add("$thumbnail_url", SqliteType.Text);
    var pPermalink = cmd.Parameters.Add("$permalink", SqliteType.Text);
    var pScore = cmd.Parameters.Add("$score", SqliteType.Integer);
    var pComments = cmd.Parameters.Add("$comments_count", SqliteType.Integer);
    var pTags = cmd.Parameters.Add("$tags", SqliteType.Text);
    var pAtlasId = cmd.Parameters.Add("$atlas_id", SqliteType.Text);
    var pExtracted = cmd.Parameters.Add("$extracted_at", SqliteType.Text);

    var itemsToPreThumbnail = new List<(string id, string targetUrl)>();

    foreach (var el in items)
    {
        string id = el.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : (el.TryGetProperty("reddit_id", out var ridProp) ? ridProp.GetString() ?? "" : "");
        if (string.IsNullOrEmpty(id))
        {
            string urlVal = el.TryGetProperty("url", out var uVal) ? uVal.GetString() ?? "" : (el.TryGetProperty("permalink", out var pVal) ? pVal.GetString() ?? "" : "");
            string titleVal = el.TryGetProperty("title", out var tVal) ? tVal.GetString() ?? "" : "";
            id = !string.IsNullOrEmpty(urlVal) ? $"item_{Math.Abs(urlVal.GetHashCode())}" : (!string.IsNullOrEmpty(titleVal) ? $"item_{Math.Abs(titleVal.GetHashCode())}_{importedCount}" : $"import_{Guid.NewGuid().ToString("N")[..8]}");
        }

        string filePath = el.TryGetProperty("filePath", out var fpProp) ? fpProp.GetString() ?? "" : "";
        string title = el.TryGetProperty("title", out var titleProp) ? titleProp.GetString() ?? "Untitled" : "Untitled";
        string author = el.TryGetProperty("author", out var authProp) ? authProp.GetString() ?? "unknown" : "unknown";
        string subreddit = el.TryGetProperty("subreddit", out var subProp) ? subProp.GetString() ?? "imported" : "imported";
        string format = el.TryGetProperty("format", out var fmtProp) ? fmtProp.GetString() ?? "jpg" : "jpg";
        long sizeBytes = el.TryGetProperty("sizeBytes", out var sizeProp) && sizeProp.ValueKind == JsonValueKind.Number ? sizeProp.GetInt64() : 0;
        string url = el.TryGetProperty("url", out var urlProp) ? urlProp.GetString() ?? "" : (el.TryGetProperty("mediaUrl", out var murlProp) ? murlProp.GetString() ?? "" : "");
        string thumbnailUrl = el.TryGetProperty("thumbnail", out var thumbProp) ? thumbProp.GetString() ?? "" : (el.TryGetProperty("thumbnail_url", out var turlProp) ? turlProp.GetString() ?? "" : "");
        string permalink = el.TryGetProperty("permalink", out var permProp) ? permProp.GetString() ?? "" : "";
        int score = el.TryGetProperty("score", out var scoreProp) && scoreProp.ValueKind == JsonValueKind.Number ? scoreProp.GetInt32() : 0;
        int commentsCount = el.TryGetProperty("commentsCount", out var commProp) && commProp.ValueKind == JsonValueKind.Number ? commProp.GetInt32() : (el.TryGetProperty("comments_count", out var cProp) && cProp.ValueKind == JsonValueKind.Number ? cProp.GetInt32() : 0);

        string atlasId = el.TryGetProperty("atlas_id", out var aProp) ? aProp.GetString() ?? "" : (el.TryGetProperty("atlasId", out var aIdProp) ? aIdProp.GetString() ?? "" : "");
        if (string.IsNullOrEmpty(atlasId)) atlasId = "myatlas";

        List<string> tagsList = new();
        if (el.TryGetProperty("derivedTags", out var dtProp) && dtProp.ValueKind == JsonValueKind.Array)
        {
            tagsList = dtProp.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList();
        }
        else if (el.TryGetProperty("tags", out var tProp))
        {
            if (tProp.ValueKind == JsonValueKind.Array)
            {
                tagsList = tProp.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList();
            }
            else if (tProp.ValueKind == JsonValueKind.String)
            {
                try { tagsList = JsonSerializer.Deserialize<List<string>>(tProp.GetString() ?? "") ?? new(); } catch { }
            }
        }

        string extractedAt = el.TryGetProperty("extracted_at", out var extProp) ? extProp.GetString() ?? DateTime.UtcNow.ToString("o") : DateTime.UtcNow.ToString("o");

        string cleanThumbnailUrl = (!string.IsNullOrEmpty(thumbnailUrl) && !thumbnailUrl.Contains("/api/thumbnail/") && !thumbnailUrl.StartsWith("blob:", StringComparison.OrdinalIgnoreCase))
            ? thumbnailUrl
            : ((!string.IsNullOrEmpty(url) && !url.Contains("/api/") && !url.StartsWith("blob:", StringComparison.OrdinalIgnoreCase)) ? url : "");

        string cleanUrl = (!string.IsNullOrEmpty(url) && !url.Contains("/api/stream/") && !url.StartsWith("blob:", StringComparison.OrdinalIgnoreCase))
            ? url
            : "";

        pId.Value = id;
        pPath.Value = filePath;
        pTitle.Value = title;
        pAuthor.Value = author;
        pSub.Value = subreddit;
        pFormat.Value = format;
        pSize.Value = sizeBytes;
        pUrl.Value = !string.IsNullOrEmpty(cleanUrl) ? cleanUrl : url;
        pThumb.Value = cleanThumbnailUrl;
        pPermalink.Value = permalink;
        pScore.Value = score;
        pComments.Value = commentsCount;
        pTags.Value = JsonSerializer.Serialize(tagsList);
        pAtlasId.Value = atlasId;
        pExtracted.Value = extractedAt;

        cmd.ExecuteNonQuery();
        importedCount++;

        string targetPreUrl = !string.IsNullOrEmpty(thumbnailUrl) && !thumbnailUrl.Contains("/api/thumbnail/") && !thumbnailUrl.StartsWith("blob:", StringComparison.OrdinalIgnoreCase)
            ? thumbnailUrl 
            : (!string.IsNullOrEmpty(filePath) && File.Exists(filePath) ? filePath : (!url.Contains("/api/") && !url.StartsWith("blob:", StringComparison.OrdinalIgnoreCase) ? url : ""));
        if (!string.IsNullOrEmpty(targetPreUrl))
        {
            itemsToPreThumbnail.Add((id, targetPreUrl));
        }
    }

    tx.Commit();

    // Launch parallel background WebP thumbnail pre-generation
    if (itemsToPreThumbnail.Count > 0)
    {
        _ = Task.Run(() =>
        {
            Parallel.ForEach(itemsToPreThumbnail, new ParallelOptions { MaxDegreeOfParallelism = 6 }, item =>
            {
                PreGenerateWebpThumbnail(item.id, item.targetUrl, cacheDir);
            });
        });
    }

    return Results.Ok(new { success = true, count = importedCount });
});

// High-Speed Multi-Threaded Folder Disk Scanner
app.MapPost("/api/scan", async (HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    var bodyText = await reader.ReadToEndAsync();

    string targetFolder = "";
    try
    {
        using var doc = JsonDocument.Parse(bodyText);
        if (doc.RootElement.TryGetProperty("path", out var pathProp))
        {
            targetFolder = pathProp.GetString() ?? "";
        }
    }
    catch { }

    if (string.IsNullOrEmpty(targetFolder) || !Directory.Exists(targetFolder))
    {
        return Results.BadRequest(new { error = "Invalid or non-existent folder directory path" });
    }

    var validExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4", ".webm", ".mov", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".txt", ".json"
    };

    int addedCount = 0;
    var searchOption = SearchOption.AllDirectories;

    try
    {
        var files = Directory.EnumerateFiles(targetFolder, "*.*", searchOption)
                             .Where(f => validExtensions.Contains(Path.GetExtension(f)))
                             .ToList();

        using var conn = new SqliteConnection(connectionString);
        conn.Open();

        using var tx = conn.BeginTransaction();
        using var cmd = conn.CreateCommand();
        cmd.Transaction = tx;
        cmd.CommandText = @"
            INSERT OR REPLACE INTO local_items 
            (id, file_path, title, author, subreddit, format, size_bytes, url, thumbnail_url, tags, created_at)
            VALUES ($id, $file_path, $title, $author, $subreddit, $format, $size_bytes, $url, $thumbnail_url, $tags, CURRENT_TIMESTAMP);
        ";

        var pId = cmd.Parameters.Add("$id", SqliteType.Text);
        var pPath = cmd.Parameters.Add("$file_path", SqliteType.Text);
        var pTitle = cmd.Parameters.Add("$title", SqliteType.Text);
        var pAuthor = cmd.Parameters.Add("$author", SqliteType.Text);
        var pSub = cmd.Parameters.Add("$subreddit", SqliteType.Text);
        var pFormat = cmd.Parameters.Add("$format", SqliteType.Text);
        var pSize = cmd.Parameters.Add("$size_bytes", SqliteType.Integer);
        var pUrl = cmd.Parameters.Add("$url", SqliteType.Text);
        var pThumb = cmd.Parameters.Add("$thumbnail_url", SqliteType.Text);
        var pTags = cmd.Parameters.Add("$tags", SqliteType.Text);

        string scanTimestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");

        var itemsToPreThumbnail = new List<(string id, string targetUrl)>();

        foreach (var file in files)
        {
            var fileInfo = new FileInfo(file);
            var ext = fileInfo.Extension.TrimStart('.').ToLower();
            var fileName = fileInfo.Name;
            var id = $"file_{fileInfo.LastWriteTimeUtc.Ticks}_{Math.Abs(file.GetHashCode())}";

            var tags = new List<string>
            {
                $"format:{ext}",
                $"meta:extension:{ext}",
                $"meta:upload:{scanTimestamp}"
            };
            if (ext is "mp4" or "webm" or "mov") tags.Add("meta:format:video");
            if (ext is "png" or "jpg" or "jpeg" or "gif" or "webp") tags.Add("meta:format:image");

            pId.Value = id;
            pPath.Value = file;
            pTitle.Value = fileName;
            pAuthor.Value = "local_creator";
            pSub.Value = "disk_directory";
            pFormat.Value = ext;
            pSize.Value = fileInfo.Length;
            pUrl.Value = $"http://127.0.0.1:7171/api/stream/{id}";
            pThumb.Value = $"http://127.0.0.1:7171/api/thumbnail/{id}";
            pTags.Value = JsonSerializer.Serialize(tags);

            cmd.ExecuteNonQuery();
            addedCount++;
            itemsToPreThumbnail.Add((id, file));
        }

        tx.Commit();

        if (itemsToPreThumbnail.Count > 0)
        {
            _ = Task.Run(() =>
            {
                Parallel.ForEach(itemsToPreThumbnail, new ParallelOptions { MaxDegreeOfParallelism = 6 }, item =>
                {
                    PreGenerateWebpThumbnail(item.id, item.targetUrl, cacheDir);
                });
            });
        }
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }

    return Results.Ok(new { success = true, scannedFolder = targetFolder, itemsIndexed = addedCount });
});

// Clear All Database Items
app.MapPost("/api/clear", () =>
{
    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = "DELETE FROM local_items;";
    cmd.ExecuteNonQuery();

    if (Directory.Exists(cacheDir))
    {
        foreach (var file in Directory.GetFiles(cacheDir))
        {
            try { File.Delete(file); } catch { }
        }
    }

    return Results.Ok(new { success = true, message = "C# SQLite database and thumbnail cache wiped clean." });
});

// Pre-Cache WebP Thumbnails for All Database Items in Parallel Background Threads
app.MapPost("/api/precache", () =>
{
    var itemsToPreThumbnail = new List<(string id, string targetUrl)>();
    using (var conn = new SqliteConnection(connectionString))
    {
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id, file_path, url, thumbnail_url FROM local_items;";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var id = reader.GetString(0);
            var filePath = reader.IsDBNull(1) ? "" : reader.GetString(1);
            var url = reader.IsDBNull(2) ? "" : reader.GetString(2);
            var thumbnailUrl = reader.IsDBNull(3) ? "" : reader.GetString(3);
            string targetUrl = !string.IsNullOrEmpty(thumbnailUrl) && !thumbnailUrl.Contains("/api/thumbnail/") && !thumbnailUrl.StartsWith("blob:", StringComparison.OrdinalIgnoreCase)
                ? thumbnailUrl 
                : (!string.IsNullOrEmpty(filePath) && File.Exists(filePath) ? filePath : (!url.Contains("/api/") && !url.StartsWith("blob:", StringComparison.OrdinalIgnoreCase) ? url : ""));
            
            string cachedWebpPath = Path.Combine(cacheDir, $"{id}.webp");
            bool isMissingOrCorrupt = !File.Exists(cachedWebpPath) || new FileInfo(cachedWebpPath).Length == 0;
            
            if (!string.IsNullOrEmpty(id) && !string.IsNullOrEmpty(targetUrl) && isMissingOrCorrupt)
            {
                itemsToPreThumbnail.Add((id, targetUrl));
            }
        }
    }

    _ = Task.Run(() =>
    {
        Parallel.ForEach(itemsToPreThumbnail, new ParallelOptions { MaxDegreeOfParallelism = 8 }, item =>
        {
            PreGenerateWebpThumbnail(item.id, item.targetUrl, cacheDir);
        });
    });

    return Results.Ok(new { success = true, count = itemsToPreThumbnail.Count, message = "Background thumbnail pre-caching launched." });
});

// Delete Database Items By Tag Endpoint
app.MapPost("/api/delete-by-tag", async (HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    var bodyText = await reader.ReadToEndAsync();

    string targetTag = "";
    try
    {
        using var doc = JsonDocument.Parse(bodyText);
        if (doc.RootElement.TryGetProperty("tag", out var tagProp))
        {
            targetTag = tagProp.GetString() ?? "";
        }
    }
    catch { }

    if (string.IsNullOrWhiteSpace(targetTag))
    {
        return Results.BadRequest(new { error = "Missing or empty 'tag' parameter" });
    }

    using var conn = new SqliteConnection(connectionString);
    conn.Open();

    // 1. Find matching IDs to clean up thumbnail cache
    var matchingIds = new List<string>();
    using (var selectCmd = conn.CreateCommand())
    {
        selectCmd.CommandText = "SELECT id, tags FROM local_items;";
        using var readerResult = selectCmd.ExecuteReader();
        while (readerResult.Read())
        {
            var id = readerResult.GetString(0);
            var rawTags = readerResult.IsDBNull(1) ? "" : readerResult.GetString(1);
            if (!string.IsNullOrEmpty(rawTags))
            {
                try
                {
                    var tags = JsonSerializer.Deserialize<List<string>>(rawTags);
                    if (tags != null && tags.Any(t => t.Equals(targetTag, StringComparison.OrdinalIgnoreCase)))
                    {
                        matchingIds.Add(id);
                    }
                }
                catch { }
            }
        }
    }

    if (matchingIds.Count == 0)
    {
        return Results.Ok(new { success = true, deletedCount = 0, message = $"No posts found with tag '{targetTag}'" });
    }

    // 2. Delete matching rows from database
    using var tx = conn.BeginTransaction();
    using var deleteCmd = conn.CreateCommand();
    deleteCmd.Transaction = tx;

    int deletedCount = 0;
    foreach (var id in matchingIds)
    {
        deleteCmd.CommandText = "DELETE FROM local_items WHERE id = $id;";
        deleteCmd.Parameters.Clear();
        deleteCmd.Parameters.AddWithValue("$id", id);
        deletedCount += deleteCmd.ExecuteNonQuery();

        // Remove cached thumbnail file
        string cachedPath = Path.Combine(cacheDir, $"{id}_thumb.jpg");
        if (File.Exists(cachedPath))
        {
            try { File.Delete(cachedPath); } catch { }
        }
    }
    tx.Commit();

    return Results.Ok(new { success = true, deletedCount, tag = targetTag });
});

Console.WriteLine("===============================================");
Console.WriteLine(" MyAtlas C# .NET 8 Backend Engine Active");
Console.WriteLine(" Server URL: http://127.0.0.1:7171");
Console.WriteLine("===============================================");

app.Run();

[StructLayout(LayoutKind.Sequential)]
public struct SIZE
{
    public int cx;
    public int cy;
    public SIZE(int cx, int cy) { this.cx = cx; this.cy = cy; }
}

[Flags]
public enum SIIGBF
{
    SIIGBF_RESIZETOFIT = 0,
    SIIGBF_BIGGERSIZEOK = 1,
    SIIGBF_MEMORYONLY = 2,
    SIIGBF_ICONONLY = 4,
    SIIGBF_THUMBNAILONLY = 8,
    SIIGBF_INCACHEONLY = 16
}

[ComImport]
[Guid("bcc82741-9660-4b7e-8260-ac2789f1165f")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IShellItemImageFactory
{
    void GetImage(SIZE size, SIIGBF flags, out IntPtr phbm);
}

[StructLayout(LayoutKind.Sequential)]
public struct BITMAP
{
    public int bmType;
    public int bmWidth;
    public int bmHeight;
    public int bmWidthBytes;
    public ushort bmPlanes;
    public ushort bmBitsPixel;
    public IntPtr bmBits;
}

[StructLayout(LayoutKind.Sequential)]
public struct BITMAPINFOHEADER
{
    public uint biSize;
    public int biWidth;
    public int biHeight;
    public ushort biPlanes;
    public ushort biBitCount;
    public uint biCompression;
    public uint biSizeImage;
    public int biXPelsPerMeter;
    public int biYPelsPerMeter;
    public uint biClrUsed;
    public uint biClrImportant;
}

public static class WindowsThumbnailProvider
{
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    public static extern void SHCreateItemFromParsingName(
        [MarshalAs(UnmanagedType.LPWStr)] string pszPath,
        IntPtr pbc,
        [In] ref Guid riid,
        [MarshalAs(UnmanagedType.Interface)] out IShellItemImageFactory ppv);

    [DllImport("gdi32.dll")]
    public static extern bool DeleteObject(IntPtr hObject);

    [DllImport("gdi32.dll")]
    public static extern int GetObject(IntPtr hgdiobj, int cbBuffer, out BITMAP lpv);

    [DllImport("user32.dll")]
    public static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    public static extern int GetDIBits(IntPtr hdc, IntPtr hbmp, uint uStartScan, uint cScanLines, byte[] lpvBits, ref BITMAPINFOHEADER lpbmi, uint uUsage);

    public static SixLabors.ImageSharp.Image? GetVideoFrameImage(string filePath, int size = 300)
    {
        if (!File.Exists(filePath)) return null;
        SixLabors.ImageSharp.Image? resultImage = null;

        var thread = new Thread(() =>
        {
            try
            {
                Guid uuid = typeof(IShellItemImageFactory).GUID;
                SHCreateItemFromParsingName(filePath, IntPtr.Zero, ref uuid, out var factory);
                if (factory != null)
                {
                    IntPtr hBitmap = IntPtr.Zero;
                    try
                    {
                        factory.GetImage(new SIZE(size, size), SIIGBF.SIIGBF_BIGGERSIZEOK, out hBitmap);
                    }
                    catch
                    {
                        try
                        {
                            factory.GetImage(new SIZE(size, size), SIIGBF.SIIGBF_RESIZETOFIT, out hBitmap);
                        }
                        catch { }
                    }

                    if (hBitmap != IntPtr.Zero)
                    {
                        try
                        {
                            if (GetObject(hBitmap, Marshal.SizeOf<BITMAP>(), out BITMAP bm) != 0)
                            {
                                int width = bm.bmWidth;
                                int height = Math.Abs(bm.bmHeight);
                                if (width > 0 && height > 0)
                                {
                                    var bmi = new BITMAPINFOHEADER
                                    {
                                        biSize = (uint)Marshal.SizeOf<BITMAPINFOHEADER>(),
                                        biWidth = width,
                                        biHeight = -height,
                                        biPlanes = 1,
                                        biBitCount = 32,
                                        biCompression = 0
                                    };

                                    IntPtr hdc = GetDC(IntPtr.Zero);
                                    byte[] pixelBytes = new byte[width * height * 4];
                                    GetDIBits(hdc, hBitmap, 0, (uint)height, pixelBytes, ref bmi, 0);
                                    ReleaseDC(IntPtr.Zero, hdc);

                                    resultImage = SixLabors.ImageSharp.Image.LoadPixelData<SixLabors.ImageSharp.PixelFormats.Bgra32>(pixelBytes, width, height);
                                }
                            }
                        }
                        finally
                        {
                            DeleteObject(hBitmap);
                        }
                    }
                }
            }
            catch { }
        });

        thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
        thread.Join(3000);

        return resultImage;
    }
}

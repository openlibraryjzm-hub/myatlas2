import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_TIMESTAMP = '2026-08-16_12-36-00';
const ATLAS_TAG = 'meta:atlas:toolatlas';

const TOOLS = [
  {
    title: "Supabase",
    author: "Supabase",
    score: 9850,
    url: "https://cdn.simpleicons.org/supabase/3ecf8e",
    thumbnail: "https://cdn.simpleicons.org/supabase/3ecf8e",
    permalink: "https://supabase.com",
    colorTheme: { bg: "#0d1117", text: "#3ecf8e", accent: "#3ecf8e", description: "The open source Firebase alternative with Postgres, Auth, and Storage." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:supabase", "database", "backend", "postgres", "open_source"]
  },
  {
    title: "Figma",
    author: "Figma",
    score: 9620,
    url: "https://cdn.simpleicons.org/figma/f24e1e",
    thumbnail: "https://cdn.simpleicons.org/figma/f24e1e",
    permalink: "https://www.figma.com",
    colorTheme: { bg: "#1e1e1e", text: "#f24e1e", accent: "#f24e1e", description: "The collaborative interface design tool powered by real-time cloud editing." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:design", "artist:figma", "design", "ui_ux", "prototyping"]
  },
  {
    title: "Vercel",
    author: "Vercel",
    score: 9510,
    url: "https://cdn.simpleicons.org/vercel/000000",
    thumbnail: "https://cdn.simpleicons.org/vercel/000000",
    permalink: "https://vercel.com",
    colorTheme: { bg: "#ffffff", text: "#000000", accent: "#000000", description: "Frontend cloud platform providing instant deployment and global edge CDN." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:vercel", "hosting", "cloud", "nextjs"]
  },
  {
    title: "Raycast",
    author: "Raycast Technologies",
    score: 8940,
    url: "https://cdn.simpleicons.org/raycast/ff6363",
    thumbnail: "https://cdn.simpleicons.org/raycast/ff6363",
    permalink: "https://www.raycast.com",
    colorTheme: { bg: "#18181b", text: "#ff6363", accent: "#ff6363", description: "An extendable launcher that lets you control your tools in a few keystrokes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:raycast", "launcher", "productivity", "mac_app"]
  },
  {
    title: "Postman",
    author: "Postman Inc",
    score: 8720,
    url: "https://cdn.simpleicons.org/postman/ff6c37",
    thumbnail: "https://cdn.simpleicons.org/postman/ff6c37",
    permalink: "https://www.postman.com",
    colorTheme: { bg: "#1c1c1c", text: "#ff6c37", accent: "#ff6c37", description: "An API platform for building, testing, and simplifying API development." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:postman", "api", "testing", "http"]
  },
  {
    title: "Tailwind CSS",
    author: "Tailwind Labs",
    score: 9400,
    url: "https://cdn.simpleicons.org/tailwindcss/06b6d4",
    thumbnail: "https://cdn.simpleicons.org/tailwindcss/06b6d4",
    permalink: "https://tailwindcss.com",
    colorTheme: { bg: "#0f172a", text: "#06b6d4", accent: "#06b6d4", description: "Utility-first CSS framework packed with classes for rapid custom styling." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:web", "artist:tailwind_labs", "css", "styling", "frontend"]
  },
  {
    title: "Docker",
    author: "Docker Inc",
    score: 9310,
    url: "https://cdn.simpleicons.org/docker/2496ed",
    thumbnail: "https://cdn.simpleicons.org/docker/2496ed",
    permalink: "https://www.docker.com",
    colorTheme: { bg: "#0d1b2a", text: "#2496ed", accent: "#2496ed", description: "Collaborative containerization software for building, sharing, and running apps." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:devops", "artist:docker", "containers", "devops", "virtualization"]
  },
  {
    title: "Notion",
    author: "Notion Labs",
    score: 9650,
    url: "https://cdn.simpleicons.org/notion/000000",
    thumbnail: "https://cdn.simpleicons.org/notion/000000",
    permalink: "https://www.notion.so",
    colorTheme: { bg: "#ffffff", text: "#000000", accent: "#000000", description: "Connected workspace for wiki, docs, project management, and notes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:notion", "workspace", "notes", "wiki", "docs"]
  },
  {
    title: "GitHub",
    author: "GitHub Inc",
    score: 9990,
    url: "https://cdn.simpleicons.org/github/181717",
    thumbnail: "https://cdn.simpleicons.org/github/181717",
    permalink: "https://github.com",
    colorTheme: { bg: "#0d1117", text: "#ffffff", accent: "#2da44e", description: "The complete developer platform to build, scale, and deliver secure software." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:github", "git", "repository", "code"]
  },
  {
    title: "Linear",
    author: "Linear Orbit Inc",
    score: 9120,
    url: "https://cdn.simpleicons.org/linear/5e6ad2",
    thumbnail: "https://cdn.simpleicons.org/linear/5e6ad2",
    permalink: "https://linear.app",
    colorTheme: { bg: "#121316", text: "#5e6ad2", accent: "#5e6ad2", description: "The issue tracking tool created for high-performance software engineering teams." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:linear", "issue_tracker", "agile", "tasks"]
  }
];

const posts = TOOLS.map((t, idx) => ({
  title: t.title,
  subreddit: 'toolatlas',
  author: t.author,
  score: t.score,
  width: 500,
  height: 500,
  created_iso: new Date(Date.now() - (idx * 3600000)).toISOString(),
  url: t.url,
  thumbnail: t.thumbnail,
  permalink: t.permalink,
  derivedTags: t.tags,
  colorTheme: t.colorTheme
}));

const outputPath = path.join(__dirname, 'toolfolio_10_batch.json');
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');

console.log(`Successfully generated ${posts.length} clean tool entries with meta pricing tags to ${outputPath}`);
console.log(`Batch upload timestamp: meta:upload:${BATCH_TIMESTAMP}`);

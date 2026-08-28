import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_TIMESTAMP = '2026-08-16_12-55-00';
const ATLAS_TAG = 'meta:atlas:toolatlas';

const DEV_CLOUD_TOOLS = [
  // Editors & IDEs
  {
    title: "VS Code",
    author: "Microsoft",
    score: 9980,
    url: "https://cdn.simpleicons.org/visualstudiocode/007acc",
    thumbnail: "https://cdn.simpleicons.org/visualstudiocode/007acc",
    permalink: "https://code.visualstudio.com",
    colorTheme: { bg: "#0e1726", text: "#007acc", accent: "#007acc", description: "Code editing redefined and built for modern web and cloud applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:microsoft", "editor", "ide", "open_source", "cross_platform"]
  },
  {
    title: "Cursor AI",
    author: "Anysphere",
    score: 9840,
    url: "https://cdn.simpleicons.org/cursor/000000",
    thumbnail: "https://cdn.simpleicons.org/cursor/000000",
    permalink: "https://www.cursor.com",
    colorTheme: { bg: "#18181b", text: "#ffffff", accent: "#38bdf8", description: "The AI-first code editor designed to make programming blazingly fast." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:anysphere", "ai_editor", "copilot", "llm"]
  },
  {
    title: "Neovim",
    author: "Neovim Team",
    score: 9650,
    url: "https://cdn.simpleicons.org/neovim/57a143",
    thumbnail: "https://cdn.simpleicons.org/neovim/57a143",
    permalink: "https://neovim.io",
    colorTheme: { bg: "#0f172a", text: "#57a143", accent: "#57a143", description: "Hyperextensible Vim-based text editor seeking to maximize usability." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:neovim_team", "editor", "terminal", "vim", "open_source"]
  },
  {
    title: "Sublime Text",
    author: "Sublime HQ",
    score: 9210,
    url: "https://cdn.simpleicons.org/sublimetext/ff9800",
    thumbnail: "https://cdn.simpleicons.org/sublimetext/ff9800",
    permalink: "https://www.sublimetext.com",
    colorTheme: { bg: "#1e1e1e", text: "#ff9800", accent: "#ff9800", description: "Sophisticated text editor for code, markup and prose with ultrafast execution." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:developer_tools", "artist:sublime_hq", "editor", "lightweight", "fast"]
  },
  {
    title: "WebStorm",
    author: "JetBrains",
    score: 9340,
    url: "https://cdn.simpleicons.org/webstorm/000000",
    thumbnail: "https://cdn.simpleicons.org/webstorm/000000",
    permalink: "https://www.jetbrains.com/webstorm",
    colorTheme: { bg: "#121212", text: "#00c853", accent: "#00c853", description: "The smartest JavaScript and TypeScript IDE created by JetBrains." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:developer_tools", "artist:jetbrains", "ide", "javascript", "typescript"]
  },

  // API & Testing Tools
  {
    title: "Postman",
    author: "Postman Inc",
    score: 9780,
    url: "https://cdn.simpleicons.org/postman/ff6c37",
    thumbnail: "https://cdn.simpleicons.org/postman/ff6c37",
    permalink: "https://www.postman.com",
    colorTheme: { bg: "#1c1c1c", text: "#ff6c37", accent: "#ff6c37", description: "An API platform for building, testing, and simplifying API development." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:postman", "api", "testing", "http", "rest"]
  },
  {
    title: "Insomnia",
    author: "Kong",
    score: 9150,
    url: "https://cdn.simpleicons.org/insomnia/5851db",
    thumbnail: "https://cdn.simpleicons.org/insomnia/5851db",
    permalink: "https://insomnia.rest",
    colorTheme: { bg: "#110e1b", text: "#5851db", accent: "#5851db", description: "Open-source, cross-platform API client for GraphQL, REST, and gRPC." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:kong", "api", "graphql", "rest", "open_source"]
  },

  // Containers & DevOps
  {
    title: "Docker",
    author: "Docker Inc",
    score: 9940,
    url: "https://cdn.simpleicons.org/docker/2496ed",
    thumbnail: "https://cdn.simpleicons.org/docker/2496ed",
    permalink: "https://www.docker.com",
    colorTheme: { bg: "#0d1b2a", text: "#2496ed", accent: "#2496ed", description: "Collaborative containerization software for building, sharing, and running apps." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:devops", "artist:docker", "containers", "devops", "virtualization"]
  },
  {
    title: "Kubernetes",
    author: "CNCF",
    score: 9890,
    url: "https://cdn.simpleicons.org/kubernetes/326ce5",
    thumbnail: "https://cdn.simpleicons.org/kubernetes/326ce5",
    permalink: "https://kubernetes.io",
    colorTheme: { bg: "#0a192f", text: "#326ce5", accent: "#326ce5", description: "Automated container deployment, scaling, and management orchestration platform." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:devops", "artist:cncf", "orchestration", "containers", "devops", "open_source"]
  },
  {
    title: "Terraform",
    author: "HashiCorp",
    score: 9710,
    url: "https://cdn.simpleicons.org/terraform/844fba",
    thumbnail: "https://cdn.simpleicons.org/terraform/844fba",
    permalink: "https://www.terraform.io",
    colorTheme: { bg: "#15102a", text: "#844fba", accent: "#844fba", description: "Infrastructure as Code tool to build, change, and version cloud infrastructure safely." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:devops", "artist:hashicorp", "iac", "cloud", "automation", "devops"]
  },

  // Terminals & CLI
  {
    title: "Warp Terminal",
    author: "Warp",
    score: 9420,
    url: "https://cdn.simpleicons.org/warp/000000",
    thumbnail: "https://cdn.simpleicons.org/warp/000000",
    permalink: "https://www.warp.dev",
    colorTheme: { bg: "#0d0d0d", text: "#00e5ff", accent: "#00e5ff", description: "Modern, Rust-based terminal with AI built in for developer workflows." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:warp", "terminal", "cli", "ai", "rust"]
  },
  {
    title: "iTerm2",
    author: "George Nachman",
    score: 9110,
    url: "https://cdn.simpleicons.org/iterm2/000000",
    thumbnail: "https://cdn.simpleicons.org/iterm2/000000",
    permalink: "https://iterm2.com",
    colorTheme: { bg: "#1a1a1a", text: "#00ff66", accent: "#00ff66", description: "Terminal emulator replacement for macOS with custom tabs and split panes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:george_nachman", "terminal", "mac_app", "open_source"]
  },

  // Version Control & Repositories
  {
    title: "GitKraken",
    author: "Axosoft",
    score: 9280,
    url: "https://cdn.simpleicons.org/gitkraken/179287",
    thumbnail: "https://cdn.simpleicons.org/gitkraken/179287",
    permalink: "https://www.gitkraken.com",
    colorTheme: { bg: "#0f2328", text: "#179287", accent: "#179287", description: "Legendary Git GUI client for Windows, Mac, and Linux with interactive graphs." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:axosoft", "git", "gui", "version_control"]
  },
  {
    title: "GitHub",
    author: "GitHub Inc",
    score: 9995,
    url: "https://cdn.simpleicons.org/github/181717",
    thumbnail: "https://cdn.simpleicons.org/github/181717",
    permalink: "https://github.com",
    colorTheme: { bg: "#0d1117", text: "#ffffff", accent: "#2da44e", description: "The complete developer platform to build, scale, and deliver secure software." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:github", "git", "repository", "code"]
  },
  {
    title: "GitLab",
    author: "GitLab Inc",
    score: 9760,
    url: "https://cdn.simpleicons.org/gitlab/fc6d26",
    thumbnail: "https://cdn.simpleicons.org/gitlab/fc6d26",
    permalink: "https://about.gitlab.com",
    colorTheme: { bg: "#18141d", text: "#fc6d26", accent: "#fc6d26", description: "The DevSecOps platform delivered as a single application for Git repos and CI/CD." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:devops", "artist:gitlab", "git", "cicd", "devops"]
  },
  {
    title: "Bitbucket",
    author: "Atlassian",
    score: 9140,
    url: "https://cdn.simpleicons.org/bitbucket/0052cc",
    thumbnail: "https://cdn.simpleicons.org/bitbucket/0052cc",
    permalink: "https://bitbucket.org",
    colorTheme: { bg: "#091e42", text: "#0052cc", accent: "#0052cc", description: "Git code management built for enterprise teams integrated with Jira." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:atlassian", "git", "repository", "jira"]
  },

  // Databases & Backend Platforms
  {
    title: "Supabase",
    author: "Supabase",
    score: 9880,
    url: "https://cdn.simpleicons.org/supabase/3ecf8e",
    thumbnail: "https://cdn.simpleicons.org/supabase/3ecf8e",
    permalink: "https://supabase.com",
    colorTheme: { bg: "#0d1117", text: "#3ecf8e", accent: "#3ecf8e", description: "The open source Firebase alternative with Postgres, Auth, and Storage." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:supabase", "database", "backend", "postgres", "open_source"]
  },
  {
    title: "PlanetScale",
    author: "PlanetScale Inc",
    score: 9480,
    url: "https://cdn.simpleicons.org/planetscale/000000",
    thumbnail: "https://cdn.simpleicons.org/planetscale/000000",
    permalink: "https://planetscale.com",
    colorTheme: { bg: "#000000", text: "#ffffff", accent: "#f43f5e", description: "The MySQL-compatible serverless database platform powered by Vitess." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:database", "artist:planetscale", "database", "mysql", "serverless"]
  },
  {
    title: "Neon Postgres",
    author: "Neon Inc",
    score: 9540,
    url: "https://cdn.simpleicons.org/neon/00e599",
    thumbnail: "https://cdn.simpleicons.org/neon/00e599",
    permalink: "https://neon.tech",
    colorTheme: { bg: "#0a1410", text: "#00e599", accent: "#00e599", description: "Serverless open-source Postgres branching built for modern cloud developers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:neon", "postgres", "serverless", "branching"]
  },
  {
    title: "MongoDB",
    author: "MongoDB Inc",
    score: 9810,
    url: "https://cdn.simpleicons.org/mongodb/47a248",
    thumbnail: "https://cdn.simpleicons.org/mongodb/47a248",
    permalink: "https://www.mongodb.com",
    colorTheme: { bg: "#0b1d12", text: "#47a248", accent: "#47a248", description: "The leading developer data platform for document-based NoSQL applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:mongodb", "nosql", "document_db", "database"]
  },
  {
    title: "PostgreSQL",
    author: "PostgreSQL Group",
    score: 9960,
    url: "https://cdn.simpleicons.org/postgresql/4169e1",
    thumbnail: "https://cdn.simpleicons.org/postgresql/4169e1",
    permalink: "https://www.postgresql.org",
    colorTheme: { bg: "#0d1b2a", text: "#4169e1", accent: "#4169e1", description: "The world's most advanced open source relational database engine." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:database", "artist:postgresql_group", "postgres", "sql", "open_source"]
  },
  {
    title: "MySQL",
    author: "Oracle",
    score: 9890,
    url: "https://cdn.simpleicons.org/mysql/4479a9",
    thumbnail: "https://cdn.simpleicons.org/mysql/4479a9",
    permalink: "https://www.mysql.com",
    colorTheme: { bg: "#002b49", text: "#f29111", accent: "#f29111", description: "The world's most popular open-source relational database management system." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:database", "artist:oracle", "mysql", "sql", "relational"]
  },
  {
    title: "Redis",
    author: "Redis Ltd",
    score: 9870,
    url: "https://cdn.simpleicons.org/redis/ff4438",
    thumbnail: "https://cdn.simpleicons.org/redis/ff4438",
    permalink: "https://redis.io",
    colorTheme: { bg: "#220a09", text: "#ff4438", accent: "#ff4438", description: "In-memory data structure store used as a database, cache, and message broker." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:database", "artist:redis", "cache", "in_memory", "key_value"]
  },
  {
    title: "Elasticsearch",
    author: "Elastic",
    score: 9630,
    url: "https://cdn.simpleicons.org/elasticsearch/005571",
    thumbnail: "https://cdn.simpleicons.org/elasticsearch/005571",
    permalink: "https://www.elastic.co/elasticsearch",
    colorTheme: { bg: "#051f28", text: "#00bfb3", accent: "#00bfb3", description: "Distributed RESTful search and analytics engine built on Apache Lucene." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:elastic", "search", "analytics", "indexing"]
  },

  // ORMs & Data Query Tools
  {
    title: "Prisma ORM",
    author: "Prisma Data",
    score: 9640,
    url: "https://cdn.simpleicons.org/prisma/2d3748",
    thumbnail: "https://cdn.simpleicons.org/prisma/2d3748",
    permalink: "https://www.prisma.io",
    colorTheme: { bg: "#0f172a", text: "#38bdf8", accent: "#38bdf8", description: "Next-generation ORM for Node.js and TypeScript to query databases safely." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:prisma_data", "orm", "typescript", "database"]
  },
  {
    title: "Drizzle ORM",
    author: "Drizzle Team",
    score: 9580,
    url: "https://cdn.simpleicons.org/drizzle/c5f740",
    thumbnail: "https://cdn.simpleicons.org/drizzle/c5f740",
    permalink: "https://orm.drizzle.team",
    colorTheme: { bg: "#18181b", text: "#c5f740", accent: "#c5f740", description: "Lightweight and performant TypeScript ORM with zero dependencies." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:drizzle_team", "orm", "typescript", "fast"]
  },

  // Cloud Platforms & Hosting
  {
    title: "Vercel",
    author: "Vercel Inc",
    score: 9930,
    url: "https://cdn.simpleicons.org/vercel/000000",
    thumbnail: "https://cdn.simpleicons.org/vercel/000000",
    permalink: "https://vercel.com",
    colorTheme: { bg: "#ffffff", text: "#000000", accent: "#000000", description: "Frontend cloud platform providing instant deployment and global edge CDN." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:vercel", "hosting", "cloud", "nextjs", "cdn"]
  },
  {
    title: "Netlify",
    author: "Netlify Inc",
    score: 9730,
    url: "https://cdn.simpleicons.org/netlify/00c7b7",
    thumbnail: "https://cdn.simpleicons.org/netlify/00c7b7",
    permalink: "https://www.netlify.com",
    colorTheme: { bg: "#0b1f24", text: "#00c7b7", accent: "#00c7b7", description: "The modern web development platform for building and scaling web apps." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:netlify", "hosting", "serverless", "jamstack"]
  },
  {
    title: "AWS",
    author: "Amazon",
    score: 9990,
    url: "https://cdn.simpleicons.org/amazonwebservices/ff9900",
    thumbnail: "https://cdn.simpleicons.org/amazonwebservices/ff9900",
    permalink: "https://aws.amazon.com",
    colorTheme: { bg: "#161e2e", text: "#ff9900", accent: "#ff9900", description: "Comprehensive and broadly adopted cloud platform offering over 200 services." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:amazon", "cloud", "iaas", "aws", "infrastructure"]
  },
  {
    title: "Google Cloud",
    author: "Google",
    score: 9910,
    url: "https://cdn.simpleicons.org/googlecloud/4285f4",
    thumbnail: "https://cdn.simpleicons.org/googlecloud/4285f4",
    permalink: "https://cloud.google.com",
    colorTheme: { bg: "#0d1b2a", text: "#4285f4", accent: "#4285f4", description: "Suite of cloud computing services running on Google's infrastructure." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:google", "cloud", "gcp", "compute"]
  },
  {
    title: "Microsoft Azure",
    author: "Microsoft",
    score: 9870,
    url: "https://cdn.simpleicons.org/microsoftazure/0089d6",
    thumbnail: "https://cdn.simpleicons.org/microsoftazure/0089d6",
    permalink: "https://azure.microsoft.com",
    colorTheme: { bg: "#001a33", text: "#0089d6", accent: "#0089d6", description: "Cloud computing service created by Microsoft for application management." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:microsoft", "cloud", "azure", "enterprise"]
  },
  {
    title: "Cloudflare",
    author: "Cloudflare Inc",
    score: 9950,
    url: "https://cdn.simpleicons.org/cloudflare/f38020",
    thumbnail: "https://cdn.simpleicons.org/cloudflare/f38020",
    permalink: "https://www.cloudflare.com",
    colorTheme: { bg: "#1f140a", text: "#f38020", accent: "#f38020", description: "Global network delivering web security, DNS, Workers serverless, and CDN." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:cloudflare", "cdn", "dns", "edge", "security"]
  },
  {
    title: "DigitalOcean",
    author: "DigitalOcean Inc",
    score: 9680,
    url: "https://cdn.simpleicons.org/digitalocean/0080ff",
    thumbnail: "https://cdn.simpleicons.org/digitalocean/0080ff",
    permalink: "https://www.digitalocean.com",
    colorTheme: { bg: "#0a192f", text: "#0080ff", accent: "#0080ff", description: "Simple cloud hosting platform providing Droplet virtual machines for developers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:hosting", "artist:digitalocean", "vps", "droplet", "cloud"]
  },
  {
    title: "Heroku",
    author: "Salesforce",
    score: 9410,
    url: "https://cdn.simpleicons.org/heroku/430098",
    thumbnail: "https://cdn.simpleicons.org/heroku/430098",
    permalink: "https://www.heroku.com",
    colorTheme: { bg: "#150628", text: "#7952b3", accent: "#7952b3", description: "PaaS platform enabling developers to build, run, and operate applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:hosting", "artist:salesforce", "paas", "hosting", "dyno"]
  },
  {
    title: "Render",
    author: "Render Services",
    score: 9590,
    url: "https://cdn.simpleicons.org/render/000000",
    thumbnail: "https://cdn.simpleicons.org/render/000000",
    permalink: "https://render.com",
    colorTheme: { bg: "#0d1b2a", text: "#46e3b7", accent: "#46e3b7", description: "Unified cloud platform to build and run all your web applications and databases." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:render_services", "paas", "hosting", "cloud"]
  },
  {
    title: "Railway",
    author: "Railway Corp",
    score: 9620,
    url: "https://cdn.simpleicons.org/railway/000000",
    thumbnail: "https://cdn.simpleicons.org/railway/000000",
    permalink: "https://railway.app",
    colorTheme: { bg: "#13111c", text: "#c084fc", accent: "#c084fc", description: "Infrastructure platform where you deploy code and database instances in seconds." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:hosting", "artist:railway_corp", "paas", "hosting", "containers"]
  },
  {
    title: "Fly.io",
    author: "Fly.io Inc",
    score: 9570,
    url: "https://cdn.simpleicons.org/flydotio/24185b",
    thumbnail: "https://cdn.simpleicons.org/flydotio/24185b",
    permalink: "https://fly.io",
    colorTheme: { bg: "#130e28", text: "#7b61ff", accent: "#7b61ff", description: "Run your fullstack app and database close to your users worldwide on MicroVMs." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:flyio_inc", "microvms", "edge", "hosting"]
  },
  {
    title: "Firebase",
    author: "Google",
    score: 9830,
    url: "https://cdn.simpleicons.org/firebase/ffca28",
    thumbnail: "https://cdn.simpleicons.org/firebase/ffca28",
    permalink: "https://firebase.google.com",
    colorTheme: { bg: "#1a160a", text: "#ffca28", accent: "#ffca28", description: "Google's mobile and web app development platform with Realtime DB & Auth." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:hosting", "artist:google", "baas", "nosql", "auth"]
  },

  // Observability & Security
  {
    title: "Sentry",
    author: "Functional Software",
    score: 9720,
    url: "https://cdn.simpleicons.org/sentry/362d59",
    thumbnail: "https://cdn.simpleicons.org/sentry/362d59",
    permalink: "https://sentry.io",
    colorTheme: { bg: "#161224", text: "#fb4226", accent: "#fb4226", description: "Application monitoring platform for error tracking and real-time crash reporting." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:functional_software", "error_tracking", "observability", "debugging"]
  },
  {
    title: "Datadog",
    author: "Datadog Inc",
    score: 9690,
    url: "https://cdn.simpleicons.org/datadog/632ca6",
    thumbnail: "https://cdn.simpleicons.org/datadog/632ca6",
    permalink: "https://www.datadoghq.com",
    colorTheme: { bg: "#1b1128", text: "#632ca6", accent: "#632ca6", description: "Monitoring and analytics platform for cloud-scale infrastructure and logs." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:devops", "artist:datadog", "monitoring", "observability", "metrics"]
  },
  {
    title: "Better Stack",
    author: "Better Stack Inc",
    score: 9470,
    url: "https://cdn.simpleicons.org/betterstack/000000",
    thumbnail: "https://cdn.simpleicons.org/betterstack/000000",
    permalink: "https://betterstack.com",
    colorTheme: { bg: "#0d0d0d", text: "#22c55e", accent: "#22c55e", description: "Uptime monitoring, incident management, and log management platform." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:devops", "artist:better_stack", "uptime", "logs", "incidents"]
  },
  {
    title: "PostHog",
    author: "PostHog Inc",
    score: 9660,
    url: "https://cdn.simpleicons.org/posthog/1d4ed8",
    thumbnail: "https://cdn.simpleicons.org/posthog/1d4ed8",
    permalink: "https://posthog.com",
    colorTheme: { bg: "#0b172a", text: "#f97316", accent: "#f97316", description: "Open-source product analytics, session recording, feature flags, and A/B testing." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:posthog", "analytics", "session_replay", "open_source"]
  },
  {
    title: "Plausible Analytics",
    author: "Plausible Insights",
    score: 9510,
    url: "https://cdn.simpleicons.org/plausibleanalytics/5850ec",
    thumbnail: "https://cdn.simpleicons.org/plausibleanalytics/5850ec",
    permalink: "https://plausible.io",
    colorTheme: { bg: "#111827", text: "#5850ec", accent: "#5850ec", description: "Lightweight and open-source web analytics without cookies or tracking." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:developer_tools", "artist:plausible_insights", "analytics", "privacy", "cookieless"]
  },
  {
    title: "Ngrok",
    author: "Inconshreveable",
    score: 9530,
    url: "https://cdn.simpleicons.org/ngrok/1f1e1e",
    thumbnail: "https://cdn.simpleicons.org/ngrok/1f1e1e",
    permalink: "https://ngrok.com",
    colorTheme: { bg: "#1f1e1e", text: "#1f1e1e", accent: "#38bdf8", description: "Secure introspectable tunnels to localhost for local testing and webhooks." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:inconshreveable", "tunnels", "localhost", "webhooks"]
  },
  {
    title: "Tailscale",
    author: "Tailscale Inc",
    score: 9740,
    url: "https://cdn.simpleicons.org/tailscale/000000",
    thumbnail: "https://cdn.simpleicons.org/tailscale/000000",
    permalink: "https://tailscale.com",
    colorTheme: { bg: "#18181b", text: "#ffffff", accent: "#a855f7", description: "Zero config VPN built on WireGuard that connects your devices securely." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:devops", "artist:tailscale", "vpn", "networking", "wireguard"]
  },
  {
    title: "1Password",
    author: "AgileBits",
    score: 9790,
    url: "https://cdn.simpleicons.org/1password/0094f5",
    thumbnail: "https://cdn.simpleicons.org/1password/0094f5",
    permalink: "https://1password.com",
    colorTheme: { bg: "#001a33", text: "#0094f5", accent: "#0094f5", description: "Password manager that keeps your credentials secure across all your devices." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:developer_tools", "artist:agilebits", "passwords", "security", "vault"]
  },
  {
    title: "Bitwarden",
    author: "Bitwarden Inc",
    score: 9770,
    url: "https://cdn.simpleicons.org/bitwarden/175ddc",
    thumbnail: "https://cdn.simpleicons.org/bitwarden/175ddc",
    permalink: "https://bitwarden.com",
    colorTheme: { bg: "#0d1b2a", text: "#175ddc", accent: "#175ddc", description: "Open-source password manager for business and personal password security." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:developer_tools", "artist:bitwarden", "passwords", "security", "open_source"]
  },

  // Runtimes & Environments
  {
    title: "Node.js",
    author: "OpenJS Foundation",
    score: 9985,
    url: "https://cdn.simpleicons.org/nodedotjs/5fa04e",
    thumbnail: "https://cdn.simpleicons.org/nodedotjs/5fa04e",
    permalink: "https://nodejs.org",
    colorTheme: { bg: "#0c1a10", text: "#5fa04e", accent: "#5fa04e", description: "Cross-platform, open-source JavaScript runtime environment built on V8." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:openjs_foundation", "runtime", "javascript", "backend"]
  },
  {
    title: "Deno",
    author: "Deno Land Inc",
    score: 9590,
    url: "https://cdn.simpleicons.org/deno/000000",
    thumbnail: "https://cdn.simpleicons.org/deno/000000",
    permalink: "https://deno.com",
    colorTheme: { bg: "#000000", text: "#ffffff", accent: "#38bdf8", description: "Modern, secure runtime for JavaScript and TypeScript built in Rust." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:deno_land", "runtime", "typescript", "rust"]
  },
  {
    title: "Bun",
    author: "Oven App Inc",
    score: 9680,
    url: "https://cdn.simpleicons.org/bun/fbf0df",
    thumbnail: "https://cdn.simpleicons.org/bun/fbf0df",
    permalink: "https://bun.sh",
    colorTheme: { bg: "#18181b", text: "#fbf0df", accent: "#fbf0df", description: "Incredibly fast JavaScript & TypeScript all-in-one toolkit and runtime." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:developer_tools", "artist:oven_app", "runtime", "bundler", "fast"]
  }
];

const posts = DEV_CLOUD_TOOLS.map((t, idx) => ({
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

const outputPath = path.join(__dirname, 'toolfolio_50_batch1_dev_cloud.json');
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');

console.log(`Successfully generated ${posts.length} clean developer & cloud tool entries to ${outputPath}`);
console.log(`Batch upload timestamp: meta:upload:${BATCH_TIMESTAMP}`);

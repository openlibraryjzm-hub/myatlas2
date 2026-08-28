import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_TIMESTAMP = '2026-08-16_13-22-00';
const ATLAS_TAG = 'meta:atlas:toolatlas';

const PRODUCTIVITY_SAAS_TOOLS = [
  // Workspace & Notes
  {
    title: "Notion",
    author: "Notion Labs",
    score: 9990,
    url: "https://cdn.simpleicons.org/notion/000000",
    thumbnail: "https://cdn.simpleicons.org/notion/000000",
    permalink: "https://www.notion.so",
    colorTheme: { bg: "#ffffff", text: "#000000", accent: "#000000", description: "Connected workspace for wiki, docs, project management, and notes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:notion_labs", "workspace", "notes", "wiki", "docs"]
  },
  {
    title: "Obsidian",
    author: "Dynalist Inc",
    score: 9890,
    url: "https://cdn.simpleicons.org/obsidian/483699",
    thumbnail: "https://cdn.simpleicons.org/obsidian/483699",
    permalink: "https://obsidian.md",
    colorTheme: { bg: "#100d1e", text: "#a78bfa", accent: "#a78bfa", description: "Private and flexible note-taking app that adapts to the way you think." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:productivity", "artist:dynalist_inc", "notes", "markdown", "knowledge_base", "local_first"]
  },
  {
    title: "Logseq",
    author: "Logseq Team",
    score: 9610,
    url: "https://cdn.simpleicons.org/logseq/18181b",
    thumbnail: "https://cdn.simpleicons.org/logseq/18181b",
    permalink: "https://logseq.com",
    colorTheme: { bg: "#18181b", text: "#10b981", accent: "#10b981", description: "Open source local-first outliner and knowledge graph note-taking platform." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:productivity", "artist:logseq_team", "notes", "outliner", "open_source", "markdown"]
  },
  {
    title: "Evernote",
    author: "Bending Spoons",
    score: 9420,
    url: "https://cdn.simpleicons.org/evernote/00a82d",
    thumbnail: "https://cdn.simpleicons.org/evernote/00a82d",
    permalink: "https://evernote.com",
    colorTheme: { bg: "#061a0a", text: "#00a82d", accent: "#00a82d", description: "Tame your work and organize your life with notes, web clipper, and tasks." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:bending_spoons", "notes", "web_clipper", "tasks"]
  },
  {
    title: "Bear Notes",
    author: "Shiny Frog",
    score: 9540,
    url: "https://cdn.simpleicons.org/bear/e04c4c",
    thumbnail: "https://cdn.simpleicons.org/bear/e04c4c",
    permalink: "https://bear.app",
    colorTheme: { bg: "#1a0808", text: "#e04c4c", accent: "#e04c4c", description: "Focused, flexible writing app for crafting notes and prose on Apple devices." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:shiny_frog", "notes", "markdown", "mac_app"]
  },
  {
    title: "Roam Research",
    author: "Roam Research",
    score: 9480,
    url: "https://cdn.simpleicons.org/roamresearch/333333",
    thumbnail: "https://cdn.simpleicons.org/roamresearch/333333",
    permalink: "https://roamresearch.com",
    colorTheme: { bg: "#141414", text: "#ffffff", accent: "#38bdf8", description: "A note-taking tool for networked thought designed to help you connect ideas." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:productivity", "artist:roam_research", "networked_thought", "notes", "graph"]
  },
  {
    title: "Craft Docs",
    author: "Craft Docs Ltd",
    score: 9580,
    url: "https://cdn.simpleicons.org/craft/000000",
    thumbnail: "https://cdn.simpleicons.org/craft/000000",
    permalink: "https://www.craft.do",
    colorTheme: { bg: "#121212", text: "#a855f7", accent: "#a855f7", description: "Structured writing and document creation app with native block editing." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:craft_docs", "docs", "notes", "structured"]
  },
  {
    title: "Coda",
    author: "Coda Project Inc",
    score: 9510,
    url: "https://cdn.simpleicons.org/coda/f55744",
    thumbnail: "https://cdn.simpleicons.org/coda/f55744",
    permalink: "https://coda.io",
    colorTheme: { bg: "#1c0b08", text: "#f55744", accent: "#f55744", description: "The all-in-one doc that brings words, data, and teams together." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:coda_project", "docs", "tables", "automation"]
  },

  // Issue Tracking & Task Management
  {
    title: "Linear",
    author: "Linear Orbit Inc",
    score: 9940,
    url: "https://cdn.simpleicons.org/linear/5e6ad2",
    thumbnail: "https://cdn.simpleicons.org/linear/5e6ad2",
    permalink: "https://linear.app",
    colorTheme: { bg: "#121316", text: "#5e6ad2", accent: "#5e6ad2", description: "The issue tracking tool created for high-performance software engineering teams." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:linear_orbit", "issue_tracker", "agile", "kanban", "fast"]
  },
  {
    title: "Todoist",
    author: "Doist",
    score: 9820,
    url: "https://cdn.simpleicons.org/todoist/e44332",
    thumbnail: "https://cdn.simpleicons.org/todoist/e44332",
    permalink: "https://todoist.com",
    colorTheme: { bg: "#1a0807", text: "#e44332", accent: "#e44332", description: "Task manager and to-do list app trusted by millions to organize work and life." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:doist", "todos", "tasks", "gtd"]
  },
  {
    title: "Things 3",
    author: "Cultured Code",
    score: 9670,
    url: "https://cdn.simpleicons.org/things/207bd2",
    thumbnail: "https://cdn.simpleicons.org/things/207bd2",
    permalink: "https://culturedcode.com/things",
    colorTheme: { bg: "#081524", text: "#207bd2", accent: "#207bd2", description: "Thoughtfully designed task manager for Mac, iPhone, and iPad." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:tasks", "artist:cultured_code", "todos", "tasks", "mac_app"]
  },
  {
    title: "TickTick",
    author: "Appest Limited",
    score: 9590,
    url: "https://cdn.simpleicons.org/ticktick/488bf8",
    thumbnail: "https://cdn.simpleicons.org/ticktick/488bf8",
    permalink: "https://ticktick.com",
    colorTheme: { bg: "#081226", text: "#488bf8", accent: "#488bf8", description: "Powerful to-do list and task management app with built-in Pomodoro timer." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:appest", "todos", "pomodoro", "calendar"]
  },
  {
    title: "Trello",
    author: "Atlassian",
    score: 9860,
    url: "https://cdn.simpleicons.org/trello/0052cc",
    thumbnail: "https://cdn.simpleicons.org/trello/0052cc",
    permalink: "https://trello.com",
    colorTheme: { bg: "#091e42", text: "#0052cc", accent: "#0052cc", description: "Visual kanban board tool for managing projects, tasks, and workflows." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:atlassian", "kanban", "boards", "projects"]
  },
  {
    title: "Asana",
    author: "Asana Inc",
    score: 9780,
    url: "https://cdn.simpleicons.org/asana/f06a6a",
    thumbnail: "https://cdn.simpleicons.org/asana/f06a6a",
    permalink: "https://asana.com",
    colorTheme: { bg: "#1f0909", text: "#f06a6a", accent: "#f06a6a", description: "Work management platform designed to help teams organize and track tasks." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:asana_inc", "projects", "tasks", "collaboration"]
  },
  {
    title: "Jira",
    author: "Atlassian",
    score: 9910,
    url: "https://cdn.simpleicons.org/jira/0052cc",
    thumbnail: "https://cdn.simpleicons.org/jira/0052cc",
    permalink: "https://www.atlassian.com/software/jira",
    colorTheme: { bg: "#091e42", text: "#2684ff", accent: "#2684ff", description: "The #1 software development tool used by agile engineering teams." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:atlassian", "agile", "issue_tracker", "sprints"]
  },
  {
    title: "ClickUp",
    author: "ClickUp",
    score: 9720,
    url: "https://cdn.simpleicons.org/clickup/7b68ee",
    thumbnail: "https://cdn.simpleicons.org/clickup/7b68ee",
    permalink: "https://clickup.com",
    colorTheme: { bg: "#130f28", text: "#7b68ee", accent: "#7b68ee", description: "All-in-one productivity app combining tasks, docs, chat, and goals." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:clickup", "productivity", "all_in_one", "tasks"]
  },
  {
    title: "Monday.com",
    author: "monday.com",
    score: 9750,
    url: "https://cdn.simpleicons.org/mondaydotcom/ff3d57",
    thumbnail: "https://cdn.simpleicons.org/mondaydotcom/ff3d57",
    permalink: "https://monday.com",
    colorTheme: { bg: "#21070b", text: "#ff3d57", accent: "#ff3d57", description: "Work OS that powers teams to run projects and workflows with confidence." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:tasks", "artist:mondaydotcom", "work_os", "projects", "workflows"]
  },
  {
    title: "Basecamp",
    author: "37signals",
    score: 9630,
    url: "https://cdn.simpleicons.org/basecamp/25a863",
    thumbnail: "https://cdn.simpleicons.org/basecamp/25a863",
    permalink: "https://basecamp.com",
    colorTheme: { bg: "#061a0d", text: "#25a863", accent: "#25a863", description: "The calm, organized way to manage projects and communicate across company teams." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:collaboration", "artist:37signals", "projects", "communication", "calm"]
  },

  // Launchers & macOS Desktop Utilities
  {
    title: "Raycast",
    author: "Raycast Technologies",
    score: 9920,
    url: "https://cdn.simpleicons.org/raycast/ff6363",
    thumbnail: "https://cdn.simpleicons.org/raycast/ff6363",
    permalink: "https://www.raycast.com",
    colorTheme: { bg: "#18181b", text: "#ff6363", accent: "#ff6363", description: "An extendable launcher that lets you control your tools in a few keystrokes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:raycast", "launcher", "productivity", "mac_app"]
  },
  {
    title: "Alfred",
    author: "Running with Crayons",
    score: 9550,
    url: "https://cdn.simpleicons.org/alfred/000000",
    thumbnail: "https://cdn.simpleicons.org/alfred/000000",
    permalink: "https://www.alfredapp.com",
    colorTheme: { bg: "#141414", text: "#a855f7", accent: "#a855f7", description: "Award-winning launcher app for macOS that boosts productivity with hotkey workflows." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:running_with_crayons", "launcher", "mac_app", "workflows"]
  },
  {
    title: "Arc Browser",
    author: "The Browser Company",
    score: 9810,
    url: "https://cdn.simpleicons.org/arc/529bf7",
    thumbnail: "https://cdn.simpleicons.org/arc/529bf7",
    permalink: "https://arc.net",
    colorTheme: { bg: "#0a1526", text: "#529bf7", accent: "#529bf7", description: "The Chrome replacement browser redesigned for focus, vertical tabs, and spaces." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:productivity", "artist:browser_company", "browser", "spaces", "sidebar"]
  },
  {
    title: "CleanShot X",
    author: "MTW",
    score: 9760,
    url: "https://cdn.simpleicons.org/cleanshot/2e2e2e",
    thumbnail: "https://cdn.simpleicons.org/cleanshot/2e2e2e",
    permalink: "https://cleanshot.com",
    colorTheme: { bg: "#141414", text: "#38bdf8", accent: "#38bdf8", description: "Ultimate screen capture, screen recording, and screenshot annotation app for Mac." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:productivity", "artist:mtw", "screenshots", "screen_recorder", "mac_app"]
  },

  // Communication & Messaging
  {
    title: "Slack",
    author: "Salesforce",
    score: 9980,
    url: "https://cdn.simpleicons.org/slack/4a154b",
    thumbnail: "https://cdn.simpleicons.org/slack/4a154b",
    permalink: "https://slack.com",
    colorTheme: { bg: "#19051d", text: "#e01e5a", accent: "#ecb22e", description: "The AI-powered messaging app that connects teams and streamlines workflows." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:communication", "artist:salesforce", "messaging", "chat", "channels"]
  },
  {
    title: "Discord",
    author: "Discord Inc",
    score: 9970,
    url: "https://cdn.simpleicons.org/discord/5865f2",
    thumbnail: "https://cdn.simpleicons.org/discord/5865f2",
    permalink: "https://discord.com",
    colorTheme: { bg: "#0f1124", text: "#5865f2", accent: "#5865f2", description: "Voice, video, and text communication platform for communities and teams." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:communication", "artist:discord_inc", "chat", "voice", "communities"]
  },
  {
    title: "Microsoft Teams",
    author: "Microsoft",
    score: 9890,
    url: "https://cdn.simpleicons.org/microsoftteams/6264a7",
    thumbnail: "https://cdn.simpleicons.org/microsoftteams/6264a7",
    permalink: "https://www.microsoft.com/microsoft-teams",
    colorTheme: { bg: "#0d0e1c", text: "#6264a7", accent: "#6264a7", description: "Workspace chat, video conferencing, file storage, and application integration." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:communication", "artist:microsoft", "video_calls", "chat", "enterprise"]
  },
  {
    title: "Zoom",
    author: "Zoom Communications",
    score: 9920,
    url: "https://cdn.simpleicons.org/zoom/2d8cff",
    thumbnail: "https://cdn.simpleicons.org/zoom/2d8cff",
    permalink: "https://zoom.us",
    colorTheme: { bg: "#05152b", text: "#2d8cff", accent: "#2d8cff", description: "Frictionless video conferencing, web meetings, and real-time screen sharing." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:communication", "artist:zoom_communications", "video_conferencing", "meetings", "calls"]
  },
  {
    title: "Google Meet",
    author: "Google",
    score: 9880,
    url: "https://cdn.simpleicons.org/googlemeet/00897b",
    thumbnail: "https://cdn.simpleicons.org/googlemeet/00897b",
    permalink: "https://meet.google.com",
    colorTheme: { bg: "#031715", text: "#00897b", accent: "#00897b", description: "Real-time video meetings by Google using your browser or mobile app." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:communication", "artist:google", "video_calls", "meetings", "browser"]
  },

  // Video Messaging & Email
  {
    title: "Loom",
    author: "Atlassian",
    score: 9790,
    url: "https://cdn.simpleicons.org/loom/625df5",
    thumbnail: "https://cdn.simpleicons.org/loom/625df5",
    permalink: "https://www.loom.com",
    colorTheme: { bg: "#100d29", text: "#625df5", accent: "#625df5", description: "Async video messaging platform to record your screen, camera, and audio." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:communication", "artist:atlassian", "video_messaging", "screen_recorder", "async"]
  },
  {
    title: "Superhuman",
    author: "Superhuman Inc",
    score: 9680,
    url: "https://cdn.simpleicons.org/superhuman/000000",
    thumbnail: "https://cdn.simpleicons.org/superhuman/000000",
    permalink: "https://superhuman.com",
    colorTheme: { bg: "#141414", text: "#ffffff", accent: "#eab308", description: "The fastest email experience ever created for high-performing teams." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:productivity", "artist:superhuman_inc", "email", "fast", "shortcuts"]
  },
  {
    title: "Grammarly",
    author: "Grammarly Inc",
    score: 9890,
    url: "https://cdn.simpleicons.org/grammarly/15c39a",
    thumbnail: "https://cdn.simpleicons.org/grammarly/15c39a",
    permalink: "https://www.grammarly.com",
    colorTheme: { bg: "#041c14", text: "#15c39a", accent: "#15c39a", description: "AI writing assistant for grammar checking, spell check, and tone detection." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:grammarly_inc", "writing", "grammar", "ai"]
  },

  // Automation, Forms & Scheduling
  {
    title: "Zapier",
    author: "Zapier Inc",
    score: 9910,
    url: "https://cdn.simpleicons.org/zapier/ff4a00",
    thumbnail: "https://cdn.simpleicons.org/zapier/ff4a00",
    permalink: "https://zapier.com",
    colorTheme: { bg: "#1f0900", text: "#ff4a00", accent: "#ff4a00", description: "Automate workflows by connecting your favorite web apps together." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:zapier_inc", "automation", "integration", "no_code"]
  },
  {
    title: "Make",
    author: "Celonis",
    score: 9780,
    url: "https://cdn.simpleicons.org/make/6d28d9",
    thumbnail: "https://cdn.simpleicons.org/make/6d28d9",
    permalink: "https://www.make.com",
    colorTheme: { bg: "#100624", text: "#a855f7", accent: "#a855f7", description: "Visual automation platform that lets you design, build, and automate workflows." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:celonis", "automation", "visual_editor", "integration"]
  },
  {
    title: "Airtable",
    author: "Formagrid Inc",
    score: 9870,
    url: "https://cdn.simpleicons.org/airtable/18bfff",
    thumbnail: "https://cdn.simpleicons.org/airtable/18bfff",
    permalink: "https://airtable.com",
    colorTheme: { bg: "#041926", text: "#18bfff", accent: "#18bfff", description: "Low-code platform for building collaborative database spreadsheet applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:formagrid_inc", "database", "spreadsheet", "workflows"]
  },
  {
    title: "Tally Forms",
    author: "Tally Team",
    score: 9690,
    url: "https://cdn.simpleicons.org/tally/000000",
    thumbnail: "https://cdn.simpleicons.org/tally/000000",
    permalink: "https://tally.so",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#38bdf8", description: "The simplest way to create online forms for free with Notion-style editor." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:tally_team", "forms", "surveys", "notion_style"]
  },
  {
    title: "Typeform",
    author: "Typeform SL",
    score: 9760,
    url: "https://cdn.simpleicons.org/typeform/000000",
    thumbnail: "https://cdn.simpleicons.org/typeform/000000",
    permalink: "https://www.typeform.com",
    colorTheme: { bg: "#18181b", text: "#ffffff", accent: "#38bdf8", description: "People-friendly conversational online forms, surveys, and quizzes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:typeform_sl", "forms", "surveys", "conversational"]
  },
  {
    title: "Calendly",
    author: "Calendly LLC",
    score: 9840,
    url: "https://cdn.simpleicons.org/calendly/006bff",
    thumbnail: "https://cdn.simpleicons.org/calendly/006bff",
    permalink: "https://calendly.com",
    colorTheme: { bg: "#001633", text: "#006bff", accent: "#006bff", description: "Automated scheduling platform that eliminates back-and-forth emails." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:calendly_llc", "scheduling", "calendar", "meetings"]
  },
  {
    title: "Cal.com",
    author: "Cal.com Inc",
    score: 9710,
    url: "https://cdn.simpleicons.org/caldotcom/000000",
    thumbnail: "https://cdn.simpleicons.org/caldotcom/000000",
    permalink: "https://cal.com",
    colorTheme: { bg: "#111111", text: "#ffffff", accent: "#ffffff", description: "Open source scheduling infrastructure for everyone—the open Calendly alternative." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:saas", "artist:calcom_inc", "scheduling", "open_source", "calendar"]
  },
  {
    title: "Fantastical",
    author: "Flexibits",
    score: 9520,
    url: "https://cdn.simpleicons.org/fantastical/e84a5f",
    thumbnail: "https://cdn.simpleicons.org/fantastical/e84a5f",
    permalink: "https://flexibits.com/fantastical",
    colorTheme: { bg: "#1f090d", text: "#e84a5f", accent: "#e84a5f", description: "Multiple award-winning calendar and tasks app for Mac, iPad, and iPhone." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:flexibits", "calendar", "mac_app", "tasks"]
  },

  // CRM, Payments & Commerce SaaS
  {
    title: "Intercom",
    author: "Intercom Inc",
    score: 9810,
    url: "https://cdn.simpleicons.org/intercom/000000",
    thumbnail: "https://cdn.simpleicons.org/intercom/000000",
    permalink: "https://www.intercom.com",
    colorTheme: { bg: "#111827", text: "#38bdf8", accent: "#38bdf8", description: "AI-first customer service solution with live chat and support ticket workflows." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:saas", "artist:intercom_inc", "customer_service", "live_chat", "support"]
  },
  {
    title: "Zendesk",
    author: "Zendesk Inc",
    score: 9740,
    url: "https://cdn.simpleicons.org/zendesk/03363d",
    thumbnail: "https://cdn.simpleicons.org/zendesk/03363d",
    permalink: "https://www.zendesk.com",
    colorTheme: { bg: "#011214", text: "#03363d", accent: "#03363d", description: "Customer service software and CRM sales solution for modern businesses." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:saas", "artist:zendesk_inc", "crm", "support", "helpdesk"]
  },
  {
    title: "HubSpot",
    author: "HubSpot Inc",
    score: 9890,
    url: "https://cdn.simpleicons.org/hubspot/ff7a59",
    thumbnail: "https://cdn.simpleicons.org/hubspot/ff7a59",
    permalink: "https://www.hubspot.com",
    colorTheme: { bg: "#240f09", text: "#ff7a59", accent: "#ff7a59", description: "CRM platform with inbound marketing, sales, content management, and customer service." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:hubspot_inc", "crm", "marketing", "sales"]
  },
  {
    title: "Stripe",
    author: "Stripe Inc",
    score: 9990,
    url: "https://cdn.simpleicons.org/stripe/635bff",
    thumbnail: "https://cdn.simpleicons.org/stripe/635bff",
    permalink: "https://stripe.com",
    colorTheme: { bg: "#0d0b2b", text: "#635bff", accent: "#635bff", description: "Financial infrastructure for the internet—accept payments and run online businesses." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:stripe_inc", "payments", "billing", "api"]
  },
  {
    title: "Gumroad",
    author: "Sahil Lavingia",
    score: 9680,
    url: "https://cdn.simpleicons.org/gumroad/ff90e8",
    thumbnail: "https://cdn.simpleicons.org/gumroad/ff90e8",
    permalink: "https://gumroad.com",
    colorTheme: { bg: "#24001f", text: "#ff90e8", accent: "#ff90e8", description: "E-commerce platform for creators to sell digital products, courses, and memberships." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:sahil_lavingia", "ecommerce", "creators", "digital_products"]
  },
  {
    title: "Lemon Squeezy",
    author: "MakeSwift",
    score: 9610,
    url: "https://cdn.simpleicons.org/lemonsqueezy/ffdd00",
    thumbnail: "https://cdn.simpleicons.org/lemonsqueezy/ffdd00",
    permalink: "https://www.lemonsqueezy.com",
    colorTheme: { bg: "#1f1b00", text: "#ffdd00", accent: "#ffdd00", description: "Merchant of record platform to sell software, digital downloads, and SaaS subscriptions." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:makeswift", "merchant_of_record", "payments", "saas"]
  },
  {
    title: "Paddle",
    author: "Paddle Inc",
    score: 9540,
    url: "https://cdn.simpleicons.org/paddle/000000",
    thumbnail: "https://cdn.simpleicons.org/paddle/000000",
    permalink: "https://www.paddle.com",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#38bdf8", description: "Complete payment infrastructure and global merchant of record for SaaS businesses." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:paddle_inc", "payments", "billing", "saas"]
  },
  {
    title: "Buffer",
    author: "Buffer Inc",
    score: 9610,
    url: "https://cdn.simpleicons.org/buffer/231f20",
    thumbnail: "https://cdn.simpleicons.org/buffer/231f20",
    permalink: "https://buffer.com",
    colorTheme: { bg: "#121212", text: "#38bdf8", accent: "#38bdf8", description: "Organic social media management tool to schedule posts and analyze performance." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:saas", "artist:buffer_inc", "social_media", "scheduling", "analytics"]
  },
  {
    title: "Readwise",
    author: "Readwise Inc",
    score: 9580,
    url: "https://cdn.simpleicons.org/readwise/000000",
    thumbnail: "https://cdn.simpleicons.org/readwise/000000",
    permalink: "https://readwise.io",
    colorTheme: { bg: "#141414", text: "#eab308", accent: "#eab308", description: "Sync your highlights from Kindle, Instapaper, and Pocket into Notion & Obsidian." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:productivity", "artist:readwise_inc", "reading", "highlights", "sync"]
  },
  {
    title: "Pocket",
    author: "Mozilla",
    score: 9510,
    url: "https://cdn.simpleicons.org/pocket/ef4056",
    thumbnail: "https://cdn.simpleicons.org/pocket/ef4056",
    permalink: "https://getpocket.com",
    colorTheme: { bg: "#21090d", text: "#ef4056", accent: "#ef4056", description: "Save articles, videos, and stories from any publication to read later offline." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:productivity", "artist:mozilla", "read_later", "bookmarks", "articles"]
  },
  {
    title: "Product Hunt",
    author: "Product Hunt Team",
    score: 9940,
    url: "https://cdn.simpleicons.org/producthunt/da552f",
    thumbnail: "https://cdn.simpleicons.org/producthunt/da552f",
    permalink: "https://www.producthunt.com",
    colorTheme: { bg: "#1f0a07", text: "#da552f", accent: "#da552f", description: "The place to launch and discover the latest mobile apps, websites, and tech products." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:saas", "artist:product_hunt_team", "discovery", "launches", "products"]
  },
  {
    title: "Cron Calendar",
    author: "Notion",
    score: 9640,
    url: "https://cdn.simpleicons.org/cron/000000",
    thumbnail: "https://cdn.simpleicons.org/cron/000000",
    permalink: "https://cron.com",
    colorTheme: { bg: "#121212", text: "#38bdf8", accent: "#38bdf8", description: "Next-generation calendar for professionals and teams built by Notion." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:productivity", "artist:notion", "calendar", "scheduling", "time_management"]
  }
];

const posts = PRODUCTIVITY_SAAS_TOOLS.map((t, idx) => ({
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

const outputPath = path.join(__dirname, 'toolfolio_50_batch3_productivity.json');
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');

console.log(`Successfully generated ${posts.length} clean productivity & SaaS tool entries to ${outputPath}`);
console.log(`Batch upload timestamp: meta:upload:${BATCH_TIMESTAMP}`);

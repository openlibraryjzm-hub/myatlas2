import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_TIMESTAMP = '2026-08-16_13-29-00';
const ATLAS_TAG = 'meta:atlas:toolatlas';

const AI_GENERATIVE_TOOLS = [
  // Conversational Assistants & Foundational LLMs
  {
    title: "ChatGPT",
    author: "OpenAI",
    score: 9999,
    url: "https://cdn.simpleicons.org/openai/412991",
    thumbnail: "https://cdn.simpleicons.org/openai/412991",
    permalink: "https://chatgpt.com",
    colorTheme: { bg: "#0d1b15", text: "#10a37f", accent: "#10a37f", description: "Conversational AI model for drafting text, writing code, and reasoning." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:openai", "llm", "assistant", "chat", "gpt4"]
  },
  {
    title: "Claude AI",
    author: "Anthropic",
    score: 9960,
    url: "https://cdn.simpleicons.org/anthropic/d97706",
    thumbnail: "https://cdn.simpleicons.org/anthropic/d97706",
    permalink: "https://claude.ai",
    colorTheme: { bg: "#1f1811", text: "#d97706", accent: "#d97706", description: "Next-generation AI assistant built for deep reasoning, coding, and analysis." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:anthropic", "llm", "assistant", "reasoning", "claude"]
  },
  {
    title: "Google Gemini",
    author: "Google",
    score: 9920,
    url: "https://cdn.simpleicons.org/googlegemini/8e75ff",
    thumbnail: "https://cdn.simpleicons.org/googlegemini/8e75ff",
    permalink: "https://gemini.google.com",
    colorTheme: { bg: "#0d1124", text: "#8e75ff", accent: "#8e75ff", description: "Google's multimodal AI model for understanding text, code, audio, and images." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:google", "llm", "multimodal", "gemini"]
  },
  {
    title: "Perplexity AI",
    author: "Perplexity AI Inc",
    score: 9890,
    url: "https://cdn.simpleicons.org/perplexity/22b8cf",
    thumbnail: "https://cdn.simpleicons.org/perplexity/22b8cf",
    permalink: "https://www.perplexity.ai",
    colorTheme: { bg: "#06181f", text: "#22b8cf", accent: "#22b8cf", description: "AI-powered answer engine providing cited web search and research summary." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:perplexity_ai", "search", "citations", "research"]
  },
  {
    title: "Mistral AI",
    author: "Mistral AI",
    score: 9780,
    url: "https://cdn.simpleicons.org/mistral/ff7000",
    thumbnail: "https://cdn.simpleicons.org/mistral/ff7000",
    permalink: "https://mistral.ai",
    colorTheme: { bg: "#210f05", text: "#ff7000", accent: "#ff7000", description: "Frontier open-weight LLMs offering blazingly fast inference and reasoning." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:mistral_ai", "open_weights", "llm", "inference"]
  },
  {
    title: "Meta LLaMA",
    author: "Meta",
    score: 9850,
    url: "https://cdn.simpleicons.org/meta/0467df",
    thumbnail: "https://cdn.simpleicons.org/meta/0467df",
    permalink: "https://llama.meta.com",
    colorTheme: { bg: "#05162a", text: "#0467df", accent: "#0467df", description: "State-of-the-art open source large language model suite built by Meta." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:meta", "open_source", "llm", "llama"]
  },
  {
    title: "OpenAI API",
    author: "OpenAI",
    score: 9970,
    url: "https://cdn.simpleicons.org/openai/000000",
    thumbnail: "https://cdn.simpleicons.org/openai/000000",
    permalink: "https://platform.openai.com",
    colorTheme: { bg: "#121212", text: "#10a37f", accent: "#10a37f", description: "Developer platform offering API access to GPT-4o, DALL-E, and Whisper." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:openai", "api", "gpt4", "embeddings"]
  },

  // AI Coding Assistants & Builders
  {
    title: "Cursor AI",
    author: "Anysphere",
    score: 9940,
    url: "https://cdn.simpleicons.org/cursor/000000",
    thumbnail: "https://cdn.simpleicons.org/cursor/000000",
    permalink: "https://www.cursor.com",
    colorTheme: { bg: "#18181b", text: "#38bdf8", accent: "#38bdf8", description: "The AI-first code editor designed to make programming blazingly fast." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:anysphere", "ai_editor", "copilot", "coding"]
  },
  {
    title: "GitHub Copilot",
    author: "GitHub",
    score: 9910,
    url: "https://cdn.simpleicons.org/githubcopilot/000000",
    thumbnail: "https://cdn.simpleicons.org/githubcopilot/000000",
    permalink: "https://github.com/features/copilot",
    colorTheme: { bg: "#0d1117", text: "#a855f7", accent: "#a855f7", description: "AI pair programmer that offers autocomplete code suggestions right inside your editor." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:github", "copilot", "autocomplete", "coding"]
  },
  {
    title: "Codeium",
    author: "Codeium Inc",
    score: 9680,
    url: "https://cdn.simpleicons.org/codeium/09b6a2",
    thumbnail: "https://cdn.simpleicons.org/codeium/09b6a2",
    permalink: "https://codeium.com",
    colorTheme: { bg: "#041b18", text: "#09b6a2", accent: "#09b6a2", description: "Free AI code completion and chat tool for all major IDEs and editors." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:codeium_inc", "copilot", "autocomplete", "free"]
  },
  {
    title: "v0 by Vercel",
    author: "Vercel",
    score: 9860,
    url: "https://cdn.simpleicons.org/vercel/000000",
    thumbnail: "https://cdn.simpleicons.org/vercel/000000",
    permalink: "https://v0.dev",
    colorTheme: { bg: "#000000", text: "#ffffff", accent: "#ffffff", description: "Generative UI system powered by AI that outputs production-ready React components." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:vercel", "generative_ui", "react", "tailwind"]
  },
  {
    title: "Bolt.new",
    author: "StackBlitz",
    score: 9810,
    url: "https://cdn.simpleicons.org/stackblitz/1389fd",
    thumbnail: "https://cdn.simpleicons.org/stackblitz/1389fd",
    permalink: "https://bolt.new",
    colorTheme: { bg: "#081324", text: "#1389fd", accent: "#1389fd", description: "Prompt, build, and deploy full-stack web applications in the browser with AI." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:stackblitz", "fullstack", "in_browser", "ai_builder"]
  },
  {
    title: "Phind",
    author: "Phind Inc",
    score: 9640,
    url: "https://cdn.simpleicons.org/phind/38bdf8",
    thumbnail: "https://cdn.simpleicons.org/phind/38bdf8",
    permalink: "https://www.phind.com",
    colorTheme: { bg: "#071724", text: "#38bdf8", accent: "#38bdf8", description: "The AI search engine created specifically for software developers." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:phind_inc", "search", "developer", "code"]
  },

  // Image & Media Generation
  {
    title: "Midjourney",
    author: "Midjourney Inc",
    score: 9980,
    url: "https://cdn.simpleicons.org/midjourney/000000",
    thumbnail: "https://cdn.simpleicons.org/midjourney/000000",
    permalink: "https://www.midjourney.com",
    colorTheme: { bg: "#0c0d12", text: "#ffffff", accent: "#38bdf8", description: "Generative AI program producing artwork and photorealistic imagery from prompts." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:midjourney_inc", "ai_art", "image_generation", "creative"]
  },
  {
    title: "Stability AI",
    author: "Stability AI",
    score: 9890,
    url: "https://cdn.simpleicons.org/stabilitydotai/a855f7",
    thumbnail: "https://cdn.simpleicons.org/stabilitydotai/a855f7",
    permalink: "https://stability.ai",
    colorTheme: { bg: "#160b24", text: "#a855f7", accent: "#a855f7", description: "Open source text-to-image generator powered by Stable Diffusion models." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:stability_ai", "stable_diffusion", "open_source", "image_gen"]
  },
  {
    title: "Leonardo AI",
    author: "Leonardo Interactive",
    score: 9720,
    url: "https://cdn.simpleicons.org/leonardoai/ec4899",
    thumbnail: "https://cdn.simpleicons.org/leonardoai/ec4899",
    permalink: "https://leonardo.ai",
    colorTheme: { bg: "#210917", text: "#ec4899", accent: "#ec4899", description: "Generative AI suite for creating game assets, concept art, and illustrations." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:leonardo_interactive", "game_assets", "image_gen", "art"]
  },
  {
    title: "Civitai",
    author: "Civitai Team",
    score: 9780,
    url: "https://cdn.simpleicons.org/civitai/0284c7",
    thumbnail: "https://cdn.simpleicons.org/civitai/0284c7",
    permalink: "https://civitai.com",
    colorTheme: { bg: "#061926", text: "#0284c7", accent: "#0284c7", description: "Ecosystem platform for sharing and exploring fine-tuned Stable Diffusion models and LoRAs." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:civitai_team", "lora", "models", "stable_diffusion"]
  },

  // Video & Motion AI
  {
    title: "Runway Gen-2",
    author: "Runway ML",
    score: 9870,
    url: "https://cdn.simpleicons.org/runway/000000",
    thumbnail: "https://cdn.simpleicons.org/runway/000000",
    permalink: "https://runwayml.com",
    colorTheme: { bg: "#141414", text: "#ffffff", accent: "#a855f7", description: "Multimodal AI system to generate videos from text, images, or existing clips." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:runway_ml", "video_gen", "ai_video", "creative"]
  },
  {
    title: "Luma Dream Machine",
    author: "Luma AI Inc",
    score: 9790,
    url: "https://cdn.simpleicons.org/luma/000000",
    thumbnail: "https://cdn.simpleicons.org/luma/000000",
    permalink: "https://lumalabs.ai",
    colorTheme: { bg: "#0d0d0d", text: "#38bdf8", accent: "#38bdf8", description: "Generative AI model that creates high quality realistic 3D and 5-second video scenes." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:luma_ai", "video_gen", "3d", "nerf"]
  },
  {
    title: "HeyGen",
    author: "HeyGen",
    score: 9690,
    url: "https://cdn.simpleicons.org/heygen/6366f1",
    thumbnail: "https://cdn.simpleicons.org/heygen/6366f1",
    permalink: "https://www.heygen.com",
    colorTheme: { bg: "#0d0f28", text: "#6366f1", accent: "#6366f1", description: "AI video generator platform using customizable digital avatars and voice cloning." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:heygen", "avatars", "video_gen", "voice"]
  },
  {
    title: "Synthesia",
    author: "Synthesia Ltd",
    score: 9640,
    url: "https://cdn.simpleicons.org/synthesia/3b82f6",
    thumbnail: "https://cdn.simpleicons.org/synthesia/3b82f6",
    permalink: "https://www.synthesia.io",
    colorTheme: { bg: "#081326", text: "#3b82f6", accent: "#3b82f6", description: "AI video communications platform creating professional avatar videos from text." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:synthesia_ltd", "avatars", "video_gen", "presentation"]
  },

  // Audio, Voice & Music AI
  {
    title: "ElevenLabs",
    author: "ElevenLabs",
    score: 9940,
    url: "https://cdn.simpleicons.org/elevenlabs/000000",
    thumbnail: "https://cdn.simpleicons.org/elevenlabs/000000",
    permalink: "https://elevenlabs.io",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#38bdf8", description: "Industry-leading AI voice generator, voice cloning, and text-to-speech software." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:elevenlabs", "tts", "voice_cloning", "audio"]
  },
  {
    title: "Suno AI",
    author: "Suno Inc",
    score: 9860,
    url: "https://cdn.simpleicons.org/suno/000000",
    thumbnail: "https://cdn.simpleicons.org/suno/000000",
    permalink: "https://suno.com",
    colorTheme: { bg: "#18181b", text: "#f59e0b", accent: "#f59e0b", description: "Generative AI music platform producing full songs with vocals and instruments from text." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:suno_inc", "music_generation", "audio", "songwriting"]
  },
  {
    title: "Udio",
    author: "Udio Inc",
    score: 9780,
    url: "https://cdn.simpleicons.org/udio/000000",
    thumbnail: "https://cdn.simpleicons.org/udio/000000",
    permalink: "https://www.udio.com",
    colorTheme: { bg: "#111111", text: "#ec4899", accent: "#ec4899", description: "AI music creation model offering studio-quality musical compositions and vocals." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:udio_inc", "music_gen", "audio", "creative"]
  },

  // Open Source Ecosystem & Infrastructure
  {
    title: "Hugging Face",
    author: "Hugging Face",
    score: 9980,
    url: "https://cdn.simpleicons.org/huggingface/ffd21e",
    thumbnail: "https://cdn.simpleicons.org/huggingface/ffd21e",
    permalink: "https://huggingface.co",
    colorTheme: { bg: "#1c1809", text: "#ffd21e", accent: "#ffd21e", description: "The AI community platform for hosting models, datasets, and open source spaces." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:hugging_face", "models", "datasets", "open_source"]
  },
  {
    title: "Replicate",
    author: "Replicate Inc",
    score: 9810,
    url: "https://cdn.simpleicons.org/replicate/000000",
    thumbnail: "https://cdn.simpleicons.org/replicate/000000",
    permalink: "https://replicate.com",
    colorTheme: { bg: "#0d0d0d", text: "#ffffff", accent: "#a855f7", description: "Run open-source machine learning models with a cloud API endpoint." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:replicate_inc", "api", "cloud_models", "inference"]
  },
  {
    title: "Ollama",
    author: "Ollama Team",
    score: 9890,
    url: "https://cdn.simpleicons.org/ollama/000000",
    thumbnail: "https://cdn.simpleicons.org/ollama/000000",
    permalink: "https://ollama.com",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#10b981", description: "Get up and running with Llama 3, Mistral, and other open LLMs locally." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:ollama_team", "local_llm", "open_source", "cli"]
  },
  {
    title: "LangChain",
    author: "LangChain Inc",
    score: 9840,
    url: "https://cdn.simpleicons.org/langchain/1c3c3c",
    thumbnail: "https://cdn.simpleicons.org/langchain/1c3c3c",
    permalink: "https://www.langchain.com",
    colorTheme: { bg: "#0c1818", text: "#10b981", accent: "#10b981", description: "Framework for building context-aware reasoning applications with LLMs." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:langchain_inc", "framework", "llm_ops", "agents", "rag"]
  },
  {
    title: "Groq",
    author: "Groq Inc",
    score: 9790,
    url: "https://cdn.simpleicons.org/groq/f97316",
    thumbnail: "https://cdn.simpleicons.org/groq/f97316",
    permalink: "https://groq.com",
    colorTheme: { bg: "#1f0f08", text: "#f97316", accent: "#f97316", description: "Ultrafast LPU inference engine powering real-time open-weight LLMs." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:groq_inc", "inference", "lpu", "fast"]
  },

  // Vector Databases for AI / RAG
  {
    title: "Pinecone",
    author: "Pinecone Systems",
    score: 9740,
    url: "https://cdn.simpleicons.org/pinecone/000000",
    thumbnail: "https://cdn.simpleicons.org/pinecone/000000",
    permalink: "https://www.pinecone.io",
    colorTheme: { bg: "#0d0d0d", text: "#38bdf8", accent: "#38bdf8", description: "Vector database for high-performance similarity search and RAG applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:pinecone_systems", "vector_db", "rag", "embeddings"]
  },
  {
    title: "Chroma DB",
    author: "Chroma Inc",
    score: 9680,
    url: "https://cdn.simpleicons.org/chroma/f43f5e",
    thumbnail: "https://cdn.simpleicons.org/chroma/f43f5e",
    permalink: "https://www.trychroma.com",
    colorTheme: { bg: "#1c090e", text: "#f43f5e", accent: "#f43f5e", description: "Open source embedding database designed for building AI applications with embeddings." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:database", "artist:chroma_inc", "vector_db", "open_source", "embeddings"]
  },
  {
    title: "Weaviate",
    author: "Weaviate B.V.",
    score: 9610,
    url: "https://cdn.simpleicons.org/weaviate/e0005a",
    thumbnail: "https://cdn.simpleicons.org/weaviate/e0005a",
    permalink: "https://weaviate.io",
    colorTheme: { bg: "#1f040e", text: "#e0005a", accent: "#e0005a", description: "Open source vector search engine with built-in ML model modules." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:weaviate_bv", "vector_search", "open_source", "rag"]
  },

  // Writing & Copywriting AI
  {
    title: "Jasper AI",
    author: "Jasper Inc",
    score: 9710,
    url: "https://cdn.simpleicons.org/jasper/ff4f00",
    thumbnail: "https://cdn.simpleicons.org/jasper/ff4f00",
    permalink: "https://www.jasper.ai",
    colorTheme: { bg: "#210b00", text: "#ff4f00", accent: "#ff4f00", description: "AI copilot for enterprise marketing teams to draft high-converting copy." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:jasper_inc", "copywriting", "marketing", "content"]
  },
  {
    title: "Copy.ai",
    author: "Copy.ai",
    score: 9650,
    url: "https://cdn.simpleicons.org/copyai/2563eb",
    thumbnail: "https://cdn.simpleicons.org/copyai/2563eb",
    permalink: "https://www.copy.ai",
    colorTheme: { bg: "#081329", text: "#2563eb", accent: "#2563eb", description: "AI marketing OS for content creation, sales copy, and social posts." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:copyai", "copywriting", "marketing", "sales"]
  },
  {
    title: "Writesonic",
    author: "Writesonic Inc",
    score: 9580,
    url: "https://cdn.simpleicons.org/writesonic/7c3aed",
    thumbnail: "https://cdn.simpleicons.org/writesonic/7c3aed",
    permalink: "https://writesonic.com",
    colorTheme: { bg: "#130924", text: "#7c3aed", accent: "#7c3aed", description: "AI writer for SEO blogs, articles, ad copy, and e-commerce content." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:writesonic_inc", "seo", "content", "copywriting"]
  },

  // Speech Recognition & Translation AI
  {
    title: "DeepL Translate",
    author: "DeepL SE",
    score: 9940,
    url: "https://cdn.simpleicons.org/deepl/0f2b46",
    thumbnail: "https://cdn.simpleicons.org/deepl/0f2b46",
    permalink: "https://www.deepl.com",
    colorTheme: { bg: "#08131e", text: "#0f2b46", accent: "#38bdf8", description: "Neural machine translation service offering ultra-accurate language translations." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:deepl_se", "translation", "languages", "neural_net"]
  },
  {
    title: "Descript",
    author: "Descript Inc",
    score: 9780,
    url: "https://cdn.simpleicons.org/descript/000000",
    thumbnail: "https://cdn.simpleicons.org/descript/000000",
    permalink: "https://www.descript.com",
    colorTheme: { bg: "#121212", text: "#ffffff", accent: "#a855f7", description: "All-in-one video and podcast editing software that works like a text doc using AI." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:descript_inc", "transcription", "podcast", "video_editing"]
  },
  {
    title: "Otter.ai",
    author: "Otter.ai",
    score: 9710,
    url: "https://cdn.simpleicons.org/otterdotai/2563eb",
    thumbnail: "https://cdn.simpleicons.org/otterdotai/2563eb",
    permalink: "https://otter.ai",
    colorTheme: { bg: "#061326", text: "#2563eb", accent: "#2563eb", description: "AI meeting note taker that transcribes conversations in real time." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:otterai", "transcription", "meeting_notes", "audio"]
  },

  // Conversational Bots & Workflow AI
  {
    title: "Poe by Quora",
    author: "Quora",
    score: 9690,
    url: "https://cdn.simpleicons.org/poe/4b5563",
    thumbnail: "https://cdn.simpleicons.org/poe/4b5563",
    permalink: "https://poe.com",
    colorTheme: { bg: "#111827", text: "#ffffff", accent: "#38bdf8", description: "Platform allowing users to chat with multiple AI bots in one interface." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:quora", "chatbots", "multi_model", "aggregation"]
  },
  {
    title: "Voiceflow",
    author: "Voiceflow Inc",
    score: 9630,
    url: "https://cdn.simpleicons.org/voiceflow/3b82f6",
    thumbnail: "https://cdn.simpleicons.org/voiceflow/3b82f6",
    permalink: "https://www.voiceflow.com",
    colorTheme: { bg: "#081326", text: "#3b82f6", accent: "#3b82f6", description: "Collaborative design platform for building conversational AI agents and chatbots." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:voiceflow_inc", "chatbots", "conversation_design", "no_code"]
  },
  {
    title: "Botpress",
    author: "Botpress Inc",
    score: 9580,
    url: "https://cdn.simpleicons.org/botpress/000000",
    thumbnail: "https://cdn.simpleicons.org/botpress/000000",
    permalink: "https://botpress.com",
    colorTheme: { bg: "#111111", text: "#ffffff", accent: "#10b981", description: "Open source chatbot building engine powered by OpenAI and LLM integrations." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:botpress_inc", "chatbots", "open_source", "workflow"]
  },

  // AI Compute & Platform Infrastructure
  {
    title: "Together AI",
    author: "Together Computer",
    score: 9620,
    url: "https://cdn.simpleicons.org/togetherai/0f172a",
    thumbnail: "https://cdn.simpleicons.org/togetherai/0f172a",
    permalink: "https://www.together.ai",
    colorTheme: { bg: "#0b121e", text: "#a855f7", accent: "#a855f7", description: "Fastest cloud platform for training and running open source AI models." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:together_computer", "cloud_inference", "open_source", "gpu"]
  },
  {
    title: "Anyscale",
    author: "Anyscale Inc",
    score: 9540,
    url: "https://cdn.simpleicons.org/anyscale/0284c7",
    thumbnail: "https://cdn.simpleicons.org/anyscale/0284c7",
    permalink: "https://www.anyscale.com",
    colorTheme: { bg: "#061826", text: "#0284c7", accent: "#0284c7", description: "Managed Ray platform to scale AI applications and LLM workloads." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:anyscale_inc", "ray", "scaling", "distributed"]
  },
  {
    title: "Scale AI",
    author: "Scale AI Inc",
    score: 9810,
    url: "https://cdn.simpleicons.org/scaleai/000000",
    thumbnail: "https://cdn.simpleicons.org/scaleai/000000",
    permalink: "https://scale.com",
    colorTheme: { bg: "#0f0f0f", text: "#ffffff", accent: "#a855f7", description: "Data platform for AI providing high-quality training data and RLHF annotation." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:scale_ai_inc", "data_annotation", "rlhf", "training_data"]
  },
  {
    title: "Qdrant",
    author: "Qdrant Solutions",
    score: 9590,
    url: "https://cdn.simpleicons.org/qdrant/dc2626",
    thumbnail: "https://cdn.simpleicons.org/qdrant/dc2626",
    permalink: "https://qdrant.tech",
    colorTheme: { bg: "#1f0909", text: "#dc2626", accent: "#dc2626", description: "Vector similarity search engine and database written in Rust." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:database", "artist:qdrant_solutions", "vector_db", "rust", "search"]
  },
  {
    title: "Flowise AI",
    author: "Flowise Team",
    score: 9640,
    url: "https://cdn.simpleicons.org/flowise/0284c7",
    thumbnail: "https://cdn.simpleicons.org/flowise/0284c7",
    permalink: "https://flowiseai.com",
    colorTheme: { bg: "#061826", text: "#0284c7", accent: "#0284c7", description: "Open source drag & drop UI to build customized LLM flow applications." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:free", "flair:ai", "artist:flowise_team", "drag_drop", "no_code", "langchain", "open_source"]
  },

  // Creative Image Utilities
  {
    title: "Canva Magic Studio",
    author: "Canva",
    score: 9840,
    url: "https://cdn.simpleicons.org/canva/00c4cc",
    thumbnail: "https://cdn.simpleicons.org/canva/00c4cc",
    permalink: "https://www.canva.com/magic",
    colorTheme: { bg: "#071b24", text: "#00c4cc", accent: "#00c4cc", description: "All-in-one AI design tools for instant image editing, expansion, and copy generation." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:canva", "design_ai", "image_editing", "generative"]
  },
  {
    title: "Sora Video AI",
    author: "OpenAI",
    score: 9995,
    url: "https://cdn.simpleicons.org/openai/10a37f",
    thumbnail: "https://cdn.simpleicons.org/openai/10a37f",
    permalink: "https://openai.com/sora",
    colorTheme: { bg: "#0d1b15", text: "#10a37f", accent: "#10a37f", description: "Text-to-video AI model that creates realistic and imaginative scenes from prompts." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:paid", "flair:ai", "artist:openai", "sora", "video_gen", "ai_video"]
  },
  {
    title: "You.com",
    author: "You.com",
    score: 9680,
    url: "https://cdn.simpleicons.org/you/2563eb",
    thumbnail: "https://cdn.simpleicons.org/you/2563eb",
    permalink: "https://you.com",
    colorTheme: { bg: "#081329", text: "#2563eb", accent: "#2563eb", description: "AI search engine and chat assistant providing customizable model modes and web research." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:you_com", "search", "llm", "assistant"]
  },
  {
    title: "Kling AI",
    author: "Kuaishou",
    score: 9760,
    url: "https://cdn.simpleicons.org/kling/000000",
    thumbnail: "https://cdn.simpleicons.org/kling/000000",
    permalink: "https://klingai.com",
    colorTheme: { bg: "#141414", text: "#a855f7", accent: "#a855f7", description: "Generative AI video model producing high-definition 1080p motion clips from text." },
    tags: [ATLAS_TAG, `meta:upload:${BATCH_TIMESTAMP}`, "meta:format:image", "meta:extension:svg", "meta:pricing:freemium", "flair:ai", "artist:kuaishou", "video_gen", "ai_video", "motion"]
  }
];

const posts = AI_GENERATIVE_TOOLS.map((t, idx) => ({
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

const outputPath = path.join(__dirname, 'toolfolio_50_batch4_ai.json');
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');

console.log(`Successfully generated ${posts.length} clean AI & Generative tool entries to ${outputPath}`);
console.log(`Batch upload timestamp: meta:upload:${BATCH_TIMESTAMP}`);

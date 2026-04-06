# Coregit Vibecoding Demo

A Lovable-style AI code generation app powered by [Coregit](https://coregit.dev) — the serverless Git backend for AI-native products.

**Type a prompt, get a running app.** The AI generates code, commits it to Coregit with a single API call, and runs it live in your browser via WebContainer.

## How it works

```
You: "Build me a todo app with dark mode"
  ↓
AI generates code (React + Vite + Tailwind)
  ↓
Files committed atomically to Coregit (1 API call = N files)
  ↓
WebContainer boots in browser → npm install → npm run dev
  ↓
Live preview appears. Iterate with follow-up prompts.
```

## Why Coregit

Traditional Git APIs require **7-14 HTTP calls** to commit multiple files (create blobs → create tree → create commit → update ref). Coregit does it in **one call**:

```bash
curl -X POST https://api.coregit.dev/v1/repos/my-app/commits \
  -H "x-api-key: $COREGIT_API_KEY" \
  -d '{
    "branch": "main",
    "message": "Add todo app",
    "author": { "name": "AI", "email": "ai@coregit.dev" },
    "changes": [
      { "path": "package.json", "content": "..." },
      { "path": "src/App.tsx", "content": "..." },
      { "path": "src/index.css", "content": "..." }
    ]
  }'
```

This makes Coregit ideal for AI agents that generate entire projects in one shot.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI | Vercel AI SDK v6 + Claude Haiku 4.5 |
| Git Backend | [Coregit API](https://coregit.dev) via `@coregit/sdk` SDK |
| Preview | [WebContainer](https://webcontainers.io) (StackBlitz) |
| UI | shadcn/ui (new-york) + Tailwind v4 |
| Markdown | Streamdown + @streamdown/code |

## Getting Started

```bash
git clone https://github.com/Strayl-Inc/coregit-vibecoding-demo.git
cd coregit-vibecoding-demo
npm install
```

Create `.env.local`:

```bash
COREGIT_API_KEY=cgk_...        # Get one at https://app.coregit.dev
ANTHROPIC_API_KEY=sk-ant-...   # From https://console.anthropic.com
```

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start prompting.

## Features

- **Chat interface** — strayl-style chat with streaming responses and tool call visualization
- **Atomic commits** — AI writes all files in a single Coregit API call
- **Live preview** — WebContainer runs the generated app right in the browser
- **File explorer** — browse and view generated code with syntax highlighting
- **Commit history** — see every version the AI created
- **Git clone** — clone any generated repo with standard `git clone`
- **Dark/light theme** — Coregit brand palette with system detection
- **Resizable panels** — drag the divider between chat and preview

## Architecture

```
Browser
├── Chat Panel (left)
│   ├── useChat() → POST /api/chat
│   ├── Streaming AI responses
│   └── Tool call blocks (commitFiles, readFile, etc.)
│
└── Preview Panel (right)
    ├── WebContainer (live preview iframe)
    ├── File Explorer + Code Viewer
    └── Commit History + Clone Snippet

Server (Next.js API Routes)
├── POST /api/chat     → Vercel AI SDK streamText + tools
├── POST /api/repos    → Coregit: create repo
├── GET  /api/files/*  → Coregit: tree/blob
└── GET  /api/commits  → Coregit: commit history

Tools (called by AI during generation)
├── commitFiles  → POST /v1/repos/:slug/commits (atomic N-file commit)
├── deleteFiles  → POST /v1/repos/:slug/commits (with action: "delete")
├── readFile     → GET  /v1/repos/:slug/blob/:ref/:path
└── listFiles    → GET  /v1/repos/:slug/tree/:ref/:path
```

## For Platform Builders

This demo shows what you can build with Coregit. If you're building a platform like Lovable, Bolt, or Replit, Coregit gives you:

- **Single-call commits** — no multi-step blob/tree/commit dance
- **Full Git protocol** — users can `git clone` and `git push`
- **Snapshots** — named restore points for agent rollback
- **Usage-based pricing** — no per-seat costs
- **Zero ops** — serverless on Cloudflare Workers

Check out [coregit.dev](https://coregit.dev) or [the docs](https://docs.coregit.dev).

## License

MIT

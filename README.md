# dialectic machine

> _"Self-consciousness exists in and for itself when, and by the fact that, it so exists for another; that is, it exists only in being acknowledged."_
> — G.W.F. Hegel, *Phenomenology of Spirit* §178

A terminal-aesthetic knowledge tracking tool for readers, researchers, and thinkers. Capture ideas, claims, questions, and quotes — then discover the connections between them.

## Problem Statement

When reading books, papers, or articles, we collect fragments of insight across multiple sources. These fragments lose their power when they sit isolated in notebooks or scattered across apps. The dialectic machine solves this by:

- **Tracking** every thought with source attribution
- **Classifying** entries by type (claim, question, idea, quote, etc.)
- **Connecting** related entries through shared tags and sources
- **Surfacing** relationships you didn't know existed

This isn't a todo app or a static note-taker. It's a tool for **dialectical thinking** — the process of discovering truth through the collision and synthesis of opposing ideas.

## Features

- **Terminal-aesthetic UI** — monospace, dark theme, keyboard-driven workflow
- **Multiple views** — List, Kanban board, and Timeline
- **Entry types** — 8 dialectical categories (claim, question, idea, quote, reference, opinion, task, reflection)
- **Tag system** — cross-reference entries by topic
- **Related entries** — automatically surface entries sharing tags with the current one
- **Command palette** — quick actions via keyboard (`P`)
- **Keyboard navigation** — vim-style `j/k` navigation, full keyboard shortcuts
- **Search & filter** — by text, type, or tags
- **Export** — entries to JSON or Markdown
- **Google OAuth** — sign in with Google via Supabase
- **Persistent storage** — all data synced to Supabase
- **AI Assist** — Auto-populate entry metadata using Gemini (client-side only)

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Auth** | Supabase Auth (Google OAuth + email/password) |
| **Deployment** | Netlify |

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd dialectic-machine
npm install
```

### 2. Supabase Setup

1. Create a [Supabase](https://supabase.com) project
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Create the `entries` table in your Supabase database:
   ```sql
   create table entries (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users not null,
     content text not null,
     source text,
     url text,
     type text default 'idea',
     tags text[] default '{}',
     commentary text,
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   alter table entries enable row level security;

   create policy "Users can CRUD own entries" on entries
     for all using (auth.uid() = user_id);
   ```
4. Enable **Google OAuth** in Supabase Dashboard → Authentication → Providers → Google

### 3. Configure AI Assist (Optional)

The AI Assist feature uses Google's Gemini API to auto-populate entry metadata from quotes:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open the app and press `p` for command palette
3. Select "AI settings (Gemini API)"
4. Paste your key and accept the privacy notice

**Privacy Note:** Your API key is stored only in your browser's localStorage. It never touches our servers — requests go directly to Google's API from your browser.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:5173`

### 4. Deploy to Netlify

1. Push to GitHub
2. Connect repo on [Netlify](https://netlify.com)
3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `j` / `k` | Navigate up/down |
| `Enter` | Open entry |
| `n` | New entry |
| `e` | Edit entry |
| `d` | Delete entry |
| `f` | Toggle filter |
| `v` | Cycle view (List → Kanban → Timeline) |
| `t` | Toggle tag sidebar |
| `/` | Focus search |
| `p` | Command palette |
| `q` | Sign out |
| (in palette) | `AI settings` — Configure Gemini API key |

## AI Assist Feature

When creating a new entry, click the `[ AI: analyze quote ]` button to:
1. Auto-detect entry type (claim, question, quote, etc.)
2. Extract source information (Author — Title)
3. Suggest relevant tags
4. Generate analytical commentary

The AI analyzes your pasted content and fills in the metadata fields. You can review and edit before saving.

**How it works:**
- Paste a quote or thought in the content field
- Click `[ AI: analyze quote ]` button
- The AI populates type, source, tags, and commentary
- Review and hit Ctrl+S to save

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # Auth & Entries state management
├── hooks/          # Custom React hooks
├── pages/          # Route-level components
├── services/       # Supabase client & CRUD
└── lib/            # Constants & utilities
```

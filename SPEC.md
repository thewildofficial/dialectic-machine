# Discourse Tracker — Product Spec v2

## The Vibe

A terminal UI for tracking discourse. Not a web app that looks like a terminal — a knowledge base that feels like you're operating a system. Tmux panes. JetBrains Mono. Braille art. Keyboard-first.

---

## Landing Page

Black screen. Braille yin-yang (large, ~80x40 chars). Below it:
```
discourse v0.1.0
track what you read. find what connects.

> press enter to continue _
```
Blinking cursor. That's it. No nav, no buttons, no chrome.

---

## App UI — Tmux Layout

```
┌─[discourse]────────────────────────[entries:47 tags:12 view:list]──────────────┐
│                                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────────────┐  │
│  │ > entries            │  │                                                  │  │
│  │                      │  │  # The Adolescence of Technology                 │  │
│  │  ▸ claim    03:42    │  │                                                  │  │
│  │    "AI could give    │  │  Type: claim                                     │  │
│  │    individuals the   │  │  Source: Dario Amodei, Jan 2026                  │  │
│  │    ability to..."    │  │  Tags: AI-risk, power, civilizational-analysis   │  │
│  │                      │  │                                                  │  │
│  │  ▸ question  03:38   │  │  ⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀  │  │
│  │    "How did you      │  │  ⣿⣿⣿⣀⣀⣀⣿⣿⣿⣀⣀⣀⣿⣿⣿⣀⣀⣀⣀  │  │
│  │    survive this..."  │  │  ⣀⣀⣀⣿⣿⣿⣀⣀⣀⣿⣿⣿⣀⣀⣀⣿⣿⣿⣀  │  │
│  │                      │  │  ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿  │  │
│  │  ▸ idea     03:35    │  │                                                  │  │
│  │    "Mechanistic      │  │  Commentary:                                     │  │
│  │    interpretability  │  │  Direct link to FEP — the model can't model      │  │
│  │    as diagnosis..."  │  │  itself, same as consciousness problem.          │  │
│  │                      │  │                                                  │  │
│  │  ▸ quote    03:30    │  │  Related: [3 entries share tags]                 │  │
│  │    "A country of     │  │  - mechanistic interpretability (idea)           │  │
│  │    geniuses in a     │  │  - constitutional AI (reference)                 │  │
│  │    datacenter..."    │  │  - reward hacking (claim)                        │  │
│  │                      │  │                                                  │  │
│  └─────────────────────┘  └──────────────────────────────────────────────────┘  │
│                                                                                 │
│─[j/k:navigate enter:open n:new e:edit d:delete f:filter v:view t:tags q:quit]──│
```

### Layout
- **Top bar**: tmux-style status — app name + stats + current view
- **Left pane**: scrollable entry list with type indicator, timestamp, content preview
- **Right pane**: selected entry detail — full content, type, source, tags, braille art, commentary, related entries
- **Bottom bar**: keybinding hints (always visible)

### Panes
- Resizable via mouse drag on the border (like tmux)
- Left pane defaults to ~35% width
- Single-pane mode on mobile (list → detail is a full-page transition)

---

## Typography

**JetBrains Mono everywhere.** No exceptions.
- Regular weight for body
- Bold for headers/status bar
- Dim color for secondary text
- Font size: 14px desktop, 12px mobile

---

## Color Palette (Terminal)

```
bg:          #0a0a0a  (near black)
fg:          #c9c9c9  (light gray)
dim:         #5c5c5c  (muted)
accent:      #d4a574  (amber, warm)
type_claim:  #d4a574  (amber)
type_question: #6ba3f7 (blue)
type_idea:   #7ec87e  (green)
type_quote:  #c792ea  (purple)
type_reference: #888888 (gray)
type_opinion: #f78c6c (orange)
type_task:   #ff5370  (red)
tag:         #89ddff  (cyan)
source:      #c792ea  (purple)
border:      #2a2a2a  (dark gray)
selection:   #1a1a2e  (subtle blue bg)
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Move up/down in list |
| `Enter` | Open entry detail |
| `Escape` | Close detail / cancel |
| `n` | New entry (opens form overlay) |
| `e` | Edit selected entry |
| `d` | Delete selected entry (confirm prompt) |
| `f` | Toggle filter bar |
| `v` | Cycle views: list → kanban → timeline |
| `t` | Toggle tag sidebar |
| `/` | Focus search |
| `Ctrl+P` | Command palette |
| `q` | Quit to landing page (or logout) |

---

## Entry Form (Overlay)

When pressing `n`, a centered modal appears (still monospace, terminal style):

```
┌─[new entry]─────────────────────────────────────────────┐
│                                                          │
│  type: [claim    ▾]                                      │
│                                                          │
│  content:                                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ AI could give individuals the ability to create    │  │
│  │ weapons of mass destruction, breaking the          │  │
│  │ historical correlation between destructive         │  │
│  │ ability and disciplined training.                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  source: Dario Amodei — The Adolescence of Technology    │
│  url:    https://darioamodei.com/essay/...               │
│  tags:   AI-risk, bioweapons, misuse                     │
│  commentary:                                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ This maps directly to Taleb's fragile/antifragile  │  │
│  │ framework — distributed risk vs concentrated       │  │
│  │ capability.                                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│           [ Ctrl+S save ]  [ Escape cancel ]             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- All fields are controlled components
- Type is a select dropdown (styled terminal-native)
- Tags are comma-separated, displayed as pills on blur
- `Ctrl+S` to save, `Escape` to cancel
- Auto-classification updates the type dropdown on blur if user hasn't manually selected

---

## Three Views

### List View (default)
Chronological feed. Each entry shows: type indicator (`▸`), timestamp, content preview (2 lines). Selected entry highlighted with `selection` bg.

### Kanban View
Full-width columns grouped by type:
```
┌─claims──────┐ ┌─questions───┐ ┌─ideas───────┐ ┌─quotes──────┐
│ ▸ entry 1   │ │ ▸ entry 4   │ │ ▸ entry 6   │ │ ▸ entry 8   │
│ ▸ entry 2   │ │ ▸ entry 5   │ │ ▸ entry 7   │ │             │
│ ▸ entry 3   │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```
- Scroll horizontally if more types exist
- Each card shows content preview + tags
- `j/k` moves within column, `h/l` moves between columns

### Timeline View
Vertical timeline grouped by month:
```
─── January 2026 ─────────────────────────────────
  ▸ [claim]  "AI could give individuals..."
  ▸ [idea]   "Mechanistic interpretability..."
  ▸ [quote]  "A country of geniuses..."

─── December 2025 ────────────────────────────────
  ▸ [question] "How did you survive..."
  ▸ [claim]    "Scaling laws suggest..."
```

---

## Braille Art Generation

Client-side, pure Unicode. No external API.

### Algorithm
1. Hash the entry content (simple string hash)
2. Use hash as seed for pseudo-random braille pattern
3. Generate a 40x20 braille grid (80x80 pixel equivalent)
4. Pattern influenced by entry type (claims get angular patterns, questions get circular, ideas get fractal-ish)
5. Display in entry detail view as the entry's "visual fingerprint"

### Braille Characters
Unicode range U+2800 to U+28FF. Each character encodes a 2x4 dot grid. Combined with density variation, creates detailed images.

---

## Auto-Classification (Heuristic)

No external API. Fast, private.

```
if content ends with '?'              → question
if content starts with quote marks    → quote
if url field has value + short text   → reference
if matches "I think/believe/feel"     → opinion
if matches "should/must/need to"      → claim
if matches "todo/fix/implement"       → task
default                               → idea
```

User can always override via the type dropdown.

---

## Search & Filter

- `/` focuses the search input in the filter bar
- Real-time filtering as you type (useMemo)
- Filter by type: `[all] [claims] [questions] [ideas] [quotes] [references] [opinions] [tasks]`
- Filter by tag: tag cloud in toggleable sidebar
- Filters compose: search + type + tag all active simultaneously

---

## Command Palette (Ctrl+P)

Terminal-style command palette, centered overlay:
```
┌─[command]──────────────────┐
│ > _                        │
│                            │
│   new entry                │
│   switch to list view      │
│   switch to kanban view    │
│   switch to timeline view  │
│   export entries (.json)   │
│   export entries (.md)     │
│   toggle dark/light        │
│   logout                   │
└────────────────────────────┘
```

Fuzzy match as you type. `Enter` to execute.

---

## Tech Stack

- **React** (Vite)
- **React Router** — routes: `/` (landing), `/app` (main), `/login`
- **Context API** — AuthContext + EntriesContext
- **Supabase** — auth + PostgreSQL entries table
- **Tailwind CSS** — utility classes for the terminal look
- **JetBrains Mono** — via Google Fonts or self-hosted woff2
- **Custom hooks** — useAuth, useEntries, useFilteredEntries, useBraille
- **Deploy:** Vercel

---

## Supabase Schema

### entries table
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid references auth.users
content     text not null
source      text
url         text
type        text not null default 'idea'  -- claim|question|idea|quote|reference|opinion|reflection|task
tags        text[] default '{}'
commentary  text
created_at  timestamptz default now()
updated_at  timestamptz default now()
```

### RLS policies
- Users can only read/write their own entries

---

## Folder Structure

```
/src
  /components
    BrailleArt.jsx
    EntryCard.jsx
    EntryForm.jsx
    EntryDetail.jsx
    FilterBar.jsx
    KanbanBoard.jsx
    TimelineView.jsx
    TmuxStatusBar.jsx
    BottomBar.jsx
    CommandPalette.jsx
    LandingPage.jsx
    TerminalPane.jsx       — resizable split pane wrapper
    ProtectedRoute.jsx
    TypeIndicator.jsx
    TagPill.jsx
    ConfirmDialog.jsx
  /pages
    App.jsx                — main tmux-layout page
    Login.jsx
    Landing.jsx
  /hooks
    useAuth.js
    useEntries.js
    useFilteredEntries.js
    useBraille.js
    useKeyboardNav.js      — j/k/enter/escape handler
    useCommandPalette.js
  /context
    AuthContext.jsx
    EntriesContext.jsx
  /services
    supabase.js
    classifier.js
    braille.js
  /lib
    utils.js
    constants.js           — colors, types, keybindings
  main.jsx
  index.css                — tailwind + JetBrains Mono import
```

---

## Grading Rubric Coverage

| Requirement | Implementation |
|---|---|
| Auth + protected routes | Supabase auth, ProtectedRoute, login page |
| CRUD with persistent storage | Supabase entries table, full CRUD |
| React Router | `/`, `/app`, `/login` routes |
| Context API | AuthContext + EntriesContext |
| useState | Form state, filter state, view state, palette state |
| useEffect | Fetch entries on mount, auth listener, keyboard listeners |
| Lifting state up | Entries in context, filters as props |
| Controlled components | EntryForm — all inputs controlled |
| useMemo | Filtered/sorted entries, search results |
| useCallback | Keyboard handlers, filter callbacks |
| useRef | Search input focus, pane resize |
| Folder structure | /components, /pages, /hooks, /context, /services |
| Responsive | Tailwind, mobile single-pane, desktop split-pane |
| Real problem | Legitimate research/knowledge management tool |
| Non-trivial | 3 views, auto-classification, braille art, keyboard nav, command palette |

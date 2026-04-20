// Entry types and their display metadata
export const ENTRY_TYPES = {
  claim: { label: 'claim', color: 'text-type-claim', indicator: '▸' },
  question: { label: 'question', color: 'text-type-question', indicator: '▸' },
  idea: { label: 'idea', color: 'text-type-idea', indicator: '▸' },
  quote: { label: 'quote', color: 'text-type-quote', indicator: '▸' },
  reference: { label: 'reference', color: 'text-type-reference', indicator: '▸' },
  opinion: { label: 'opinion', color: 'text-type-opinion', indicator: '▸' },
  task: { label: 'task', color: 'text-type-task', indicator: '▸' },
  reflection: { label: 'reflection', color: 'text-type-reflection', indicator: '▸' },
}

// All type keys as array
export const TYPE_KEYS = Object.keys(ENTRY_TYPES)

// Views available in the app
export const VIEWS = {
  LIST: 'list',
  KANBAN: 'kanban',
  TIMELINE: 'timeline',
  GRAPH: 'graph',
}

export const VIEW_KEYS = Object.values(VIEWS)

// Keyboard shortcuts mapping
export const KEYBINDINGS = {
  NAVIGATE_UP: 'k',
  NAVIGATE_DOWN: 'j',
  OPEN: 'Enter',
  CLOSE: 'Escape',
  NEW: 'n',
  EDIT: 'e',
  DELETE: 'd',
  FILTER: 'f',
  CYCLE_VIEW: 'v',
  TAGS: 't',
  SEARCH: '/',
  COMMAND_PALETTE: 'p',
  QUIT: 'q',
}

// Supabase configuration — loaded from environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://flicspjrrunfujloyipk.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Braille art dimensions
export const BRAILLE_COLS = 40
export const BRAILLE_ROWS = 20

// App version
export const APP_VERSION = '0.1.0'

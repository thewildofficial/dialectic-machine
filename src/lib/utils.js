/**
 * Simple string hash function for generating deterministic seeds
 * Used for braille art generation and entry fingerprinting
 */
export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Format a timestamp into a relative time string
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Format timestamp as HH:MM for display
 */
export function formatTimeShort(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Parse comma-separated tags string into array
 */
export function parseTags(tagString) {
  if (!tagString) return []
  return tagString
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(t => t.toLowerCase())
}

/**
 * Format tags array for display in form
 */
export function formatTags(tags) {
  if (!tags || !Array.isArray(tags)) return ''
  return tags.join(', ')
}

/**
 * Generate a unique ID (client-side fallback)
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * Group entries by month for timeline view
 */
export function groupByMonth(entries) {
  const groups = {}
  const sorted = [...entries].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )

  for (const entry of sorted) {
    const date = new Date(entry.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (!groups[key]) {
      groups[key] = { label, entries: [] }
    }
    groups[key].entries.push(entry)
  }

  return Object.values(groups)
}

/**
 * Escape special characters for safe string handling
 */
export function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

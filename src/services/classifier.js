/**
 * Auto-classification heuristic for entry types.
 * No external API — pure client-side pattern matching.
 *
 * Rules (in priority order):
 * 1. Content ends with '?' → question
 * 2. Content starts with quote marks → quote
 * 3. URL field has value + short text → reference
 * 4. Matches "I think/believe/feel" → opinion
 * 5. Matches "should/must/need to" → claim
 * 6. Matches "todo/fix/implement" → task
 * 7. Default → idea
 */

export function classifyEntry(content, url) {
  if (!content || content.trim().length === 0) {
    return 'idea'
  }

  const trimmed = content.trim()
  const lower = trimmed.toLowerCase()

  // Rule 1: Ends with question mark
  if (trimmed.endsWith('?')) {
    return 'question'
  }

  // Rule 2: Starts with quote marks
  if (trimmed.startsWith('"') || trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed.startsWith('\u2018')) {
    return 'quote'
  }

  // Rule 3: Has URL and short text (reference)
  if (url && url.trim().length > 0 && trimmed.length < 200) {
    return 'reference'
  }

  // Rule 4: Opinion indicators
  const opinionPatterns = [
    /^i\s+think\b/,
    /^i\s+believe\b/,
    /^i\s+feel\b/,
    /^in my opinion\b/,
    /^i\s+would\s+argue\b/,
    /^it\s+seems\s+(to\s+me\s+)?that\b/,
  ]

  for (const pattern of opinionPatterns) {
    if (pattern.test(lower)) {
      return 'opinion'
    }
  }

  // Rule 5: Claim indicators (should/must/need to)
  const claimPatterns = [
    /\bshould\b/,
    /\bmust\b/,
    /\bneed\s+to\b/,
    /\bought\s+to\b/,
    /\bhas\s+to\b/,
    /\bis\s+(clearly|obviously|definitely)\b/,
  ]

  for (const pattern of claimPatterns) {
    if (pattern.test(lower)) {
      return 'claim'
    }
  }

  // Rule 6: Task indicators
  const taskPatterns = [
    /^todo\b/,
    /^fix\b/,
    /^implement\b/,
    /^add\b/,
    /^update\b/,
    /^remove\b/,
    /^create\b/,
    /^build\b/,
    /^research\b/,
    /^read\b/,
    /^write\b/,
    /^review\b/,
  ]

  for (const pattern of taskPatterns) {
    if (pattern.test(lower)) {
      return 'task'
    }
  }

  // Default: idea
  return 'idea'
}

/**
 * Get confidence score for classification (0-1)
 * Higher confidence means the heuristic is more certain
 */
export function getClassificationConfidence(content, url) {
  const type = classifyEntry(content, url)

  // Questions and quotes have high confidence
  if (type === 'question' || type === 'quote') {
    return 0.95
  }

  // References with URLs are fairly confident
  if (type === 'reference') {
    return 0.85
  }

  // Pattern matches are moderate confidence
  if (type === 'opinion' || type === 'claim' || type === 'task') {
    return 0.7
  }

  // Default idea is low confidence
  return 0.3
}

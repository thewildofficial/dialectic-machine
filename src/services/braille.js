import { hashString } from '../lib/utils'
import { BRAILLE_COLS, BRAILLE_ROWS } from '../lib/constants'

/**
 * Braille dot patterns for each Unicode character
 * Braille characters are in range U+2800 to U+28FF
 * Each character encodes a 2x4 grid of dots
 */
const BRAILLE_BASE = 0x2800

/**
 * Dot positions in a braille character (2 columns x 4 rows):
 * 1 4
 * 2 5
 * 3 6
 * 7 8
 */
const DOT_VALUES = [1, 2, 4, 64, 128, 256, 32, 64]

/**
 * Generate a pseudo-random number from a seed
 */
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

/**
 * Generate braille pattern influenced by entry type
 * Different types produce visually distinct patterns
 */
function generatePattern(type, rng) {
  const patterns = {
    claim: () => {
      // Angular patterns — more dots in corners
      return Math.floor(rng() * 8) < 4 ? 0xFF : Math.floor(rng() * 256)
    },
    question: () => {
      // Circular patterns — dots clustered in center
      const center = rng() > 0.5 ? 0x3C : 0x00 // 00111100
      return rng() > 0.4 ? center : Math.floor(rng() * 256)
    },
    idea: () => {
      // Fractal-like — repeating patterns at different scales
      const base = Math.floor(rng() * 16)
      return base | (base << 4)
    },
    quote: () => {
      // Flowing patterns — wave-like
      const wave = Math.floor(rng() * 8)
      return (0xAA >> wave) | ((0xAA << (8 - wave)) & 0xFF)
    },
    reference: () => {
      // Grid-like — structured
      return rng() > 0.5 ? 0x55 : 0xAA
    },
    opinion: () => {
      // Scattered — random dots
      return Math.floor(rng() * 256)
    },
    task: () => {
      // Checkmark-like — bottom-heavy
      return Math.floor(rng() * 128) | 0xC0
    },
    reflection: () => {
      // Mirror patterns — symmetric
      const half = Math.floor(rng() * 16)
      return half | (half << 4)
    },
  }

  const generator = patterns[type] || patterns.idea
  return generator()
}

/**
 * Generate braille art string for an entry
 * Returns a multi-line string of braille characters
 */
export function generateBrailleArt(content, type = 'idea') {
  if (!content) {
    return ''
  }

  const seed = hashString(content + type)
  const rng = seededRandom(seed)

  const lines = []

  for (let row = 0; row < BRAILLE_ROWS; row++) {
    let line = ''
    for (let col = 0; col < BRAILLE_COLS; col++) {
      const pattern = generatePattern(type, rng)
      const codePoint = BRAILLE_BASE + pattern
      line += String.fromCharCode(codePoint)
    }
    lines.push(line)
  }

  return lines.join('\n')
}

/**
 * Generate a compact braille fingerprint (single line)
 */
export function generateBrailleFingerprint(content, type = 'idea') {
  if (!content) return ''

  const seed = hashString(content + type)
  const rng = seededRandom(seed)

  let fingerprint = ''
  for (let i = 0; i < 20; i++) {
    const pattern = generatePattern(type, rng)
    const codePoint = BRAILLE_BASE + pattern
    fingerprint += String.fromCharCode(codePoint)
  }

  return fingerprint
}

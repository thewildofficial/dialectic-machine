/**
 * Programmatically generates a Yin-Yang (☯) symbol as braille Unicode art.
 *
 * Each braille character (U+2800–U+28FF) encodes a 2×4 pixel block.
 * We compute a high-res pixel grid based on the yin-yang geometry,
 * then compress it into braille characters.
 *
 * Geometry:
 *   - Outer circle of radius R
 *   - Two inner circles of radius R/2 (the "eyes")
 *   - S-curve dividing light/dark halves
 *   - Two dots (eyes) of radius R/6
 */

// Braille dot mapping: each bit corresponds to one pixel in a 2×4 block
// Bit layout (row-major, 2 cols × 4 rows):
//   bit 0: (0,0)  bit 1: (1,0)
//   bit 2: (0,1)  bit 3: (1,1)
//   bit 4: (0,2)  bit 5: (1,2)
//   bit 6: (0,3)  bit 7: (1,3)
const BRAILLE_BASE = 0x2800

function pixelToBraille(pixels) {
  // pixels is a 4×2 array (4 rows, 2 cols) of 0/1
  let code = 0
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 2; c++) {
      if (pixels[r][c]) {
        code |= (1 << (r * 2 + c))
      }
    }
  }
  return String.fromCodePoint(BRAILLE_BASE + code)
}

/**
 * Generate yin-yang braille art.
 * @param {number} cols - Number of braille characters wide
 * @param {number} rows - Number of braille characters tall
 * @param {object} opts - Options
 * @returns {string} Braille art string
 */
export function generateYinYangBraille(cols = 40, rows = 20) {
  // Each braille char = 2×4 pixels
  const pixelCols = cols * 2
  const pixelRows = rows * 4

  // Center of the grid
  const cx = pixelCols / 2
  const cy = pixelRows / 2

  // Outer radius (slightly smaller than half the shorter dimension to fit)
  const R = Math.min(pixelCols, pixelRows) * 0.45

  // Inner circle radius (half of outer)
  const rInner = R / 2

  // Dot radius
  const rDot = R / 6

  // Build pixel grid: 1 = dark (filled), 0 = light (empty)
  const grid = []
  for (let py = 0; py < pixelRows; py++) {
    grid[py] = []
    for (let px = 0; px < pixelCols; px++) {
      const dx = px - cx
      const dy = py - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Outside the outer circle → empty
      if (dist > R) {
        grid[py][px] = 0
        continue
      }

      // Determine which half of the yin-yang this pixel belongs to
      // The S-curve: upper half is dark, lower half is light,
      // but each half contains a circle of the opposite color
      const isUpper = dy < 0

      // Check if inside the upper inner circle (dark circle in upper half)
      const distUpper = Math.sqrt(dx * dx + (dy + rInner) * (dy + rInner))
      const inUpperCircle = distUpper < rInner

      // Check if inside the lower inner circle (light circle in lower half)
      const distLower = Math.sqrt(dx * dx + (dy - rInner) * (dy - rInner))
      const inLowerCircle = distLower < rInner

      // Check if inside the dark dot (in the lower circle)
      const distDotDark = Math.sqrt(dx * dx + (dy - rInner) * (dy - rInner))
      const inDarkDot = distDotDark < rDot

      // Check if inside the light dot (in the upper circle)
      const distDotLight = Math.sqrt(dx * dx + (dy + rInner) * (dy + rInner))
      const inLightDot = distDotLight < rDot

      // Yin-yang logic:
      // Upper half: dark, except the upper inner circle is light
      //   → but the light dot inside the upper circle is dark
      // Lower half: light, except the lower inner circle is dark
      //   → but the dark dot inside the lower circle is light

      if (isUpper) {
        // Upper half: dark by default
        if (inUpperCircle) {
          // Inside the light inner circle
          grid[py][px] = inLightDot ? 1 : 0
        } else {
          grid[py][px] = 1
        }
      } else {
        // Lower half: light by default
        if (inLowerCircle) {
          // Inside the dark inner circle
          grid[py][px] = inDarkDot ? 0 : 1
        } else {
          grid[py][px] = 0
        }
      }
    }
  }

  // Compress pixel grid into braille characters
  const lines = []
  for (let by = 0; by < rows; by++) {
    let line = ''
    for (let bx = 0; bx < cols; bx++) {
      const pixels = []
      for (let r = 0; r < 4; r++) {
        pixels[r] = []
        for (let c = 0; c < 2; c++) {
          const py = by * 4 + r
          const px = bx * 2 + c
          pixels[r][c] = (py < pixelRows && px < pixelCols) ? grid[py][px] : 0
        }
      }
      line += pixelToBraille(pixels)
    }
    lines.push(line)
  }

  return lines.join('\n')
}

/**
 * React hook that generates yin-yang braille art.
 * @param {number} cols - Width in braille characters
 * @param {number} rows - Height in braille characters
 * @returns {string} Braille art string
 */
export function useYinYangBraille(cols = 40, rows = 20) {
  // Memoized since the output is deterministic
  return generateYinYangBraille(cols, rows)
}

export default useYinYangBraille

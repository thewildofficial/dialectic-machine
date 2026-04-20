import React from 'react'
import { useBraille } from '../hooks/useBraille'

/**
 * Renders braille art for an entry
 * Can display full art or compact fingerprint
 */
function BrailleArt({ content, type = 'idea', compact = false }) {
  const { art, fingerprint } = useBraille(content, type)

  if (compact) {
    return (
      <pre className="text-dim text-xs leading-none overflow-hidden">
        {fingerprint}
      </pre>
    )
  }

  return (
    <pre className="text-dim text-xs leading-none overflow-hidden">
      {art}
    </pre>
  )
}

export default BrailleArt

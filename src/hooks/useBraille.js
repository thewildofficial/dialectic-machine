import { useMemo } from 'react'
import { generateBrailleArt, generateBrailleFingerprint } from '../services/braille'

/**
 * Hook for generating braille art from entry content
 * Memoizes the output to avoid regenerating on every render
 */
export function useBraille(content, type = 'idea') {
  const art = useMemo(() => {
    return generateBrailleArt(content, type)
  }, [content, type])

  const fingerprint = useMemo(() => {
    return generateBrailleFingerprint(content, type)
  }, [content, type])

  return { art, fingerprint }
}

export default useBraille

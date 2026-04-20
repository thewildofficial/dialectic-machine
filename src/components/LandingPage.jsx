import React, { useCallback } from 'react'
import { APP_VERSION } from '../lib/constants'
import YIN_YANG from '../assets/YINYANG.txt?raw'

/**
 * Landing page — yin-yang braille + Hegel mutual recognition quote
 */
function LandingPage({ onEnter }) {

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      onEnter()
    }
  }, [onEnter])

  return (
    <div
      className="h-screen w-screen bg-bg flex items-center justify-center px-4 py-8 font-mono cursor-text"
      onClick={() => onEnter()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-dim text-[10px] leading-none select-none sm:text-xs">
          <pre className="text-center">{YIN_YANG}</pre>
        </div>

        <div className="h-16 sm:h-20 md:h-24" />

        <div className="max-w-xl space-y-3 px-2 sm:px-4">
          <p className="text-fg text-sm italic leading-relaxed">
            "Self-consciousness exists in and for itself when, and by the fact
            that, it so exists for another; that is, it exists only in being
            acknowledged."
          </p>
          <p className="text-dim text-xs">
            — G.W.F. Hegel, <span className="text-accent">Phenomenology of Spirit</span> §178
          </p>
        </div>

        <div className="h-12 sm:h-16 md:h-20" />

        <div className="space-y-2">
          <h1 className="text-fg text-lg font-semibold">
            dialectic machine v{APP_VERSION}
          </h1>
          <p className="text-dim text-sm">
            track what you read. find what connects.
          </p>
        </div>

        <div className="h-10 sm:h-12 md:h-14" />

        <div className="flex items-center gap-2 text-fg">
          <span className="text-accent">&gt;</span>
          <span>press enter to continue</span>
          <span className="cursor-blink text-accent">_</span>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

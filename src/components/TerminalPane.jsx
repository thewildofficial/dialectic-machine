import React, { useState, useCallback, useRef } from 'react'

/**
 * Resizable split pane wrapper
 * Mouse drag on border to resize (like tmux)
 */
function TerminalPane({
  left,
  right,
  defaultSplit = 35,
  minLeft = 20,
  maxLeft = 60,
}) {
  const [splitPercent, setSplitPercent] = useState(defaultSplit)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = (x / rect.width) * 100

    setSplitPercent(Math.max(minLeft, Math.min(maxLeft, percent)))
  }, [isDragging, minLeft, maxLeft])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className="flex flex-1 overflow-hidden relative"
    >
      {/* Left pane */}
      <div
        className="overflow-hidden"
        style={{ width: `${splitPercent}%` }}
      >
        {left}
      </div>

      {/* Resize handle */}
      <div
        className={`
          w-1 cursor-col-resize hover:bg-accent/50 transition-colors relative z-10
          ${isDragging ? 'bg-accent' : 'bg-border'}
        `}
        onMouseDown={handleMouseDown}
      />

      {/* Right pane */}
      <div
        className="flex-1 overflow-hidden"
        style={{ width: `${100 - splitPercent}%` }}
      >
        {right}
      </div>
    </div>
  )
}

export default TerminalPane

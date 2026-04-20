import React from 'react'

/**
 * Bottom bar showing available keyboard shortcuts
 * Always visible in the app
 */
function BottomBar() {
  const shortcuts = [
    { key: 'j/k', action: 'navigate' },
    { key: 'enter', action: 'open' },
    { key: 'n', action: 'new' },
    { key: 'e', action: 'edit' },
    { key: 'd', action: 'delete' },
    { key: 'f', action: 'filter' },
    { key: 'v', action: 'view' },
    { key: 't', action: 'tags' },
    { key: 'q', action: 'quit' },
  ]

  return (
    <div className="border-t border-border px-4 py-1 flex items-center justify-center gap-4 font-mono text-xs text-dim select-none">
      {shortcuts.map((s) => (
        <span key={s.key} className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-border/50 rounded text-fg text-[10px]">
            {s.key}
          </kbd>
          <span>{s.action}</span>
        </span>
      ))}
    </div>
  )
}

export default BottomBar

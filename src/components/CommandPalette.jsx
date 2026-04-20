import React, { useRef, useEffect } from 'react'

/**
 * Command palette overlay
 * Terminal-style fuzzy search for commands
 * Opens with Ctrl+P
 */
function CommandPalette({
  isOpen,
  query,
  onQueryChange,
  selectedIndex,
  commands,
  onSelect,
  onClose,
}) {
  const inputRef = useRef(null)

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 pt-[20vh] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-bg border border-border rounded w-full max-w-lg font-mono fade-in overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-4 py-2 flex items-center">
          <span className="text-accent text-sm">[command]</span>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-accent text-sm">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="type a command..."
              className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-dim/50"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Command list */}
        <div className="max-h-64 overflow-y-auto py-2">
          {commands.length === 0 ? (
            <div className="px-4 py-3 text-dim text-sm">
              no matching commands
            </div>
          ) : (
            commands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => onSelect(index)}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                  ${index === selectedIndex
                    ? 'bg-selection text-fg'
                    : 'text-dim hover:text-fg hover:bg-bg/50'
                  }
                `}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="text-dim text-xs px-1.5 py-0.5 bg-border/50 rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette

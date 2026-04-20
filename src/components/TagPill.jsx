import React from 'react'

/**
 * Renders a tag as a styled pill
 */
function TagPill({ tag, active = false, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono
        transition-colors cursor-pointer border
        ${active
          ? 'bg-tag/20 text-tag border-tag/40'
          : 'bg-border/50 text-dim border-border hover:text-tag hover:border-tag/30'
        }
      `}
      title={count !== undefined ? `${count} entries` : undefined}
    >
      <span>#{tag}</span>
      {count !== undefined && (
        <span className="text-dim text-[10px]">{count}</span>
      )}
    </button>
  )
}

export default TagPill

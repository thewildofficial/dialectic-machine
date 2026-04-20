import React from 'react'

/**
 * Renders a tag as a styled pill
 */
function TagPill({ tag, active = false, onClick, count }) {
  const pillClassName = `
    inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border
    transition-colors
    ${onClick ? 'cursor-pointer' : 'cursor-default'}
    ${active
      ? 'bg-tag/20 text-tag border-tag/40'
      : 'bg-border/50 text-dim border-border hover:text-tag hover:border-tag/30'
    }
  `

  if (!onClick) {
    return (
      <span
        className={pillClassName}
        title={count !== undefined ? `${count} entries` : undefined}
      >
        <span>#{tag}</span>
        {count !== undefined && (
          <span className="text-dim text-[10px]">{count}</span>
        )}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={pillClassName}
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

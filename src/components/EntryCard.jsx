import React from 'react'
import TypeIndicator from './TypeIndicator'
import { formatTime, truncate } from '../lib/utils'

/**
 * Displays a single entry in the list view
 * Shows type indicator, timestamp, and content preview
 */
function EntryCard({ entry, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 border-b border-border transition-colors font-mono
        ${isSelected
          ? 'bg-selection border-l-2 border-l-accent'
          : 'hover:bg-bg/80 border-l-2 border-l-transparent'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <TypeIndicator type={entry.type} />
        <span className={`text-xs ${isSelected ? 'text-fg' : 'text-dim'}`}>
          {entry.type}
        </span>
        <span className="text-dim text-xs ml-auto">
          {formatTime(entry.created_at)}
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${isSelected ? 'text-fg' : 'text-dim'}`}>
        {truncate(entry.content, 120)}
      </p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {entry.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-tag text-[10px]">
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-dim text-[10px]">+{entry.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  )
}

export default EntryCard

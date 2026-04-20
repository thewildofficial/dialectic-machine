import React, { useState, useCallback } from 'react'
import TypeIndicator from './TypeIndicator'
import TagPill from './TagPill'
import { ENTRY_TYPES, TYPE_KEYS } from '../lib/constants'
import { truncate } from '../lib/utils'

/**
 * Kanban board view — entries grouped by type in columns
 * Navigate with j/k within column, h/l between columns
 */
function KanbanBoard({ entries, onSelect, selectedEntry, onOpen }) {
  const [activeColumn, setActiveColumn] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  // Group entries by type
  const columns = TYPE_KEYS.map(type => ({
    type,
    entries: entries.filter(e => e.type === type),
  })).filter(col => col.entries.length > 0)

  const handleCardClick = useCallback((entry) => {
    onSelect(entry)
  }, [onSelect])

  const handleCardDoubleClick = useCallback((entry) => {
    onSelect(entry)
    onOpen(entry)
  }, [onSelect, onOpen])

  // Keyboard navigation within kanban
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'j':
        e.preventDefault()
        setActiveIndex(prev => {
          const col = columns[activeColumn]
          if (!col) return prev
          return Math.min(prev + 1, col.entries.length - 1)
        })
        break
      case 'k':
        e.preventDefault()
        setActiveIndex(prev => Math.max(0, prev - 1))
        break
      case 'h':
        e.preventDefault()
        setActiveColumn(prev => Math.max(0, prev - 1))
        setActiveIndex(0)
        break
      case 'l':
        e.preventDefault()
        setActiveColumn(prev => Math.min(columns.length - 1, prev + 1))
        setActiveIndex(0)
        break
      case 'Enter':
        e.preventDefault()
        const col = columns[activeColumn]
        if (col && col.entries[activeIndex]) {
          handleCardDoubleClick(col.entries[activeIndex])
        }
        break
      default:
        break
    }
  }, [activeColumn, activeIndex, columns, handleCardDoubleClick])

  return (
    <div
      className="h-full overflow-x-auto overflow-y-hidden p-4 font-mono"
      onKeyDown={handleKeyDown}
    >
      <div className="flex gap-4 h-full min-w-max">
        {columns.map((column, colIdx) => (
          <div
            key={column.type}
            className={`
              w-72 flex flex-col border rounded transition-colors
              ${colIdx === activeColumn
                ? 'border-accent/50'
                : 'border-border'
              }
            `}
          >
            {/* Column header */}
            <div className={`
              px-3 py-2 border-b border-border flex items-center gap-2
              ${colIdx === activeColumn ? 'bg-accent/5' : ''}
            `}>
              <TypeIndicator type={column.type} />
              <span className={`text-sm font-semibold ${ENTRY_TYPES[column.type].color}`}>
                {ENTRY_TYPES[column.type].label}
              </span>
              <span className="text-dim text-xs ml-auto">
                {column.entries.length}
              </span>
            </div>

            {/* Column entries */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {column.entries.map((entry, entryIdx) => {
                const isSelected = selectedEntry?.id === entry.id
                const isActive = colIdx === activeColumn && entryIdx === activeIndex

                return (
                  <button
                    key={entry.id}
                    onClick={() => handleCardClick(entry)}
                    onDoubleClick={() => handleCardDoubleClick(entry)}
                    className={`
                      w-full text-left p-3 rounded border transition-colors
                      ${isSelected
                        ? 'bg-selection border-accent/50'
                        : isActive
                          ? 'border-accent/30 bg-accent/5'
                          : 'border-border hover:border-dim/50'
                      }
                    `}
                  >
                    <p className="text-sm text-fg leading-relaxed mb-2">
                      {truncate(entry.content, 100)}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {entry.tags.slice(0, 3).map((tag, i) => (
                          <TagPill key={i} tag={tag} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard

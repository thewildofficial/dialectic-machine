import React from 'react'
import TypeIndicator from './TypeIndicator'
import { groupByMonth, truncate } from '../lib/utils'

/**
 * Timeline view — entries grouped by month
 * Chronological display with month headers
 */
function TimelineView({ entries, onSelect, selectedEntry, onOpen }) {
  const groups = groupByMonth(entries)

  return (
    <div className="h-full overflow-y-auto p-6 font-mono">
      {groups.length === 0 ? (
        <div className="text-dim text-center mt-20">
          <p className="text-lg mb-2">no entries yet</p>
          <p className="text-sm">press n to create your first entry</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="mb-8">
            {/* Month header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-accent text-sm font-semibold">
                ─── {group.label} ───
              </span>
              <span className="text-dim text-xs">
                {group.entries.length} entries
              </span>
            </div>

            {/* Entries for this month */}
            <div className="space-y-1 ml-4">
              {group.entries.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id

                return (
                  <button
                    key={entry.id}
                    onClick={() => onSelect(entry)}
                    onDoubleClick={() => {
                      onSelect(entry)
                      onOpen(entry)
                    }}
                    className={`
                      w-full text-left py-2 px-3 rounded flex items-start gap-3 transition-colors
                      ${isSelected
                        ? 'bg-selection'
                        : 'hover:bg-bg/50'
                      }
                    `}
                  >
                    <TypeIndicator type={entry.type} />
                    <span className={`text-xs mt-0.5 ${ENTRY_COLORS[entry.type] || 'text-dim'}`}>
                      [{entry.type}]
                    </span>
                    <span className={`text-sm flex-1 ${isSelected ? 'text-fg' : 'text-dim'}`}>
                      "{truncate(entry.content, 100)}"
                    </span>
                    <span className="text-dim text-xs whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Import for colors
import { ENTRY_TYPES } from '../lib/constants'
const ENTRY_COLORS = {}
for (const [key, value] of Object.entries(ENTRY_TYPES)) {
  ENTRY_COLORS[key] = value.color
}

export default TimelineView

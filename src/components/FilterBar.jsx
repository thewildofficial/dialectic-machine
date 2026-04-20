import React from 'react'
import { ENTRY_TYPES, TYPE_KEYS } from '../lib/constants'

/**
 * Filter bar for searching and filtering entries
 * Shows when user presses 'f' or '/'
 */
function FilterBar({
  searchQuery,
  onSearchChange,
  filterType,
  onTypeChange,
  onClear,
  hasActiveFilters,
  searchInputRef,
}) {
  return (
    <div className="border-b border-border px-4 py-2 font-mono fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search input */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-accent text-sm">/</span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="search entries..."
            className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-dim/50"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-dim hover:text-fg text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => onTypeChange('all')}
            className={`
              px-2 py-0.5 rounded text-xs transition-colors cursor-pointer
              ${filterType === 'all'
                ? 'bg-accent/20 text-accent'
                : 'text-dim hover:text-fg'
              }
            `}
          >
            all
          </button>
          {TYPE_KEYS.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`
                px-2 py-0.5 rounded text-xs transition-colors cursor-pointer
                ${filterType === type
                  ? `${ENTRY_TYPES[type].color} bg-accent/10`
                  : 'text-dim hover:text-fg'
                }
              `}
            >
              {ENTRY_TYPES[type].label}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-dim hover:text-fg text-xs cursor-pointer"
          >
            clear
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterBar

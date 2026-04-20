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
  relatedTagSource,
  relatedTagCluster = [],
  onClear,
  hasActiveFilters,
  searchInputRef,
}) {
  return (
    <div className="border-b border-border px-4 py-3 sm:px-5 sm:py-4 font-mono fade-in">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search input */}
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onTypeChange('all')}
            className={`
              px-2.5 py-1 rounded text-xs transition-colors cursor-pointer
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
                px-2.5 py-1 rounded text-xs transition-colors cursor-pointer
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

      {relatedTagCluster.length > 0 && (
        <div className="mt-3 flex items-start gap-2 text-xs text-dim">
          <span className="whitespace-nowrap">related to #{relatedTagSource}:</span>
          <span className="text-tag/90 break-words">
            {relatedTagCluster.map(tag => `#${tag}`).join(' ')}
          </span>
        </div>
      )}
    </div>
  )
}

export default FilterBar

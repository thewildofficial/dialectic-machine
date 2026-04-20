import React from 'react'
import { ENTRY_TYPES } from '../lib/constants'

/**
 * Displays a colored type indicator (▸) for an entry
 */
function TypeIndicator({ type, size = 'sm' }) {
  const config = ENTRY_TYPES[type] || ENTRY_TYPES.idea
  const sizeClasses = size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm'

  return (
    <span className={`${config.color} ${sizeClasses}`} title={config.label}>
      {config.indicator}
    </span>
  )
}

export default TypeIndicator

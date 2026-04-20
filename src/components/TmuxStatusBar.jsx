import React from 'react'
import { APP_VERSION } from '../lib/constants'

/**
 * Tmux-style status bar at the top of the app
 * Shows app name, stats, and current view
 */
function TmuxStatusBar({ entryCount, tagCount, currentView, showTags }) {
  const viewLabels = {
    list: 'list',
    kanban: 'kanban',
    timeline: 'timeline',
    graph: 'graph',
  }

  return (
    <div className="border-b border-border px-4 py-1 flex items-center justify-between font-mono text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="text-accent font-semibold">dialectic-machine</span>
        <span className="text-dim">v{APP_VERSION}</span>
      </div>
      <div className="flex items-center gap-3 text-dim">
        <span>entries:{entryCount}</span>
        <span>tags:{tagCount}</span>
        <span>view:{viewLabels[currentView] || 'list'}</span>
        {showTags && <span className="text-tag">tags-sidebar</span>}
      </div>
    </div>
  )
}

export default TmuxStatusBar

import React, { useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../context/EntriesContext'
import { useFilteredEntries } from '../hooks/useFilteredEntries'
import { useKeyboardNav } from '../hooks/useKeyboardNav'
import { useCommandPalette } from '../hooks/useCommandPalette'

// Components
import TmuxStatusBar from '../components/TmuxStatusBar'
import BottomBar from '../components/BottomBar'
import TerminalPane from '../components/TerminalPane'
import EntryCard from '../components/EntryCard'
import EntryDetail from '../components/EntryDetail'
import EntryForm from '../components/EntryForm'
import FilterBar from '../components/FilterBar'
import CommandPalette from '../components/CommandPalette'
import ConfirmDialog from '../components/ConfirmDialog'
import TagPill from '../components/TagPill'
import GeminiSettings from '../components/GeminiSettings'

// Lazy-loaded heavy views
const KanbanBoard = lazy(() => import('../components/KanbanBoard'))
const TimelineView = lazy(() => import('../components/TimelineView'))
const GraphView = lazy(() => import('../components/GraphView'))

import { VIEWS, TYPE_KEYS } from '../lib/constants'

/**
 * Main app page with tmux-style layout
 * Split panes, keyboard navigation, multiple views
 */
function App() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { entries, loading, addEntry, editEntry, removeEntry } = useEntries()
  const {
    entries: filteredEntries,
    allTags,
    tagCounts,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterTags,
    relatedTagSource,
    relatedTagCluster,
    showRelatedByTag,
    clearFilters,
    hasActiveFilters,
  } = useFilteredEntries()

  // UI state
  const [currentView, setCurrentView] = useState(VIEWS.LIST)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showPalette, setShowPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const searchInputRef = useRef(null)

  // Cycle through views
  const cycleView = useCallback(() => {
    setCurrentView(prev => {
      if (prev === VIEWS.LIST) return VIEWS.KANBAN
      if (prev === VIEWS.KANBAN) return VIEWS.TIMELINE
      if (prev === VIEWS.TIMELINE) return VIEWS.GRAPH
      return VIEWS.LIST
    })
  }, [])

  // Entry selection
  const handleSelect = useCallback((entry) => {
    setSelectedEntry(entry)
  }, [])

  const handleOpen = useCallback((entry) => {
    if (entry) {
      setSelectedEntry(entry)
      setShowDetail(true)
    } else {
      setShowDetail(false)
    }
  }, [])

  // Form handlers
  const handleNew = useCallback(() => {
    setEditingEntry(null)
    setShowForm(true)
  }, [])

  const handleEdit = useCallback((entry) => {
    setEditingEntry(entry)
    setShowForm(true)
  }, [])

  const handleSave = useCallback(async (entryData) => {
    const result = editingEntry?.id
      ? await editEntry(editingEntry.id, entryData)
      : await addEntry(entryData)

    if (result) {
      setShowForm(false)
      setEditingEntry(null)
    }

    return result
  }, [editingEntry, addEntry, editEntry])

  const handleFormCancel = useCallback(() => {
    setShowForm(false)
    setEditingEntry(null)
  }, [])

  // Delete handler
  const handleDelete = useCallback((entry) => {
    setConfirmDelete(entry)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (confirmDelete) {
      await removeEntry(confirmDelete.id)
      if (selectedEntry?.id === confirmDelete.id) {
        setSelectedEntry(null)
        setShowDetail(false)
      }
      setConfirmDelete(null)
    }
  }, [confirmDelete, removeEntry, selectedEntry])

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null)
  }, [])

  // Filter handlers
  const handleToggleFilter = useCallback(() => {
    setShowFilter(prev => !prev)
  }, [])

  const handleSearch = useCallback(() => {
    setShowFilter(true)
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 100)
  }, [])

  // Tag sidebar toggle
  const handleToggleTags = useCallback(() => {
    setShowTags(prev => !prev)
  }, [])

  const handleTagClick = useCallback((tag) => {
    showRelatedByTag(tag)
    setCurrentView(VIEWS.LIST)
    setShowFilter(true)
  }, [showRelatedByTag])

  const handleSourceClick = useCallback((source) => {
    const normalizedSource = (source || '').trim()
    if (!normalizedSource) return

    // Prefer the author segment when source follows "Author - Work" style.
    const authorSegment = normalizedSource.split(/\s[-—]\s/)[0]?.trim() || normalizedSource
    const referenceQuery = authorSegment || normalizedSource

    clearFilters()
    setSearchQuery(referenceQuery)
    setCurrentView(VIEWS.LIST)
    setShowFilter(true)
  }, [clearFilters, setSearchQuery])

  // Quit handler
  const handleQuit = useCallback(async () => {
    await signOut()
    navigate('/login')
  }, [signOut, navigate])

  // Command palette handlers
  const handleExportJson = useCallback(() => {
    const data = JSON.stringify(entries, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discourse-entries-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  const handleExportMd = useCallback(() => {
    const lines = entries.map(entry => {
      let md = `## [${entry.type}] ${entry.content}\n\n`
      if (entry.source) md += `**Source:** ${entry.source}\n\n`
      if (entry.url) md += `**URL:** ${entry.url}\n\n`
      if (entry.tags?.length) md += `**Tags:** ${entry.tags.map(t => `#${t}`).join(' ')}\n\n`
      if (entry.commentary) md += `**Commentary:**\n${entry.commentary}\n\n`
      md += `---\n`
      return md
    })

    const content = `# Discourse Entries\n\nExported: ${new Date().toISOString()}\n\n${lines.join('\n')}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discourse-entries-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  const handleToggleTheme = useCallback(() => {
    // Theme toggle placeholder — dark-only for now
    console.log('theme toggle not yet implemented')
  }, [])

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false)
  }, [])

  const {
    isOpen: paletteOpen,
    query: paletteQuery,
    setQuery: setPaletteQuery,
    selectedIndex: paletteSelectedIndex,
    filteredCommands: paletteCommands,
    toggle: togglePalette,
    executeCommand: executePaletteCommand,
  } = useCommandPalette({
    onNewEntry: handleNew,
    onSwitchView: setCurrentView,
    onExportJson: handleExportJson,
    onExportMd: handleExportMd,
    onToggleTheme: handleToggleTheme,
    onLogout: handleQuit,
    onToggleFilter: handleToggleFilter,
    onToggleTags: handleToggleTags,
    onOpenSettings: handleOpenSettings,
  })

  // Keyboard navigation
  const { selectedIndex, selectEntry } = useKeyboardNav({
    entries: filteredEntries,
    onSelect: handleSelect,
    onOpen: handleOpen,
    onNew: handleNew,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onFilter: handleToggleFilter,
    onCycleView: cycleView,
    onTags: handleToggleTags,
    onSearch: handleSearch,
    onCommandPalette: togglePalette,
    currentView,
    showFilter,
    showTags,
    showForm,
    showDetail,
    showPalette: paletteOpen,
    showConfirmDialog: !!confirmDelete,
  })

  // Get related entries (entries sharing tags with selected)
  const relatedEntries = useMemo(() => {
    if (!selectedEntry || !selectedEntry.tags) return []
    const selectedTags = new Set(selectedEntry.tags.map(t => t.toLowerCase()))
    return entries.filter(e =>
      e.id !== selectedEntry.id &&
      e.tags?.some(t => selectedTags.has(t.toLowerCase()))
    )
  }, [selectedEntry, entries])

  // Tag count for status bar
  const tagCount = allTags.length

  // Loading state
  if (loading && entries.length === 0) {
    return (
      <div className="h-screen w-screen bg-bg flex items-center justify-center font-mono">
        <div className="text-dim text-sm">
          <span className="text-accent">&gt;</span> loading entries...
          <span className="cursor-blink text-accent ml-1">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-bg flex flex-col overflow-hidden font-mono">
      {/* Top status bar */}
      <TmuxStatusBar
        entryCount={entries.length}
        tagCount={tagCount}
        currentView={currentView}
        showTags={showTags}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side: list + filter */}
        <div className={`
          flex flex-col flex-1 min-w-0 border-r border-border
          ${currentView === VIEWS.GRAPH
            ? 'lg:flex-none lg:w-[60%] xl:w-[62%]'
            : 'lg:flex-none lg:w-[38%] xl:w-[36%]'
          }
        `}>
          {/* Filter bar */}
          {showFilter && (
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onTypeChange={setFilterType}
              relatedTagSource={relatedTagSource}
              relatedTagCluster={relatedTagCluster}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
              searchInputRef={searchInputRef}
            />
          )}

          {/* Entry list / kanban / timeline */}
          <div className="flex-1 overflow-y-auto">
            {currentView === VIEWS.LIST && (
              filteredEntries.length === 0 ? (
                <div className="text-dim text-center mt-20 px-5 py-6 sm:px-6 sm:py-8">
                  <p className="text-sm mb-2">
                    {hasActiveFilters ? 'no entries match filters' : 'no entries yet'}
                  </p>
                  <p className="text-xs">
                    {hasActiveFilters ? 'press f to clear filters' : 'press n to create your first entry'}
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry, index) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    isSelected={selectedEntry?.id === entry.id}
                    onClick={() => selectEntry(index)}
                  />
                ))
              )
            )}

            {currentView === VIEWS.KANBAN && (
              <Suspense fallback={
                <div className="text-dim text-center mt-20 px-5 py-6 sm:px-6 sm:py-8">
                  <p className="text-sm">loading kanban view...</p>
                </div>
              }>
                <KanbanBoard
                  entries={filteredEntries}
                  onSelect={handleSelect}
                  selectedEntry={selectedEntry}
                  onOpen={handleOpen}
                />
              </Suspense>
            )}

            {currentView === VIEWS.TIMELINE && (
              <Suspense fallback={
                <div className="text-dim text-center mt-20 px-5 py-6 sm:px-6 sm:py-8">
                  <p className="text-sm">loading timeline view...</p>
                </div>
              }>
                <TimelineView
                  entries={filteredEntries}
                  onSelect={handleSelect}
                  selectedEntry={selectedEntry}
                  onOpen={handleOpen}
                />
              </Suspense>
            )}

            {currentView === VIEWS.GRAPH && (
              <Suspense fallback={
                <div className="text-dim text-center mt-20 px-5 py-6 sm:px-6 sm:py-8">
                  <p className="text-sm">loading graph view...</p>
                </div>
              }>
                <GraphView
                  entries={filteredEntries}
                  onSelect={handleSelect}
                  selectedEntry={selectedEntry}
                  onOpen={handleOpen}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* Right side: detail view (desktop) */}
        <div className="hidden lg:flex flex-1 flex-col">
          {selectedEntry ? (
            <EntryDetail
              entry={selectedEntry}
              onClose={() => setShowDetail(false)}
              relatedEntries={relatedEntries}
              onTagClick={handleTagClick}
              onSourceClick={handleSourceClick}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-dim">
              <div className="text-center px-6 py-8">
                <p className="text-sm mb-2">no entry selected</p>
                <p className="text-xs">press enter to open an entry</p>
              </div>
            </div>
          )}
        </div>

        {/* Tag sidebar (toggleable) */}
        {showTags && (
          <div className="hidden lg:block w-52 border-l border-border overflow-y-auto px-4 py-5">
            <div className="text-dim text-xs mb-4 font-semibold">tags</div>
            <div className="space-y-2.5">
              {allTags.map(tag => (
                <TagPill
                  key={tag}
                  tag={tag}
                  active={filterTags.includes(tag)}
                  onClick={() => handleTagClick(tag)}
                  count={tagCounts[tag]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: detail overlay */}
      {showDetail && selectedEntry && (
        <div className="lg:hidden fixed inset-0 z-40 bg-bg">
          <div className="flex flex-col h-full">
            <div className="border-b border-border px-4 py-2 flex items-center">
              <button
                onClick={() => setShowDetail(false)}
                className="text-accent text-sm cursor-pointer"
              >
                &lt; back
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <EntryDetail
                entry={selectedEntry}
                onClose={() => setShowDetail(false)}
                relatedEntries={relatedEntries}
                onTagClick={handleTagClick}
                onSourceClick={handleSourceClick}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <BottomBar />

      {/* Entry form overlay */}
      {showForm && (
        <EntryForm
          entry={editingEntry}
          onSave={handleSave}
          onCancel={handleFormCancel}
          isEditing={!!editingEntry}
        />
      )}

      {/* Command palette */}
      <CommandPalette
        isOpen={paletteOpen}
        query={paletteQuery}
        onQueryChange={setPaletteQuery}
        selectedIndex={paletteSelectedIndex}
        commands={paletteCommands}
        onSelect={executePaletteCommand}
        onClose={togglePalette}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          message={`delete "${confirmDelete.content?.slice(0, 60)}${confirmDelete.content?.length > 60 ? '...' : ''}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmLabel="delete"
          cancelLabel="cancel"
        />
      )}

      {/* AI Settings */}
      {showSettings && (
        <GeminiSettings onClose={handleCloseSettings} />
      )}
    </div>
  )
}

export default App

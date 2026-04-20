import { useState, useCallback, useEffect, useRef } from 'react'
import { VIEWS, VIEW_KEYS } from '../lib/constants'

/**
 * Hook for keyboard navigation in the entry list
 * Handles j/k navigation, enter to open, escape to close
 */
export function useKeyboardNav({
  entries,
  onSelect,
  onOpen,
  onNew,
  onEdit,
  onDelete,
  onFilter,
  onCycleView,
  onTags,
  onSearch,
  onCommandPalette,
  currentView,
  showFilter,
  showTags,
  showForm,
  showDetail,
  showPalette,
  showConfirmDialog,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef(null)

  // Reset selection when entries change
  useEffect(() => {
    if (selectedIndex >= entries.length && entries.length > 0) {
      setSelectedIndex(entries.length - 1)
    }
  }, [entries.length, selectedIndex])

  const selectEntry = useCallback((index) => {
    if (index < 0 || index >= entries.length) return
    setSelectedIndex(index)
    if (entries[index]) {
      onSelect(entries[index])
    }
  }, [entries, onSelect])

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => {
      const next = Math.max(0, prev - 1)
      if (entries[next]) {
        onSelect(entries[next])
      }
      return next
    })
  }, [entries, onSelect])

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => {
      const next = Math.min(entries.length - 1, prev + 1)
      if (entries[next]) {
        onSelect(entries[next])
      }
      return next
    })
  }, [entries, onSelect])

  const openEntry = useCallback(() => {
    if (entries[selectedIndex]) {
      onOpen(entries[selectedIndex])
    }
  }, [entries, selectedIndex, onOpen])

  const handleKeyDown = useCallback((e) => {
    // Don't handle shortcuts when typing in inputs
    const tag = e.target.tagName.toLowerCase()
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select'

    // Always allow Escape to close things
    if (e.key === 'Escape') {
      e.preventDefault()
      if (showPalette) {
        onCommandPalette()
      } else if (showForm) {
        // Form handles its own escape
        return
      } else if (showDetail) {
        onOpen(null) // Close detail
      }
      return
    }

    // Command palette shortcut (Ctrl+P or Cmd+P)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault()
      onCommandPalette()
      return
    }

    // Don't handle other shortcuts when typing
    if (isInput) return

    // Don't handle shortcuts when overlays are open
    if (showForm || showPalette || showConfirmDialog) return

    switch (e.key) {
      case 'j':
        e.preventDefault()
        moveDown()
        break
      case 'k':
        e.preventDefault()
        moveUp()
        break
      case 'Enter':
        e.preventDefault()
        if (showDetail) {
          onOpen(null) // Close detail
        } else {
          openEntry()
        }
        break
      case 'n':
        e.preventDefault()
        onNew()
        break
      case 'e':
        e.preventDefault()
        if (entries[selectedIndex]) {
          onEdit(entries[selectedIndex])
        }
        break
      case 'd':
        e.preventDefault()
        if (entries[selectedIndex]) {
          onDelete(entries[selectedIndex])
        }
        break
      case 'f':
        e.preventDefault()
        onFilter()
        break
      case 'v':
        e.preventDefault()
        onCycleView()
        break
      case 't':
        e.preventDefault()
        onTags()
        break
      case '/':
        e.preventDefault()
        onSearch()
        break
      case 'h':
        // Kanban: move left between columns
        if (currentView === VIEWS.KANBAN) {
          e.preventDefault()
          // Handled by KanbanBoard
        }
        break
      case 'l':
        // Kanban: move right between columns
        if (currentView === VIEWS.KANBAN) {
          e.preventDefault()
          // Handled by KanbanBoard
        }
        break
      default:
        break
    }
  }, [
    entries,
    selectedIndex,
    showDetail,
    showForm,
    showPalette,
    showConfirmDialog,
    moveUp,
    moveDown,
    openEntry,
    onNew,
    onEdit,
    onDelete,
    onFilter,
    onCycleView,
    onTags,
    onSearch,
    onCommandPalette,
    onOpen,
    currentView,
  ])

  // Attach global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    selectedIndex,
    setSelectedIndex,
    selectEntry,
    moveUp,
    moveDown,
    listRef,
  }
}

export default useKeyboardNav

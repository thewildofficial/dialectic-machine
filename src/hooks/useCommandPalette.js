import { useState, useCallback, useMemo, useEffect } from 'react'

/**
 * Hook for the command palette
 * Handles open/close state, search filtering, and command execution
 */
export function useCommandPalette({
  onNewEntry,
  onSwitchView,
  onExportJson,
  onExportMd,
  onToggleTheme,
  onLogout,
  onToggleFilter,
  onToggleTags,
  onOpenSettings,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Define all available commands
  const commands = useMemo(() => [
    {
      id: 'new-entry',
      label: 'new entry',
      shortcut: 'n',
      action: () => {
        setIsOpen(false)
        onNewEntry()
      },
    },
    {
      id: 'view-list',
      label: 'switch to list view',
      shortcut: 'v',
      action: () => {
        setIsOpen(false)
        onSwitchView('list')
      },
    },
    {
      id: 'view-kanban',
      label: 'switch to kanban view',
      shortcut: 'v',
      action: () => {
        setIsOpen(false)
        onSwitchView('kanban')
      },
    },
    {
      id: 'view-timeline',
      label: 'switch to timeline view',
      shortcut: 'v',
      action: () => {
        setIsOpen(false)
        onSwitchView('timeline')
      },
    },
    {
      id: 'view-graph',
      label: 'switch to graph view',
      shortcut: 'v',
      action: () => {
        setIsOpen(false)
        onSwitchView('graph')
      },
    },
    {
      id: 'export-json',
      label: 'export entries (.json)',
      action: () => {
        setIsOpen(false)
        onExportJson()
      },
    },
    {
      id: 'export-md',
      label: 'export entries (.md)',
      action: () => {
        setIsOpen(false)
        onExportMd()
      },
    },
    {
      id: 'toggle-filter',
      label: 'toggle filter bar',
      shortcut: 'f',
      action: () => {
        setIsOpen(false)
        onToggleFilter()
      },
    },
    {
      id: 'toggle-tags',
      label: 'toggle tag sidebar',
      shortcut: 't',
      action: () => {
        setIsOpen(false)
        onToggleTags()
      },
    },
    {
      id: 'toggle-theme',
      label: 'toggle dark/light',
      action: () => {
        setIsOpen(false)
        onToggleTheme()
      },
    },
    {
      id: 'ai-settings',
      label: 'AI settings (Gemini API)',
      action: () => {
        setIsOpen(false)
        onOpenSettings()
      },
    },
    {
      id: 'logout',
      label: 'logout',
      shortcut: 'q',
      action: () => {
        setIsOpen(false)
        onLogout()
      },
    },
  ], [onNewEntry, onSwitchView, onExportJson, onExportMd, onToggleTheme, onLogout, onToggleFilter, onToggleTags, onOpenSettings])

  // Filter commands based on query (fuzzy match)
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const q = query.toLowerCase()
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q)
    )
  }, [commands, query])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  const executeCommand = useCallback((index) => {
    const cmd = filteredCommands[index]
    if (cmd) {
      cmd.action()
    }
  }, [filteredCommands])

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        executeCommand(selectedIndex)
        break
      default:
        break
    }
  }, [isOpen, close, selectedIndex, filteredCommands.length, executeCommand])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    isOpen,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    filteredCommands,
    open,
    close,
    toggle,
    executeCommand,
  }
}

export default useCommandPalette

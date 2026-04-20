import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchEntries, createEntry, updateEntry, deleteEntry } from '../services/supabase'
import { classifyEntry } from '../services/classifier'

const EntriesContext = createContext(null)

export function EntriesProvider({ children, userId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load entries on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setEntries([])
      setLoading(false)
      return
    }

    const loadEntries = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchEntries()
        setEntries(data)
      } catch (err) {
        setError(err.message)
        console.error('Failed to load entries:', err)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [userId])

  const addEntry = useCallback(async (entryData) => {
    // Auto-classify if type not explicitly set
    const type = entryData.type || classifyEntry(entryData.content, entryData.url)

    const newEntry = {
      ...entryData,
      type,
      tags: entryData.tags || [],
    }

    try {
      const created = await createEntry(newEntry)
      setEntries(prev => [created, ...prev])
      setError(null)
      return created
    } catch (err) {
      setError(err.message || 'Failed to save entry. Please try again.')
      return null
    }
  }, [])

  const editEntry = useCallback(async (id, updates) => {
    // Auto-classify if content changed and type not explicitly provided
    if (updates.content && !updates.type) {
      const existing = entries.find(e => e.id === id)
      updates.type = classifyEntry(updates.content, updates.url || existing?.url)
    }

    try {
      const updated = await updateEntry(id, updates)
      setEntries(prev => prev.map(e => e.id === id ? updated : e))
      setError(null)
      return updated
    } catch (err) {
      setError(err.message || 'Failed to update entry. Please try again.')
      return null
    }
  }, [entries])

  const removeEntry = useCallback(async (id) => {
    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
      setError(null)
      return true
    } catch (err) {
      setError(err.message || 'Failed to delete entry. Please try again.')
      return false
    }
  }, [])

  const getEntryById = useCallback((id) => {
    return entries.find(e => e.id === id)
  }, [entries])

  const value = {
    entries,
    loading,
    error,
    addEntry,
    editEntry,
    removeEntry,
    getEntryById,
    entryCount: entries.length,
  }

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const context = useContext(EntriesContext)
  if (!context) {
    throw new Error('useEntries must be used within an EntriesProvider')
  }
  return context
}

export default EntriesContext

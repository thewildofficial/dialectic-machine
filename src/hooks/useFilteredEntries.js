import { useMemo, useState, useCallback } from 'react'
import { useEntries } from '../context/EntriesContext'

/**
 * Hook for filtering, searching, and sorting entries
 * Returns memoized filtered entries based on active filters
 */
export function useFilteredEntries() {
  const { entries, loading, error } = useEntries()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTags, setFilterTags] = useState([])
  const [sortBy, setSortBy] = useState('created_at') // 'created_at' | 'updated_at' | 'type'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' | 'desc'

  const filteredEntries = useMemo(() => {
    let result = [...entries]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(entry =>
        entry.content?.toLowerCase().includes(query) ||
        entry.source?.toLowerCase().includes(query) ||
        entry.commentary?.toLowerCase().includes(query) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(entry => entry.type === filterType)
    }

    // Filter by tags (AND logic — entry must have ALL selected tags)
    if (filterTags.length > 0) {
      result = result.filter(entry => {
        const entryTags = (entry.tags || []).map(t => t.toLowerCase())
        return filterTags.every(tag => entryTags.includes(tag.toLowerCase()))
      })
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      // Handle date sorting
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      // Handle string sorting
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [entries, searchQuery, filterType, filterTags, sortBy, sortOrder])

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    const tagSet = new Set()
    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          tagSet.add(tag.toLowerCase())
        }
      }
    }
    return Array.from(tagSet).sort()
  }, [entries])

  // Get tag counts
  const tagCounts = useMemo(() => {
    const counts = {}
    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          const lower = tag.toLowerCase()
          counts[lower] = (counts[lower] || 0) + 1
        }
      }
    }
    return counts
  }, [entries])

  const toggleTag = useCallback((tag) => {
    setFilterTags(prev => {
      const lower = tag.toLowerCase()
      if (prev.includes(lower)) {
        return prev.filter(t => t !== lower)
      }
      return [...prev, lower]
    })
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterType('all')
    setFilterTags([])
  }, [])

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterTags.length > 0

  return {
    entries: filteredEntries,
    allEntries: entries,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterTags,
    setFilterTags,
    toggleTag,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    allTags,
    tagCounts,
    clearFilters,
    hasActiveFilters,
  }
}

export default useFilteredEntries

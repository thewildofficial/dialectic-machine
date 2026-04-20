import { useMemo, useState, useCallback } from 'react'
import { useEntries } from '../context/EntriesContext'

const MIN_SUBSTRING_LENGTH = 3
const MIN_PREFIX_LENGTH = 4

function normalizeTag(tag) {
  return (tag || '').toLowerCase().trim()
}

function tagTokens(tag) {
  return normalizeTag(tag)
    .split(/[\s\-_]+/)
    .map(token => token.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
}

function tokenVariants(token) {
  if (token.length <= 3) return [token]
  if (token.endsWith('s')) return [token, token.slice(0, -1)]
  return [token, `${token}s`]
}

function areTagsSimilar(baseTag, candidateTag) {
  const base = normalizeTag(baseTag)
  const candidate = normalizeTag(candidateTag)

  if (!base || !candidate) return false
  if (base === candidate) return true

  if (base.length >= MIN_SUBSTRING_LENGTH && candidate.includes(base)) return true
  if (candidate.length >= MIN_SUBSTRING_LENGTH && base.includes(candidate)) return true

  if (base.slice(0, MIN_PREFIX_LENGTH) === candidate.slice(0, MIN_PREFIX_LENGTH)) {
    return true
  }

  const baseTokens = tagTokens(base)
  const candidateTokens = tagTokens(candidate)
  if (baseTokens.length === 0 || candidateTokens.length === 0) return false

  return baseTokens.some(baseToken => {
    const variants = tokenVariants(baseToken)
    return candidateTokens.some(candidateToken => variants.includes(candidateToken))
  })
}

/**
 * Hook for filtering, searching, and sorting entries
 * Returns memoized filtered entries based on active filters
 */
export function useFilteredEntries() {
  const { entries, loading, error } = useEntries()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTags, setFilterTags] = useState([])
  const [relatedTagSource, setRelatedTagSource] = useState('')
  const [relatedTagCluster, setRelatedTagCluster] = useState([])
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

    // Filter by related tags cluster (OR logic — entry matches any related tag)
    if (relatedTagCluster.length > 0) {
      const clusterSet = new Set(relatedTagCluster.map(normalizeTag))
      result = result.filter(entry => {
        const entryTags = (entry.tags || []).map(normalizeTag)
        return entryTags.some(tag => clusterSet.has(tag))
      })
    }

    // Filter by tags (AND logic — entry must have ALL selected tags)
    if (filterTags.length > 0) {
      result = result.filter(entry => {
        const entryTags = (entry.tags || []).map(normalizeTag)
        return filterTags.every(tag => entryTags.includes(normalizeTag(tag)))
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
  }, [entries, searchQuery, filterType, filterTags, relatedTagCluster, sortBy, sortOrder])

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    const tagSet = new Set()
    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          tagSet.add(normalizeTag(tag))
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
          const lower = normalizeTag(tag)
          counts[lower] = (counts[lower] || 0) + 1
        }
      }
    }
    return counts
  }, [entries])

  const setSearchQueryWithReset = useCallback((query) => {
    setSearchQuery(query)
    setRelatedTagSource('')
    setRelatedTagCluster([])
  }, [])

  const showRelatedByTag = useCallback((tag) => {
    const normalizedTag = normalizeTag(tag)
    if (!normalizedTag) return

    const similarTags = allTags.filter(candidate => areTagsSimilar(normalizedTag, candidate))

    setRelatedTagSource(normalizedTag)
    setRelatedTagCluster(similarTags.length > 0 ? similarTags : [normalizedTag])
    setFilterTags([])
    setSearchQuery('')
  }, [allTags])

  const toggleTag = useCallback((tag) => {
    setRelatedTagSource('')
    setRelatedTagCluster([])
    setFilterTags(prev => {
      const lower = normalizeTag(tag)
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
    setRelatedTagSource('')
    setRelatedTagCluster([])
  }, [])

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterTags.length > 0 || relatedTagCluster.length > 0

  return {
    entries: filteredEntries,
    allEntries: entries,
    loading,
    error,
    searchQuery,
    setSearchQuery: setSearchQueryWithReset,
    filterType,
    setFilterType,
    filterTags,
    setFilterTags,
    relatedTagSource,
    relatedTagCluster,
    showRelatedByTag,
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

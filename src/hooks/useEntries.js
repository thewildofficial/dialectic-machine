import { useEntries } from '../context/EntriesContext'

/**
 * Hook that returns entries state — re-export for convenience
 * Wraps useEntries from context
 */
export function useEntries() {
  return useEntries()
}

export default useEntries

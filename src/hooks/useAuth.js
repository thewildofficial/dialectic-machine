import { useAuth } from '../context/AuthContext'

/**
 * Hook that returns auth state — re-export for convenience
 * Wraps useAuth from context
 */
export function useAuth() {
  return useAuth()
}

export default useAuth

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protected route wrapper
 * Redirects to /login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg flex items-center justify-center font-mono">
        <div className="text-dim text-sm">
          <span className="text-accent">&gt;</span> loading...
          <span className="cursor-blink text-accent ml-1">_</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

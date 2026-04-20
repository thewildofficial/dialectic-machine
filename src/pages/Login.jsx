import React, { useState, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Login page with email/password auth
 * Supports sign in and sign up modes
 */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('email and password are required')
      return
    }

    if (password.length < 6) {
      setError('password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = isSignUp
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password)

      if (result.error) {
        setError(result.error.message)
      } else {
        navigate('/app')
      }
    } catch (err) {
      setError(err.message || 'an unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [email, password, isSignUp, signIn, signUp, navigate])

  return (
    <div className="h-screen w-screen bg-bg flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-fg text-lg font-semibold mb-1">
            discourse
          </h1>
          <p className="text-dim text-sm">
            {isSignUp ? 'create an account' : 'sign in to continue'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-border rounded p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="text-dim text-sm block mb-1">email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm focus:border-accent outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-dim text-sm block mb-1">password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm focus:border-accent outline-none"
              placeholder="••••••••"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-type-task text-sm">
              &gt; {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2 rounded text-sm font-mono transition-colors
              ${loading
                ? 'text-dim cursor-not-allowed'
                : 'text-accent hover:bg-accent/10 cursor-pointer'
              }
            `}
          >
            {loading ? 'processing...' : isSignUp ? '[ create account ]' : '[ sign in ]'}
          </button>

          {/* Toggle sign in/sign up */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-dim text-sm hover:text-fg transition-colors cursor-pointer"
            >
              {isSignUp
                ? 'already have an account? sign in'
                : "don't have an account? sign up"
              }
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-dim text-xs">
          <p>press enter to submit</p>
        </div>
      </div>
    </div>
  )
}

export default Login

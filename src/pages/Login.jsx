import React, { useState, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HEGEL from '../assets/HEGEL.txt?raw'

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

  const { signIn, signUp, signInWithGoogle, isAuthenticated } = useAuth()
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
        setLoading(false)
        return
      }

      if (!result.user) {
        setError('authentication failed - no user returned')
        setLoading(false)
        return
      }

      navigate('/app')
    } catch (err) {
      setError(err.message || 'an unexpected error occurred')
      setLoading(false)
    }
  }, [email, password, isSignUp, signIn, signUp, navigate])

  const handleGoogleSignIn = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const result = await signInWithGoogle()
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'an unexpected error occurred')
      setLoading(false)
    }
  }, [signInWithGoogle])

  return (
    <div className="h-screen w-screen bg-bg flex items-center justify-center font-mono p-6">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center text-center">
          <div className="text-dim text-[6px] leading-[0.8] select-none sm:text-[7px] md:text-[8px]">
            <pre className="text-center">{HEGEL}</pre>
          </div>

          <div className="h-8 sm:h-10 md:h-12" />

          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-fg text-lg font-semibold">
            dialectical machine
            </h1>
            <p className="text-dim text-sm">
              {isSignUp ? 'create an account' : 'sign in to continue'}
            </p>
          </div>

          <div className="h-8 sm:h-10 md:h-12" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`
            w-full py-3 rounded text-sm font-mono transition-colors border border-border
            ${loading
              ? 'text-dim cursor-not-allowed'
              : 'text-accent hover:bg-accent/10 cursor-pointer'
            }
          `}
        >
          [ sign in with google ]
        </button>

        <div className="my-8 flex items-center sm:my-10">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-3 text-dim text-xs">or</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <form onSubmit={handleSubmit} className="border border-border rounded p-8 space-y-6 sm:p-10">
          {/* Email */}
          <div>
            <label className="text-dim text-sm block mb-2">email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-3 text-fg font-mono text-sm focus:border-accent outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-dim text-sm block mb-2">password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-3 text-fg font-mono text-sm focus:border-accent outline-none"
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
              w-full py-3 rounded text-sm font-mono transition-colors
              ${loading
                ? 'text-dim cursor-not-allowed'
                : 'text-accent hover:bg-accent/10 cursor-pointer'
              }
            `}
          >
            {loading ? 'processing...' : isSignUp ? '[ create account ]' : '[ sign in ]'}
          </button>

          {/* Toggle sign in/sign up */}
          <div className="text-center pt-6">
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
        <div className="text-center mt-10 text-dim text-xs sm:mt-12">
          <p>press enter to submit</p>
        </div>
      </div>
    </div>
  )
}

export default Login

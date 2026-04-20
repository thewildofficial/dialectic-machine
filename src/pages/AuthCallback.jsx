import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

function AuthCallback() {
  const [status, setStatus] = useState('authenticating')
  const navigate = useNavigate()

  useEffect(() => {
    const exchangeCode = async () => {
      const url = window.location.href

      const { error } = await supabase.auth.exchangeCodeForSession(url)

      if (error) {
        console.error('Auth callback error:', error)
        setStatus('failed')
        setTimeout(() => navigate('/login?error=auth_failed'), 1000)
      } else {
        setStatus('redirecting')
        navigate('/app')
      }
    }

    exchangeCode()
  }, [navigate])

  return (
    <div className="h-screen w-screen bg-bg flex items-center justify-center font-mono">
      <div className="text-center">
        <p className="text-dim text-sm">&gt; {status}...</p>
      </div>
    </div>
  )
}

export default AuthCallback
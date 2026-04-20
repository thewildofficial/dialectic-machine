import React, { useState, useCallback } from 'react'
import { useGeminiKey } from '../hooks/useGeminiKey'

const AVAILABLE_GEMINI_MODELS = [
  // Gemma 4 Series (Open Models) - Best for most users, runs on free tier
  { value: 'gemma-4-31b-it', label: 'Gemma 4 31B IT ★ Recommended — #3 open model globally' },
  { value: 'gemma-4-26b-a4b-it', label: 'Gemma 4 26B MoE — Efficient reasoning' },

  // Gemini 2.5 Series (Proprietary) - GA/Stable until Oct 2026
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash — Fast, cost-effective' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro — Most capable, reasoning' },

  // Gemini 3 Series (Preview) - Latest frontier models
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview — Fastest responses' },
  { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview — Advanced intelligence' },
]

/**
 * Settings panel for configuring Gemini API key
 * Warns users that key is stored locally in browser only
 */
function GeminiSettings({ onClose }) {
  const {
    apiKey,
    hasConsent,
    isConfigured,
    selectedModel,
    saveKey,
    removeKey,
    updateConsent,
    updateModel
  } = useGeminiKey()
  const [inputKey, setInputKey] = useState('')
  const [consent, setConsent] = useState(hasConsent)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = useCallback(() => {
    setError('')
    setSuccess('')

    try {
      saveKey(inputKey, consent, selectedModel)
      setInputKey('')
      setSuccess('API key saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }, [inputKey, consent, saveKey])

  const handleRemove = useCallback(() => {
    removeKey()
    setInputKey('')
    setConsent(false)
    setSuccess('API key removed')
    setTimeout(() => setSuccess(''), 3000)
  }, [removeKey])

  const handleConsentChange = useCallback((e) => {
    const newConsent = e.target.checked
    setConsent(newConsent)
    if (isConfigured) {
      updateConsent(newConsent)
    }
  }, [isConfigured, updateConsent])

  const handleModelChange = useCallback((e) => {
    updateModel(e.target.value)
  }, [updateModel])

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-bg border border-border rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto font-mono">
        {/* Header */}
        <div className="border-b border-border px-8 py-6 flex items-center justify-between">
          <span className="text-accent text-sm font-semibold">[AI settings]</span>
          <button
            onClick={onClose}
            className="text-dim hover:text-fg text-sm cursor-pointer px-2 py-1"
          >
            [×]
          </button>
        </div>

        <div className="divide-y divide-border">
          {/* Privacy Notice Section */}
          <div className="p-10">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-8">
              <div className="flex items-start gap-5">
                <span className="text-yellow-400 text-lg mt-0.5">⚠</span>
                <div className="space-y-4">
                  <h3 className="text-yellow-400 text-sm font-semibold">Privacy Notice</h3>
                  <p className="text-yellow-400/90 text-sm leading-relaxed">
                    Your Gemini API key is stored <span className="font-semibold">only in your browser's localStorage</span>.
                    It never leaves your device except when making direct API calls to Google's Gemini service.
                    This app does not have a backend server — your key is yours alone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="px-8 py-10">
            <div className="flex items-center gap-4">
              <span className="text-dim text-sm">Configuration Status:</span>
              {isConfigured ? (
                <span className="text-green-400 text-sm font-medium">● Active</span>
              ) : (
                <span className="text-dim text-sm">○ Not configured</span>
              )}
            </div>
          </div>

          {/* API Key Input Section */}
          <div className="px-8 py-10 space-y-6">
            <label className="text-fg text-sm font-medium block">Gemini API Key</label>
            <div className="flex gap-3">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={isConfigured ? '••••••••••••••••' : 'Enter your Gemini API key'}
                className="flex-1 bg-bg/50 border border-border rounded px-4 py-4 text-fg font-mono text-sm focus:border-accent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-4 py-4 border border-border rounded text-dim hover:text-fg text-sm cursor-pointer transition-colors"
              >
                {showKey ? 'hide' : 'show'}
              </button>
            </div>
            <p className="text-dim text-xs leading-relaxed">
              Get your API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Consent Section */}
          <div className="px-8 py-10 space-y-4">
            <div className="space-y-2">
              <label htmlFor="gemini-model" className="text-fg text-sm font-medium block">
                Model
              </label>
              <select
                id="gemini-model"
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full bg-bg/50 border border-border rounded px-4 py-4 text-fg font-mono text-sm focus:border-accent outline-none"
              >
                {AVAILABLE_GEMINI_MODELS.map((modelOption) => (
                  <option key={modelOption.value} value={modelOption.value} className="bg-bg text-fg">
                    {modelOption.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-dim text-xs leading-relaxed">
              This model will be used for all AI Assist requests.
            </p>
          </div>

          {/* Consent Section */}
          <div className="px-8 py-10">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="gemini-consent"
                checked={consent}
                onChange={handleConsentChange}
                className="mt-1 accent-accent cursor-pointer w-4 h-4"
              />
              <label htmlFor="gemini-consent" className="text-dim text-sm leading-relaxed cursor-pointer">
                I understand that my API key will be stored locally in my browser and used only
                to make requests to Google's Gemini API. I accept responsibility for securing my own key.
              </label>
            </div>
          </div>

          {/* Messages & Actions Section */}
          <div className="px-8 py-10 space-y-6">
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 rounded px-4 py-4 border border-red-700/30">
                &gt; {error}
              </div>
            )}
            {success && (
              <div className="text-green-400 text-sm bg-green-900/20 rounded px-4 py-4 border border-green-700/30">
                &gt; {success}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={!inputKey.trim() || !consent}
                className={`
                  flex-1 py-4 rounded text-sm font-mono transition-colors border
                  ${!inputKey.trim() || !consent
                    ? 'text-dim border-border cursor-not-allowed'
                    : 'text-accent border-accent hover:bg-accent/10 cursor-pointer'
                  }
                `}
              >
                [ save key ]
              </button>
              {isConfigured && (
                <button
                  onClick={handleRemove}
                  className="flex-1 py-4 rounded text-sm font-mono text-red-400 border border-red-700/50 hover:bg-red-900/20 cursor-pointer transition-colors"
                >
                  [ remove key ]
                </button>
              )}
            </div>
          </div>

          {/* Info Footer Section */}
          <div className="px-8 py-10 bg-bg/50">
            <div className="space-y-6 text-dim text-xs leading-relaxed">
              <div className="flex gap-3">
                <span className="text-fg font-medium whitespace-nowrap">How it works:</span>
                <p>
                  When you paste a quote and click "AI Assist", the app sends your content to Gemini
                  along with your API key to get suggested tags, source info, and commentary.
                  The key never touches our servers.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-fg font-medium whitespace-nowrap">Security tip:</span>
                <p>
                  Consider creating a restricted API key in Google AI Studio with usage limits for extra safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeminiSettings

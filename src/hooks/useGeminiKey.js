import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dialectic_gemini_key'
const CONSENT_KEY = 'dialectic_gemini_consent'
const MODEL_KEY = 'dialectic_gemini_model'
const DEFAULT_GEMINI_MODEL = 'gemma-4-31b-it'

/**
 * Hook for managing Gemini API key in localStorage
 * Key is stored locally only and never sent to any server except Gemini's API
 */
export function useGeminiKey() {
  const [apiKey, setApiKey] = useState('')
  const [hasConsent, setHasConsent] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_GEMINI_MODEL)

  // Load from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY)
    const storedConsent = localStorage.getItem(CONSENT_KEY)
    const storedModel = localStorage.getItem(MODEL_KEY)

    if (storedKey) {
      setApiKey(storedKey)
      setIsConfigured(true)
    }
    if (storedConsent === 'true') {
      setHasConsent(true)
    }
    if (storedModel) {
      setSelectedModel(storedModel)
    }
  }, [])

  // Save key with user consent
  const saveKey = useCallback((key, consent, model = DEFAULT_GEMINI_MODEL) => {
    if (!consent) {
      throw new Error('User consent required to store API key')
    }

    const trimmedKey = key.trim()
    if (!trimmedKey) {
      throw new Error('API key cannot be empty')
    }

    localStorage.setItem(STORAGE_KEY, trimmedKey)
    localStorage.setItem(CONSENT_KEY, 'true')
    localStorage.setItem(MODEL_KEY, model)
    setApiKey(trimmedKey)
    setHasConsent(true)
    setIsConfigured(true)
    setSelectedModel(model)
  }, [])

  // Remove key, consent, and reset model to default
  const removeKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CONSENT_KEY)
    localStorage.removeItem(MODEL_KEY)
    setApiKey('')
    setHasConsent(false)
    setIsConfigured(false)
    setSelectedModel(DEFAULT_GEMINI_MODEL)
  }, [])

  // Update consent without changing key
  const updateConsent = useCallback((consent) => {
    if (consent) {
      localStorage.setItem(CONSENT_KEY, 'true')
      setHasConsent(true)
    } else {
      localStorage.removeItem(CONSENT_KEY)
      setHasConsent(false)
    }
  }, [])

  // Update selected Gemini model
  const updateModel = useCallback((model) => {
    localStorage.setItem(MODEL_KEY, model)
    setSelectedModel(model)
  }, [])

  return {
    apiKey,
    hasConsent,
    isConfigured,
    selectedModel,
    defaultModel: DEFAULT_GEMINI_MODEL,
    saveKey,
    removeKey,
    updateConsent,
    updateModel,
  }
}

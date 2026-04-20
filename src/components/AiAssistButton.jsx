import React, { useState, useCallback } from 'react'
import { analyzeEntry, quickPasteAnalysis } from '../services/gemini'
import { useGeminiKey } from '../hooks/useGeminiKey'

function formatModelLabel(model) {
  if (!model) return 'unknown model'
  return model.replace(/-preview$/, ' (preview)')
}

/**
 * AI Assist button for auto-populating entry fields using Gemini
 */
function AiAssistButton({ onSuggestions, content = '', context = '' }) {
  const { apiKey, isConfigured, selectedModel } = useGeminiKey()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      let result

      // If we have content, analyze it directly
      // Otherwise try to read from clipboard
      if (content.trim()) {
        result = await analyzeEntry(content, context, apiKey, selectedModel)
      } else {
        const pasteResult = await quickPasteAnalysis(apiKey, selectedModel)
        result = {
          ...pasteResult.suggestions,
          content: pasteResult.content,
        }
      }

      onSuggestions(result)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }, [apiKey, content, context, onSuggestions, selectedModel])

  if (!isConfigured) {
    return (
      <div className="relative">
        <button
          type="button"
          disabled
          className="text-dim text-xs cursor-not-allowed opacity-50"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          [ AI: not configured ]
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-bg border border-border rounded p-2 text-xs text-dim z-10">
            Configure Gemini API key in settings to use AI assist
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-dim text-[10px]">
        model: {formatModelLabel(selectedModel)}
      </span>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || (!content.trim() && !navigator.clipboard)}
        className={`
          text-xs font-mono transition-colors
          ${loading
            ? 'text-dim cursor-wait'
            : 'text-purple-400 hover:text-purple-300 cursor-pointer'
          }
        `}
      >
        {loading
          ? '[ AI: analyzing... ]'
          : content.trim()
            ? '[ AI: analyze quote ]'
            : '[ AI: paste & analyze ]'
        }
      </button>

      {error && (
        <span className="text-red-400 text-xs">
          {error}
        </span>
      )}
    </div>
  )
}

export default AiAssistButton

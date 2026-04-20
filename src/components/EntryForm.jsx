import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ENTRY_TYPES, TYPE_KEYS } from '../lib/constants'
import { classifyEntry } from '../services/classifier'
import { parseTags, formatTags } from '../lib/utils'
import AiAssistButton from './AiAssistButton'

/**
 * Entry form overlay for creating and editing entries
 * All fields are controlled components
 * Ctrl+S to save, Escape to cancel
 */
function EntryForm({
  entry = null,
  onSave,
  onCancel,
  isEditing = false,
}) {
  const [type, setType] = useState(entry?.type || 'idea')
  const [content, setContent] = useState(entry?.content || '')
  const [source, setSource] = useState(entry?.source || '')
  const [url, setUrl] = useState(entry?.url || '')
  const [tags, setTags] = useState(entry?.tags ? formatTags(entry.tags) : '')
  const [commentary, setCommentary] = useState(entry?.commentary || '')
  const [manuallySelectedType, setManuallySelectedType] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const contentRef = useRef(null)
  const formRef = useRef(null)

  // Focus content field on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus()
    }
  }, [])

  // Auto-classification on blur if user hasn't manually selected
  const handleContentBlur = useCallback(() => {
    if (!manuallySelectedType && content) {
      const classified = classifyEntry(content, url)
      setType(classified)
    }
  }, [content, url, manuallySelectedType])

  // Handle type change — mark as manually selected
  const handleTypeChange = useCallback((e) => {
    setType(e.target.value)
    setManuallySelectedType(true)
  }, [])

  // Handle AI suggestions
  const handleAiSuggestions = useCallback((suggestions) => {
    // If AI provided content (from clipboard paste mode), set it
    if (suggestions.content && !content.trim()) {
      setContent(suggestions.content)
    }

    // Set type if valid
    const validTypes = ['claim', 'question', 'idea', 'quote', 'reference', 'opinion', 'task', 'reflection']
    if (suggestions.type && validTypes.includes(suggestions.type)) {
      setType(suggestions.type)
      setManuallySelectedType(true)
    }

    // Set source if provided and current is empty
    if (suggestions.source && !source.trim()) {
      setSource(suggestions.source)
    }

    // Set URL if provided and current is empty
    if (suggestions.url && !url.trim()) {
      setUrl(suggestions.url)
    }

    // Set tags (append to existing if any)
    if (suggestions.tags && suggestions.tags.length > 0) {
      const existingTags = parseTags(tags)
      const newTags = [...new Set([...existingTags, ...suggestions.tags])]
      setTags(formatTags(newTags))
    }

    // Set commentary if provided and current is empty
    if (suggestions.commentary && !commentary.trim()) {
      setCommentary(suggestions.commentary)
    }
  }, [content, source, url, tags, commentary])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!content.trim()) return

    setSaving(true)
    setSaveError(null)

    const result = await onSave({
      id: entry?.id,
      content: content.trim(),
      source: source.trim() || null,
      url: url.trim() || null,
      type,
      tags: parseTags(tags),
      commentary: commentary.trim() || null,
    })

    setSaving(false)

    if (!result) {
      setSaveError('Failed to save. Check console for details.')
    }
  }, [content, source, url, type, tags, commentary, entry, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, onCancel])

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        ref={formRef}
        className="bg-bg border border-border rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto font-mono fade-in"
      >
        {/* Header */}
        <div className="border-b border-border px-5 py-4 sm:px-6 sm:py-5 flex items-center">
          <span className="text-accent text-sm font-semibold">
            {isEditing ? '[edit entry]' : '[new entry]'}
          </span>
        </div>

        {/* Form fields */}
        <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-6">
          {/* Type */}
          <div>
            <label className="text-dim text-sm block mb-2">type:</label>
            <select
              value={type}
              onChange={handleTypeChange}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm focus:border-accent outline-none"
            >
              {TYPE_KEYS.map((t) => (
                <option key={t} value={t}>
                  {ENTRY_TYPES[t].label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-dim text-sm">content:</label>
              <AiAssistButton
                onSuggestions={handleAiSuggestions}
                content={content}
                context={commentary}
              />
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentBlur}
              rows={5}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm resize-none focus:border-accent outline-none"
              placeholder="Paste a quote or thought here, then click [AI: analyze quote] to auto-fill metadata..."
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-dim text-sm block mb-2">source:</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm focus:border-accent outline-none"
              placeholder="Author — Title / Podcast / Book"
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-dim text-sm block mb-2">url:</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm focus:border-accent outline-none"
              placeholder="https://..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-dim text-sm block mb-2">tags:</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm focus:border-accent outline-none"
              placeholder="AI-risk, bioweapons, misuse"
            />
          </div>

          {/* Commentary */}
          <div>
            <label className="text-dim text-sm block mb-2">commentary:</label>
            <textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              rows={3}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm resize-none focus:border-accent outline-none"
              placeholder="Your thoughts, connections, analysis..."
            />
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="border-t border-border px-5 py-3 sm:px-6 sm:py-4 bg-red-900/20">
            <p className="text-red-400 text-sm text-center">{saveError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-border px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-center gap-5">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className={`
              px-4 py-2 rounded text-sm font-mono transition-colors
              ${saving || !content.trim()
                ? 'text-dim cursor-not-allowed'
                : 'text-accent hover:bg-accent/10 cursor-pointer'
              }
            `}
          >
            [ Ctrl+S save ]
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-mono text-dim hover:text-fg transition-colors cursor-pointer"
          >
            [ Escape cancel ]
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntryForm

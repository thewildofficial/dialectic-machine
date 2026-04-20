import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ENTRY_TYPES, TYPE_KEYS } from '../lib/constants'
import { classifyEntry } from '../services/classifier'
import { parseTags, formatTags } from '../lib/utils'

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

  // Save handler
  const handleSave = useCallback(async () => {
    if (!content.trim()) return

    setSaving(true)
    await onSave({
      id: entry?.id,
      content: content.trim(),
      source: source.trim() || null,
      url: url.trim() || null,
      type,
      tags: parseTags(tags),
      commentary: commentary.trim() || null,
    })
    setSaving(false)
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
        <div className="border-b border-border px-4 py-2 flex items-center">
          <span className="text-accent text-sm font-semibold">
            {isEditing ? '[edit entry]' : '[new entry]'}
          </span>
        </div>

        {/* Form fields */}
        <div className="p-4 space-y-4">
          {/* Type */}
          <div>
            <label className="text-dim text-sm block mb-1">type:</label>
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
            <label className="text-dim text-sm block mb-1">content:</label>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentBlur}
              rows={5}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm resize-none focus:border-accent outline-none"
              placeholder="What did you read, hear, or think?"
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-dim text-sm block mb-1">source:</label>
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
            <label className="text-dim text-sm block mb-1">url:</label>
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
            <label className="text-dim text-sm block mb-1">tags:</label>
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
            <label className="text-dim text-sm block mb-1">commentary:</label>
            <textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              rows={3}
              className="w-full bg-bg/50 border border-border rounded px-3 py-2 text-fg font-mono text-sm resize-none focus:border-accent outline-none"
              placeholder="Your thoughts, connections, analysis..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-center gap-4">
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

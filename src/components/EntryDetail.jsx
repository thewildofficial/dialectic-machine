import React, { useState, useEffect, useCallback, useRef } from 'react'
import TypeIndicator from './TypeIndicator'
import BrailleArt from './BrailleArt'
import TagPill from './TagPill'
import { formatTime, formatTimeShort } from '../lib/utils'

/**
 * Displays the full detail of a selected entry
 * Shows content, metadata, braille art, commentary, and related entries
 */
function EntryDetail({ entry, onClose, relatedEntries = [], onTagClick, onSourceClick }) {
  const detailRef = useRef(null)

  // Focus trap and escape handler
  useEffect(() => {
    if (detailRef.current) {
      detailRef.current.focus()
    }
  }, [])

  if (!entry) return null

  return (
    <div
      ref={detailRef}
      tabIndex={-1}
      className="h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 font-mono fade-in outline-none"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TypeIndicator type={entry.type} size="lg" />
          <span className="text-accent text-sm uppercase tracking-wider">
            {entry.type}
          </span>
          <span className="text-dim text-xs ml-auto">
            {formatTime(entry.created_at)}
          </span>
        </div>
        <h2 className="text-fg text-lg leading-relaxed font-semibold whitespace-pre-wrap break-words">
          {entry.content}
        </h2>
      </div>

      {/* Metadata */}
      <div className="space-y-3 mb-8 text-sm">
        {entry.source && (
          <div className="flex items-start gap-3">
            <span className="text-dim min-w-[70px]">source:</span>
            {onSourceClick ? (
              <button
                type="button"
                onClick={() => onSourceClick(entry.source)}
                className="text-source hover:underline text-left cursor-pointer"
                title="Show notes with this reference"
              >
                {entry.source}
              </button>
            ) : (
              <span className="text-source">{entry.source}</span>
            )}
          </div>
        )}
        {entry.url && (
          <div className="flex items-start gap-3">
            <span className="text-dim min-w-[70px]">url:</span>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tag hover:underline break-all"
            >
              {entry.url}
            </a>
          </div>
        )}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="text-dim min-w-[70px]">tags:</span>
            <div className="flex gap-2 flex-wrap">
              {entry.tags.map((tag, i) => (
                <TagPill
                  key={i}
                  tag={tag}
                  onClick={onTagClick ? () => onTagClick(tag) : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Braille Art */}
      <div className="mb-8">
        <div className="text-dim text-xs mb-3">fingerprint:</div>
        <div className="text-dim leading-none overflow-hidden rounded border border-border p-2 bg-bg/50">
          <BrailleArt content={entry.content} type={entry.type} compact />
        </div>
      </div>

      {/* Commentary */}
      {entry.commentary && (
        <div className="mb-8">
          <div className="text-dim text-xs mb-3">commentary:</div>
          <div className="text-fg text-sm leading-relaxed border-l-2 border-border pl-4">
            {entry.commentary}
          </div>
        </div>
      )}

      {/* Related Entries */}
      {relatedEntries.length > 0 && (
        <div>
          <div className="text-dim text-xs mb-3">
            related: [{relatedEntries.length} entries share tags]
          </div>
          <div className="space-y-3">
            {relatedEntries.slice(0, 5).map((related) => (
              <div key={related.id} className="flex items-start gap-3 text-sm">
                <TypeIndicator type={related.type} />
                <span className="text-dim truncate">
                  {related.content?.slice(0, 80)}
                  {related.content?.length > 80 ? '...' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EntryDetail

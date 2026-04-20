import React, { useCallback, useEffect, useRef } from 'react'

/**
 * Confirmation dialog for destructive actions (delete, logout, etc.)
 */
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
}) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.focus()
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }, [onConfirm, onCancel])

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="bg-bg border border-border rounded p-6 font-mono max-w-sm w-full fade-in">
        <p className="text-fg text-sm mb-6">{message}</p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm text-type-task hover:bg-type-task/10 transition-colors cursor-pointer"
            title="Press Enter to confirm"
          >
            [ {confirmLabel} ]
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm text-dim hover:text-fg transition-colors cursor-pointer"
            title="Press Escape to cancel"
          >
            [ {cancelLabel} ]
          </button>
        </div>
        <p className="text-dim text-xs text-center mt-4">
          tip: press <kbd className="px-1.5 py-0.5 bg-border/50 rounded text-fg text-[10px]">enter</kbd> to confirm,
          <kbd className="ml-1 px-1.5 py-0.5 bg-border/50 rounded text-fg text-[10px]">esc</kbd> to cancel
        </p>
      </div>
    </div>
  )
}

export default ConfirmDialog

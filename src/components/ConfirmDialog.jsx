import React, { useState, useCallback } from 'react'

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
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      onConfirm()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }, [onConfirm, onCancel])

  return (
    <div
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
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm text-type-task hover:bg-type-task/10 transition-colors cursor-pointer"
          >
            [ {confirmLabel} ]
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm text-dim hover:text-fg transition-colors cursor-pointer"
          >
            [ {cancelLabel} ]
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

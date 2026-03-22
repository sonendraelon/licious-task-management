import { useEffect } from 'react'
import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

// Base overlay component featuring escape key handling and scroll locking
export function Modal({ title, open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return

    // Close modal on Escape
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    // Prevent background scrolling while modal is open
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    // Restore standard environment on unmount
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="iconButton" onClick={onClose} aria-label="Close dialog" type="button">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  )
}


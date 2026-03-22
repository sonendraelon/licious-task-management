import { Modal } from './Modal'

// Reusable confirmation prompt for destructive actions
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <p className="muted">{description}</p>
      <div className="modalActions">
        <button className="button buttonSecondary" type="button" onClick={onClose}>
          {cancelText ?? 'Cancel'}
        </button>
        <button
          className="button buttonDanger"
          type="button"
          onClick={() => onConfirm()}
          aria-label={confirmText}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}


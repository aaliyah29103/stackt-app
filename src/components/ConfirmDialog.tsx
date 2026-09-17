import type { ReactNode } from 'react'
import { Button } from './Button'
import { CloseIcon, WarningIcon } from '../assets/icons'

export type DialogOption = {
  label: string
  icon?: ReactNode
  onSelect: () => void
  /** "primary" is the filled accent Button; "secondary" is the outlined one. Defaults to "secondary" when omitted. */
  emphasis?: 'primary' | 'secondary'
}

type DangerDialogProps = {
  open: boolean
  variant: 'danger'
  title: string
  description: string
  confirmLabel: string
  /** Left footer button's label. Defaults to "Cancel". */
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  /** Tapping the backdrop. Defaults to `onCancel`. */
  onDismiss?: () => void
}

type NeutralDialogProps = {
  open: boolean
  variant: 'neutral'
  title: string
  description: string
  /** The full-width stacked choices — rendered as shared Button components with icons. */
  options: DialogOption[]
  /** Tapping the backdrop or the "X" — a neutral dialog has no true "cancel", so this is required. */
  onDismiss: () => void
}

type ConfirmDialogProps = DangerDialogProps | NeutralDialogProps

function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, description, variant } = props
  if (!open) return null

  const onDismiss =
    variant === 'danger' ? (props.onDismiss ?? props.onCancel) : props.onDismiss

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
          {variant === 'neutral' && (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="absolute top-4 right-4 text-gray-400"
            >
              <CloseIcon className="h-4 w-3" />
            </button>
          )}
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            {variant === 'danger' && (
              <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-500">
                <WarningIcon className="h-5 w-5" />
              </span>
            )}
            <h2 className="text-xl font-extrabold text-ink">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>

          {variant === 'neutral' ? (
            <div className="flex flex-col gap-3 border-t border-gray-200 p-6">
              {props.options.map((option) => (
                <Button
                  key={option.label}
                  variant={option.emphasis === 'primary' ? 'solid' : 'outline'}
                  onClick={option.onSelect}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex border-t border-gray-200">
              <button
                type="button"
                onClick={props.onCancel}
                className="flex-1 border-r border-gray-200 py-4 text-base font-bold text-gray-500"
              >
                {props.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={props.onConfirm}
                className="flex-1 py-4 text-base font-bold text-red-500"
              >
                {props.confirmLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ConfirmDialog

import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  onClose?: () => void
  footer?: ReactNode
  open?: boolean
  className?: string
}

export default function Dialog({
  title,
  subtitle,
  children,
  onClose,
  footer,
  open = true,
  className = '',
}: DialogProps) {
  if (!open) return null

  const titleId = 'dialog-title'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`bg-surface-default border border-border-default rounded-2xl shadow-[0px_35px_21px_0px_rgba(0,0,0,0.02),0px_16px_16px_0px_rgba(0,0,0,0.02),0px_4px_9px_0px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col max-h-[90vh] ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-1 px-6 pt-6 pb-1 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-text-foreground text-2xl font-semibold leading-8 tracking-[-0.48px]">
            {title}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="flex items-center justify-center size-6 rounded-full bg-button-secondary cursor-pointer shrink-0"
            >
              <X size={15} className="text-text-foreground" />
            </button>
          )}
        </div>
        {subtitle && (
          <p className="text-text-light text-base leading-6 tracking-[-0.16px] m-0">
            {subtitle}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="text-text-light text-base leading-6 tracking-[-0.16px] px-6 pt-5 pb-6 overflow-y-auto min-h-0 flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center px-6 pb-6 shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}

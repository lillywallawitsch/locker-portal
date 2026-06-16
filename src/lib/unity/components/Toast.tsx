import type { ReactNode } from 'react'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info'
export type ToastPosition = 'bottom-center' | 'bottom-right'

interface ToastProps {
  variant?: ToastVariant
  position?: ToastPosition
  title?: ReactNode
  children: ReactNode
  className?: string
}

const variantStyles = {
  success: { bg: 'bg-surface-success', text: 'text-text-success', Icon: CheckCircle },
  error: { bg: 'bg-surface-error', text: 'text-text-error', Icon: AlertCircle },
  info: { bg: 'bg-surface-primary-light', text: 'text-text-primary', Icon: Info },
} as const

const positionStyles = {
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-6 right-6 max-w-[420px]',
} as const

export default function Toast({
  variant = 'success',
  position = 'bottom-center',
  title,
  children,
  className = '',
}: ToastProps) {
  const v = variantStyles[variant]
  const Icon = v.Icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed z-50 flex items-start gap-3 ${v.bg} rounded-[10px] px-4 py-3 shadow-tile ${positionStyles[position]} ${className}`}
    >
      <span className="flex items-center justify-center pt-0.5 size-5 shrink-0">
        <Icon size={20} className={v.text} aria-hidden="true" />
      </span>
      {title ? (
        <div className="flex flex-col gap-1 min-w-0">
          <span className={`text-base font-medium ${v.text} tracking-[-0.16px] leading-6`}>
            {title}
          </span>
          <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
            {children}
          </span>
        </div>
      ) : (
        <span className={`text-sm font-medium ${v.text} tracking-[-0.14px] leading-[22px]`}>
          {children}
        </span>
      )}
    </div>
  )
}

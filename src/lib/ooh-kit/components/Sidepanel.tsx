import type { ReactNode } from 'react'

interface SidepanelProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  surface?: 'surface' | 'card'
  backdrop?: 'transparent' | 'dim'
  className?: string
}

const surfaceStyles = {
  surface: 'bg-surface-surface',
  card: 'bg-surface-card',
} as const

const backdropStyles = {
  transparent: '',
  dim: 'bg-black/20',
} as const

export default function Sidepanel({
  open,
  onClose,
  children,
  surface = 'surface',
  backdrop = 'transparent',
  className = '',
}: SidepanelProps) {
  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 z-40 ${backdropStyles[backdrop]}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[95vw] max-w-[500px] ${surfaceStyles[surface]} shadow-panel flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${className}`}
      >
        {children}
      </div>
    </>
  )
}

import type { ReactNode } from 'react'

export type TooltipPosition = 'top' | 'bottom'

interface TooltipProps {
  content: string
  position?: TooltipPosition
  children?: ReactNode
  visible?: boolean
}

export default function Tooltip({
  content,
  position = 'top',
  children,
  visible = true,
}: TooltipProps) {
  if (!visible) return <>{children}</>

  const tooltip = (
    <div className={`flex flex-col items-center ${position === 'bottom' ? 'flex-col-reverse' : ''}`}>
      <div className="bg-surface-tooltip rounded-md px-3 py-2 overflow-hidden">
        <span className="text-xs text-text-inverted text-center leading-4 tracking-[-0.12px]">
          {content}
        </span>
      </div>
      <svg
        aria-hidden="true"
        width="18"
        height="10"
        viewBox="0 0 18 10"
        fill="none"
        className={`text-surface-tooltip ${position === 'bottom' ? 'rotate-180' : ''}`}
      >
        <path d="M9 10L0 0H18L9 10Z" fill="currentColor" />
      </svg>
    </div>
  )

  if (!children) return tooltip

  return (
    <div className="relative inline-flex flex-col items-center" role="tooltip">
      <div className={`absolute ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} z-10`}>
        {tooltip}
      </div>
      {children}
    </div>
  )
}

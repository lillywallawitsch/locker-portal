import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

export type InformationBoxVariant = 'info' | 'success' | 'warning' | 'error'

interface InformationBoxProps {
  children: ReactNode
  icon?: ReactNode
  variant?: InformationBoxVariant
}

const variantStyles: Record<InformationBoxVariant, string> = {
  info: 'bg-surface-primary-light text-text-primary',
  success: 'bg-surface-success text-text-success',
  warning: 'bg-surface-warning text-text-warning',
  error: 'bg-surface-error text-text-error',
}

export default function InformationBox({
  children,
  icon,
  variant = 'info',
}: InformationBoxProps) {
  return (
    <div className={`flex gap-2 items-start px-4 py-3 rounded-lg ${variantStyles[variant]}`}>
      <span className="flex items-center justify-center size-5 shrink-0">
        {icon ?? <Info size={20} />}
      </span>
      <span className="text-base font-medium leading-6 tracking-[-0.16px]">
        {children}
      </span>
    </div>
  )
}

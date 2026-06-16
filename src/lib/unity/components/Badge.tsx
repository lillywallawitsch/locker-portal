export type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'neutral'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-button-primary text-text-inverted',
  success: 'bg-surface-success text-text-success',
  error: 'bg-surface-error text-text-error',
  warning: 'bg-surface-warning text-text-warning',
  neutral: 'bg-surface-secondary text-text-foreground',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-[10px] leading-[13px]',
  md: 'px-3 py-1.5 text-xs leading-4',
  lg: 'px-3.5 py-2 text-sm leading-5',
}

export default function Badge({ label, variant = 'primary', size = 'md' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-normal whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {label}
    </span>
  )
}

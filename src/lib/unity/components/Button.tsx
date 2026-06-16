import type { ReactNode, ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconOnly?: boolean
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-surface-primary text-text-button border-0',
  secondary: 'bg-surface-secondary text-text-foreground border-0',
  ghost: 'bg-transparent text-text-foreground hover:bg-surface-secondary border border-solid border-border-light',
  destructive: 'bg-surface-error text-text-error border-0',
  outline: 'bg-surface-input text-text-foreground border border-solid border-border-default',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-[30px] px-4 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly,
  children,
  className = '',
  ...props
}: ButtonProps) {
  if (iconOnly) {
    return (
      <button
        className={`flex items-center justify-center size-6 rounded-full bg-surface-secondary cursor-pointer border-0 shrink-0 hover:opacity-90 transition-opacity ${className}`}
        {...props}
      >
        {icon}
      </button>
    )
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-[-0.16px] leading-5 cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center size-5">{icon}</span>}
      {children}
    </button>
  )
}

import { type InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  inputSize?: 'md' | 'lg'
}

let inputIdCounter = 0

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, inputSize = 'lg', className = '', id, disabled, readOnly, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputId = id || `input-${++inputIdCounter}`
    const errorId = error ? `${inputId}-error` : undefined
    const isMuted = disabled || readOnly
    const hasValue =
      (props.value !== undefined && props.value !== '' && props.value !== null) ||
      (props.defaultValue !== undefined && props.defaultValue !== '')
    const showLabel = !!label && (hasValue || isFocused)
    const borderColor = error
      ? 'border-border-error'
      : isMuted
      ? 'border-border-default'
      : 'border-border-default focus-within:border-border-active'
    const bgClass = isMuted ? 'bg-surface-secondary' : 'bg-surface-input'
    const labelColor = isMuted ? 'text-text-muted' : 'text-text-label'
    const valueColor = isMuted ? 'text-text-muted' : 'text-text-foreground'

    const heightClass = inputSize === 'lg' ? 'h-[54px]' : 'h-12'
    const paddingClass = inputSize === 'lg' ? 'py-2' : 'py-1.5'
    const gapClass = inputSize === 'lg' ? 'gap-2' : 'gap-0.5'
    const floatingTextClass =
      inputSize === 'lg'
        ? 'text-base leading-5 tracking-[-0.16px]'
        : 'text-sm leading-[18px] tracking-[-0.14px]'
    const inputTextClass = showLabel
      ? floatingTextClass
      : 'text-base leading-5 tracking-[-0.16px]'

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div
          className={`${bgClass} border ${borderColor} rounded-lg flex items-center px-3 ${paddingClass} ${heightClass} transition-colors`}
        >
          <div className={`flex flex-col ${gapClass} justify-center flex-1 min-w-0`}>
            {showLabel && (
              <label htmlFor={inputId} className={`text-xs ${labelColor} leading-4 tracking-[-0.12px]`}>
                {label}
              </label>
            )}
            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              readOnly={readOnly}
              aria-invalid={error ? true : undefined}
              aria-describedby={errorId}
              aria-label={!showLabel && label ? label : undefined}
              onFocus={(e) => {
                setIsFocused(true)
                onFocus?.(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                onBlur?.(e)
              }}
              className={`w-full ${valueColor} bg-transparent outline-none placeholder:text-text-light ${inputTextClass} ${disabled ? 'cursor-not-allowed' : ''}`}
              {...props}
            />
          </div>
        </div>
        {error && (
          <span id={errorId} className="text-xs text-text-error leading-4" role="alert">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input

import { useCallback, useState, type MouseEvent } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  value: string
  ariaLabel?: string
  className?: string
}

export default function CopyButton({ value, ariaLabel = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
    },
    [value]
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center w-6 h-6 shrink-0 border border-border-default rounded-md bg-button-secondary text-text-foreground hover:border-border-primary transition-colors cursor-pointer ${className}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

import { useState } from 'react'
import { Info, Search, XCircle } from 'lucide-react'
import { Tooltip } from '../../unity'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  infoTooltip?: string
}

export default function SearchInput({
  placeholder = 'Search Lockers',
  value = '',
  onChange,
  className = 'w-[339px]',
  infoTooltip,
}: SearchInputProps) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className={`flex items-center gap-3 h-[38px] px-3 border border-border-default rounded-lg shadow-[0px_0px_0px_0px_var(--color-border-default)] ${className}`}>
      <Search size={20} aria-hidden="true" className="text-text-light shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 min-w-0 text-sm text-text-foreground tracking-[-0.14px] leading-[18px] bg-transparent border-none outline-none placeholder:text-text-light"
      />
      {value ? (
        <button
          onClick={() => onChange?.('')}
          aria-label="Clear search"
          className="p-0 border-0 bg-transparent cursor-pointer shrink-0"
        >
          <XCircle size={20} className="text-text-light" />
        </button>
      ) : infoTooltip ? (
        <div className="relative shrink-0">
          <button
            type="button"
            onMouseEnter={() => setInfoOpen(true)}
            onMouseLeave={() => setInfoOpen(false)}
            onFocus={() => setInfoOpen(true)}
            onBlur={() => setInfoOpen(false)}
            aria-label="Search help"
            className="flex items-center justify-center w-5 h-5 p-0 border-0 bg-transparent cursor-help text-text-light hover:text-text-foreground transition-colors"
          >
            <Info size={16} aria-hidden="true" />
          </button>
          {infoOpen && (
            <div className="absolute top-full right-0 mt-2 z-30 pointer-events-none">
              <Tooltip content={infoTooltip} position="bottom" />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

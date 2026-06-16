import { X } from 'lucide-react'

type FilterChipTone = 'default' | 'primary'

interface FilterChipProps {
  label: string
  onClick?: () => void
  onRemove?: () => void
  active?: boolean
  tone?: FilterChipTone
}

export default function FilterChip({
  label,
  onClick,
  onRemove,
  active = false,
  tone = 'default',
}: FilterChipProps) {
  const isPrimary = tone === 'primary' && !active

  return (
    <div
      className={`inline-flex items-center h-[30px] rounded-full border transition-colors ${
        active
          ? 'bg-surface-primary border-border-primary text-text-inverted'
          : isPrimary
          ? 'bg-surface-primary-light border-surface-primary-light text-text-primary hover:bg-surface-primary-light/80'
          : 'bg-surface-default border-border-filter text-text-foreground hover:bg-surface-secondary'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`pl-3 ${onRemove ? 'pr-1.5' : 'pr-3'} h-full bg-transparent border-0 cursor-pointer flex items-center`}
      >
        <span className="text-sm font-medium tracking-[-0.14px] leading-[18px] whitespace-nowrap">
          {label}
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${label}`}
          className={`flex items-center justify-center w-6 h-6 mr-1 rounded-full bg-transparent border-0 cursor-pointer ${
            active ? 'hover:bg-white/20' : isPrimary ? 'hover:bg-white/40' : 'hover:bg-surface-secondary'
          }`}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

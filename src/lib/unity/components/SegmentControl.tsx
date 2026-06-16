import type { ReactNode } from 'react'

export interface SegmentItem {
  key: string
  label?: string
  value?: string
  icon?: ReactNode
  ariaLabel?: string
}

interface SegmentControlProps {
  items: SegmentItem[]
  activeKey: string
  onChange?: (key: string) => void
}

export default function SegmentControl({ items, activeKey, onChange }: SegmentControlProps) {
  return (
    <div className="flex items-center p-0.5 bg-surface-secondary rounded-[10px]">
      {items.map((item) => {
        const active = item.key === activeKey
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange?.(item.key)}
            aria-label={item.ariaLabel ?? item.label}
            title={item.ariaLabel ?? item.label}
            className={`relative flex-1 flex gap-3 items-center justify-center px-4 py-2 rounded-md cursor-pointer transition-all ${
              active
                ? 'bg-surface-default shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] text-text-foreground'
                : 'bg-transparent text-text-light'
            }`}
          >
            <div className={`flex items-center gap-2 ${active ? 'text-text-foreground' : 'text-text-light'}`}>
              {item.icon && <span className="flex items-center shrink-0">{item.icon}</span>}
              {item.label && (
                <span className="text-sm leading-5 tracking-[-0.14px] font-medium whitespace-nowrap">{item.label}</span>
              )}
              {item.value && (
                <span className={`text-xs leading-4 tracking-[-0.12px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                  active
                    ? 'bg-surface-primary text-text-button'
                    : 'bg-border-default text-text-light'
                }`}>
                  {item.value}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

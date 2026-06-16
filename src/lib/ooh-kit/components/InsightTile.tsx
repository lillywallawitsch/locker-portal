import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Filter } from 'lucide-react'

export interface InsightItem {
  count: number
  label: string
}

interface InsightTileProps {
  title: string
  items: InsightItem[]
  onFilterClick?: () => void
  filterActive?: boolean
}

export default function InsightTile({
  title,
  items,
  onFilterClick,
  filterActive = false,
}: InsightTileProps) {
  const cardInteractive = !!onFilterClick
  const [cardHovered, setCardHovered] = useState(false)

  const showTopRightIcon = filterActive || cardHovered

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onFilterClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onFilterClick()
    }
  }

  return (
    <div
      role={cardInteractive ? 'button' : undefined}
      tabIndex={cardInteractive ? 0 : undefined}
      onClick={onFilterClick}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      aria-pressed={cardInteractive ? filterActive : undefined}
      className={`flex flex-col gap-6 p-6 flex-1 min-w-[260px] bg-surface-surface border rounded-[10px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 ${
        cardInteractive ? 'cursor-pointer' : ''
      } ${
        filterActive
          ? 'border-border-primary shadow-[0_0_0_1px_var(--color-border-primary)]'
          : `border-border-default ${
              cardInteractive
                ? 'hover:border-border-primary-light hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.03)]'
                : ''
            }`
      }`}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <p
          className={`text-lg font-semibold tracking-[-0.28px] leading-6 transition-colors ${
            filterActive ? 'text-text-primary' : 'text-text-foreground'
          }`}
        >
          {title}
        </p>
        <div
          aria-hidden="true"
          className={`flex items-center justify-center size-[30px] rounded border shrink-0 transition-opacity ${
            showTopRightIcon ? 'opacity-100' : 'opacity-0'
          } ${
            filterActive
              ? 'border-border-primary text-text-primary'
              : 'border-border-default text-text-light'
          }`}
        >
          <Filter size={16} />
        </div>
      </div>
      <div className="flex gap-6 items-start w-full">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1 flex-1 min-w-0">
            <span
              className={`text-xl font-semibold tracking-[-0.2px] leading-8 transition-colors ${
                filterActive ? 'text-text-primary' : 'text-text-foreground'
              }`}
            >
              {item.count}
            </span>
            <span className="text-sm text-text-light tracking-[-0.14px] leading-[18px] break-words">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

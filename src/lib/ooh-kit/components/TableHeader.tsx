import { ArrowDownNarrowWide, ArrowDownUp, ArrowUpNarrowWide } from 'lucide-react'

export type SortDirection = 'asc' | 'desc' | null

interface TableHeaderProps {
  label: string
  sortable?: boolean
  sortDirection?: SortDirection
  onSort?: () => void
  width?: string
}

export default function TableHeader({
  label,
  sortable = true,
  sortDirection = null,
  onSort,
  width,
}: TableHeaderProps) {
  const interactive = sortable && !!onSort
  const Icon =
    sortDirection === 'asc' ? ArrowUpNarrowWide
    : sortDirection === 'desc' ? ArrowDownNarrowWide
    : ArrowDownUp
  const iconColor =
    sortDirection ? 'text-text-foreground' : 'text-text-header'
  return (
    <th
      className={`bg-surface-card border-b border-border-default h-9 px-4 py-2 text-left ${width ?? ''}`}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onSort}
          className="flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer hover:text-text-foreground transition-colors"
        >
          <span className={`text-sm font-normal tracking-[-0.14px] whitespace-nowrap leading-[18px] ${sortDirection ? 'text-text-foreground' : 'text-text-header'}`}>
            {label}
          </span>
          <Icon size={12} className={iconColor} />
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-sm text-text-header font-normal tracking-[-0.14px] whitespace-nowrap leading-[18px]">
            {label}
          </span>
        </div>
      )}
    </th>
  )
}

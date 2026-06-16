import type { ReactNode } from 'react'

interface SelectTileProps {
  title: string
  subtitle?: ReactNode
  icon?: ReactNode
  selected?: boolean
  onClick?: () => void
}

export default function SelectTile({
  title,
  subtitle,
  icon,
  selected = false,
  onClick,
}: SelectTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-surface-default border ${selected ? 'border-[1.5px] border-border-active' : 'border border-border-default'} rounded-lg p-4 flex gap-4 items-start cursor-pointer shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)] overflow-hidden text-left transition-colors hover:bg-surface-muted w-full`}
    >
      {icon && <span className="flex items-center justify-center size-6 shrink-0">{icon}</span>}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-base text-text-foreground font-medium leading-6 tracking-[-0.16px]">
          {title}
        </span>
        {subtitle && (
          <span className="text-sm text-text-light leading-[14px] tracking-[0px]">
            {subtitle}
          </span>
        )}
      </div>
    </button>
  )
}

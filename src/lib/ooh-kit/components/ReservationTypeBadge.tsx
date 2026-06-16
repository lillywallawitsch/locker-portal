import type { ReservationType } from '../../../data/parcels'

export default function ReservationTypeBadge({ type }: { type: ReservationType }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 h-6 border border-border-default rounded-[10px] bg-surface-default whitespace-nowrap">
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px] text-text-foreground">
        {type}
      </span>
    </div>
  )
}

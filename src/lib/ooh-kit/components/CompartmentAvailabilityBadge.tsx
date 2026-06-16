import { PieChart } from 'lucide-react'

interface CompartmentAvailabilityBadgeProps {
  percent: number
}

export default function CompartmentAvailabilityBadge({ percent }: CompartmentAvailabilityBadgeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 h-6 border border-border-default rounded-[10px] bg-surface-default">
      <PieChart size={14} className="text-text-foreground shrink-0" />
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px] text-text-foreground whitespace-nowrap">
        {clamped} % Available
      </span>
    </div>
  )
}

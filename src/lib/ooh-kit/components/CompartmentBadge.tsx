import { PieChart } from 'lucide-react'

interface CompartmentBadgeProps {
  percentage: number
}

export default function CompartmentBadge({ percentage }: CompartmentBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 h-6 border border-border-default rounded-[10px] bg-surface-default">
      <PieChart size={14} className="text-text-foreground" />
      <span className="text-xs text-text-foreground font-medium tracking-[-0.14px] uppercase leading-[18px] whitespace-nowrap">
        {percentage} %
      </span>
    </div>
  )
}

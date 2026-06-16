import type { ShipmentType } from '../../../data/parcels'

const iconMap: Record<ShipmentType, string> = {
  'First Mile': '/icons/first-mile.svg',
  'Last Mile': '/icons/last-mile.svg',
  'Alternative Delivery': '/icons/last-mile.svg',
  Return: '/icons/last-mile.svg',
}

const labelMap: Record<ShipmentType, string> = {
  'First Mile': 'First Mile',
  'Last Mile': 'Last Mile',
  'Alternative Delivery': 'Alt. Delivery',
  Return: 'Return',
}

export default function ShipmentTypeBadge({ type }: { type: ShipmentType }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 h-6 border border-border-default rounded-[10px] bg-surface-default">
      <img src={iconMap[type]} alt="" className="w-3.5 h-3.5" />
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px] text-text-foreground whitespace-nowrap">
        {labelMap[type]}
      </span>
    </div>
  )
}

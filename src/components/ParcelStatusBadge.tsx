import { CheckCircle, AlertCircle } from 'lucide-react'
import type { ParcelStatus } from '../data/parcels'

type BadgeConfig = {
  icon?: typeof CheckCircle
  className: string
}

const config: Record<ParcelStatus, BadgeConfig> = {
  'Ready for Pickup': {
    className: 'bg-surface-primary-light border-border-primary text-text-primary',
  },
  Expected: {
    className: 'bg-surface-default border-border-default text-text-foreground',
  },
  Expired: {
    icon: AlertCircle,
    className: 'bg-surface-warning border-border-warning text-text-warning',
  },
  'Consignee Collected': {
    icon: CheckCircle,
    className: 'bg-surface-success border-border-success text-text-success',
  },
  'Courier Collected': {
    icon: CheckCircle,
    className: 'bg-surface-success border-border-success text-text-success',
  },
  'Booking Cancelled': {
    icon: AlertCircle,
    className: 'bg-surface-error border-border-error text-text-error',
  },
  'Booking Rejected': {
    icon: AlertCircle,
    className: 'bg-surface-error border-border-error text-text-error',
  },
}

export default function ParcelStatusBadge({ status }: { status: ParcelStatus }) {
  const { icon: Icon, className } = config[status]
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 h-6 border rounded-[10px] whitespace-nowrap ${className}`}>
      {Icon && <Icon size={16} />}
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px]">
        {status}
      </span>
    </div>
  )
}

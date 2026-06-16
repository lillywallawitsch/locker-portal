import { CheckCircle, AlertCircle } from 'lucide-react'
import type { ParcelStatus } from '../../../data/parcels'
import { formatSince } from './_formatSince'

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

interface ParcelStatusBadgeProps {
  status: ParcelStatus
  since?: string
  compartmentId?: string
}

function deriveLabel(status: ParcelStatus, compartmentId?: string): string {
  if (status === 'Ready for Pickup') {
    return 'In Locker'
  }
  if (status === 'Expired' && compartmentId) {
    return 'In Locker: Expired'
  }
  return status
}

export default function ParcelStatusBadge({ status, since, compartmentId }: ParcelStatusBadgeProps) {
  const { icon: Icon, className } = config[status]
  const label = deriveLabel(status, compartmentId)
  const tooltip = since ? `${label} since ${formatSince(since)}` : undefined
  return (
    <div
      title={tooltip}
      className={`inline-flex items-center gap-1 px-2 py-1 h-6 border rounded-[10px] whitespace-nowrap ${className}`}
    >
      {Icon && <Icon size={16} />}
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px]">
        {label}
      </span>
    </div>
  )
}

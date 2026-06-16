import { AlertCircle } from 'lucide-react'
import { formatSince } from './_formatSince'

export type StatusBadgeVariant =
  // Locker (carrier) statuses
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'decommissioned'
  // Compartment statuses
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'defective'

interface StatusBadgeProps {
  status: StatusBadgeVariant
  label?: string
  hideIcon?: boolean
  since?: string
}

const variants: Record<StatusBadgeVariant, string> = {
  active:
    'bg-surface-success border-border-success text-text-success',
  inactive:
    'bg-surface-bg border-border-default text-text-foreground',
  maintenance:
    'bg-surface-warning border-border-warning text-text-warning',
  decommissioned:
    'bg-surface-bg border-border-default text-text-foreground',
  available:
    'bg-surface-success border-border-success text-text-success',
  occupied:
    'bg-surface-primary-light border-border-primary-light text-text-primary',
  reserved:
    'bg-surface-secondary border-border-default text-text-foreground',
  defective:
    'bg-surface-error border-border-error text-text-error',
}

const defaultLabels: Record<StatusBadgeVariant, string> = {
  active: 'Active',
  inactive: 'Inactive',
  maintenance: 'Maintenance',
  decommissioned: 'Decommissioned',
  available: 'Ready for storage',
  occupied: 'Occupied',
  reserved: 'Reserved',
  defective: 'Defective',
}

const iconStatuses = new Set<StatusBadgeVariant>(['inactive', 'defective'])

const iconColorClass: Partial<Record<StatusBadgeVariant, string>> = {
  defective: 'text-text-error',
}

export default function StatusBadge({ status, label, hideIcon = false, since }: StatusBadgeProps) {
  const displayLabel = label ?? defaultLabels[status]
  const showIcon = !hideIcon && iconStatuses.has(status)
  const tooltip = since ? `${displayLabel} since ${formatSince(since)}` : undefined

  return (
    <div
      title={tooltip}
      className={`inline-flex items-center gap-1 px-2 py-1 h-6 border rounded-[10px] ${variants[status]}`}
    >
      {showIcon && (
        <AlertCircle size={16} className={iconColorClass[status] ?? 'text-text-foreground'} />
      )}
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px] whitespace-nowrap">
        {displayLabel}
      </span>
    </div>
  )
}

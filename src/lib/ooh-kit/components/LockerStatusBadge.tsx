import StatusBadge from './StatusBadge'
import type { StatusBadgeVariant } from './StatusBadge'
import { formatSince } from './_formatSince'

interface LockerStatusBadgeProps {
  status: StatusBadgeVariant
  label?: string
  since?: string
  hideIcon?: boolean
}

const statusVerb: Partial<Record<StatusBadgeVariant, string>> = {
  active: 'Active',
  inactive: 'Inactive',
  maintenance: 'In maintenance',
  decommissioned: 'Decommissioned',
}

export default function LockerStatusBadge({ status, label, since, hideIcon }: LockerStatusBadgeProps) {
  const tooltipText = since
    ? `${statusVerb[status] ?? label ?? status} since ${formatSince(since)}`
    : undefined

  return (
    <span title={tooltipText} className="inline-flex">
      <StatusBadge status={status} label={label} hideIcon={hideIcon} />
    </span>
  )
}

import { AlertCircle } from 'lucide-react'
import { formatSince } from './_formatSince'

export type UserStatus = 'Active' | 'Invitation Pending' | 'Invitation Expired' | 'Blocked'

const config: Record<UserStatus, { className: string; hasIcon?: boolean }> = {
  Active: {
    className: 'border-border-success bg-surface-success text-text-success',
  },
  Blocked: {
    className: 'border-border-error bg-surface-error text-text-error',
  },
  'Invitation Pending': {
    className: 'border-border-default bg-surface-bg text-text-foreground',
  },
  'Invitation Expired': {
    className: 'border-border-default bg-surface-bg text-text-foreground',
    hasIcon: true,
  },
}

interface UserStatusBadgeProps {
  status: UserStatus
  since?: string
}

export default function UserStatusBadge({ status, since }: UserStatusBadgeProps) {
  const { className, hasIcon } = config[status]
  const tooltip = since ? `${status} since ${formatSince(since)}` : undefined
  return (
    <span
      title={tooltip}
      className={`inline-flex items-center justify-center gap-1 h-6 px-2 py-1 rounded-[10px] border font-medium whitespace-nowrap text-xs tracking-[-0.14px] leading-[18px] uppercase ${className}`}
    >
      {hasIcon && <AlertCircle size={14} />}
      {status}
    </span>
  )
}

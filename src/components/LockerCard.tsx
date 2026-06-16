import { LockerStatusBadge, CompartmentBadge, ProviderLogo, Avatar } from '../lib/ooh-kit'
import type { Locker } from '../data/lockers'

interface LockerCardProps {
  locker: Locker
  onClick?: () => void
}

export default function LockerCard({ locker, onClick }: LockerCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2 p-4 bg-surface-card border border-border-default rounded-[10px] cursor-pointer hover:bg-surface-card-hover overflow-hidden"
    >
      {/* Provider icon + ID */}
      <div className="flex items-center gap-1.5 h-6">
        <ProviderLogo provider={locker.provider} size="sm" />
        <span className="text-xs text-text-light font-medium tracking-[-0.12px] leading-5 truncate min-w-0 flex-1">
          {locker.id}
        </span>
      </div>

      {/* Name + Address + Thumbnail */}
      <div className="flex gap-3 flex-1">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[18px] line-clamp-2">
            {locker.name}
          </span>
          <div className="flex flex-col text-sm text-text-light tracking-[-0.14px]">
            <span className="leading-[22px] truncate">{locker.street}</span>
            <span className="leading-[22px] truncate">{locker.city}</span>
          </div>
        </div>
        <Avatar type="locker" size="sm" status={locker.carrierStatus} />
      </div>

      {/* Divider + Badges */}
      <div className="flex flex-col gap-3">
        <div className="h-px w-full bg-border-default" />
        <div className="flex items-center justify-between">
          <CompartmentBadge percentage={locker.compartments} />
          <LockerStatusBadge status={locker.carrierStatus} since={locker.statusSince} />
        </div>
      </div>
    </div>
  )
}

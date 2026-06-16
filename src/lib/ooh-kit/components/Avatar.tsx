export type AvatarType = 'locker' | 'parcel' | 'user-initials' | 'user-profile'
export type LockerAvatarStatus = 'active' | 'maintenance' | 'inactive' | 'decommissioned'

interface AvatarProps {
  type: AvatarType
  size?: 'sm' | 'md'
  /** Carrier status indicator dot — only used when type is 'locker' */
  status?: LockerAvatarStatus
  /** Initials to display — only used when type is 'user-initials' */
  initials?: string
}

const statusDotMap: Record<string, string> = {
  active: '/avatars/dot-active.svg',
  maintenance: '/avatars/dot-maintenance.svg',
  inactive: '/avatars/dot-inactive.svg',
  decommissioned: '/avatars/dot-inactive.svg',
}

export default function Avatar({ type, size = 'md', status, initials = 'MH' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-[52px] h-[52px]'
  const isLocker = type === 'locker'
  const isParcel = type === 'parcel'
  const isUserInitials = type === 'user-initials'
  const isUserProfile = type === 'user-profile'

  const bgClass = isUserInitials || isUserProfile
    ? 'bg-text-light'
    : 'bg-surface-secondary'

  const dotSize = size === 'sm' ? 'w-3 h-3 -bottom-0.5 -right-0.5' : 'w-3.5 h-3.5 -bottom-0.5 -right-0.5'

  return (
    <div className={`${sizeClass} shrink-0 relative`}>
      <div className={`w-full h-full rounded-[10px] ${bgClass} overflow-hidden shadow-[0px_3px_6px_0px_rgba(0,0,0,0.07)] relative`}>
        {isLocker && (
          <img
            src="/avatars/locker.png"
            alt="Locker"
            className="absolute h-[184%] left-[-33%] top-[-8%] w-[184%] max-w-none"
          />
        )}

        {isParcel && (
          <img
            src="/avatars/parcel.png"
            alt="Parcel"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {isUserInitials && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white tracking-[-0.12px]">
              {initials}
            </span>
          </div>
        )}

        {isUserProfile && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/avatars/user-icon.svg"
              alt="User"
              className="w-4 h-4"
            />
          </div>
        )}
      </div>

      {isLocker && status && (
        <img
          src={statusDotMap[status]}
          alt={status}
          className={`absolute ${dotSize}`}
        />
      )}
    </div>
  )
}

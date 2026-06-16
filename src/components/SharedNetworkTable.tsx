import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Pagination, ProviderLogo, StatusBadge } from '../lib/ooh-kit'
import type { StatusBadgeVariant } from '../lib/ooh-kit'
import type {
  SharedInviteStatus,
  SharedNetworkInvite,
} from '../data/sharedNetwork'

interface SharedNetworkTableProps {
  invites: SharedNetworkInvite[]
  statuses: SharedInviteStatus[]
  onRowClick: (invite: SharedNetworkInvite) => void
}

function daysBetween(iso: string) {
  const d = new Date(iso).getTime()
  const now = Date.now()
  if (Number.isNaN(d)) return ''
  const days = Math.max(0, Math.floor((now - d) / 86_400_000))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

const statusLabel: Record<SharedInviteStatus, string> = {
  pending: 'Pending',
  declined: 'Declined',
  revoked: 'Revoked',
}

const statusVariant: Record<SharedInviteStatus, StatusBadgeVariant> = {
  pending: 'inactive',
  declined: 'inactive',
  revoked: 'decommissioned',
}

const cardShadow =
  'shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)]'

export default function SharedNetworkTable({
  invites,
  statuses,
  onRowClick,
}: SharedNetworkTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const rows = useMemo(() => {
    if (statuses.length === 0) return invites
    return invites.filter((i) => statuses.includes(i.status))
  }, [invites, statuses])

  const emptyMessage =
    invites.length === 0
      ? 'No invitations yet.'
      : 'No invitations match the selected filters.'

  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const page = Math.min(currentPage, totalPages)
  const paginated = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="flex flex-col gap-4">
      {paginated.length === 0 ? (
        <div className="border border-border-default rounded-lg bg-surface-default px-4 py-10 text-center">
          <span className="text-sm text-text-light tracking-[-0.14px]">{emptyMessage}</span>
        </div>
      ) : (
        <ul className="m-0 list-none p-0 flex flex-col gap-3">
          {paginated.map((invite) => {
            const isClickable = invite.status !== 'revoked'
            const inner = (
              <>
                <span className="flex items-center justify-center size-6 shrink-0 mt-0.5">
                  <ProviderLogo provider={invite.provider} />
                </span>
                <span className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-base text-text-foreground font-medium leading-6 tracking-[-0.16px] break-words">
                      {invite.ownedBy.name}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <StatusBadge
                        status={statusVariant[invite.status]}
                        label={statusLabel[invite.status]}
                        hideIcon={invite.status === 'declined'}
                        since={invite.statusChangedAt}
                      />
                      {isClickable && (
                        <ChevronRight
                          size={18}
                          className="text-text-light group-hover:text-text-foreground transition-colors"
                        />
                      )}
                    </span>
                  </span>
                  <span className="text-sm text-text-light leading-5 tracking-[-0.14px] break-words">
                    {invite.address.street} {invite.address.houseNumber}, {invite.address.postalCode} {invite.address.city}
                  </span>
                  <span className="text-sm text-text-light leading-5 tracking-[-0.14px]">
                    Updated {daysBetween(invite.statusChangedAt)}
                  </span>
                </span>
              </>
            )

            const baseClass = `bg-surface-default border border-border-default rounded-lg p-4 flex gap-4 items-start ${cardShadow} text-left transition-colors w-full`

            return (
              <li key={invite.id}>
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onRowClick(invite)}
                    className={`group ${baseClass} cursor-pointer hover:bg-surface-muted`}
                  >
                    {inner}
                  </button>
                ) : (
                  <div className={baseClass}>{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}

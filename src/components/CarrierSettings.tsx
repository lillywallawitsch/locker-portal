import { useEffect, useMemo, useState } from 'react'
import { Plus, ListFilter, RotateCcw } from 'lucide-react'
import {
  NavBreadcrumb,
  PageHeader,
  FilterButton,
} from '../lib/ooh-kit'
import { Button, Input, Toggle, SegmentControl, Toast } from '../lib/unity'
import type { SegmentItem } from '../lib/unity'
import type { Locker } from '../data/lockers'
import { getCarrierExpirySettings } from '../data/providerSettings'
import type { CarrierExpirySettings, ProviderExpiryRule } from '../data/providerSettings'
import { useOrg } from '../context/OrgContext'
import type { SharedInviteStatus, SharedNetworkInvite } from '../data/sharedNetwork'
import type { OutgoingShareStatus } from '../data/sharedLockers'
import SharedNetworkTable from './SharedNetworkTable'
import SharedByMeTable from './SharedByMeTable'
import AcceptSharedLockerInviteSidepanel from './AcceptSharedLockerInviteSidepanel'
import ShareLockerSidepanel from './ShareLockerSidepanel'

interface CarrierSettingsProps {
  navCollapsed?: boolean
  onNavToggle?: () => void
  carrierId: string
  onViewLocker: (locker: Locker) => void
}

type Direction = 'shared' | 'received'

export default function CarrierSettings({
  navCollapsed,
  onNavToggle,
  carrierId,
  onViewLocker,
}: CarrierSettingsProps) {
  const seed = useMemo(() => getCarrierExpirySettings(carrierId), [carrierId])
  const [settings, setSettings] = useState<CarrierExpirySettings>(seed)
  const [defaultDraft, setDefaultDraft] = useState<ProviderExpiryRule>(seed.default)
  const [applyInFlight, setApplyInFlight] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Shared Network state (merged in)
  const { sharedNetworkData, outgoingShares, acceptInvite, declineInvite, carrier } = useOrg()
  const [direction, setDirection] = useState<Direction>('shared')
  const [receivedStatuses, setReceivedStatuses] = useState<SharedInviteStatus[]>([])
  const [sharedStatuses, setSharedStatuses] = useState<OutgoingShareStatus[]>([])
  const [selectedInvite, setSelectedInvite] = useState<SharedNetworkInvite | null>(null)
  const [acceptToast, setAcceptToast] = useState<Locker | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareToast, setShareToast] = useState<{ lockerCount: number; carrierCount: number } | null>(null)

  // Reset when carrier switches
  useEffect(() => {
    setSettings(seed)
    setDefaultDraft(seed.default)
    setApplyInFlight(false)
    setDirection('shared')
    setReceivedStatuses([])
    setSharedStatuses([])
    setSelectedInvite(null)
  }, [seed])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  useEffect(() => {
    if (!acceptToast) return
    const timer = setTimeout(() => setAcceptToast(null), 5000)
    return () => clearTimeout(timer)
  }, [acceptToast])

  useEffect(() => {
    if (!shareToast) return
    const timer = setTimeout(() => setShareToast(null), 5000)
    return () => clearTimeout(timer)
  }, [shareToast])

  const isAtSeed =
    defaultDraft.firstMileHours === seed.default.firstMileHours &&
    defaultDraft.lastMileHours === seed.default.lastMileHours &&
    settings.default.firstMileHours === seed.default.firstMileHours &&
    settings.default.lastMileHours === seed.default.lastMileHours

  const handleResetDefault = () => {
    if (isAtSeed) return
    setSettings({ default: seed.default })
    setDefaultDraft(seed.default)
    setApplyInFlight(false)
    setToast(`Default expiry reset${applyInFlight ? ' and applied to in-flight bookings' : ''}.`)
  }

  // Shared network counts
  const receivedCounts = useMemo(() => {
    return sharedNetworkData.reduce(
      (acc, i) => {
        acc[i.status]++
        return acc
      },
      { pending: 0, declined: 0, revoked: 0 } as Record<SharedInviteStatus, number>,
    )
  }, [sharedNetworkData])

  const sharedCounts = useMemo(() => {
    return outgoingShares.reduce(
      (acc, i) => {
        acc[i.status]++
        return acc
      },
      { pending: 0, accepted: 0, declined: 0, revoked: 0 } as Record<OutgoingShareStatus, number>,
    )
  }, [outgoingShares])

  const directionSegments: SegmentItem[] = [
    { key: 'shared', label: `Shared by ${carrier.name}` },
    {
      key: 'received',
      label: 'Shared by other Carriers',
      value: receivedCounts.pending > 0 ? String(receivedCounts.pending) : undefined,
    },
  ]

  const sharedStatusOptions = [
    { value: 'pending', label: `Pending (${sharedCounts.pending})` },
    { value: 'accepted', label: `Accepted (${sharedCounts.accepted})` },
    { value: 'declined', label: `Declined (${sharedCounts.declined})` },
    { value: 'revoked', label: `Revoked (${sharedCounts.revoked})` },
  ]

  const receivedStatusOptions = [
    { value: 'pending', label: `Pending (${receivedCounts.pending})` },
    { value: 'declined', label: `Declined (${receivedCounts.declined})` },
    { value: 'revoked', label: `Revoked (${receivedCounts.revoked})` },
  ]

  return (
    <main className="flex-1 overflow-auto">
      {toast && <Toast>{toast}</Toast>}

      <div className="px-[18px] pt-[21px]">
        <NavBreadcrumb
          items={[{ label: 'Carrier Settings' }]}
          collapsed={navCollapsed}
          onToggle={onNavToggle}
        />
      </div>

      <div className="px-[18px] pt-[12px] pb-12">
        <PageHeader title="Carrier Settings" />

        <div className="mt-6 flex flex-col">
          {/* Parcel expiry */}
          <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10 py-8">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                  Parcel expiry
                </h2>
                <p className="text-sm text-text-light tracking-[-0.14px] leading-[22px] m-0">
                  How long parcels can sit in lockers before they're expired and a driver collection is triggered. Applied to all providers in your network.
                </p>
              </div>
              <span className="text-xs text-text-light tracking-[-0.12px]">
                Last edited {formatDate(settings.default.updatedAt)} by {settings.default.updatedBy}
              </span>
              <Button
                variant="secondary"
                size="md"
                icon={<RotateCcw size={16} />}
                onClick={handleResetDefault}
                disabled={isAtSeed}
                className={`self-start ${isAtSeed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Reset default
              </Button>
            </div>
            <div className="flex flex-col gap-5 max-w-[640px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First-mile expiry (hours)"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={String(defaultDraft.firstMileHours)}
                  onChange={(e) =>
                    setDefaultDraft((prev) => ({ ...prev, firstMileHours: Number(e.target.value) }))
                  }
                />
                <Input
                  label="Last-mile expiry (hours)"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={String(defaultDraft.lastMileHours)}
                  onChange={(e) =>
                    setDefaultDraft((prev) => ({ ...prev, lastMileHours: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-text-foreground tracking-[-0.14px]">
                    Apply changes to in-flight bookings
                  </span>
                  <span className="text-xs text-text-light tracking-[-0.12px] leading-4">
                    Re-time existing reservations and parcels in locker as well.
                  </span>
                </div>
                <Toggle checked={applyInFlight} onChange={setApplyInFlight} />
              </div>
            </div>
          </section>

          {/* Shared Network */}
          <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10 py-8 border-t border-border-default">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                  Shared Network
                </h2>
                <p className="text-sm text-text-light tracking-[-0.14px] leading-[22px] m-0">
                  Lockers shared between carriers. Manage outgoing share invites and respond to incoming ones.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<Plus size={16} />}
                onClick={() => setShareDialogOpen(true)}
                className="self-start"
              >
                Share Locker
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-fit">
                  <SegmentControl
                    items={directionSegments}
                    activeKey={direction}
                    onChange={(key) => setDirection(key as Direction)}
                  />
                </div>
                {direction === 'shared' ? (
                  <FilterButton
                    label="Status"
                    icon={<ListFilter size={16} />}
                    options={sharedStatusOptions}
                    selected={sharedStatuses}
                    onChange={(next) => setSharedStatuses(next as OutgoingShareStatus[])}
                  />
                ) : (
                  <FilterButton
                    label="Status"
                    icon={<ListFilter size={16} />}
                    options={receivedStatusOptions}
                    selected={receivedStatuses}
                    onChange={(next) => setReceivedStatuses(next as SharedInviteStatus[])}
                  />
                )}
              </div>

              {direction === 'shared' ? (
                <SharedByMeTable invites={outgoingShares} statuses={sharedStatuses} />
              ) : (
                <SharedNetworkTable
                  invites={sharedNetworkData}
                  statuses={receivedStatuses}
                  onRowClick={setSelectedInvite}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      <AcceptSharedLockerInviteSidepanel
        invite={selectedInvite}
        onClose={() => setSelectedInvite(null)}
        onAccept={(id, details) => {
          const newLocker = acceptInvite(id, details)
          setSelectedInvite(null)
          if (newLocker) setAcceptToast(newLocker)
        }}
        onDecline={(id) => {
          declineInvite(id)
          setSelectedInvite(null)
          setReceivedStatuses(['declined'])
        }}
      />

      {shareDialogOpen && (
        <ShareLockerSidepanel
          onClose={() => setShareDialogOpen(false)}
          onShared={(lockerCount, carrierCount) => {
            setShareToast({ lockerCount, carrierCount })
            setSharedStatuses(['pending'])
          }}
        />
      )}

      {acceptToast && (
        <Toast position="bottom-right" title="Locker was added to your Network">
          <button
            type="button"
            onClick={() => {
              onViewLocker(acceptToast)
              setAcceptToast(null)
            }}
            className="font-semibold text-text-success hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            {acceptToast.name}
          </button>{' '}
          is now listed in the Locker Overview and will be activated on {formatActivationDate(acceptToast.activationDate)}.
        </Toast>
      )}

      {shareToast && (
        <Toast
          position="bottom-right"
          title={`${shareToast.lockerCount} locker${shareToast.lockerCount === 1 ? '' : 's'} shared with ${shareToast.carrierCount} carrier${shareToast.carrierCount === 1 ? '' : 's'}`}
        >
          Each carrier still needs to accept the invitation. You can track them under the <strong>Pending</strong> tab.
        </Toast>
      )}
    </main>
  )
}


function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatActivationDate(iso: string) {
  const [y, m, day] = iso.split('-').map(Number)
  if (!y || !m || !day) return iso
  const d = new Date(y, m - 1, day)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

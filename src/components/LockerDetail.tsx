import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ChevronRight,
  Navigation,
  PieChart,
  Pencil,
  HelpCircle,
  AlertCircle,
  Package,
  Activity,
  Info,
  MessageCircle,
  Send,
} from 'lucide-react'
import {
  NavBreadcrumb,
  TableHeader,
  Avatar,
  StatusBadge,
  LockerStatusBadge,
  TableJourneyStep,
  ProviderLogo,
  Card,
  Field,
  LocationMap,
  OpeningHoursField,
  OpeningStatusBadge,
} from '../lib/ooh-kit'
import { Button, SegmentControl, Dialog, CopyButton, Toast } from '../lib/unity'
import type { SegmentItem } from '../lib/unity'
import type { Locker } from '../data/lockers'
import {
  getCompartmentsForLocker,
  getActivitiesForLocker,
  isLockerOffline,
  providerLabels,
  venueTypeLabels,
  placementLabels,
} from '../data/lockers'
import type { ParcelOverviewItem } from '../data/parcels'
import { ShipmentTypeBadge } from '../lib/ooh-kit'
import { formatAgeSince, formatAgeDuration, parseParcelTimestamp } from '../lib/ooh-kit/components/_formatDateTimeWithAge'
import type { SortDirection } from '../lib/ooh-kit'
import LastUpdatedButton from './LastUpdatedButton'
import EditLockerInformationSidepanel from './EditLockerInformationSidepanel'
import { useOrg } from '../context/OrgContext'
import { depotTerm, showOwnedBy, showHost } from '../lib/carrierConfig'
import type { OutgoingShareStatus } from '../data/sharedLockers'
import type { StatusBadgeVariant } from '../lib/ooh-kit'

interface LockerDetailProps {
  locker: Locker
  onBack: () => void
  onParcelClick?: (parcel: ParcelOverviewItem) => void
  navCollapsed?: boolean
  onNavToggle?: () => void
}

const shareStatusLabel: Record<OutgoingShareStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  revoked: 'Revoked',
}

const shareStatusVariant: Record<OutgoingShareStatus, StatusBadgeVariant> = {
  pending: 'inactive',
  accepted: 'active',
  declined: 'inactive',
  revoked: 'decommissioned',
}

// Indicative interior dimensions per compartment size (W × H × D, mm).
// Matches the realistic ranges used in the parcel `dimensions` mock pool.
const compartmentSizeDimensions: Record<string, string> = {
  Small: '250 × 80 × 400 mm',
  Medium: '350 × 180 × 400 mm',
  Large: '450 × 280 × 500 mm',
  'Extra Large': '600 × 380 × 500 mm',
}

export default function LockerDetail({ locker, onBack, onParcelClick, navCollapsed, onNavToggle }: LockerDetailProps) {
  const { outgoingShares, parcelData, carrier } = useOrg()

  const lockerShares = useMemo(
    () =>
      outgoingShares.filter(
        (s) => s.lockerId === locker.id && (s.status === 'pending' || s.status === 'accepted'),
      ),
    [outgoingShares, locker.id],
  )

  const isPreActivation = useMemo(() => {
    const [y, m, d] = locker.activationDate.split('-').map(Number)
    if (!y || !m || !d) return false
    const activation = new Date(y, m - 1, d)
    if (Number.isNaN(activation.getTime())) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activation.getTime() > today.getTime()
  }, [locker.activationDate])

  // Offline lockers (carrier- AND provider-inactive) hold no parcels and have
  // no compartment capacity, mirroring the "–" shown in the locker overview.
  const offline = isLockerOffline(locker)
  const noCompartmentData = isPreActivation || offline

  const compartments = useMemo(() => {
    if (noCompartmentData) return []
    return getCompartmentsForLocker(locker.id)
  }, [locker.id, noCompartmentData])
  const parcels = useMemo(
    () => (noCompartmentData ? [] : parcelData.filter((p) => p.assignedLocker === locker.id)),
    [parcelData, locker.id, noCompartmentData]
  )
  const activities = useMemo(
    () => (isPreActivation ? [] : getActivitiesForLocker(locker.id)),
    [locker.id, isPreActivation]
  )

  // Total — used by the sidebar "Compartments in Total" card.
  const total = compartments.length

  // Size breakdown
  const sizeBreakdown = {
    Small: compartments.filter((c) => c.size === 'S').length,
    Medium: compartments.filter((c) => c.size === 'M').length,
    Large: compartments.filter((c) => c.size === 'L').length,
    'Extra Large': compartments.filter((c) => c.size === 'XL').length,
  }

  // Sidepanel state
  const [editSidepanelOpen, setEditSidepanelOpen] = useState(false)
  const [openingHoursExpanded, setOpeningHoursExpanded] = useState(false)

  // Right panel tab state
  const [rightPanelTab, setRightPanelTab] = useState<'details' | 'help'>('details')

  // Help chat state
  type HelpMessage = { role: 'bot' | 'user'; text: string }
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>([
    { role: 'bot', text: "Hi! I can help with issues on this locker. What's going on?" },
  ])
  const [helpInput, setHelpInput] = useState('')
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false)
  const helpEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    helpEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [helpMessages])

  const sendHelpMessage = (text: string) => {
    if (!text.trim()) return
    setSuggestionsDismissed(true)
    setHelpMessages(prev => [...prev, { role: 'user', text }])
    setHelpInput('')
    const replies: Record<string, string> = {
      'Wrong compartment availability showing': "I'll raise a carrier issue for this locker. Can you confirm what the platform shows vs what you see physically at the locker?",
      'Locker appears offline or isn\'t responding': "I'll create a ticket to investigate the offline status. Is this affecting deposits, collections, or both?",
      'Request a data update for this locker': "Sure — what needs to be updated? For example: address, locker ID, or other details.",
    }
    const reply = replies[text] ?? "Thanks — I'll help you with that. Can you describe the issue in more detail?"
    setTimeout(() => {
      setHelpMessages(prev => [...prev, { role: 'bot', text: reply }])
    }, 600)
  }

  // Activation / Deactivation state
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [statusOverride, setStatusOverride] = useState<'active' | 'inactive' | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const effectiveStatus = statusOverride ?? (isPreActivation ? 'inactive' : locker.carrierStatus)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleDeactivate = () => {
    setDeactivateDialogOpen(false)
    setStatusOverride('inactive')
    setToastMessage(`${locker.name} has been deactivated successfully.`)
  }

  const handleActivate = () => {
    setActivateDialogOpen(false)
    setStatusOverride('active')
    setToastMessage(`${locker.name} has been activated successfully.`)
  }

  // Parcels tab state
  const [activeTab, setActiveTab] = useState('in-locker')

  // "In Locker" surface includes Expired parcels still physically inside a
  // compartment (compartmentId set). Historical Expired (driver already
  // collected — no compartmentId) are excluded.
  const isInLocker = (p: ParcelOverviewItem) =>
    p.status === 'Ready for Pickup' || (p.status === 'Expired' && !!p.compartmentId)
  const inLockerCount = parcels.filter(isInLocker).length
  const expectedCount = parcels.filter(p => p.status === 'Expected').length
  const collectedCount = parcels.filter(p => p.status === 'Consignee Collected' || p.status === 'Courier Collected').length
  const rejectedCount = parcels.filter(p => p.status === 'Booking Rejected').length
  const cancelledCount = parcels.filter(p => p.status === 'Booking Cancelled').length

  const segments: SegmentItem[] = isPreActivation
    ? [
        { key: 'in-locker', label: 'In Locker', value: '0' },
        { key: 'expected', label: 'Expected', value: '0' },
        { key: 'collected', label: 'Collected', value: '0' },
        { key: 'rejected', label: 'Rejected', value: '0' },
      ]
    : [
        { key: 'in-locker', label: 'In Locker', value: String(inLockerCount) },
        { key: 'expected', label: 'Expected', value: String(expectedCount) },
        { key: 'collected', label: 'Collected', value: String(collectedCount) },
        { key: 'rejected', label: 'Rejected', value: String(rejectedCount) },
        { key: 'cancelled', label: 'Cancelled', value: String(cancelledCount) },
      ]

  const filteredParcels = useMemo(() => {
    if (activeTab === 'in-locker') return parcels.filter(isInLocker)
    const statusMap: Record<string, string[]> = {
      'expected': ['Expected'],
      'collected': ['Consignee Collected', 'Courier Collected'],
      'rejected': ['Booking Rejected'],
      'cancelled': ['Booking Cancelled'],
    }
    const statuses = statusMap[activeTab]
    if (!statuses) return parcels
    return parcels.filter(p => statuses.includes(p.status))
  }, [parcels, activeTab])

  // Sort state for the parcels list. Reset whenever the tab changes since the
  // available columns differ between tabs.
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  useEffect(() => {
    setSortKey(null)
    setSortDirection(null)
  }, [activeTab])

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection('asc')
    } else if (sortDirection === 'asc') {
      setSortDirection('desc')
    } else {
      setSortKey(null)
      setSortDirection(null)
    }
  }

  const dateValue = (stamp: string | undefined): number =>
    parseParcelTimestamp(stamp)?.getTime() ?? 0

  const getSortValue = (parcel: ParcelOverviewItem, key: string): string | number => {
    switch (key) {
      case 'parcelId': return parcel.parcelId
      case 'shipmentType': return parcel.shipmentType
      case 'depositedAt': return dateValue(parcel.depositedAt)
      case 'expiresAt': return dateValue(parcel.expiresAt)
      case 'reservedAt': return dateValue(parcel.reservedAt)
      case 'collectedAt': return dateValue(parcel.collectedAt)
      case 'cancelledAt': return dateValue(parcel.cancelledAt)
      case 'rejectedAt': return dateValue(parcel.rejectedAt)
      default: return ''
    }
  }

  const sortedParcels = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredParcels
    const dir = sortDirection === 'asc' ? 1 : -1
    return [...filteredParcels].sort((a, b) => {
      const av = getSortValue(a, sortKey)
      const bv = getSortValue(b, sortKey)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredParcels, sortKey, sortDirection])

  return (
    <div className="flex-1 overflow-auto">
      <EditLockerInformationSidepanel
        open={editSidepanelOpen}
        onClose={() => setEditSidepanelOpen(false)}
        locker={locker}
        onDeactivate={effectiveStatus === 'active' ? () => setDeactivateDialogOpen(true) : undefined}
      />

      {/* Deactivate Confirmation Dialog */}
      {deactivateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeactivateDialogOpen(false)} />
          <div className="relative z-10 w-[90vw] max-w-[620px]">
            <Dialog
              title={`Deactivate ${locker.name}?`}
              onClose={() => setDeactivateDialogOpen(false)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setDeactivateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="destructive" size="md" onClick={handleDeactivate}>
                    Deactivate Locker
                  </Button>
                </>
              }
            >
              <p className="m-0">
                <strong className="text-text-foreground">Please Note:</strong> New bookings will be blocked until the locker is reactivated. Existing reservations can still be delivered, and parcels already in the locker can still be picked up.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {/* Activate Confirmation Dialog */}
      {activateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActivateDialogOpen(false)} />
          <div className="relative z-10 w-[90vw] max-w-[620px]">
            <Dialog
              title={`Activate ${locker.name}?`}
              onClose={() => setActivateDialogOpen(false)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setActivateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="primary" size="md" onClick={handleActivate}>
                    Activate Locker
                  </Button>
                </>
              }
            >
              <p className="m-0">
                New bookings and reservations will be accepted.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {toastMessage && <Toast>{toastMessage}</Toast>}

      {/* Breadcrumb */}
      <div className="px-4 pt-[18px]">
        <NavBreadcrumb
          items={[
            { label: 'Locker Overview', onClick: onBack },
            { label: locker.name },
          ]}
          collapsed={navCollapsed}
          onToggle={onNavToggle}
        />
      </div>

      {/* Page Header */}
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-3 py-2">
            {/* Locker avatar */}
            <Avatar type="locker" size="md" status={effectiveStatus} />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold leading-[26px] tracking-[-0.3px] text-text-foreground m-0">
                {locker.name}
              </h1>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">
                  ID: {locker.id}
                </span>
                <span className="text-xs text-text-light">·</span>
                <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">
                  {locker.street}, {locker.city}
                </span>
                <span className="text-xs text-text-light">·</span>
                <LastUpdatedButton />
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            icon={<Pencil size={16} />}
            onClick={() => setEditSidepanelOpen(true)}
          >
            {isPreActivation ? 'Edit Locker' : 'Edit Locker Information'}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="px-4 pt-[22px] pb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-[32px] w-full lg:w-auto">
            {/* Compartment Availability */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-col gap-[2px]">
                  <h2 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                    Compartment Availability
                  </h2>
                  <div className="flex gap-1 text-text-light">
                    <span className="text-sm tracking-[-0.14px] leading-[22px]">
                      Current availability and usage of all compartments in this Locker
                    </span>
                    <span className="text-xs tracking-[-0.12px] leading-5">·</span>
                    <span className="text-sm tracking-[-0.14px] leading-[22px]">
                      Updated hourly (last at 14:42)
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="md" icon={<PieChart size={16} />}>
                  Detailed Breakdown
                </Button>
              </div>
              {noCompartmentData ? (
                <EmptyStateCard
                  icon={<PieChart size={24} className="text-text-light" />}
                  title={offline ? 'No compartment data' : 'No Compartments yet'}
                  description={
                    offline
                      ? 'This locker is inactive on both the carrier and provider side, so it currently holds no parcels or compartment capacity.'
                      : 'This Locker has no compartment data until activation.'
                  }
                />
              ) : (() => {
                const total = compartments.length
                const availableCount = compartments.filter((c) => c.status === 'available').length
                const occupiedCount = compartments.filter((c) => c.status === 'occupied').length
                const reservedCount = compartments.filter((c) => c.status === 'reserved').length
                const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100))
                const availabilitySegments = [
                  { key: 'available', label: 'Available', count: availableCount, color: 'var(--color-availability-available)' },
                  { key: 'occupied', label: 'Occupied', count: occupiedCount, color: 'var(--color-availability-occupied)' },
                  { key: 'reserved', label: 'Reserved', count: reservedCount, color: 'var(--color-availability-reserved)' },
                ]
                return (
                  <div className="bg-surface-card border border-border-default rounded-[10px] p-6 flex flex-col gap-6">
                    <div className="flex h-5 gap-1 w-full">
                      {availabilitySegments.map((s) => (
                        s.count > 0 && (
                          <div
                            key={s.key}
                            className="h-full rounded-[4px]"
                            style={{ backgroundColor: s.color, flexGrow: s.count, flexBasis: 0 }}
                          />
                        )
                      ))}
                    </div>
                    <div className="flex gap-4 items-stretch">
                      {availabilitySegments.map((s) => (
                        <div
                          key={s.key}
                          className="flex-1 min-w-0 bg-surface-surface border border-border-default rounded-[10px] p-6 flex flex-col gap-6"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-4 h-4 rounded-[1px] shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="text-lg font-semibold tracking-[-0.28px] leading-6 text-text-foreground">
                              {s.label}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xl font-semibold tracking-[-0.2px] leading-8 text-text-foreground">
                              {pct(s.count)} %
                            </span>
                            <span className="text-sm leading-[18px] tracking-[-0.14px] text-text-light">
                              {s.count} of {total} Compartments
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Parcels Section */}
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                Parcels
              </h2>
              <div className="flex flex-col gap-[14px]">
                <SegmentControl
                  items={segments}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />
                {isPreActivation ? (
                  <EmptyStateCard
                    icon={<Package size={24} className="text-text-light" />}
                    title={
                      activeTab === 'in-locker'
                        ? 'No Parcels in Locker'
                        : activeTab === 'expected'
                        ? 'No Expected Parcels'
                        : activeTab === 'collected'
                        ? 'No Collected Parcels'
                        : 'No Rejected Parcels'
                    }
                    description="This Locker is currently empty."
                  />
                ) : (
                <div className="border border-border-default rounded-[10px] overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <TableHeader
                          label="Parcel ID"
                          width="w-[220px]"
                          sortDirection={sortKey === 'parcelId' ? sortDirection : null}
                          onSort={() => handleSort('parcelId')}
                        />
                        <TableHeader
                          label="Shipment Type"
                          width="w-[160px]"
                          sortDirection={sortKey === 'shipmentType' ? sortDirection : null}
                          onSort={() => handleSort('shipmentType')}
                        />
                        {activeTab === 'in-locker' && (
                          <>
                            <TableHeader
                              label="Deposited on"
                              width="w-[220px]"
                              sortDirection={sortKey === 'depositedAt' ? sortDirection : null}
                              onSort={() => handleSort('depositedAt')}
                            />
                            <TableHeader
                              label="Expires on"
                              width="w-[280px]"
                              sortDirection={sortKey === 'expiresAt' ? sortDirection : null}
                              onSort={() => handleSort('expiresAt')}
                            />
                          </>
                        )}
                        {activeTab === 'expected' && (
                          <>
                            <TableHeader
                              label="Reserved on"
                              width="w-[220px]"
                              sortDirection={sortKey === 'reservedAt' ? sortDirection : null}
                              onSort={() => handleSort('reservedAt')}
                            />
                            <TableHeader
                              label="Expires on"
                              width="w-[220px]"
                              sortDirection={sortKey === 'expiresAt' ? sortDirection : null}
                              onSort={() => handleSort('expiresAt')}
                            />
                          </>
                        )}
                        {activeTab === 'collected' && (
                          <TableHeader
                            label="Collected on"
                            width="w-[220px]"
                            sortDirection={sortKey === 'collectedAt' ? sortDirection : null}
                            onSort={() => handleSort('collectedAt')}
                          />
                        )}
                        {activeTab === 'cancelled' && (
                          <TableHeader
                            label="Cancelled on"
                            width="w-[220px]"
                            sortDirection={sortKey === 'cancelledAt' ? sortDirection : null}
                            onSort={() => handleSort('cancelledAt')}
                          />
                        )}
                        {activeTab === 'rejected' && (
                          <TableHeader
                            label="Rejected on"
                            width="w-[220px]"
                            sortDirection={sortKey === 'rejectedAt' ? sortDirection : null}
                            onSort={() => handleSort('rejectedAt')}
                          />
                        )}
                        <th className="bg-surface-card border-b border-border-default h-9 w-[59px]" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedParcels.map((parcel) => {
                        return (
                        <tr
                          key={parcel.parcelId}
                          className="group cursor-pointer"
                          onClick={() => onParcelClick?.(parcel)}
                        >
                          {/* Parcel ID with avatar */}
                          <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                            <div className="flex items-center gap-3">
                              <Avatar type="parcel" size="sm" />
                              <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[22px] truncate">
                                {parcel.parcelId}
                              </span>
                            </div>
                          </td>
                          {/* Shipment Type */}
                          <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                            <ShipmentTypeBadge type={parcel.shipmentType} />
                          </td>
                          {activeTab === 'in-locker' && (() => {
                            const depositedSince = formatAgeSince(parcel.depositedAt)
                            const isExpired = parcel.status === 'Expired'
                            const expiresAtDate = parseParcelTimestamp(parcel.expiresAt)
                            const now = Date.now()
                            const expiresDuration = expiresAtDate
                              ? formatAgeDuration(Math.abs(expiresAtDate.getTime() - now))
                              : null
                            return (
                              <>
                                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                                  <div className="flex flex-col">
                                    <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                      {parcel.depositedAt ?? '-'}
                                    </span>
                                    {depositedSince && (
                                      <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                                        In Locker since {depositedSince}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                      {parcel.expiresAt ?? '-'}
                                    </span>
                                    {expiresDuration && (
                                      isExpired ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-text-warning tracking-[-0.12px] leading-5">
                                          <AlertCircle size={12} aria-hidden="true" />
                                          Expired since {expiresDuration}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                                          Expires in {expiresDuration}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </td>
                              </>
                            )
                          })()}
                          {activeTab === 'expected' && (
                            <>
                              <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                                <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                  {parcel.reservedAt ?? '-'}
                                </span>
                              </td>
                              <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                                <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                  {parcel.expiresAt ?? '-'}
                                </span>
                              </td>
                            </>
                          )}
                          {activeTab === 'collected' && (
                            <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                {parcel.collectedAt ?? '-'}
                              </span>
                            </td>
                          )}
                          {activeTab === 'cancelled' && (
                            <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                {parcel.cancelledAt ?? '-'}
                              </span>
                            </td>
                          )}
                          {activeTab === 'rejected' && (
                            <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                {parcel.rejectedAt ?? '-'}
                              </span>
                            </td>
                          )}
                          {/* Chevron */}
                          <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                            <div className="flex items-center justify-center">
                              <ChevronRight size={20} className="text-text-light group-hover:text-text-foreground transition-colors" />
                            </div>
                          </td>
                        </tr>
                        )
                      })}
                      {sortedParcels.length === 0 && (
                        <tr>
                          <td colSpan={(activeTab === 'in-locker' || activeTab === 'expected') ? 5 : (activeTab === 'collected' || activeTab === 'cancelled' || activeTab === 'rejected') ? 4 : 3} className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-center">
                            <span className="text-sm text-text-light tracking-[-0.14px]">
                              No parcels found
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>

            {/* Last Activities */}
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                Last Activities
              </h2>
              {isPreActivation ? (
                <EmptyStateCard
                  icon={<Activity size={24} className="text-text-light" />}
                  title="No Activites tracked"
                  description="This Locker doesn't have any activity yet."
                />
              ) : (() => {
                const parcelActivities = activities
                  .filter((a) => a.category === 'parcel')
                  .slice(0, 5)
                return (
                <div className="flex flex-col gap-[14px]">
                  <div className="border border-border-default rounded-[10px] overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <TableHeader label="Event" />
                          <th className="bg-surface-card border-b border-border-default h-9" />
                        </tr>
                      </thead>
                      <tbody>
                        {parcelActivities.map((activity, i) => (
                          <tr key={activity.id}>
                            <td className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2">
                              <div className="flex items-center gap-3">
                                <TableJourneyStep step={activity.step} showConnectionLine={i > 0} />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-text-foreground tracking-[-0.14px] leading-[22px]">
                                    {activity.event}
                                  </span>
                                  {activity.detail && (
                                    <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                                      {activity.detail}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-right align-middle">
                              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                {activity.timestamp}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {parcelActivities.length === 0 && (
                          <tr>
                            <td colSpan={2} className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-center">
                              <span className="text-sm text-text-light tracking-[-0.14px]">
                                No parcel activities
                              </span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )
              })()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[301px] shrink-0 flex flex-col lg:sticky lg:top-4 lg:max-h-[calc(100vh-96px)]">

            {/* Tab bar */}
            <div className="flex border-b border-border-default shrink-0">
              <button
                onClick={() => setRightPanelTab('details')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium border-b-[3px] -mb-px transition-colors ${
                  rightPanelTab === 'details'
                    ? 'border-text-foreground text-text-foreground'
                    : 'border-transparent text-text-light hover:text-text-foreground'
                }`}
              >
                <Info size={14} />
                Details
              </button>
              <button
                onClick={() => setRightPanelTab('help')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium border-b-[3px] -mb-px transition-colors ${
                  rightPanelTab === 'help'
                    ? 'border-text-foreground text-text-foreground'
                    : 'border-transparent text-text-light hover:text-text-foreground'
                }`}
              >
                <MessageCircle size={14} />
                Help
              </button>
            </div>

            {/* Details panel */}
            {rightPanelTab === 'details' && (
              <div className="flex flex-col gap-8 pt-6 overflow-y-auto">
            {/* Carrier */}
            <Card
              title="Carrier"
              headerRight={<LockerStatusBadge status={effectiveStatus} since={locker.statusSince} />}
            >
              <Field
                label="Carrier Locker ID"
                trailing={<CopyButton value={locker.id} ariaLabel="Copy locker ID" />}
              >
                <span className="break-all">{locker.id}</span>
              </Field>
              <Field label={depotTerm(carrier.id)}>{locker.depot || '—'}</Field>
              <Field label="Region">{locker.region || '—'}</Field>
              <Field label="Activation Date">{formatActivationDate(locker.activationDate)}</Field>
              {showOwnedBy(carrier.id) && (
                <Field label="Owned by">{locker.ownedBy || '—'}</Field>
              )}
              {locker.ownership === 'owned' && lockerShares.length > 0 && (
                <Field label="Shared with">
                  <div className="flex flex-col gap-2">
                    {lockerShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between gap-3">
                        <span className="truncate">{share.invitedCarrier.name}</span>
                        <StatusBadge
                          status={shareStatusVariant[share.status]}
                          label={shareStatusLabel[share.status]}
                          hideIcon
                          since={share.statusChangedAt}
                        />
                      </div>
                    ))}
                  </div>
                </Field>
              )}
              {effectiveStatus === 'active' && (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => setDeactivateDialogOpen(true)}
                >
                  Deactivate Locker
                </Button>
              )}
              {effectiveStatus === 'inactive' && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setActivateDialogOpen(true)}
                >
                  Activate Locker
                </Button>
              )}
            </Card>

            {/* Provider */}
            <Card
              title="Provider"
              headerRight={<StatusBadge status={locker.providerStatus} />}
            >
              <Field
                label="Provider Locker ID"
                trailing={
                  locker.providerLockerId ? (
                    <CopyButton value={locker.providerLockerId} ariaLabel="Copy provider locker ID" />
                  ) : undefined
                }
              >
                <span className="break-all">{locker.providerLockerId || '—'}</span>
              </Field>
              <Field label="Provider Name">
                <span className="inline-flex items-center gap-1.5">
                  <ProviderLogo provider={locker.provider} size="sm" />
                  {providerLabels[locker.provider]}
                </span>
              </Field>
              <Field label="Locker Model">{locker.providerLockerModel || '—'}</Field>
              <Field label="Locker Version">{locker.providerLockerVersion || '—'}</Field>
            </Card>

            {/* Location */}
            <Card
              title="Location"
              headerRight={<OpeningStatusBadge hours={locker.openingHours} />}
            >
              <LocationMap
                latitude={locker.latitude}
                longitude={locker.longitude}
                href={`https://www.google.com/maps?q=${locker.latitude},${locker.longitude}`}
              />
              <Field
                label="Address"
                trailing={
                  <a
                    href={`https://www.google.com/maps?q=${locker.latitude},${locker.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in Google Maps"
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-transparent border-0 hover:bg-surface-secondary"
                  >
                    <Navigation size={16} className="text-text-foreground" />
                  </a>
                }
              >
                <div className="flex flex-col">
                  <span>{locker.street}</span>
                  <span className="text-text-light font-normal">{locker.city}</span>
                </div>
              </Field>
              {showHost(carrier.id) && (
                <Field label="Host">
                  {locker.host
                    ? `${venueTypeLabels[locker.venueType]}, ${locker.host}`
                    : venueTypeLabels[locker.venueType]}
                </Field>
              )}
              <Field label="Positioning">{placementLabels[locker.placement]}</Field>
              <OpeningHoursField
                hours={locker.openingHours}
                expanded={openingHoursExpanded}
                onToggle={() => setOpeningHoursExpanded((v) => !v)}
              />
            </Card>

            {/* Compartment Card */}
            <Card
              title="Compartments"
              headerRight={
                <span
                  title={`${total} compartments in total`}
                  className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full border border-border-default bg-surface-card text-xs font-medium tracking-[-0.14px] text-text-foreground"
                >
                  {total}
                </span>
              }
            >
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(sizeBreakdown).map(([label, count]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-3 p-3 bg-surface-secondary rounded-xl"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-text-light tracking-[-0.14px]">
                        {label}
                      </span>
                      <span
                        title={compartmentSizeDimensions[label]}
                        className="flex items-center"
                      >
                        <HelpCircle size={14} className="text-text-light shrink-0" />
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-text-foreground tracking-[-0.2px] leading-7">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
              </div>
            )}

            {/* Help panel */}
            {rightPanelTab === 'help' && (
              <div className="flex flex-col flex-1 min-h-[480px] lg:min-h-0 overflow-hidden">

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {helpMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`text-sm leading-[1.6] px-3.5 py-2.5 rounded-xl max-w-[92%] ${
                        msg.role === 'bot'
                          ? 'bg-surface-secondary text-text-foreground self-start rounded-tl-sm'
                          : 'bg-surface-primary text-white self-end rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}

                  {/* Suggestion buttons */}
                  {!suggestionsDismissed && (
                    <div className="flex flex-col gap-2 mt-1">
                      {[
                        'Wrong compartment availability showing',
                        'Locker appears offline or isn\'t responding',
                        'Request a data update for this locker',
                      ].map((s) => (
                        <button
                          key={s}
                          onClick={() => sendHelpMessage(s)}
                          className="text-left text-sm text-text-foreground border border-border-default rounded-lg px-3.5 py-2.5 bg-surface-card hover:bg-surface-secondary transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={helpEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-border-default p-3 flex gap-2">
                  <input
                    type="text"
                    value={helpInput}
                    onChange={e => setHelpInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendHelpMessage(helpInput) }}
                    placeholder="Type your question…"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-border-default bg-surface-card text-text-foreground placeholder:text-text-light focus:outline-none focus:border-border-active"
                  />
                  <button
                    onClick={() => sendHelpMessage(helpInput)}
                    disabled={!helpInput.trim()}
                    aria-label="Send"
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-border-default bg-surface-card hover:bg-surface-secondary disabled:opacity-40 transition-colors"
                  >
                    <Send size={15} className="text-text-foreground" />
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function formatActivationDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function EmptyStateCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border border-border-default rounded-[10px] bg-surface-card px-6 py-12 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-1 max-w-[320px]">
        <span className="text-base font-semibold text-text-foreground tracking-[-0.16px] leading-6">
          {title}
        </span>
        <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">
          {description}
        </span>
      </div>
    </div>
  )
}


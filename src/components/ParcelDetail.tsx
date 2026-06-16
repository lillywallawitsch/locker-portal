import { useMemo, useState, useEffect, useRef } from 'react'
import {
  QrCode,
  CheckCircle,
  AlertCircle,
  XCircle,
  PackageCheck,
  RotateCcw,
  Info,
  MessageCircle,
  Send,
} from 'lucide-react'
import {
  NavBreadcrumb,
  Avatar,
  TableHeader,
  TableJourneyStep,
  Field,
} from '../lib/ooh-kit'
import { Button, Dialog, Radio, CopyButton, Toast } from '../lib/unity'
import type { ParcelOverviewItem, ParcelStatus, ShipmentType } from '../data/parcels'
import type { ParcelJourneyEvent } from '../data/parcels'
import { getJourneyForParcel } from '../data/parcels'
import { formatAgeSince } from '../lib/ooh-kit/components/_formatDateTimeWithAge'
import { ParcelStatusBadge } from '../lib/ooh-kit'
import type { JourneyStep } from '../data/lockers'
import CompartmentCodeDialog from './CompartmentCodeDialog'
import ActionMenu from './ActionMenu'
import LastUpdatedButton from './LastUpdatedButton'
import type { ActionMenuItem } from './ActionMenu'

interface ParcelDetailProps {
  parcel: ParcelOverviewItem
  onBack: () => void
  onLockerClick?: () => void
  navCollapsed?: boolean
  onNavToggle?: () => void
  breadcrumbBase: string
}

type ManualTransitionKind =
  | 'in_locker'
  | 'expired'
  | 'collected_consignee'
  | 'collected_courier'
  | 'cancelled'
  | 'expected'

type ManualTransition = {
  id: string
  kind: ManualTransitionKind
  timestamp: string
}

type PendingAction = 'in_locker' | 'expired' | 'collected' | 'cancelled' | 'expected' | null

const transitionToStatus: Record<ManualTransitionKind, ParcelStatus> = {
  in_locker: 'Ready for Pickup',
  expired: 'Expired',
  collected_consignee: 'Consignee Collected',
  collected_courier: 'Courier Collected',
  cancelled: 'Booking Cancelled',
  expected: 'Expected',
}

const rightNowByStatus: Partial<Record<ParcelStatus, string>> = {
  Expected: 'Parcel is waiting to be delivered to Locker',
  'Ready for Pickup': 'Parcel waiting to be picked up by Consignee',
  Expired: 'Parcel waiting to be picked up by Consignee or Courier',
}

function transitionMeta(kind: ManualTransitionKind): {
  event: string
  description: string
  step: JourneyStep
} {
  switch (kind) {
    case 'in_locker':
      return {
        event: 'Manually marked as Ready for Pickup',
        description: 'The Carrier has manually marked the parcel as deposited in the locker.',
        step: 'Warning',
      }
    case 'expired':
      return {
        event: 'Manually marked as Expired',
        description:
          'The Carrier has expired the parcel and triggered a driver collection event.',
        step: 'Warning',
      }
    case 'collected_consignee':
      return {
        event: 'Manually marked as Collected',
        description: 'The Carrier has marked the parcel as collected by the consignee.',
        step: 'Success',
      }
    case 'collected_courier':
      return {
        event: 'Manually marked as Collected',
        description: 'The Carrier has marked the parcel as collected by the driver.',
        step: 'Success',
      }
    case 'cancelled':
      return {
        event: 'Booking Cancelled',
        description: 'The Carrier has cancelled the booking.',
        step: 'Error',
      }
    case 'expected':
      return {
        event: 'Manually reverted to Expected',
        description: 'The Carrier has reverted the parcel back to Expected.',
        step: 'Pending',
      }
  }
}

function actionsForStatus(status: ParcelStatus): PendingAction[] {
  switch (status) {
    case 'Expected':
      return ['in_locker', 'collected', 'cancelled']
    case 'Ready for Pickup':
      return ['collected', 'expired', 'cancelled']
    case 'Consignee Collected':
    case 'Courier Collected':
      return ['in_locker', 'expired', 'expected', 'cancelled']
    case 'Expired':
      return ['collected', 'expected', 'cancelled']
    case 'Booking Cancelled':
    case 'Booking Rejected':
      return []
    default:
      return []
  }
}

const actionLabels: Record<Exclude<PendingAction, null>, string> = {
  in_locker: 'Mark as Ready for Pickup',
  collected: 'Mark as Collected',
  expired: 'Mark as Expired',
  expected: 'Mark as Expected',
  cancelled: 'Cancel Booking',
}

const shipmentTypeIcon: Record<ShipmentType, string> = {
  'First Mile': '/icons/first-mile.svg',
  'Last Mile': '/icons/last-mile.svg',
  'Alternative Delivery': '/icons/last-mile.svg',
  Return: '/icons/last-mile.svg',
}

const shipmentTypeLabel: Record<ShipmentType, string> = {
  'First Mile': 'First Mile',
  'Last Mile': 'Last Mile',
  'Alternative Delivery': 'Alternative Delivery',
  Return: 'Return',
}

export default function ParcelDetail({
  parcel,
  onBack,
  onLockerClick,
  navCollapsed,
  onNavToggle,
  breadcrumbBase,
}: ParcelDetailProps) {
  const baseJourney = useMemo(() => getJourneyForParcel(parcel), [parcel])
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)

  // Right panel tab state
  const [rightPanelTab, setRightPanelTab] = useState<'details' | 'help'>('details')

  // Help chat state
  type HelpMessage = { role: 'bot' | 'user'; text: string }
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>([
    { role: 'bot', text: "Hi! I can help with issues on this parcel. What's going on?" },
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
      'Parcel is stuck — driver or consignee can\'t collect': "I'll create a carrier issue ticket for this. Is the compartment door not opening, or is there a code or screen error?",
      'Pickup code not working': "I'll look into this. Is the code being rejected entirely, or is it accepted but the compartment won't open?",
      'Cancel this booking': "I'll raise a cancellation request for this parcel. Can you confirm this is the correct parcel ID before I proceed?",
    }
    const reply = replies[text] ?? "Thanks — I'll help you with that. Can you describe the issue in more detail?"
    setTimeout(() => {
      setHelpMessages(prev => [...prev, { role: 'bot', text: reply }])
    }, 600)
  }
  const [transitions, setTransitions] = useState<ManualTransition[]>([])
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [collectChoice, setCollectChoice] = useState<'consignee' | 'driver' | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const lastTransition = transitions[transitions.length - 1]
  const effectiveStatus: ParcelStatus = lastTransition
    ? transitionToStatus[lastTransition.kind]
    : parcel.status

  // Only Last Mile parcels can be expired — other shipment types stay with the
  // driver and don't follow the consignee-pickup deadline that Expired implies.
  const availableActions = actionsForStatus(effectiveStatus).filter(
    (a) => a !== 'expired' || parcel.shipmentType === 'Last Mile',
  )
  const canEdit = availableActions.length > 0

  const applyTransition = (kind: ManualTransitionKind, toastLabel: string) => {
    setTransitions((prev) => [
      ...prev,
      { id: `MT-${Date.now()}-${prev.length}`, kind, timestamp: new Date().toISOString() },
    ])
    setToastMessage(toastLabel)
    setPendingAction(null)
    setCollectChoice(null)
  }

  const handleConfirm = () => {
    if (pendingAction === 'in_locker') {
      applyTransition('in_locker', `${parcel.parcelId} has been marked as Ready for Pickup.`)
    } else if (pendingAction === 'expired') {
      applyTransition(
        'expired',
        `${parcel.parcelId} has been expired and a driver collection event was triggered.`,
      )
    } else if (pendingAction === 'expected') {
      applyTransition('expected', `${parcel.parcelId} has been reverted to Expected.`)
    } else if (pendingAction === 'cancelled') {
      applyTransition('cancelled', `Booking for ${parcel.parcelId} has been cancelled.`)
    } else if (pendingAction === 'collected') {
      if (!collectChoice) return
      const kind: ManualTransitionKind =
        collectChoice === 'consignee' ? 'collected_consignee' : 'collected_courier'
      const label = collectChoice === 'consignee' ? 'Consignee' : 'Driver'
      applyTransition(kind, `${parcel.parcelId} has been marked as collected by ${label}.`)
    }
  }

  // Build journey from transitions + filtered base
  const journey: ParcelJourneyEvent[] = useMemo(() => {
    if (transitions.length === 0) return baseJourney

    const events: ParcelJourneyEvent[] = []

    const isDriverPickup =
      parcel.shipmentType === 'Return' ||
      parcel.shipmentType === 'Alternative Delivery' ||
      parcel.shipmentType === 'First Mile'
    let rightNowText = rightNowByStatus[effectiveStatus]
    if (rightNowText === 'Parcel waiting to be picked up by Consignee' && isDriverPickup) {
      rightNowText = 'Parcel waiting to be picked up by Driver'
    }
    if (rightNowText) {
      let description: string | undefined
      if (parcel.compartmentId) {
        const inLockerSince = formatAgeSince(parcel.depositedAt)
        const expiredSince =
          effectiveStatus === 'Expired' ? formatAgeSince(parcel.expiresAt) : null
        if (inLockerSince && expiredSince) {
          description = `In Locker since ${inLockerSince} (Expired since ${expiredSince})`
        } else if (inLockerSince) {
          description = `In Locker since ${inLockerSince}`
        }
      }
      events.push({
        id: 'current-right-now',
        event: rightNowText,
        description,
        step: 'Right Now',
      })
    }

    for (let i = transitions.length - 1; i >= 0; i--) {
      const t = transitions[i]
      const meta = transitionMeta(t.kind)
      events.push({
        id: t.id,
        event: meta.event,
        description: meta.description,
        step: meta.step,
        timestamp: 'Just now',
      })
    }

    events.push(...baseJourney.filter((e) => e.step !== 'Right Now'))
    return events
  }, [baseJourney, transitions, effectiveStatus])

  const tabMode =
    parcel.status === 'Expired'
      ? ('both' as const)
      : parcel.shipmentType === 'First Mile'
        ? ('consignee-only' as const)
        : ('courier-only' as const)

  // Build menu items for the latest event
  const menuItems: ActionMenuItem[] = availableActions.map((action) => {
    if (action === null) return null as never
    const item: ActionMenuItem = {
      key: action,
      label: actionLabels[action],
      icon: actionIcon(action),
      destructive: action === 'cancelled',
      onClick: () => setPendingAction(action),
    }
    return item
  })

  return (
    <div className="flex-1 overflow-auto">
      <CompartmentCodeDialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        parcelId={parcel.parcelId}
        tabMode={tabMode}
      />
      {/* Mark as Ready for Pickup */}
      {pendingAction === 'in_locker' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingAction(null)} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title="Mark Parcel as Ready for Pickup?"
              onClose={() => setPendingAction(null)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setPendingAction(null)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="primary" size="md" onClick={handleConfirm}>
                    Mark as Ready for Pickup
                  </Button>
                </>
              }
            >
              <p className="m-0">
                This sets <strong className="text-text-foreground">{parcel.parcelId}</strong> to{' '}
                <strong className="text-text-foreground">Ready for Pickup</strong>. Use this when the
                parcel is physically in a compartment but the provider event is missing or stale.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {/* Mark as Expired */}
      {pendingAction === 'expired' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingAction(null)} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title="Expire parcel and notify driver?"
              onClose={() => setPendingAction(null)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setPendingAction(null)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="destructive" size="md" onClick={handleConfirm}>
                    Expire and notify driver
                  </Button>
                </>
              }
            >
              <p className="m-0">
                Expiring <strong className="text-text-foreground">{parcel.parcelId}</strong> will
                trigger a driver collection event. The consignee will no longer be able to pick this
                parcel up.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {/* Mark as Expected */}
      {pendingAction === 'expected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingAction(null)} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title="Revert to Expected?"
              onClose={() => setPendingAction(null)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setPendingAction(null)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="primary" size="md" onClick={handleConfirm}>
                    Revert to Expected
                  </Button>
                </>
              }
            >
              <p className="m-0">
                This reverts <strong className="text-text-foreground">{parcel.parcelId}</strong>{' '}
                back to <strong className="text-text-foreground">Expected</strong>. Use this only to
                correct a mistaken state change.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {/* Cancel Booking */}
      {pendingAction === 'cancelled' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingAction(null)} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title="Cancel Booking?"
              onClose={() => setPendingAction(null)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setPendingAction(null)}>
                    Keep Booking
                  </Button>
                  <div className="flex-1" />
                  <Button variant="destructive" size="md" onClick={handleConfirm}>
                    Cancel Booking
                  </Button>
                </>
              }
            >
              <div className="flex flex-col">
                <p className="m-0">
                  This will cancel the booking for{' '}
                  <strong className="text-text-foreground">{parcel.parcelId}</strong> and cannot be
                  undone.
                </p>
                <p className="m-0 mt-4">
                  <strong className="text-text-foreground">Note:</strong> It may take a few minutes
                  for this change to appear in the Parcel Journey.
                </p>
              </div>
            </Dialog>
          </div>
        </div>
      )}

      {/* Mark as Collected — radio (consignee / driver) */}
      {pendingAction === 'collected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setPendingAction(null); setCollectChoice(null) }} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title="Mark Parcel as Collected?"
              onClose={() => { setPendingAction(null); setCollectChoice(null) }}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => { setPendingAction(null); setCollectChoice(null) }}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant={collectChoice ? 'primary' : 'secondary'}
                    size="md"
                    onClick={handleConfirm}
                    disabled={!collectChoice}
                    className={!collectChoice ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Mark as Collected
                  </Button>
                </>
              }
            >
              <div className="flex flex-col gap-2">
                <p className="m-0">
                  This will update <strong className="text-text-foreground">{parcel.parcelId}</strong> to "Collected".
                </p>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-medium">Confirm who collected the parcel:</span>
                  <div className="flex flex-col gap-2 mt-1">
                    <Radio
                      label="Collected by Consignee"
                      name="collector"
                      value="consignee"
                      checked={collectChoice === 'consignee'}
                      onChange={() => setCollectChoice('consignee')}
                    />
                    <Radio
                      label="Collected by Driver"
                      name="collector"
                      value="driver"
                      checked={collectChoice === 'driver'}
                      onChange={() => setCollectChoice('driver')}
                    />
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      )}

      {toastMessage && <Toast>{toastMessage}</Toast>}

      {/* Breadcrumb */}
      <div className="px-4 pt-[18px]">
        <NavBreadcrumb
          items={[
            { label: breadcrumbBase, onClick: onBack },
            { label: parcel.parcelId },
          ]}
          collapsed={navCollapsed}
          onToggle={onNavToggle}
        />
      </div>

      {/* Page Header */}
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-3 py-2">
            <Avatar type="parcel" size="md" />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold leading-[26px] tracking-[-0.3px] text-text-foreground m-0">
                {parcel.parcelId}
              </h1>
              <div className="flex items-center gap-1 flex-wrap">
                <ParcelStatusBadge
                  status={effectiveStatus}
                  since={lastTransition?.timestamp ?? parcel.lastActivity}
                  compartmentId={parcel.compartmentId}
                />
                <span className="text-xs text-text-light">·</span>
                <LastUpdatedButton />
              </div>
            </div>
          </div>
          {(effectiveStatus === 'Ready for Pickup' || effectiveStatus === 'Expired') && (
            <Button
              variant="secondary"
              size="md"
              icon={<QrCode size={16} />}
              onClick={() => setCodeDialogOpen(true)}
            >
              Show Compartment Code
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="px-4 pt-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Main Content — Parcel Journey */}
          <div className="flex-1 min-w-0 w-full lg:w-auto lg:pr-4">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                Parcel Journey
              </h2>
              <div className="border border-border-default rounded-[10px] overflow-visible">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TableHeader label="Event" />
                      <th className="bg-surface-card border-b border-border-default h-9" />
                    </tr>
                  </thead>
                  <tbody>
                    {journey.map((event, i) => (
                      <tr key={event.id}>
                        <td className="bg-surface-card border-b border-border-light px-4 py-3 align-middle">
                          <div className="flex items-stretch gap-3 min-h-[38px]">
                            <div className="relative flex-shrink-0 w-8 self-stretch flex items-center justify-center">
                              {/* Lines extend into the cell's py-3 padding so they
                                  span the full row height and meet the next row's
                                  line at the cell border. */}
                              {i > 0 && (
                                <div className="absolute -top-3 bottom-1/2 left-1/2 -translate-x-1/2 w-px bg-border-default" />
                              )}
                              {i < journey.length - 1 && (
                                <div className="absolute top-1/2 -bottom-3 left-1/2 -translate-x-1/2 w-px bg-border-default" />
                              )}
                              <TableJourneyStep step={event.step} showConnectionLine={false} />
                            </div>
                            <div className="flex flex-col justify-center min-w-0 gap-0.5">
                              <span className="text-sm font-medium text-text-foreground tracking-[-0.14px] leading-[22px]">
                                {event.event}
                              </span>
                              {event.description && (
                                <span
                                  className={`text-xs tracking-[-0.12px] leading-[18px] ${
                                    event.step === 'Error'
                                      ? 'text-text-error'
                                      : event.step === 'Warning'
                                        ? 'text-text-warning'
                                        : 'text-text-light'
                                  }`}
                                >
                                  {event.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="bg-surface-card border-b border-border-light px-4 py-3 text-right align-middle whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            {event.timestamp && (
                              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                                {event.timestamp}
                              </span>
                            )}
                            {i === 0 && canEdit && (
                              <ActionMenu
                                items={menuItems}
                                ariaLabel="Edit last event"
                                trigger="edit-button"
                                triggerLabel="Edit"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                {/* Details Card */}
                <div className="border border-border-default rounded-[10px] bg-surface-card p-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                      Details
                    </h3>
                    <ParcelStatusBadge
                      status={effectiveStatus}
                      since={lastTransition?.timestamp ?? parcel.lastActivity}
                      compartmentId={parcel.compartmentId}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <Field
                      label="Parcel ID"
                      trailing={<CopyButton value={parcel.parcelId} ariaLabel="Copy parcel ID" />}
                    >
                      <span className="break-all">{parcel.parcelId}</span>
                    </Field>
                    <Field label="Shipment Type">
                      <span className="inline-flex items-center gap-1.5">
                        <img src={shipmentTypeIcon[parcel.shipmentType]} alt="" className="w-4 h-4" />
                        <span>{shipmentTypeLabel[parcel.shipmentType]}</span>
                      </span>
                    </Field>
                    <Field label="Reservation">{parcel.reservation}</Field>
                    <Field label="Dimensions">{parcel.dimensions}</Field>
                  </div>
                </div>

                {/* Assigned Locker Card */}
                <div className="border border-border-default rounded-[10px] bg-surface-card p-6 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
                    Assigned Locker
                  </h3>
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex gap-2 items-start">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="text-sm font-medium text-text-foreground tracking-[-0.14px] leading-[18px]">
                          {parcel.assignedLockerName}
                        </span>
                        <div className="flex flex-col text-sm text-text-light tracking-[-0.14px] leading-[22px]">
                          <span>{parcel.assignedLockerStreet}</span>
                          <span>{parcel.assignedLockerCity}</span>
                        </div>
                      </div>
                      <Avatar type="locker" size="md" status="active" />
                    </div>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={onLockerClick}
                      className="w-full"
                    >
                      Show Locker Details
                    </Button>
                  </div>
                </div>
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
                        'Parcel is stuck — driver or consignee can\'t collect',
                        'Pickup code not working',
                        'Cancel this booking',
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

function actionIcon(action: Exclude<PendingAction, null>) {
  switch (action) {
    case 'in_locker':
      return <PackageCheck size={14} />
    case 'collected':
      return <CheckCircle size={14} />
    case 'expired':
      return <AlertCircle size={14} />
    case 'expected':
      return <RotateCcw size={14} />
    case 'cancelled':
      return <XCircle size={14} />
  }
}


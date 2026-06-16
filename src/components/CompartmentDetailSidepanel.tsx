import { useEffect, useMemo, useState } from 'react'
import { X, Unlock, KeyRound, Mail, Smartphone, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { Button, Dialog, Input, Toggle } from '../lib/unity'
import { TableJourneyStep, NeutralTag, StatusBadge, Sidepanel } from '../lib/ooh-kit'
import LastUpdatedButton from './LastUpdatedButton'
import type { Compartment, CompartmentSize, CompartmentStatus } from '../data/lockers'
import { getCompartmentHistory } from '../data/compartments'
import type { CompartmentEvent } from '../data/compartments'

interface CompartmentDetailSidepanelProps {
  compartment: Compartment | null
  lockerName: string
  onClose: () => void
  onToast: (message: string) => void
  onParcelClick?: (parcelId: string) => void
}

const resetableStatuses: CompartmentStatus[] = ['occupied', 'reserved', 'defective']

const sizeLabel: Record<CompartmentSize, string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'Extra Large',
}

export default function CompartmentDetailSidepanel({
  compartment,
  lockerName,
  onClose,
  onToast,
  onParcelClick,
}: CompartmentDetailSidepanelProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [codeDialog, setCodeDialog] = useState(false)
  const [resetDialog, setResetDialog] = useState(false)
  const [sentCodes, setSentCodes] = useState<CompartmentEvent[]>([])
  const [openedEvents, setOpenedEvents] = useState<CompartmentEvent[]>([])
  const [resetEvents, setResetEvents] = useState<CompartmentEvent[]>([])
  const [statusOverride, setStatusOverride] = useState<CompartmentStatus | null>(null)
  const [groupPage, setGroupPage] = useState(1)

  // Maintenance code form
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [recipient, setRecipient] = useState('')
  const [note, setNote] = useState('')

  // Reset state when compartment changes
  useEffect(() => {
    if (compartment) {
      setSentCodes([])
      setOpenedEvents([])
      setResetEvents([])
      setStatusOverride(null)
      setRecipient('')
      setNote('')
      setChannel('email')
      setCodeDialog(false)
      setOpenDialog(false)
      setResetDialog(false)
      setGroupPage(1)
    }
  }, [compartment?.id])

  const baseHistory = useMemo<CompartmentEvent[]>(() => {
    if (!compartment) return []
    return getCompartmentHistory(compartment.id, compartment.status, compartment.parcelId)
  }, [compartment])

  const history: CompartmentEvent[] = useMemo(() => {
    return [...resetEvents, ...openedEvents, ...sentCodes, ...baseHistory]
  }, [resetEvents, openedEvents, sentCodes, baseHistory])

  const effectiveStatus: CompartmentStatus = statusOverride ?? compartment?.status ?? 'available'
  const canReset = compartment ? resetableStatuses.includes(effectiveStatus) : false

  // Paginate flat events (10 / page) — only paginate when total > 10. Group
  // headers (parcelId or "Compartment events") render inline above each run of
  // same-parcel events on the current page.
  const PAGE_SIZE = 10
  const totalEvents = history.length
  const totalPages = Math.max(1, Math.ceil(totalEvents / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, groupPage), totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pagedEvents = history.slice(pageStart, pageStart + PAGE_SIZE)

  type ParcelGroup = { parcelId: string | null; events: CompartmentEvent[] }
  const visibleGroups: ParcelGroup[] = useMemo(() => {
    const result: ParcelGroup[] = []
    for (const event of pagedEvents) {
      const id = event.parcelId ?? null
      const last = result[result.length - 1]
      if (last && last.parcelId === id) {
        last.events.push(event)
      } else {
        result.push({ parcelId: id, events: [event] })
      }
    }
    return result
  }, [pagedEvents])

  if (!compartment) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 z-40 opacity-0 pointer-events-none transition-opacity" />
        <div className="fixed top-0 right-0 h-full w-[95vw] max-w-[500px] bg-surface-card z-50 translate-x-full transition-transform duration-300" />
      </>
    )
  }

  const handleOpenCompartment = () => {
    setOpenDialog(false)
    setOpenedEvents((prev) => [
      {
        id: `OPN-${Date.now()}`,
        type: 'compartment_opened',
        actor: 'carrier',
        description: 'Compartment opened by carrier',
        detail: 'Manual override from the portal.',
        step: 'Pending',
        timestamp: 'Just now',
      },
      ...prev,
    ])
    onToast(`Compartment ${compartment.id} opened.`)
  }

  const closeCodeDialog = () => {
    setCodeDialog(false)
    setRecipient('')
    setNote('')
    setChannel('email')
  }

  const handleResetCompartment = () => {
    setResetDialog(false)
    setStatusOverride('available')
    setResetEvents((prev) => [
      {
        id: `RESET-${Date.now()}`,
        type: 'manually_reset',
        actor: 'carrier',
        description: 'Compartment reset by carrier',
        detail: 'Cleared phantom booking and returned compartment to Ready for storage.',
        step: 'Success',
        timestamp: 'Just now',
      },
      ...prev,
    ])
    onToast(`Compartment ${compartment.id} reset to Ready for storage.`)
  }

  const handleSendCode = () => {
    if (!recipient.trim()) return
    const channelLabel = channel === 'email' ? 'Email' : 'SMS'
    setSentCodes((prev) => [
      {
        id: `CODE-${Date.now()}`,
        type: 'access_code_sent',
        actor: 'carrier',
        description: `Maintenance code sent via ${channelLabel}`,
        detail: `Sent to ${recipient}${note ? ` — ${note}` : ''}.`,
        step: 'Success',
        timestamp: 'Just now',
      },
      ...prev,
    ])
    onToast(`Maintenance code sent to ${recipient}.`)
    closeCodeDialog()
  }

  return (
    <>
    <Sidepanel open onClose={onClose} backdrop="dim" surface="card">
        {/* Header */}
        <div className="border-b border-border-default px-6 pt-8 pb-6 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0">
              <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0 truncate">
                Compartment {compartment.id}
              </h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm text-text-light tracking-[-0.14px] truncate">
                  {lockerName}
                </span>
                <span className="text-xs text-text-light">·</span>
                <LastUpdatedButton />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <NeutralTag label={sizeLabel[compartment.size]} />
                <StatusBadge status={effectiveStatus} />
              </div>
            </div>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 px-6 pt-6 pb-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold leading-6 tracking-[-0.16px] text-text-foreground m-0">
                Last Activities
              </h3>

              <div className="flex flex-col gap-4">
                {visibleGroups.map((group, gi) => (
                  <div key={`${group.parcelId ?? 'compartment'}-${gi}`} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      {group.parcelId ? (
                        <button
                          type="button"
                          onClick={() => onParcelClick?.(group.parcelId!)}
                          disabled={!onParcelClick}
                          className={`group/parcel flex items-center justify-between flex-1 gap-2 text-sm font-medium tracking-[-0.14px] bg-transparent border-0 p-0 m-0 ${
                            onParcelClick ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          <span
                            className={
                              onParcelClick
                                ? 'text-text-primary group-hover/parcel:underline'
                                : 'text-text-foreground'
                            }
                          >
                            Parcel {group.parcelId}
                          </span>
                          {onParcelClick && (
                            <ChevronRight
                              size={16}
                              className="text-text-light group-hover/parcel:text-text-foreground transition-colors shrink-0"
                              aria-label="Open parcel"
                            />
                          )}
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-text-foreground tracking-[-0.14px]">
                          Compartment events
                        </span>
                      )}
                    </div>
                    <div className="border border-border-default rounded-[10px] bg-surface-card overflow-hidden">
                      <ul className="m-0 list-none p-0">
                        {group.events.map((event, i) => (
                          <li
                            key={event.id}
                            className="flex items-stretch border-b border-border-light last:border-b-0 pl-4"
                          >
                            <div className="relative flex-shrink-0 w-8 self-stretch flex items-center justify-center">
                              {/* Lines extend slightly past the row borders so
                                  consecutive rows' segments overlap and form a
                                  continuous visual line. */}
                              {i > 0 && (
                                <div className="absolute -top-px bottom-1/2 left-1/2 -translate-x-1/2 w-px bg-border-default" />
                              )}
                              {i < group.events.length - 1 && (
                                <div className="absolute top-1/2 -bottom-px left-1/2 -translate-x-1/2 w-px bg-border-default" />
                              )}
                              <TableJourneyStep step={event.step} showConnectionLine={false} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 py-3 pr-4 pl-2 gap-0.5">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-sm font-medium text-text-foreground tracking-[-0.14px] leading-[20px] line-clamp-2">
                                  {event.description}
                                </span>
                                <span className="text-xs text-text-light tracking-[-0.12px] leading-4 shrink-0">
                                  {event.timestamp}
                                </span>
                              </div>
                              {event.detail && (
                                <span
                                  className={`text-xs tracking-[-0.12px] leading-[18px] line-clamp-2 ${
                                    event.step === 'Error'
                                      ? 'text-text-error'
                                      : event.step === 'Warning'
                                        ? 'text-text-warning'
                                        : 'text-text-light'
                                  }`}
                                >
                                  {event.detail}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {totalEvents > PAGE_SIZE && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-text-light tracking-[-0.12px]">
                    Page {safePage} of {totalPages} · {totalEvents} events
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGroupPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className="flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-button-secondary border-0 cursor-pointer disabled:opacity-50"
                    >
                      <ChevronLeft size={18} className="text-text-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className="flex items-center justify-center w-[34px] h-[34px] rounded-lg border border-border-light bg-transparent cursor-pointer disabled:opacity-50"
                    >
                      <ChevronRight size={18} className="text-text-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action drawer */}
        <div className="border-t border-border-default px-6 py-4 shrink-0 flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            icon={<Unlock size={16} />}
            onClick={() => setOpenDialog(true)}
            className="flex-1"
          >
            Open compartment
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<KeyRound size={16} />}
            onClick={() => setCodeDialog(true)}
            className="flex-1"
          >
            Send maintenance code
          </Button>
          {canReset && (
            <Button
              variant="secondary"
              size="md"
              icon={<RotateCcw size={16} />}
              onClick={() => setResetDialog(true)}
              className="flex-1"
            >
              Reset compartment
            </Button>
          )}
        </div>
    </Sidepanel>

      {/* Open compartment dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenDialog(false)} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title={`Open compartment ${compartment.id}?`}
              onClose={() => setOpenDialog(false)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="primary" size="md" onClick={handleOpenCompartment}>
                    Open compartment
                  </Button>
                </>
              }
            >
              <p className="m-0">
                Sending an open command to <strong className="text-text-foreground">{compartment.id}</strong>. Make sure a member of staff is on-site to handle anything inside.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {/* Reset compartment dialog */}
      {resetDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setResetDialog(false)} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title={`Reset compartment ${compartment.id}?`}
              onClose={() => setResetDialog(false)}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={() => setResetDialog(false)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button variant="destructive" size="md" onClick={handleResetCompartment}>
                    Reset compartment
                  </Button>
                </>
              }
            >
              <p className="m-0">
                This clears the phantom booking on{' '}
                <strong className="text-text-foreground">{compartment.id}</strong> and returns it to{' '}
                <strong className="text-text-foreground">Ready for storage</strong>. Only do this once you've confirmed the compartment is physically empty — any active reservation or pending parcel state will be cleared.
              </p>
            </Dialog>
          </div>
        </div>
      )}

      {/* Send maintenance code dialog */}
      {codeDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeCodeDialog} />
          <div className="relative z-10 w-[90vw] max-w-[610px]">
            <Dialog
              title="Send maintenance code"
              subtitle={`For compartment ${compartment.id}`}
              onClose={closeCodeDialog}
              footer={
                <>
                  <Button variant="secondary" size="md" onClick={closeCodeDialog}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant={recipient.trim() ? 'primary' : 'secondary'}
                    size="md"
                    onClick={handleSendCode}
                    disabled={!recipient.trim()}
                    className={!recipient.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Send code
                  </Button>
                </>
              }
            >
              <div className="flex flex-col gap-5">
                <p className="m-0">
                  Generate a one-time maintenance code and deliver it to the recipient. Only authorised carrier users can send these.
                </p>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-text-label uppercase tracking-[0.06em] font-medium">
                    Channel
                  </span>
                  <div className="flex items-center gap-3">
                    <ChannelTile
                      icon={<Mail size={16} />}
                      label="Email"
                      selected={channel === 'email'}
                      onClick={() => setChannel('email')}
                    />
                    <ChannelTile
                      icon={<Smartphone size={16} />}
                      label="SMS"
                      selected={channel === 'sms'}
                      onClick={() => setChannel('sms')}
                    />
                  </div>
                </div>
                <Input
                  label={channel === 'email' ? 'Recipient email' : 'Recipient phone'}
                  type={channel === 'email' ? 'email' : 'tel'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={channel === 'email' ? 'name@carrier.com' : '+49 …'}
                />
                <Input
                  label="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Driver pickup window 10–12"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-light tracking-[-0.14px]">
                    Code expires after first use
                  </span>
                  <Toggle checked />
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      )}
    </>
  )
}

function ChannelTile({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border cursor-pointer transition-colors ${
        selected
          ? 'border-border-active bg-surface-default'
          : 'border-border-default bg-surface-bg hover:bg-surface-card-hover'
      }`}
    >
      <span className={selected ? 'text-text-foreground' : 'text-text-light'}>{icon}</span>
      <span
        className={`text-sm font-medium tracking-[-0.14px] ${
          selected ? 'text-text-foreground' : 'text-text-light'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

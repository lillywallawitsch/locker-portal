import { useEffect, useMemo, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { Button, DatePicker, Input, SelectMenu } from '../lib/unity'
import { ProviderLogo, CarrierLogo, Sidepanel } from '../lib/ooh-kit'
import { providerLabels } from '../data/lockers'
import type { SharedNetworkInvite } from '../data/sharedNetwork'
import type { AcceptInviteFormValues } from '../context/OrgContext'
import { useOrg } from '../context/OrgContext'
import { depotTerm } from '../lib/carrierConfig'

interface AcceptSharedLockerInviteSidepanelProps {
  invite: SharedNetworkInvite | null
  onClose: () => void
  onAccept: (id: string, details: AcceptInviteFormValues) => void
  onDecline: (id: string) => void
}

export default function AcceptSharedLockerInviteSidepanel({
  invite,
  onClose,
  onAccept,
  onDecline,
}: AcceptSharedLockerInviteSidepanelProps) {
  const { lockerData, carrier } = useOrg()
  const open = invite !== null

  const [lockerName, setLockerName] = useState('')
  const [carrierLockerId, setCarrierLockerId] = useState('')
  const [activationDate, setActivationDate] = useState('')
  const [depot, setDepot] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!invite) return
    setLockerName('')
    setCarrierLockerId('')
    setActivationDate('')
    setDepot('')
    setSubmitAttempted(false)
  }, [invite?.id])

  const depotOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { value: string; label: string; description?: string }[] = []
    for (const l of lockerData) {
      if (seen.has(l.depot)) continue
      seen.add(l.depot)
      opts.push({ value: l.depot, label: l.depot, description: l.region })
    }
    opts.sort((a, b) => a.label.localeCompare(b.label))
    return opts
  }, [lockerData])

  const canAccept =
    !!lockerName.trim() && !!carrierLockerId.trim() && !!activationDate.trim()

  const handleAccept = () => {
    if (!invite) return
    if (!canAccept) {
      setSubmitAttempted(true)
      return
    }
    onAccept(invite.id, {
      lockerName: lockerName.trim(),
      carrierLockerId: carrierLockerId.trim(),
      activationDate,
      depot: depot || undefined,
    })
  }

  const handleDecline = () => {
    if (!invite) return
    onDecline(invite.id)
  }

  const mandatoryMsg = 'This field is mandatory'
  const lockerNameError = submitAttempted && !lockerName.trim() ? mandatoryMsg : undefined
  const carrierLockerIdError = submitAttempted && !carrierLockerId.trim() ? mandatoryMsg : undefined
  const activationDateError = submitAttempted && !activationDate.trim() ? mandatoryMsg : undefined

  const subtitle = invite
    ? `${invite.ownedBy.name} has invited you to add this locker to your network.`
    : ''

  return (
    <Sidepanel open={open} onClose={onClose}>
        <div className="flex flex-col gap-1 border-b border-border-default px-6 pt-8 pb-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
              Accept Shared Locker Invitation?
            </h2>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
          </div>
          {subtitle && (
            <p className="text-base text-text-light leading-6 tracking-[-0.16px] m-0">
              {subtitle}
            </p>
          )}
        </div>

        {invite && (
          <div className="flex-1 flex flex-col gap-6 px-6 pt-6 pb-6 overflow-auto">
            <div className="flex flex-col gap-6 p-4 rounded-[10px] border border-border-default bg-surface-card">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CarrierLogo brand={invite.ownedBy.brand} shortName={invite.ownedBy.shortName} />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs text-text-light tracking-[-0.12px] leading-4">Owned by</span>
                    <span className="text-base text-text-foreground tracking-[-0.16px] leading-5 truncate">
                      {invite.ownedBy.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <ProviderLogo provider={invite.provider} size="md" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs text-text-light tracking-[-0.12px] leading-4">Locker Provider</span>
                    <span className="text-base text-text-foreground tracking-[-0.16px] leading-5 truncate">
                      {providerLabels[invite.provider]}
                      {invite.providerModel ? ` - ${invite.providerModel}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-default" />

              <div className="flex items-start gap-3">
                <div className="flex items-center pt-1 shrink-0">
                  <MapPin size={16} className="text-text-light" />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-base text-text-foreground tracking-[-0.16px] leading-5 break-words">
                      {invite.address.street} {invite.address.houseNumber}
                    </span>
                    <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px] truncate">
                      {invite.address.postalCode} {invite.address.city}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 flex-wrap">
                    <div className="inline-flex items-center justify-center h-[22px] rounded-[4px] bg-surface-secondary px-1 py-1.5">
                      <span className="text-xs text-text-foreground tracking-[-0.12px] leading-4 whitespace-nowrap tabular-nums">
                        LAT: {invite.geolocation.lat.toFixed(4)}
                      </span>
                    </div>
                    <div className="inline-flex items-center justify-center h-[22px] rounded-[4px] bg-surface-secondary px-1 py-1.5">
                      <span className="text-xs text-text-foreground tracking-[-0.12px] leading-4 whitespace-nowrap tabular-nums">
                        LNG: {invite.geolocation.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium leading-6 tracking-[-0.16px] text-text-foreground m-0">
                  Carrier Details
                </h3>
                <p className="text-sm font-normal leading-[22px] tracking-[-0.14px] text-text-light m-0">
                  How should you locker appear in your network?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Input
                  inputSize="md"
                  label="Locker Name"
                  placeholder="Add Locker Name"
                  value={lockerName}
                  onChange={(e) => setLockerName(e.target.value)}
                  error={lockerNameError}
                />
                <Input
                  inputSize="md"
                  label="Carrier Locker ID"
                  placeholder="Add Carrier Locker ID"
                  value={carrierLockerId}
                  onChange={(e) => setCarrierLockerId(e.target.value)}
                  error={carrierLockerIdError}
                />
                <DatePicker
                  inputSize="md"
                  label="Activation Date"
                  placeholder="Activation Date"
                  value={activationDate}
                  onChange={setActivationDate}
                  disablePast
                  error={activationDateError}
                />
                <SelectMenu
                  selectSize="md"
                  label={`${depotTerm(carrier.id)} (optional)`}
                  placeholder={`Add ${depotTerm(carrier.id)} (optional)`}
                  options={depotOptions}
                  value={depot}
                  onChange={setDepot}
                />
              </div>
            </section>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border-default p-4">
          <Button variant="secondary" size="md" onClick={handleDecline} disabled={!invite}>
            Decline
          </Button>
          <Button variant="primary" size="md" onClick={handleAccept} disabled={!invite}>
            Accept Invitation
          </Button>
        </div>
    </Sidepanel>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Button, DatePicker, Input, SelectMenu, Toggle } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'
import type { Locker } from '../data/lockers'
import { useOrg } from '../context/OrgContext'
import { carriers } from '../data/carriers'
import { depotTerm } from '../lib/carrierConfig'

interface EditLockerInformationSidepanelProps {
  open: boolean
  onClose: () => void
  locker: Locker
  onDeactivate?: () => void
}

// Locker.street is stored as "Name Number" (see src/data/lockers.ts factory and
// App.handleAddLocker). The form edits street name and house number separately,
// so we strip the trailing " <houseNumber>" suffix on load and recompose on save.
function stripHouseNumber(fullStreet: string, houseNumber: string): string {
  if (!houseNumber) return fullStreet
  const suffix = ` ${houseNumber}`
  return fullStreet.endsWith(suffix) ? fullStreet.slice(0, -suffix.length) : fullStreet
}

export default function EditLockerInformationSidepanel({
  open,
  onClose,
  locker,
  onDeactivate,
}: EditLockerInformationSidepanelProps) {
  const { lockerData, updateLocker, carrier: activeCarrier } = useOrg()
  const isOwned = locker.ownership === 'owned'

  const [lockerName, setLockerName] = useState(locker.name)
  const [carrierLockerId, setCarrierLockerId] = useState(locker.id)
  const [depot, setDepot] = useState(locker.depot)
  const [activationDate, setActivationDate] = useState(locker.activationDate)
  const [street, setStreet] = useState(stripHouseNumber(locker.street, locker.houseNumber))
  const [houseNumber, setHouseNumber] = useState(locker.houseNumber)
  const [postalCode, setPostalCode] = useState(locker.postalCode)
  const [cityName, setCityName] = useState(locker.cityName)
  const [latitude, setLatitude] = useState(String(locker.latitude))
  const [longitude, setLongitude] = useState(String(locker.longitude))
  const [sharingEnabled, setSharingEnabled] = useState(locker.sharingEnabled)
  const [sharedWith, setSharedWith] = useState(locker.sharedWith ?? '')

  useEffect(() => {
    if (!open) return
    setLockerName(locker.name)
    setCarrierLockerId(locker.id)
    setDepot(locker.depot)
    setActivationDate(locker.activationDate)
    setStreet(stripHouseNumber(locker.street, locker.houseNumber))
    setHouseNumber(locker.houseNumber)
    setPostalCode(locker.postalCode)
    setCityName(locker.cityName)
    setLatitude(String(locker.latitude))
    setLongitude(String(locker.longitude))
    setSharingEnabled(locker.sharingEnabled)
    setSharedWith(locker.sharedWith ?? '')
  }, [open, locker])

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

  const carrierOptions = useMemo(
    () =>
      carriers
        .filter((c) => c.id !== activeCarrier.id)
        .map((c) => ({ value: c.name, label: c.name })),
    [activeCarrier.id],
  )

  const hasChanges =
    lockerName !== locker.name ||
    carrierLockerId !== locker.id ||
    depot !== locker.depot ||
    activationDate !== locker.activationDate ||
    (isOwned &&
      (street !== stripHouseNumber(locker.street, locker.houseNumber) ||
        houseNumber !== locker.houseNumber ||
        postalCode !== locker.postalCode ||
        cityName !== locker.cityName ||
        latitude !== String(locker.latitude) ||
        longitude !== String(locker.longitude) ||
        sharingEnabled !== locker.sharingEnabled ||
        (sharingEnabled && sharedWith !== (locker.sharedWith ?? ''))))

  const canSave =
    hasChanges &&
    !!lockerName.trim() &&
    !!carrierLockerId.trim() &&
    !!activationDate.trim() &&
    (!isOwned || (!!street.trim() && !!postalCode.trim() && !!cityName.trim())) &&
    (!isOwned || !sharingEnabled || !!sharedWith)

  const handleSave = () => {
    if (!canSave) return
    const updates: Partial<Locker> = {
      name: lockerName.trim(),
      id: carrierLockerId.trim(),
      depot,
      activationDate,
    }
    if (isOwned) {
      const streetName = street.trim()
      const hn = houseNumber.trim()
      updates.street = hn ? `${streetName} ${hn}` : streetName
      updates.houseNumber = hn
      updates.postalCode = postalCode.trim()
      updates.cityName = cityName.trim()
      updates.city = `${postalCode.trim()} ${cityName.trim()}`
      const latNum = Number(latitude)
      const lngNum = Number(longitude)
      if (!Number.isNaN(latNum)) updates.latitude = latNum
      if (!Number.isNaN(lngNum)) updates.longitude = lngNum
      updates.sharingEnabled = sharingEnabled
      updates.sharedWith = sharingEnabled ? sharedWith : undefined
    }
    updateLocker(locker.id, updates)
    onClose()
  }

  return (
    <Sidepanel open={open} onClose={onClose} backdrop="dim">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-default px-6 pt-8 pb-6 gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0 truncate">
              Edit Locker Information
            </h2>
            <p className="text-sm text-text-light tracking-[-0.14px] leading-[22px] m-0">
              {isOwned
                ? 'Update locker details, location, and sharing settings.'
                : 'Update how this shared locker appears in your network.'}
            </p>
          </div>
          <Button
            iconOnly
            aria-label="Close"
            icon={<X size={15} className="text-text-foreground" />}
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-8 px-6 pt-8 pb-6 overflow-auto">
          {/* Carrier Details */}
          <section className="flex flex-col gap-4">
            <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
              Carrier Details
            </span>
            <Input
              inputSize="md"
              label="Locker Name"
              value={lockerName}
              onChange={(e) => setLockerName(e.target.value)}
            />
            <Input
              inputSize="md"
              label="Carrier Locker ID"
              value={carrierLockerId}
              onChange={(e) => setCarrierLockerId(e.target.value)}
            />
            <SelectMenu
              selectSize="md"
              label={depotTerm(activeCarrier.id)}
              placeholder={`Select ${depotTerm(activeCarrier.id).toLowerCase()}`}
              options={depotOptions}
              value={depot}
              onChange={setDepot}
            />
            <DatePicker
              inputSize="md"
              label="Activation Date"
              value={activationDate}
              onChange={setActivationDate}
            />
          </section>

          {isOwned && (
            <>
              {/* Location & Address */}
              <section className="flex flex-col gap-4">
                <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
                  Location & Address
                </span>
                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <Input
                    inputSize="md"
                    label="Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                  <Input
                    inputSize="md"
                    label="No."
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <Input
                    inputSize="md"
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <Input
                    inputSize="md"
                    label="City"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    inputSize="md"
                    label="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <Input
                    inputSize="md"
                    label="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </section>

              {/* Carrier Settings */}
              <section className="flex flex-col gap-4">
                <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
                  Carrier Settings
                </span>
                <div className="flex flex-col gap-4 p-4 border border-border-default rounded-xl bg-surface-card">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-text-foreground tracking-[-0.14px]">
                        Enable Locker Sharing?
                      </span>
                      <span className="text-xs text-text-light tracking-[-0.12px]">
                        Allow another carrier to use this locker.
                      </span>
                    </div>
                    <Toggle checked={sharingEnabled} onChange={setSharingEnabled} />
                  </div>
                  {sharingEnabled && (
                    <SelectMenu
                      selectSize="md"
                      label="Select Carrier to Share Locker"
                      placeholder="Select carrier"
                      options={carrierOptions}
                      value={sharedWith}
                      onChange={setSharedWith}
                    />
                  )}
                </div>
              </section>

              {/* Deactivate */}
              {onDeactivate && (
                <section className="flex flex-col gap-4">
                  <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
                    Danger Zone
                  </span>
                  <Button
                    variant="destructive"
                    size="md"
                    onClick={() => {
                      onDeactivate()
                      onClose()
                    }}
                  >
                    Deactivate Locker
                  </Button>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-default p-4 shrink-0">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={!canSave}
            onClick={handleSave}
            className={!canSave ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Save Changes
          </Button>
        </div>
    </Sidepanel>
  )
}

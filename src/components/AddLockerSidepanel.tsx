import { useEffect, useMemo, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { Button, DatePicker, Input, SelectMenu } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'
import {
  providerLabels,
  providersForCarrier,
  venueTypeLabels,
  placementLabels,
  type Provider,
  type VenueType,
  type Placement,
} from '../data/lockers'
import { useOrg } from '../context/OrgContext'
import { showAgency, showHost, showVenueType } from '../lib/carrierConfig'

export interface AddLockerFormValues {
  lockerName: string
  carrierLockerId: string
  depot?: string
  region?: string
  agency?: string
  venueType?: VenueType
  host?: string
  placement?: Placement
  activationDate: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  latitude: number
  longitude: number
  provider: Provider
  lockerVersion?: string
}

interface AddLockerSidepanelProps {
  open: boolean
  onClose: () => void
  onAdd: (values: AddLockerFormValues) => void
}

const modelsByProvider: Record<Provider, string[]> = {
  bloqit: ['BLOQ', 'BLOQ XL', 'BLOQ Outdoor'],
  myflexbox: ['FLEX S', 'FLEX L'],
  swipbox: ['Infinity Series 2', 'Infinity Series 3'],
  keba: ['KePol Classic', 'KePol XL', 'KePol Urban'],
  tamburi: ['Tamburi Plus'],
  quadient: ['Parcel Pending Pro'],
  locky: ['Locky Standard'],
  amazon: ['Amazon Hub Apartment', 'Amazon Hub Locker+'],
  cainiao: ['Cainiao Hub'],
}

const versionsByModel: Record<string, string[]> = {
  BLOQ: ['NEXT', '1.0', '1.2'],
  'BLOQ XL': ['NEXT', '1.2'],
  'BLOQ Outdoor': ['1.0', '1.2'],
  'FLEX S': ['1.0', '2.0'],
  'FLEX L': ['2.0'],
  'Infinity Series 2': ['2.1'],
  'Infinity Series 3': ['2.1', '2.2'],
  'KePol Classic': ['3.5', '4.0'],
  'KePol XL': ['4.0'],
  'KePol Urban': ['3.5', '4.0'],
  'Tamburi Plus': ['1.0'],
  'Parcel Pending Pro': ['2.0'],
  'Locky Standard': ['1.0'],
  'Amazon Hub Apartment': ['1.0'],
  'Amazon Hub Locker+': ['1.0'],
  'Cainiao Hub': ['1.0'],
}

export default function AddLockerSidepanel({ open, onClose, onAdd }: AddLockerSidepanelProps) {
  const { lockerData, carrier } = useOrg()

  const [lockerName, setLockerName] = useState('')
  const [carrierLockerId, setCarrierLockerId] = useState('')
  const [depot, setDepot] = useState('')
  const [region, setRegion] = useState('')
  const [agency, setAgency] = useState('')
  const [venueType, setVenueType] = useState<VenueType | ''>('')
  const [host, setHost] = useState('')
  const [placement, setPlacement] = useState<Placement | ''>('')
  const [activationDate, setActivationDate] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [provider, setProvider] = useState<Provider | ''>('')
  const [lockerVersion, setLockerVersion] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!open) return
    setLockerName('')
    setCarrierLockerId('')
    setDepot('')
    setRegion('')
    setAgency('')
    setVenueType('')
    setHost('')
    setPlacement('')
    setActivationDate('')
    setStreet('')
    setHouseNumber('')
    setPostalCode('')
    setCity('')
    setLatitude('')
    setLongitude('')
    setProvider('')
    setLockerVersion('')
    setSubmitAttempted(false)
  }, [open, carrier.id])

  const depotOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { value: string; label: string }[] = []
    for (const l of lockerData) {
      if (!l.depot || seen.has(l.depot)) continue
      seen.add(l.depot)
      opts.push({ value: l.depot, label: l.depot })
    }
    opts.sort((a, b) => a.label.localeCompare(b.label))
    return opts
  }, [lockerData])

  // Region, agency & host are free-form identifiers — derive from existing data
  // so a new locker lines up with the table's filter values (same pattern as
  // LockerTable).
  const regionOptions = useMemo(
    () =>
      [...new Set(lockerData.map((l) => l.region).filter(Boolean))]
        .sort()
        .map((r) => ({ value: r, label: r })),
    [lockerData],
  )
  const agencyOptions = useMemo(
    () =>
      [...new Set(lockerData.map((l) => l.agency).filter(Boolean))]
        .sort()
        .map((a) => ({ value: a, label: a })),
    [lockerData],
  )
  const hostOptions = useMemo(
    () =>
      [...new Set(lockerData.map((l) => l.host).filter(Boolean))]
        .sort()
        .map((h) => ({ value: h, label: h })),
    [lockerData],
  )
  // Venue type ("Location") & placement are closed enums — fixed lists from the
  // label maps so every valid option is always selectable.
  const venueTypeOptions = (Object.keys(venueTypeLabels) as VenueType[]).map((v) => ({
    value: v,
    label: venueTypeLabels[v],
  }))
  const placementOptions = (Object.keys(placementLabels) as Placement[]).map((p) => ({
    value: p,
    label: placementLabels[p],
  }))

  // Provider options are scoped to the active carrier's catalogue, so only the
  // providers actually operated in that country are selectable.
  const providerOptions = useMemo(
    () =>
      providersForCarrier(carrier.id).map((p) => ({
        value: p,
        label: providerLabels[p],
      })),
    [carrier.id],
  )

  // Locker version only applies to Keba lockers — its options are the union of
  // versions across Keba's models.
  const versionOptions = useMemo(
    () =>
      provider === 'keba'
        ? [...new Set(modelsByProvider.keba.flatMap((m) => versionsByModel[m] ?? []))]
            .sort()
            .map((v) => ({ value: v, label: v }))
        : [],
    [provider],
  )

  const addressFilled = !!street.trim() && !!postalCode.trim() && !!city.trim()

  const isValid =
    !!lockerName.trim() &&
    !!carrierLockerId.trim() &&
    addressFilled &&
    !!latitude.trim() &&
    !!longitude.trim() &&
    !!provider &&
    (provider !== 'keba' || !!lockerVersion)

  const handleGetCoordinates = () => {
    if (!addressFilled) return
    let seed = 0
    const key = `${street}|${houseNumber}|${postalCode}|${city}`
    for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0
    const rand = (n: number) => {
      seed = (seed * 16807) % 2147483647
      return ((seed - 1) / 2147483646) * n
    }
    const lat = 48 + rand(6)
    const lng = 8 + rand(6)
    setLatitude(lat.toFixed(6))
    setLongitude(lng.toFixed(6))
  }

  const handleSubmit = () => {
    if (!isValid || !provider) {
      setSubmitAttempted(true)
      return
    }
    onAdd({
      lockerName: lockerName.trim(),
      carrierLockerId: carrierLockerId.trim(),
      depot: depot || undefined,
      region: region || undefined,
      agency: agency || undefined,
      venueType: venueType || undefined,
      host: host || undefined,
      placement: placement || undefined,
      activationDate,
      street: street.trim(),
      houseNumber: houseNumber.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      provider,
      lockerVersion: lockerVersion || undefined,
    })
  }

  const mandatoryMsg = 'This field is mandatory'
  const err = (empty: boolean) => (submitAttempted && empty ? mandatoryMsg : undefined)
  const lockerNameError = err(!lockerName.trim())
  const carrierLockerIdError = err(!carrierLockerId.trim())
  const streetError = err(!street.trim())
  const postalCodeError = err(!postalCode.trim())
  const cityError = err(!city.trim())
  const latitudeError = err(!latitude.trim())
  const longitudeError = err(!longitude.trim())
  const providerError = err(!provider)
  const lockerVersionError = err(provider === 'keba' && !lockerVersion)

  return (
    <Sidepanel open={open} onClose={onClose}>
        <div className="flex flex-col gap-1 border-b border-border-default px-6 pt-8 pb-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
              Add a new locker
            </h2>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
          </div>
          <p className="text-base text-text-light leading-6 tracking-[-0.16px] m-0">
            Please fill in the information below to add a new locker to your network
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-6 px-6 pt-6 pb-6 overflow-auto">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-medium leading-6 tracking-[-0.16px] text-text-foreground m-0">
                Carrier Details
              </h3>
              <p className="text-sm font-normal leading-[22px] tracking-[-0.14px] text-text-light m-0">
                How should you locker appear in your network?
              </p>
            </div>
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
            <SelectMenu
              selectSize="md"
              label="Region (optional)"
              placeholder="Select Region (optional)"
              options={regionOptions}
              value={region}
              onChange={setRegion}
            />
            <SelectMenu
              selectSize="md"
              label="Depot (optional)"
              placeholder="Select Depot (optional)"
              options={depotOptions}
              value={depot}
              onChange={setDepot}
              searchable
              searchPlaceholder="Search Depot"
            />
            {showAgency(carrier.id) && (
              <SelectMenu
                selectSize="md"
                label="Agency (optional)"
                placeholder="Select Agency (optional)"
                options={agencyOptions}
                value={agency}
                onChange={setAgency}
                searchable
                searchPlaceholder="Search Agency"
              />
            )}
            <DatePicker
              inputSize="md"
              label="Activation Date (optional)"
              placeholder="Select Activation Date (optional)"
              value={activationDate}
              onChange={setActivationDate}
              disablePast
            />
          </section>

          <div className="h-px bg-border-default" />

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-medium leading-6 tracking-[-0.16px] text-text-foreground m-0">
                Location Details
              </h3>
              <p className="text-sm font-normal leading-[22px] tracking-[-0.14px] text-text-light m-0">
                Where exactly is your locker located?
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <Input
                  inputSize="md"
                  label="Street"
                  placeholder="Add Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  error={streetError}
                />
              </div>
              <div className="w-[80px] shrink-0">
                <Input
                  inputSize="md"
                  label="No."
                  placeholder="No."
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <Input
                  inputSize="md"
                  label="Postal Code"
                  placeholder="Add Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  error={postalCodeError}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  inputSize="md"
                  label="City"
                  placeholder="Add City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={cityError}
                />
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              icon={<MapPin size={16} aria-hidden="true" />}
              onClick={handleGetCoordinates}
              disabled={!addressFilled}
              className="w-fit"
            >
              Get GPS Coordinates
            </Button>
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <Input
                  inputSize="md"
                  label="Latitude"
                  placeholder="Add Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  error={latitudeError}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  inputSize="md"
                  label="Longitude"
                  placeholder="Add Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  error={longitudeError}
                />
              </div>
            </div>
            {showVenueType(carrier.id) && (
              <SelectMenu
                selectSize="md"
                label="Location (optional)"
                placeholder="Select Location (optional)"
                options={venueTypeOptions}
                value={venueType}
                onChange={(v) => setVenueType(v as VenueType)}
              />
            )}
            {showHost(carrier.id) && (
              <SelectMenu
                selectSize="md"
                label="Host (optional)"
                placeholder="Select Host (optional)"
                options={hostOptions}
                value={host}
                onChange={setHost}
              />
            )}
            <SelectMenu
              selectSize="md"
              label="Placement (optional)"
              placeholder="Select Placement (optional)"
              options={placementOptions}
              value={placement}
              onChange={(v) => setPlacement(v as Placement)}
            />
          </section>

          <div className="h-px bg-border-default" />

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-medium leading-6 tracking-[-0.16px] text-text-foreground m-0">
                Provider Details
              </h3>
              <p className="text-sm font-normal leading-[22px] tracking-[-0.14px] text-text-light m-0">
                Who is the provider of your locker?
              </p>
            </div>
            <SelectMenu
              selectSize="md"
              label="Provider"
              placeholder="Select Provider"
              options={providerOptions}
              value={provider}
              onChange={(v) => {
                setProvider(v as Provider)
                setLockerVersion('')
              }}
              error={providerError}
            />
            {provider === 'keba' && (
              <SelectMenu
                selectSize="md"
                label="Locker Version"
                placeholder="Select Locker Version"
                options={versionOptions}
                value={lockerVersion}
                onChange={setLockerVersion}
                error={lockerVersionError}
              />
            )}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-border-default p-4">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit}>
            Add Locker
          </Button>
        </div>
    </Sidepanel>
  )
}

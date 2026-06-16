import type { JourneyStep, CompartmentSize, Locker, Provider } from './lockers'
import { lockerData, getLockerDataForCarrier, getCompartmentsForLocker, isLockerOffline } from './lockers'
import { formatAgeSince } from '../lib/ooh-kit/components/_formatDateTimeWithAge'

export type ShipmentType = 'First Mile' | 'Last Mile' | 'Alternative Delivery' | 'Return'
export type ParcelStatus = 'Ready for Pickup' | 'Expected' | 'Expired' | 'Consignee Collected' | 'Courier Collected' | 'Booking Cancelled' | 'Booking Rejected'
export type ReservationType = 'Hard Reservation' | 'Soft Reservation'

export type ParcelOverviewItem = {
  parcelId: string
  assignedLocker: string
  assignedLockerName: string
  assignedLockerStreet: string
  assignedLockerCity: string
  depot: string
  region: string
  provider: Provider
  shipmentType: ShipmentType
  status: ParcelStatus
  lastActivity: string
  reservation: ReservationType
  compartmentSize: CompartmentSize
  dimensions: string // human-readable WxHxD, e.g. "200 x 150 x 100 mm"
  expiresAt?: string
  compartmentId?: string
  // Status-specific timestamps used by LockerDetail's per-tab columns. All
  // optional — only the ones meaningful for a given status are populated.
  deliveredAt?: string
  depositedAt?: string
  reservedAt?: string
  collectedAt?: string
  cancelledAt?: string
  rejectedAt?: string
}

export type ParcelJourneyEvent = {
  id: string
  event: string
  description?: string
  step: JourneyStep
  timestamp?: string
}

const shipmentTypes: ShipmentType[] = ['First Mile', 'Last Mile', 'Alternative Delivery', 'Return']
const reservationTypes: ReservationType[] = ['Hard Reservation', 'Soft Reservation']
const compartmentSizes: CompartmentSize[] = ['S', 'M', 'L', 'XL']

const dimensionsBySize: Record<CompartmentSize, string[]> = {
  S: ['150 x 100 x 50 mm', '200 x 120 x 80 mm', '180 x 140 x 60 mm'],
  M: ['250 x 180 x 100 mm', '300 x 200 x 120 mm', '280 x 220 x 140 mm'],
  L: ['400 x 300 x 200 mm', '450 x 320 x 180 mm', '380 x 280 x 220 mm'],
  XL: ['600 x 450 x 300 mm', '550 x 400 x 350 mm', '700 x 500 x 250 mm'],
}

const depositDates = [
  'Mo., 07.04.2025, 08:12',
  'Tu., 08.04.2025, 10:34',
  'We., 09.04.2025, 14:20',
  'Th., 10.04.2025, 09:45',
  'Fr., 11.04.2025, 16:00',
  'Sa., 12.04.2025, 11:30',
  'Su., 13.04.2025, 07:55',
  'Today, 08:00',
  'Today, 10:34',
  'Yesterday, 14:30',
]

const collectedDates = [
  'Mo., 07.04.2025, 14:30',
  'Tu., 08.04.2025, 17:45',
  'We., 09.04.2025, 10:10',
  'Th., 10.04.2025, 12:20',
  'Fr., 11.04.2025, 19:00',
  'Sa., 12.04.2025, 09:15',
  'Su., 13.04.2025, 16:35',
  'Today, 03:12',
  'Yesterday, 11:45',
]

const reservedDates = [
  'Fr., 04.04.2025, 09:30',
  'Sa., 05.04.2025, 12:15',
  'Su., 06.04.2025, 15:45',
  'Mo., 07.04.2025, 07:00',
  'Tu., 08.04.2025, 11:20',
  'We., 09.04.2025, 13:50',
  'Th., 10.04.2025, 08:40',
]

const cancelledDates = [
  'Tu., 08.04.2025, 09:05',
  'We., 09.04.2025, 11:40',
  'Th., 10.04.2025, 15:25',
  'Fr., 11.04.2025, 08:50',
  'Sa., 12.04.2025, 13:10',
  'Su., 13.04.2025, 10:30',
  'Mo., 14.04.2025, 07:15',
]

const rejectedDates = [
  'We., 09.04.2025, 06:20',
  'Th., 10.04.2025, 10:55',
  'Fr., 11.04.2025, 14:30',
  'Sa., 12.04.2025, 08:10',
  'Su., 13.04.2025, 12:45',
  'Mo., 14.04.2025, 09:35',
  'Tu., 15.04.2025, 11:00',
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pickFrom<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

// How long a Last Mile parcel sits in the locker before it expires and the
// consignee loses their exclusive pickup window (driver can then collect too).
const CONSIGNEE_PICKUP_WINDOW_DAYS = 3

const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const pad2 = (n: number) => n.toString().padStart(2, '0')

// Render a Date back into the "Xx., D.M.YYYY, HH:mm" string the rest of the
// mock data (and parseParcelTimestamp) uses.
function formatStamp(d: Date): string {
  return `${WEEKDAYS_SHORT[d.getDay()]}., ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function dateFromHoursAgo(hoursAgo: number): Date {
  return new Date(Date.now() - hoursAgo * 3_600_000)
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000)
}

const seedMap: Record<string, number> = {
  'gls-de': 31,
  'dpd-de': 5031,
  'gls-at': 10031,
  'gls-it': 15031,
  'gls-es': 20031,
  'gls-pt': 25031,
}

const idOffsetMap: Record<string, number> = {
  'gls-de': 0,
  'dpd-de': 100_000,
  'gls-at': 200_000,
  'gls-it': 300_000,
  'gls-es': 400_000,
  'gls-pt': 500_000,
}

// Number of standalone historical parcels (driver already collected, cancelled,
// rejected, or driver-collected after expiry) to add on top of the
// compartment-bound parcels. Compartment-bound counts are determined by the
// locker's actual occupied + reserved compartments, so total parcels per
// carrier is ~(2× compartment count) + this number.
const historicalCountMap: Record<string, number> = {
  'gls-de': 2000,
  'dpd-de': 600,
  'gls-at': 160,
  'gls-it': 240,
  'gls-es': 1400,
  'gls-pt': 1500,
}

// Of occupied compartments, what share host an Expired parcel (still physically
// inside, awaiting driver pickup) instead of a fresh In Locker parcel.
const EXPIRED_IN_LOCKER_RATE = 0.18

const historicalMix: Array<{ status: ParcelStatus; weight: number }> = [
  { status: 'Consignee Collected', weight: 28 },
  { status: 'Courier Collected', weight: 18 },
  { status: 'Expired', weight: 24 }, // driver already collected
  { status: 'Booking Cancelled', weight: 20 },
  { status: 'Booking Rejected', weight: 10 },
]

function lastActivityFor(parcel: Pick<ParcelOverviewItem,
  'status' | 'depositedAt' | 'reservedAt' | 'collectedAt' | 'cancelledAt' | 'rejectedAt'
>): string {
  switch (parcel.status) {
    case 'Ready for Pickup':
    case 'Expired':
      return parcel.depositedAt ?? '—'
    case 'Expected':
      return parcel.reservedAt ?? '—'
    case 'Consignee Collected':
    case 'Courier Collected':
      return parcel.collectedAt ?? '—'
    case 'Booking Cancelled':
      return parcel.cancelledAt ?? '—'
    case 'Booking Rejected':
      return parcel.rejectedAt ?? '—'
  }
}

// Last Mile dominates Last Mile pickups (Consignee Collected, Expired). Driver
// shipment types (First Mile / Return / Alternative Delivery) skew toward
// Courier Collected and the operational statuses.
function pickShipmentType(rand: () => number, status: ParcelStatus): ShipmentType {
  switch (status) {
    case 'Consignee Collected':
      // Consignees only collect Last Mile.
      return 'Last Mile'
    case 'Expired':
      // Expired only applies to Last Mile (consignee no-show).
      return 'Last Mile'
    case 'Courier Collected':
      return pickFrom(rand, ['First Mile', 'Return', 'Alternative Delivery'] as ShipmentType[])
    default:
      return pickFrom(rand, shipmentTypes)
  }
}

function buildParcel(args: {
  parcelId: string
  locker: Locker
  status: ParcelStatus
  shipmentType: ShipmentType
  compartmentId?: string
  compartmentSize: CompartmentSize
  rand: () => number
}): ParcelOverviewItem {
  const { parcelId, locker, status, shipmentType, compartmentId, compartmentSize, rand } = args
  const reservation = pickFrom(rand, reservationTypes)
  const reservedAt = pickFrom(rand, reservedDates)
  const collectedAt = pickFrom(rand, collectedDates)
  const cancelledAt = pickFrom(rand, cancelledDates)
  const rejectedAt = pickFrom(rand, rejectedDates)

  const inLocker = status === 'Ready for Pickup' || status === 'Expired'
  const collected = status === 'Consignee Collected' || status === 'Courier Collected'

  // In-locker parcels get a freshly computed deposit time so the "In Locker
  // since" and expiry countdowns read realistically. Ready-for-Pickup parcels
  // were deposited inside the consignee pickup window; Expired ones overran it.
  let depositedAt: string | undefined
  let expiresAt: string | undefined
  if (inLocker) {
    const depHoursAgo =
      status === 'Ready for Pickup'
        ? 2 + Math.floor(rand() * (CONSIGNEE_PICKUP_WINDOW_DAYS * 24 - 4)) // 2h–~3d ago
        : CONSIGNEE_PICKUP_WINDOW_DAYS * 24 + 12 + Math.floor(rand() * 24 * 9) // ~3.5–12.5d ago
    const depositDate = dateFromHoursAgo(depHoursAgo)
    depositedAt = formatStamp(depositDate)
    // Only Last Mile parcels are picked up by the consignee and therefore
    // expire (3 days after delivery). First Mile / Return / Alternative
    // Delivery are driver pickups and never expire.
    if (shipmentType === 'Last Mile') {
      expiresAt = formatStamp(addDays(depositDate, CONSIGNEE_PICKUP_WINDOW_DAYS))
    }
  } else if (collected) {
    depositedAt = pickFrom(rand, depositDates)
  }

  const parcel: ParcelOverviewItem = {
    parcelId,
    assignedLocker: locker.id,
    assignedLockerName: locker.name,
    assignedLockerStreet: locker.street,
    assignedLockerCity: locker.city,
    depot: locker.depot,
    region: locker.region,
    provider: locker.provider,
    shipmentType,
    status,
    reservation,
    compartmentSize,
    dimensions: pickFrom(rand, dimensionsBySize[compartmentSize]),
    compartmentId,
    lastActivity: '',
    expiresAt,
    depositedAt,
    reservedAt: status === 'Expected' ? reservedAt : undefined,
    collectedAt: status === 'Consignee Collected' || status === 'Courier Collected' ? collectedAt : undefined,
    cancelledAt: status === 'Booking Cancelled' ? cancelledAt : undefined,
    rejectedAt: status === 'Booking Rejected' ? rejectedAt : undefined,
    deliveredAt: depositedAt,
  }
  parcel.lastActivity = lastActivityFor(parcel)
  return parcel
}

function expandWeights<T>(mix: Array<{ status: T; weight: number }>, total: number): T[] {
  const totalWeight = mix.reduce((s, m) => s + m.weight, 0)
  const list: T[] = []
  for (const m of mix) {
    const count = Math.round((total * m.weight) / totalWeight)
    for (let i = 0; i < count; i++) list.push(m.status)
  }
  return list
}

function generateParcelsForLockers(carrierId: string, lockers: Locker[]): ParcelOverviewItem[] {
  if (lockers.length === 0) return []
  const seed = seedMap[carrierId] ?? 31
  const offset = idOffsetMap[carrierId] ?? 0
  const historicalCount = historicalCountMap[carrierId] ?? 400
  const rand = seededRandom(seed)

  const result: ParcelOverviewItem[] = []

  // Lockers that are offline on both sides (carrier- AND provider-inactive)
  // hold no parcels and report no compartment capacity, so they are excluded
  // from both the compartment-bound and the historical parcel pools.
  const activeLockers = lockers.filter((l) => !isLockerOffline(l))

  // 1. Bind one parcel to every occupied / reserved compartment in every
  //    locker, using the compartment's parcelId as the parcel's parcelId so
  //    the locker page and the parcel overview point at the same record.
  for (const locker of activeLockers) {
    const compartments = getCompartmentsForLocker(locker.id)
    for (const c of compartments) {
      if (c.status === 'occupied' && c.parcelId) {
        const status: ParcelStatus = rand() < EXPIRED_IN_LOCKER_RATE ? 'Expired' : 'Ready for Pickup'
        result.push(
          buildParcel({
            parcelId: c.parcelId,
            locker,
            status,
            shipmentType: pickShipmentType(rand, status),
            compartmentId: c.id,
            compartmentSize: c.size,
            rand,
          }),
        )
      } else if (c.status === 'reserved' && c.parcelId) {
        result.push(
          buildParcel({
            parcelId: c.parcelId,
            locker,
            status: 'Expected',
            shipmentType: pickShipmentType(rand, 'Expected'),
            compartmentId: c.id,
            compartmentSize: c.size,
            rand,
          }),
        )
      }
    }
  }

  // 2. Layer ~500 standalone historical parcels (collected, cancelled,
  //    rejected, plus expired parcels the driver already picked up) on top.
  const historicalList = expandWeights(historicalMix, historicalCount)
  for (let i = historicalList.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[historicalList[i], historicalList[j]] = [historicalList[j], historicalList[i]]
  }

  for (let i = 0; i < historicalList.length && activeLockers.length > 0; i++) {
    const status = historicalList[i]
    const locker = pickFrom(rand, activeLockers)
    // 11-digit historical parcel IDs — namespaced into the 50_000_000_000+ range
    // so they never collide with compartment-bound IDs (40_000_000_000…49…).
    const parcelId = String(50_000_000_000 + offset + i)
    result.push(
      buildParcel({
        parcelId,
        locker,
        status,
        shipmentType: pickShipmentType(rand, status),
        compartmentId: undefined,
        compartmentSize: pickFrom(rand, compartmentSizes),
        rand,
      }),
    )
  }

  return result
}

// Default export keeps a static gls-de dataset for any callers that haven't
// migrated to the carrier-aware accessor yet.
export const parcelData: ParcelOverviewItem[] = generateParcelsForLockers('gls-de', lockerData)

const journeyTemplates: Record<ParcelStatus, { event: string; description?: string; step: JourneyStep; timestamp?: string }[]> = {
  'Expected': [
    { event: 'Parcel is waiting to be delivered to Locker', step: 'Right Now' },
    { event: 'Hard Reservation Created', description: 'The Carrier has created a hard reservation for the parcel', step: 'Success' },
  ],
  'Ready for Pickup': [
    { event: 'Parcel waiting to be picked up by Consignee', step: 'Right Now' },
    { event: 'Parcel Delivered to Locker', description: 'The Courier has deposited the parcel in a compartment', step: 'Success' },
    { event: 'Hard Reservation Created', description: 'The Carrier has created a hard reservation for the parcel', step: 'Success' },
  ],
  'Expired': [
    { event: 'Parcel waiting to be picked up by Consignee or Courier', step: 'Right Now' },
    { event: 'Consignee did not pickup the parcel on time', step: 'Warning' },
    { event: 'Parcel Delivered to Locker', description: 'The Courier has deposited the parcel in a compartment', step: 'Success' },
    { event: 'Soft Reservation Created', description: 'The Carrier has created a soft reservation for the parcel', step: 'Success' },
  ],
  'Consignee Collected': [
    { event: 'Parcel collected by Consignee', description: 'The Consignee has retrieved the parcel from the locker', step: 'Success' },
    { event: 'Parcel Delivered to Locker', description: 'The Courier has deposited the parcel in a compartment', step: 'Success' },
    { event: 'Hard Reservation Created', description: 'The Carrier has created a hard reservation for the parcel', step: 'Success' },
  ],
  'Courier Collected': [
    { event: 'Parcel collected by Courier', description: 'The Courier has retrieved the parcel from the locker', step: 'Success' },
    { event: 'Parcel Delivered to Locker', description: 'The Courier has deposited the parcel in a compartment', step: 'Success' },
    { event: 'Hard Reservation Created', description: 'The Carrier has created a hard reservation for the parcel', step: 'Success' },
  ],
  'Booking Cancelled': [
    { event: 'Hard Reservation Cancelled', description: 'The Carrier has cancelled a hard reservation for the parcel', step: 'Error' },
    { event: 'Hard Reservation Created', description: 'The Carrier has created a hard reservation for the parcel', step: 'Success' },
  ],
  'Booking Rejected': [
    { event: 'Hard Reservation Rejected', description: 'The reservation was rejected: Parcel Dimensions Exceed', step: 'Error' },
  ],
}

const journeyTimestamps = [
  'Today, 08:12',
  'Yesterday, 10:57',
  'Mo., 24.3.2025, 14:30',
  'Fr., 21.3.2025, 09:00',
]

export function getJourneyForParcel(parcel: ParcelOverviewItem): ParcelJourneyEvent[] {
  const template = journeyTemplates[parcel.status]
  const isDriverPickup =
    parcel.shipmentType === 'Return' ||
    parcel.shipmentType === 'Alternative Delivery' ||
    parcel.shipmentType === 'First Mile'
  return template.map((t, i) => {
    let event = t.event
    let description = t.description
    if (isDriverPickup && event === 'Parcel waiting to be picked up by Consignee') {
      event = 'Parcel waiting to be picked up by Driver'
    }
    // On the live "Right Now" step for an in-locker parcel, surface how long
    // the parcel has been sitting in the compartment. Expired parcels get the
    // additional expiry duration appended in parentheses.
    if (t.step === 'Right Now' && !!parcel.compartmentId) {
      const inLockerSince = formatAgeSince(parcel.depositedAt)
      const expiredSince =
        parcel.status === 'Expired' ? formatAgeSince(parcel.expiresAt) : null
      if (inLockerSince && expiredSince) {
        description = `In Locker since ${inLockerSince} (Expired since ${expiredSince})`
      } else if (inLockerSince) {
        description = `In Locker since ${inLockerSince}`
      }
    }
    if (parcel.status === 'Expired' && t.step === 'Warning' && parcel.expiresAt) {
      description = `Parcel expired on ${parcel.expiresAt}`
    }
    return {
      id: `J-${parcel.parcelId}-${i}`,
      event,
      description,
      step: t.step,
      timestamp: i > 0 ? journeyTimestamps[i % journeyTimestamps.length] : undefined,
    }
  })
}

const parcelDataCache: Record<string, ParcelOverviewItem[]> = {}
export function getParcelDataForCarrier(carrierId: string): ParcelOverviewItem[] {
  if (!parcelDataCache[carrierId]) {
    parcelDataCache[carrierId] = generateParcelsForLockers(carrierId, getLockerDataForCarrier(carrierId))
  }
  return parcelDataCache[carrierId]
}

import type { JourneyStep } from './lockers'

export type CompartmentEventType =
  | 'compartment_opened'
  | 'compartment_closed'
  | 'parcel_deposited'
  | 'parcel_collected'
  | 'reservation_created'
  | 'reservation_cleared'
  | 'marked_defective'
  | 'manually_reset'
  | 'access_code_sent'
  | 'manual_force_delivered'
  | 'manual_force_expired'

export type CompartmentEventActor = 'system' | 'carrier' | 'driver' | 'consignee' | 'provider'

export type CompartmentEvent = {
  id: string
  type: CompartmentEventType
  actor: CompartmentEventActor
  description: string
  detail?: string
  step: JourneyStep
  timestamp: string
  parcelId?: string
}

type EventTemplate = Omit<CompartmentEvent, 'id'>

// Lifecycle templates for a single parcel cycle in this compartment. Events
// are returned newest-first so the timeline reads top-to-bottom.

function consigneeCollectedCycle(
  parcelId: string,
  driver: string,
  collectionDate: string,
  collectionStart: string,
  collectionEnd: string,
  depositDate: string,
  depositStart: string,
  depositEnd: string,
  reservationDate: string,
): EventTemplate[] {
  return [
    { type: 'compartment_closed', actor: 'system', description: 'Compartment closed', step: 'Pending', timestamp: `${collectionDate}, ${collectionEnd}`, parcelId },
    { type: 'parcel_collected', actor: 'consignee', description: 'Parcel collected by consignee', detail: `${parcelId} picked up`, step: 'Success', timestamp: `${collectionDate}, ${collectionEnd}`, parcelId },
    { type: 'compartment_opened', actor: 'consignee', description: 'Compartment opened by consignee', detail: 'Access code accepted', step: 'Pending', timestamp: `${collectionDate}, ${collectionStart}`, parcelId },
    { type: 'compartment_closed', actor: 'system', description: 'Compartment closed', step: 'Pending', timestamp: `${depositDate}, ${depositEnd}`, parcelId },
    { type: 'parcel_deposited', actor: 'driver', description: 'Parcel deposited', detail: `${driver} deposited ${parcelId}`, step: 'Success', timestamp: `${depositDate}, ${depositEnd}`, parcelId },
    { type: 'compartment_opened', actor: 'driver', description: 'Compartment opened by driver', detail: 'Access code accepted', step: 'Pending', timestamp: `${depositDate}, ${depositStart}`, parcelId },
    { type: 'reservation_created', actor: 'carrier', description: 'Hard reservation created', detail: `For ${parcelId}`, step: 'Success', timestamp: `${reservationDate}, 11:00`, parcelId },
  ]
}

function expiredDriverPickupCycle(
  parcelId: string,
  driver: string,
  pickupDate: string,
  pickupStart: string,
  pickupEnd: string,
  depositDate: string,
  depositStart: string,
  depositEnd: string,
  reservationDate: string,
): EventTemplate[] {
  return [
    { type: 'compartment_closed', actor: 'system', description: 'Compartment closed', step: 'Pending', timestamp: `${pickupDate}, ${pickupEnd}`, parcelId },
    { type: 'parcel_collected', actor: 'driver', description: 'Parcel collected by driver', detail: `${parcelId} returned to depot`, step: 'Success', timestamp: `${pickupDate}, ${pickupEnd}`, parcelId },
    { type: 'compartment_opened', actor: 'driver', description: 'Compartment opened by driver', detail: 'Driver collection code accepted', step: 'Pending', timestamp: `${pickupDate}, ${pickupStart}`, parcelId },
    { type: 'compartment_closed', actor: 'system', description: 'Compartment closed', step: 'Pending', timestamp: `${depositDate}, ${depositEnd}`, parcelId },
    { type: 'parcel_deposited', actor: 'driver', description: 'Parcel deposited', detail: `${driver} deposited ${parcelId}`, step: 'Success', timestamp: `${depositDate}, ${depositEnd}`, parcelId },
    { type: 'compartment_opened', actor: 'driver', description: 'Compartment opened by driver', detail: 'Access code accepted', step: 'Pending', timestamp: `${depositDate}, ${depositStart}`, parcelId },
    { type: 'reservation_created', actor: 'carrier', description: 'Hard reservation created', detail: `For ${parcelId}`, step: 'Success', timestamp: `${reservationDate}, 10:00`, parcelId },
  ]
}

function currentEventsForStatus(status: string, parcelId: string): EventTemplate[] {
  switch (status) {
    case 'occupied':
      return [
        { type: 'compartment_closed', actor: 'system', description: 'Compartment closed', step: 'Pending', timestamp: 'Today, 10:34', parcelId },
        { type: 'parcel_deposited', actor: 'driver', description: 'Parcel deposited', detail: `Driver Klein deposited ${parcelId}`, step: 'Success', timestamp: 'Today, 10:33', parcelId },
        { type: 'compartment_opened', actor: 'driver', description: 'Compartment opened by driver', detail: 'Access code accepted', step: 'Pending', timestamp: 'Today, 10:30', parcelId },
        { type: 'reservation_created', actor: 'carrier', description: 'Hard reservation created', detail: `For ${parcelId}`, step: 'Success', timestamp: 'Yesterday, 16:20', parcelId },
      ]
    case 'reserved':
      return [
        { type: 'reservation_created', actor: 'carrier', description: 'Hard reservation created', detail: `For ${parcelId} — pending deposit`, step: 'Success', timestamp: 'Today, 09:14', parcelId },
      ]
    case 'defective':
      return [
        { type: 'marked_defective', actor: 'provider', description: 'Compartment marked as defective', detail: 'Door sensor reported a fault', step: 'Error', timestamp: 'Today, 11:20' },
      ]
    case 'available':
    default:
      return []
  }
}

export function getCompartmentHistory(
  compartmentId: string,
  status: string,
  currentParcelId?: string,
): CompartmentEvent[] {
  const seed = compartmentId.charCodeAt(compartmentId.length - 1) || 1
  const parcelCurrent = currentParcelId ?? `PKG${900000 + ((seed * 7) % 900) + 100}`
  const parcelB = `PKG${900000 + ((seed * 11) % 900) + 100}`
  const parcelC = `PKG${900000 + ((seed * 13) % 900) + 100}`
  const parcelD = `PKG${900000 + ((seed * 17) % 900) + 100}`

  const ordered: EventTemplate[] = [
    ...currentEventsForStatus(status, parcelCurrent),

    // Parcel B — most recent completed cycle (consignee collected)
    ...consigneeCollectedCycle(
      parcelB,
      'Driver Klein',
      'Mo., 21.4.2025',
      '17:20',
      '17:23',
      'Su., 20.4.2025',
      '14:28',
      '14:31',
      'Sa., 19.4.2025',
    ),

    // Parcel C — expired and returned by driver
    ...expiredDriverPickupCycle(
      parcelC,
      'Driver Mertens',
      'Th., 17.4.2025',
      '12:14',
      '12:17',
      'Tu., 15.4.2025',
      '13:38',
      '13:41',
      'Mo., 14.4.2025',
    ),

    // Parcel D — older completed cycle (consignee collected)
    ...consigneeCollectedCycle(
      parcelD,
      'Driver Klein',
      'Sa., 12.4.2025',
      '17:58',
      '18:01',
      'Fr., 11.4.2025',
      '11:20',
      '11:23',
      'Th., 10.4.2025',
    ),
  ]

  return ordered.map((evt, i) => ({ ...evt, id: `EVT-${compartmentId}-${i}` }))
}

export const compartmentStatusLabels: Record<string, string> = {
  available: 'Ready for storage',
  occupied: 'Occupied',
  reserved: 'Reserved',
  defective: 'Defective',
}

export const compartmentEventActorLabels: Record<CompartmentEventActor, string> = {
  system: 'System',
  carrier: 'Carrier',
  driver: 'Driver',
  consignee: 'Consignee',
  provider: 'Provider',
}

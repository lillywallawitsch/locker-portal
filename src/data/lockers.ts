export type VenueType =
  | 'shopping_center'
  | 'petrol_station'
  | 'supermarket'
  | 'laundry'
  | 'public_transport'

export type Placement = 'indoor' | 'outdoor'

export type LockerOwnership = 'owned' | 'shared-carrier' | 'shared-provider'

export type OpeningWindow = { open: string; close: string } // 'HH:MM' 24h
export type OpeningHours =
  | { kind: '24/7' }
  | {
      kind: 'business-hours'
      // Schedules per weekday band. `null` means the locker is closed that day.
      weekdays: OpeningWindow // Mon–Fri
      saturday: OpeningWindow | null
      sunday: OpeningWindow | null
    }

export type Locker = {
  name: string
  id: string
  street: string
  houseNumber: string
  postalCode: string
  cityName: string
  city: string
  latitude: number
  longitude: number
  depot: string
  region: string
  agency: string
  carrierStatus: 'active' | 'inactive' | 'maintenance' | 'decommissioned'
  providerStatus: 'active' | 'inactive'
  compartments: number
  provider: Provider
  expiredParcelCount: number
  venueType: VenueType
  host: string
  placement: Placement
  ownership: LockerOwnership
  ownedBy: string
  sharingEnabled: boolean
  sharedWith?: string
  activationDate: string
  statusSince: string
  openingHours: OpeningHours
  providerLockerId: string
  providerLockerModel: string
  providerLockerVersion: string
}

export const venueTypeLabels: Record<VenueType, string> = {
  shopping_center: 'Shopping center',
  petrol_station: 'Petrol station',
  supermarket: 'Supermarket',
  laundry: 'Laundry',
  public_transport: 'Public transport',
}

export const placementLabels: Record<Placement, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
}

const hostsByVenue: Record<VenueType, string[]> = {
  shopping_center: ['CentrO', 'Alexa Berlin', 'Mall of Berlin', 'Kö-Galerie', 'Pasing Arcaden'],
  petrol_station: ['Aral', 'Shell', 'Esso', 'Total Energies', 'JET'],
  supermarket: ['REWE', 'EDEKA', 'Kaufland', 'Alnatura', 'Getränke Markgraf'],
  laundry: ['Persil Service', 'CleanPark', 'Schnell & Sauber'],
  public_transport: ['Deutsche Bahn', 'BVG', 'MVG', 'Hauptbahnhof Kiosk'],
}

// Per-carrier host overrides. Looked up first; venue types not listed here for
// a given carrier fall through to the global `hostsByVenue` defaults.
const hostsByCarrier: Partial<Record<string, Partial<Record<VenueType, string[]>>>> = {
  'gls-de': {
    petrol_station: ['Aral Tankstelle', 'Shell', 'Esso', 'Total Energies', 'JET'],
    supermarket: ['Getränke Markgrafen', 'REWE', 'EDEKA', 'Kaufland', 'Alnatura'],
    shopping_center: ['Individual Location Partner', 'CentrO', 'Alexa Berlin', 'Mall of Berlin', 'Pasing Arcaden'],
  },
  'dpd-de': {
    petrol_station: ['Aral', 'Shell', 'Esso', 'BP', 'Star'],
    supermarket: ['Lidl', 'Penny', 'Netto', 'Aldi Süd', 'tegut'],
    shopping_center: ['Mercado', 'Stern-Center', 'Rhein-Galerie', 'Limbecker Platz'],
  },
  'gls-at': {
    petrol_station: ['OMV', 'BP Austria', 'Shell Austria', 'Eni', 'Avanti'],
    supermarket: ['Spar', 'Billa', 'Hofer', 'Merkur', 'MPreis'],
    shopping_center: ['Donauzentrum', 'Shopping City Süd', 'Plus City', 'Europark Salzburg'],
    public_transport: ['ÖBB', 'Wiener Linien', 'Linz AG Linien'],
  },
  'gls-it': {
    petrol_station: ['Eni', 'Q8', 'Esso Italia', 'Tamoil', 'IP'],
    supermarket: ['Coop Italia', 'Conad', 'Esselunga', 'Carrefour Italia', 'Despar'],
    shopping_center: ['Galleria Vittorio Emanuele', 'Centro Sarca', 'Porta di Roma', 'Le Grange'],
    public_transport: ['Trenitalia', 'ATM Milano', 'ATAC Roma'],
  },
  'gls-es': {
    petrol_station: ['Moeve', 'Galp', 'Cepsa', 'Repsol'],
    supermarket: ['Carrefour', 'Mercadona', 'Lidl España', 'Día'],
    shopping_center: ['lyc', 'La Maquinista', 'Plaza Mayor', 'Xanadú'],
  },
  'gls-pt': {
    petrol_station: ['Galp', 'BP Portugal', 'Repsol', 'Cepsa Portugal', 'Prio'],
    supermarket: ['Continente', 'Pingo Doce', 'Lidl Portugal', 'Auchan', 'Mini Preço'],
    shopping_center: ['Colombo', 'Vasco da Gama', 'NorteShopping', 'Dolce Vita Tejo'],
    public_transport: ['CP Comboios de Portugal', 'Metro Lisboa', 'STCP Porto'],
  },
}

export type Provider =
  | 'bloqit'
  | 'myflexbox'
  | 'swipbox'
  | 'keba'
  | 'tamburi'
  | 'quadient'
  | 'locky'
  | 'amazon'
  | 'cainiao'

export type CompartmentSize = 'S' | 'M' | 'L' | 'XL'
export type CompartmentStatus = 'available' | 'occupied' | 'reserved' | 'defective'

export type Compartment = {
  id: string
  size: CompartmentSize
  status: CompartmentStatus
  parcelId?: string
}

export type JourneyStep = 'Delivered' | 'Error' | 'Pending' | 'Right Now' | 'Success' | 'Warning' | 'Expired'

export type ActivityCategory = 'carrier' | 'compartment' | 'parcel'

export type ActivityEvent = {
  id: string
  category: ActivityCategory
  event: string
  detail?: string
  timestamp: string
  step: JourneyStep
}

export function getActivitiesForLocker(lockerId: string): ActivityEvent[] {
  const base = lockerId.charCodeAt(0)
  const parcelIdFor = (offset: number) => `Parcel ID: ${7632894571239876 + base * 1000000000 + offset * 1_000_000_000}`
  const compartmentIdFor = (i: number) => `C-${String(((base + i) % 24) + 1).padStart(3, '0')}`

  // Chronologically ordered (newest first) — interleaved across categories so
  // the "All" view reads like a single timeline. Templates mirror real portal
  // flows: manual transitions, share-locker invites, compartment reset / access
  // code, reservations, status changes, etc.
  const ordered: Omit<ActivityEvent, 'id'>[] = [
    { category: 'compartment', event: `Compartment ${compartmentIdFor(0)} opened by Driver`, detail: 'Access code accepted', step: 'Pending', timestamp: 'Today, 10:34' },
    { category: 'parcel', event: 'Parcel Delivered to Locker by Courier', detail: parcelIdFor(0), step: 'Success', timestamp: 'Today, 08:00' },
    { category: 'parcel', event: 'Reminder sent to Consignee', detail: parcelIdFor(0), step: 'Pending', timestamp: 'Today, 06:55' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(1)} opened by Consignee`, step: 'Pending', timestamp: 'Today, 03:12' },

    { category: 'parcel', event: 'Parcel collected by Consignee', detail: parcelIdFor(1), step: 'Success', timestamp: 'Yesterday, 14:30' },
    { category: 'compartment', event: `Access code sent for ${compartmentIdFor(1)}`, detail: 'Sent to consignee@example.com', step: 'Pending', timestamp: 'Yesterday, 12:48' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(2)} marked as defective`, detail: 'Sensor reported door fault', step: 'Error', timestamp: 'Yesterday, 11:45' },
    { category: 'carrier', event: 'Carrier status changed to maintenance', detail: 'By Laura Graf', step: 'Warning', timestamp: 'Yesterday, 11:40' },
    { category: 'parcel', event: 'Parcel manually marked as Expired', detail: parcelIdFor(2), step: 'Warning', timestamp: 'Yesterday, 08:05' },

    { category: 'carrier', event: 'Carrier status changed to active', detail: 'By Max Hoffmann', step: 'Success', timestamp: 'Tu., 01.5.2025, 15:00' },
    { category: 'parcel', event: 'Parcel collected by Courier', detail: parcelIdFor(3), step: 'Success', timestamp: 'Tu., 01.5.2025, 14:30' },
    { category: 'parcel', event: 'Driver collection event triggered', detail: parcelIdFor(3), step: 'Pending', timestamp: 'Tu., 01.5.2025, 14:25' },

    { category: 'compartment', event: `Compartment ${compartmentIdFor(3)} reset to ready for storage`, detail: 'Manual reset by Max Hoffmann', step: 'Success', timestamp: 'Mo., 28.4.2025, 09:12' },

    { category: 'parcel', event: 'Booking created by Sender', detail: parcelIdFor(4), step: 'Pending', timestamp: 'Fr., 25.4.2025, 16:45' },
    { category: 'carrier', event: 'Provider status changed to inactive', detail: 'By provider', step: 'Warning', timestamp: 'Fr., 25.4.2025, 11:30' },
    { category: 'parcel', event: 'Parcel expired', detail: parcelIdFor(5), step: 'Warning', timestamp: 'Fr., 25.4.2025, 09:18' },

    { category: 'parcel', event: 'Parcel Delivered to Locker by Courier', detail: parcelIdFor(6), step: 'Success', timestamp: 'Th., 24.4.2025, 18:02' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(4)} opened by Driver`, detail: 'Access code accepted', step: 'Pending', timestamp: 'Th., 24.4.2025, 16:50' },
    { category: 'carrier', event: 'Locker information updated', detail: 'By Max Hoffmann', step: 'Pending', timestamp: 'Th., 24.4.2025, 14:22' },

    { category: 'parcel', event: 'Parcel collected by Consignee', detail: parcelIdFor(7), step: 'Success', timestamp: 'We., 23.4.2025, 17:21' },
    { category: 'compartment', event: `Access code sent for ${compartmentIdFor(5)}`, detail: 'Sent via SMS to +49 …', step: 'Pending', timestamp: 'We., 23.4.2025, 12:35' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(5)} opened by Consignee`, step: 'Pending', timestamp: 'We., 23.4.2025, 12:08' },

    { category: 'carrier', event: 'Locker shared with GLS Austria', detail: 'By Max Hoffmann', step: 'Pending', timestamp: 'Tu., 22.4.2025, 20:00' },
    { category: 'parcel', event: 'Booking created by Sender', detail: parcelIdFor(8), step: 'Pending', timestamp: 'Tu., 22.4.2025, 19:40' },
    { category: 'compartment', event: `Hard reservation created on ${compartmentIdFor(6)}`, detail: parcelIdFor(8), step: 'Pending', timestamp: 'Tu., 22.4.2025, 19:38' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(7)} marked as defective`, detail: 'Reported by driver', step: 'Error', timestamp: 'Tu., 22.4.2025, 14:55' },

    { category: 'parcel', event: 'Parcel manually marked as Ready for Pickup', detail: parcelIdFor(9), step: 'Warning', timestamp: 'Mo., 21.4.2025, 17:05' },
    { category: 'parcel', event: 'Parcel collected by Courier', detail: parcelIdFor(10), step: 'Success', timestamp: 'Mo., 21.4.2025, 16:33' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(8)} opened by Carrier`, detail: 'Manual override from portal', step: 'Pending', timestamp: 'Mo., 21.4.2025, 11:48' },

    { category: 'compartment', event: `Compartment ${compartmentIdFor(9)} opened by Driver`, step: 'Pending', timestamp: 'Su., 20.4.2025, 18:12' },
    { category: 'parcel', event: 'Parcel Delivered to Locker by Courier', detail: parcelIdFor(11), step: 'Success', timestamp: 'Su., 20.4.2025, 14:20' },
    { category: 'compartment', event: `Soft reservation created on ${compartmentIdFor(10)}`, detail: parcelIdFor(11), step: 'Pending', timestamp: 'Su., 20.4.2025, 09:18' },

    { category: 'parcel', event: 'Parcel collected by Consignee', detail: parcelIdFor(12), step: 'Success', timestamp: 'Sa., 19.4.2025, 17:45' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(11)} opened by Consignee`, step: 'Pending', timestamp: 'Sa., 19.4.2025, 11:08' },

    { category: 'parcel', event: 'Booking rejected', detail: 'Parcel dimensions exceed compartment', step: 'Error', timestamp: 'Fr., 18.4.2025, 20:14' },
    { category: 'carrier', event: 'Share invitation accepted by DPD Germany', detail: 'By DPD Germany', step: 'Success', timestamp: 'Fr., 18.4.2025, 14:30' },

    { category: 'compartment', event: `Reservation on ${compartmentIdFor(12)} cleared`, detail: 'Timeout — no deposit detected', step: 'Pending', timestamp: 'Th., 17.4.2025, 18:22' },
    { category: 'parcel', event: 'Parcel manually reverted to Expected', detail: parcelIdFor(13), step: 'Pending', timestamp: 'Th., 17.4.2025, 12:08' },
    { category: 'parcel', event: 'Booking cancelled by Carrier', detail: parcelIdFor(13), step: 'Error', timestamp: 'Th., 17.4.2025, 11:50' },

    { category: 'parcel', event: 'Parcel Delivered to Locker by Courier', detail: parcelIdFor(14), step: 'Success', timestamp: 'We., 16.4.2025, 09:55' },
    { category: 'compartment', event: `Compartment ${compartmentIdFor(13)} marked as defective`, detail: 'Door sensor unresponsive', step: 'Error', timestamp: 'Tu., 15.4.2025, 21:10' },
    { category: 'carrier', event: 'Provider status changed to active', detail: 'By provider', step: 'Success', timestamp: 'Tu., 15.4.2025, 09:18' },

    { category: 'parcel', event: 'Parcel collected by Consignee', detail: parcelIdFor(15), step: 'Success', timestamp: 'Mo., 14.4.2025, 14:25' },
    { category: 'carrier', event: 'Share invitation revoked', detail: 'By Max Hoffmann', step: 'Warning', timestamp: 'Mo., 14.4.2025, 10:30' },
    { category: 'compartment', event: `Parcel deposited in ${compartmentIdFor(14)}`, detail: parcelIdFor(15), step: 'Success', timestamp: 'Su., 13.4.2025, 16:14' },

    // Genesis event — always the oldest entry; nothing happens on this locker
    // before it was activated.
    { category: 'carrier', event: 'Locker activated', detail: 'By Max Hoffmann', step: 'Success', timestamp: 'Mo., 03.3.2025, 09:00' },
  ]

  return ordered.map((evt, i) => ({ ...evt, id: `ACT-${base}-${i}` }))
}

// Deterministic 11-digit parcel ID derived from a (lockerId, compartmentIndex)
// pair. Used as the single source of truth so that compartment.parcelId on a
// locker page matches the parcelId of the In Locker / Expected parcel in the
// parcel overview. Range 40_000_000_000–49_999_999_999.
export function parcelIdForCompartment(lockerId: string, compartmentIndex: number): string {
  let hash = 0
  for (let i = 0; i < lockerId.length; i++) {
    hash = (hash * 33 + lockerId.charCodeAt(i)) & 0x7fffffff
  }
  const seed = (hash * 53 + compartmentIndex * 7919) >>> 0
  return String(40_000_000_000 + (seed % 9_999_999_999))
}

function lockerHash(lockerId: string): number {
  let hash = 0
  for (let i = 0; i < lockerId.length; i++) {
    hash = (hash * 31 + lockerId.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

export function getCompartmentAvailabilityForLocker(
  lockerId: string,
): { available: number; total: number; percent: number } {
  const hash = lockerHash(lockerId)
  const total = 15 + (hash % 26)
  const percent = (hash >> 5) % 101
  const available = Math.round((percent / 100) * total)
  return { available, total, percent }
}

/**
 * A locker that is offline on both sides — carrier-inactive AND
 * provider-inactive — holds no parcels and reports no compartment capacity
 * (capacity renders as "–" and sorts to the bottom).
 */
export function isLockerOffline(
  locker: Pick<Locker, 'carrierStatus' | 'providerStatus'>,
): boolean {
  return locker.carrierStatus === 'inactive' && locker.providerStatus === 'inactive'
}

export function getCompartmentsForLocker(lockerId: string): Compartment[] {
  // Deterministic mock based on lockerId hash. Lockers carry 15–40
  // compartments (avg ~28). Availability percent varies per locker; the
  // remaining capacity is split into occupied/reserved with a small
  // defective tail.
  const sizes: CompartmentSize[] = ['S', 'M', 'L', 'XL']
  const hash = lockerHash(lockerId)
  const { total: count, available } = getCompartmentAvailabilityForLocker(lockerId)

  const defective = Math.max(0, Math.min(count - available, Math.round(count * 0.05)))
  const remaining = count - available - defective
  const occupied = Math.round(remaining * 0.6)
  const reserved = Math.max(0, remaining - occupied)

  const availableEnd = available
  const occupiedEnd = availableEnd + occupied
  const reservedEnd = occupiedEnd + reserved
  // remaining → defective

  return Array.from({ length: count }, (_, i) => {
    let status: CompartmentStatus
    if (i < availableEnd) status = 'available'
    else if (i < occupiedEnd) status = 'occupied'
    else if (i < reservedEnd) status = 'reserved'
    else status = 'defective'
    return {
      id: `C-${String(i + 1).padStart(3, '0')}`,
      size: sizes[(i + (hash % 4)) % sizes.length],
      status,
      parcelId: status === 'occupied' || status === 'reserved' ? parcelIdForCompartment(lockerId, i) : undefined,
    }
  })
}

export const providerLabels: Record<Provider, string> = {
  bloqit: 'Bloq.it',
  myflexbox: 'myflexbox',
  swipbox: 'SwipBox',
  keba: 'KEBA',
  tamburi: 'tamburi',
  quadient: 'Quadient',
  locky: 'Locky',
  amazon: 'Amazon',
  cainiao: 'Cainiao',
}

interface LockerRegion {
  streets: string[]
  cities: string[]
  depotPrefix: string
  stationPrefix: string
  regionNames: string[]
  agencyNames: string[]
  /** Explicit, locale-appropriate depot identifiers (PREFIX NNN codes for
   * carriers that run their own depots, outsourced agency company names for
   * carriers that contract local agencies). 8 entries per carrier so each
   * generated locker can be deterministically assigned. */
  depots: string[]
}

const regions: Record<string, LockerRegion> = {
  'gls-de': {
    streets: [
      'Lindenstraße', 'Friedrichstraße', 'Schillerstraße', 'Bahnhofstraße',
      'Rosenstraße', 'Königstraße', 'Hermannstraße', 'Friedrich-Ebert-Straße',
      'Hauptstraße', 'Berliner Straße', 'Gartenstraße', 'Schulstraße',
      'Dorfstraße', 'Bergstraße', 'Birkenweg', 'Kirchstraße',
      'Waldstraße', 'Ringstraße', 'Mozartstraße', 'Jahnstraße',
      'Goethestraße', 'Wiesenstraße', 'Tulpenweg', 'Industriestraße',
      'Am Markt', 'Poststraße', 'Mühlenweg', 'Bachstraße',
      'Erlenweg', 'Sonnenstraße', 'Lessingstraße', 'Parkstraße',
    ],
    cities: [
      '10115 Berlin', '10117 Berlin', '10967 Berlin', '12051 Berlin',
      '70173 Stuttgart', '70174 Stuttgart', '20095 Hamburg', '20099 Hamburg',
      '04103 Leipzig', '04109 Leipzig', '53173 Bonn', '53111 Bonn',
      '65187 Wiesbaden', '80331 München', '80333 München', '50667 Köln',
      '50668 Köln', '60311 Frankfurt', '60313 Frankfurt', '01067 Dresden',
      '01069 Dresden', '90402 Nürnberg', '30159 Hannover', '30161 Hannover',
      '28195 Bremen', '40210 Düsseldorf', '40211 Düsseldorf', '45127 Essen',
      '44135 Dortmund', '76131 Karlsruhe', '68159 Mannheim', '86150 Augsburg',
    ],
    depotPrefix: 'DE',
    stationPrefix: 'PaketStation',
    regionNames: ['DE-West', 'DE-SUED', 'DE-OST', 'DE-NORD', 'DE-MITTE'],
    agencyNames: [
      'GLS Nord GmbH', 'GLS Süd GmbH', 'GLS West GmbH', 'GLS Ost GmbH',
      'GLS Mitte GmbH', 'GLS Bayern GmbH', 'GLS Hessen GmbH', 'GLS NRW GmbH',
    ],
    depots: [
      'DE 400', 'DE 370', 'DE 860', 'DE 510', 'DE 230', 'DE 720', 'DE 680', 'DE 940',
      'DE 120', 'DE 250', 'DE 580', 'DE 790', 'DE 350', 'DE 460',
    ],
  },
  'dpd-de': {
    streets: [
      'Alexanderplatz', 'Kurfürstendamm', 'Unter den Linden', 'Potsdamer Platz',
      'Marienplatz', 'Leopoldstraße', 'Maximilianstraße', 'Sendlinger Straße',
      'Zeil', 'Kaiserstraße', 'Berger Straße', 'Hanauer Landstraße',
      'Schildergasse', 'Hohe Straße', 'Ehrenstraße', 'Breite Straße',
      'Große Bleichen', 'Mönckebergstraße', 'Jungfernstieg', 'Spitalerstraße',
      'Schlossstraße', 'Wilmersdorfer Straße', 'Karl-Marx-Straße', 'Torstraße',
      'Prenzlauer Allee', 'Kantstraße', 'Oranienstraße', 'Brunnenstraße',
      'Greifswalder Straße', 'Schönhauser Allee', 'Kastanienallee', 'Danziger Straße',
    ],
    cities: [
      '10178 Berlin', '10719 Berlin', '10117 Berlin', '10785 Berlin',
      '80331 München', '80802 München', '80539 München', '80331 München',
      '60313 Frankfurt', '60311 Frankfurt', '60316 Frankfurt', '60314 Frankfurt',
      '50667 Köln', '50667 Köln', '50672 Köln', '50667 Köln',
      '20354 Hamburg', '20095 Hamburg', '20354 Hamburg', '20095 Hamburg',
      '12163 Berlin', '10627 Berlin', '12043 Berlin', '10119 Berlin',
      '10405 Berlin', '10627 Berlin', '10999 Berlin', '10119 Berlin',
      '10405 Berlin', '10435 Berlin', '10435 Berlin', '10407 Berlin',
    ],
    depotPrefix: 'DPD',
    stationPrefix: 'Pickup Paketshop',
    regionNames: ['Nord', 'Süd', 'Ost', 'West', 'Mitte'],
    agencyNames: [
      'DPD Berlin', 'DPD Ruhrgebiet', 'DPD Süddeutschland', 'DPD Hamburg',
      'DPD Bayern', 'DPD Sachsen', 'DPD Frankfurt', 'DPD Hannover',
    ],
    depots: [
      'DPD 010', 'DPD 080', 'DPD 130', 'DPD 220', 'DPD 350', 'DPD 470', 'DPD 590', 'DPD 660',
      'DPD 110', 'DPD 290', 'DPD 410', 'DPD 540', 'DPD 720',
    ],
  },
  'gls-at': {
    streets: [
      'Kärntner Straße', 'Mariahilfer Straße', 'Graben', 'Ringstraße',
      'Landstraßer Hauptstraße', 'Favoritenstraße', 'Taborstraße', 'Praterstraße',
      'Währinger Straße', 'Hernalser Hauptstraße', 'Hütteldorfer Straße', 'Linzer Straße',
      'Getreidegasse', 'Mozartplatz', 'Linzergasse', 'Rainerstraße',
      'Landstraße', 'Herrengasse', 'Hauptplatz', 'Schmiedgasse',
      'Maria-Theresien-Straße', 'Museumstraße', 'Anichstraße', 'Maximilianstraße',
      'Bürgerstraße', 'Kreuzgasse', 'Neubaugasse', 'Josefstädter Straße',
      'Alser Straße', 'Nußdorfer Straße', 'Döblinger Hauptstraße', 'Billrothstraße',
    ],
    cities: [
      '1010 Wien', '1060 Wien', '1010 Wien', '1010 Wien',
      '1030 Wien', '1100 Wien', '1020 Wien', '1020 Wien',
      '1090 Wien', '1170 Wien', '1150 Wien', '1140 Wien',
      '5020 Salzburg', '5020 Salzburg', '5020 Salzburg', '5020 Salzburg',
      '8010 Graz', '8010 Graz', '4020 Linz', '8010 Graz',
      '6020 Innsbruck', '6020 Innsbruck', '6020 Innsbruck', '6020 Innsbruck',
      '9020 Klagenfurt', '1070 Wien', '1070 Wien', '1080 Wien',
      '1080 Wien', '1090 Wien', '1190 Wien', '1190 Wien',
    ],
    depotPrefix: 'AT',
    stationPrefix: 'PaketStation',
    regionNames: ['Ost', 'West', 'Süd', 'Nord'],
    agencyNames: [
      'GLS Austria Ost', 'GLS Austria West', 'GLS Austria Süd', 'GLS Austria Nord',
      'GLS Tirol', 'GLS Wien', 'GLS Steiermark',
    ],
    depots: [
      'AT 100', 'AT 220', 'AT 340', 'AT 460', 'AT 580', 'AT 690', 'AT 770', 'AT 880',
      'AT 110', 'AT 250', 'AT 390', 'AT 510', 'AT 630',
    ],
  },
  'gls-it': {
    streets: [
      'Via Roma', 'Via Garibaldi', 'Corso Vittorio Emanuele', 'Via Dante',
      'Via Manzoni', 'Via Torino', 'Corso Buenos Aires', 'Via Montenapoleone',
      'Via del Corso', 'Via Condotti', 'Via Nazionale', 'Via Veneto',
      'Via Toledo', 'Via Chiaia', 'Corso Umberto', 'Via dei Tribunali',
      'Via Indipendenza', 'Via Rizzoli', 'Via Ugo Bassi', 'Strada Maggiore',
      'Via Maqueda', 'Corso Vittorio Emanuele', 'Via Roma', 'Via Libertà',
      'Via XX Settembre', 'Via San Lorenzo', 'Via Garibaldi', 'Corso Italia',
      'Corso Palladio', 'Corso Andrea Palladio', 'Via Roma', 'Via Calmaggiore',
    ],
    cities: [
      '20121 Milano', '20121 Milano', '20122 Milano', '20121 Milano',
      '20121 Milano', '20123 Milano', '20124 Milano', '20121 Milano',
      '00186 Roma', '00187 Roma', '00184 Roma', '00187 Roma',
      '80134 Napoli', '80121 Napoli', '80138 Napoli', '80138 Napoli',
      '40121 Bologna', '40125 Bologna', '40126 Bologna', '40125 Bologna',
      '90134 Palermo', '90133 Palermo', '90133 Palermo', '90139 Palermo',
      '16121 Genova', '16123 Genova', '16124 Genova', '16121 Genova',
      '36100 Vicenza', '36100 Vicenza', '31100 Treviso', '31100 Treviso',
    ],
    depotPrefix: 'IT',
    stationPrefix: 'Punto Pacco',
    regionNames: ['EAST', 'WEST', 'MIDDLE', 'ROME', 'MILAN'],
    agencyNames: [
      'GLS Italia Nord', 'GLS Italia Centro', 'GLS Italia Sud', 'GLS Sicilia',
      'GLS Lombardia', 'GLS Veneto', 'GLS Lazio', 'GLS Toscana',
    ],
    depots: [
      'IT 110', 'IT 200', 'IT 320', 'IT 450', 'IT 540', 'IT 660', 'IT 780', 'IT 920',
      'IT 150', 'IT 280', 'IT 410', 'IT 530', 'IT 850',
    ],
  },
  'gls-es': {
    streets: [
      'Calle Mayor', 'Calle Alcalá', 'Gran Vía', 'Paseo del Prado',
      'Calle Goya', 'Calle Serrano', 'Calle Velázquez', 'Avenida de América',
      'Paseo de la Castellana', 'Calle Bravo Murillo', 'Calle Princesa', 'Calle Atocha',
      'Carrer de Gràcia', 'Avinguda Diagonal', 'Rambla de Catalunya', 'Passeig de Gràcia',
      'Carrer de Balmes', 'Carrer de Pelai', 'Carrer del Consell de Cent', 'La Rambla',
      'Avenida de la Constitución', 'Calle San Fernando', 'Calle Sierpes', 'Avenida de la Palmera',
      'Calle Colón', 'Calle de la Paz', 'Calle Ruzafa', 'Avenida del Puerto',
      'Calle Larios', 'Plaza de la Constitución', 'Calle Alfonso X', 'Avenida de Andalucía',
    ],
    cities: [
      '28001 Madrid', '28002 Madrid', '28004 Madrid', '28013 Madrid',
      '28014 Madrid', '28020 Madrid', '28045 Madrid', '28006 Madrid',
      '08001 Barcelona', '08002 Barcelona', '08008 Barcelona', '08025 Barcelona',
      '08010 Barcelona', '08036 Barcelona', '08018 Barcelona', '08007 Barcelona',
      '41001 Sevilla', '41003 Sevilla', '41004 Sevilla', '41010 Sevilla',
      '46001 Valencia', '46004 Valencia', '46021 Valencia', '46011 Valencia',
      '29001 Málaga', '29005 Málaga', '30001 Murcia', '50001 Zaragoza',
      '48001 Bilbao', '48003 Bilbao', '15001 A Coruña', '38001 Santa Cruz de Tenerife',
    ],
    depotPrefix: 'ES',
    stationPrefix: 'Punto Pack',
    regionNames: ['Norte', 'Centro', 'Este', 'NorEste'],
    agencyNames: [
      'GLS España Norte', 'GLS España Centro', 'GLS España Sur', 'GLS Cataluña',
      'GLS Andalucía', 'GLS Galicia', 'GLS Levante', 'GLS Madrid',
    ],
    depots: [
      'Iberia Express SLU', 'Mediterranean Logistics', 'Andalucía Pack',
      'Catalunya Distribución', 'Norte Express', 'Levante Logística',
      'Galicia Cargo', 'Madrid Logistics', 'Sevilla Logística', 'Bilbao Express',
      'Valencia Pack', 'Aragón Cargo', 'Canarias Distribución',
    ],
  },
  'gls-pt': {
    streets: [
      'Rua Augusta', 'Avenida da Liberdade', 'Rua Garrett', 'Rua do Carmo',
      'Avenida da República', 'Rua das Portas de Santo Antão', 'Rua da Prata', 'Avenida Almirante Reis',
      'Rua de São Bento', 'Avenida Engenheiro Duarte Pacheco', 'Rua do Século', 'Avenida 24 de Julho',
      'Rua de Santa Catarina', 'Avenida dos Aliados', 'Rua Júlio Dinis', 'Rua de Cedofeita',
      'Rua de Ceuta', 'Rua do Almada', 'Avenida da Boavista', 'Rua das Flores',
      'Largo do Chiado', 'Praça do Comércio', 'Rua dos Fanqueiros', 'Rua do Ouro',
      'Rua dos Combatentes da Grande Guerra', 'Avenida Doutor Lourenço Peixinho', 'Rua de São João', 'Rua do Brasil',
      'Avenida Sá da Bandeira', 'Rua dos Capelistas', 'Rua de Santo António', 'Avenida Calouste Gulbenkian',
    ],
    cities: [
      '1100 Lisboa', '1200 Lisboa', '1250 Lisboa', '1300 Lisboa',
      '1400 Lisboa', '1500 Lisboa', '1600 Lisboa', '1900 Lisboa',
      '4000 Porto', '4050 Porto', '4100 Porto', '4150 Porto',
      '4200 Porto', '4250 Porto', '4300 Porto', '4350 Porto',
      '3000 Coimbra', '3030 Coimbra', '4700 Braga', '4710 Braga',
      '8000 Faro', '8005 Faro', '9000 Funchal', '9020 Funchal',
      '2700 Amadora', '2720 Amadora', '2800 Almada', '2810 Almada',
      '3800 Aveiro', '3810 Aveiro', '2400 Leiria', '2410 Leiria',
    ],
    depotPrefix: 'PT',
    stationPrefix: 'Ponto Paket',
    regionNames: ['Norte', 'Centro', 'Sul', 'Ilhas'],
    agencyNames: [
      'GLS Portugal Norte', 'GLS Portugal Centro', 'GLS Portugal Sul', 'GLS Algarve',
      'GLS Madeira', 'GLS Açores', 'GLS Aveiro', 'GLS Lisboa',
    ],
    depots: [
      'Norte Logística', 'Lisboa Pack', 'Porto Express', 'Algarve Distribuição',
      'Centro Express', 'Coimbra Pack', 'Madeira Cargo', 'Aveiro Logística',
      'Setúbal Express', 'Faro Logística', 'Viana Cargo', 'Évora Pack', 'Castelo Distribuição',
    ],
  },
}

const allProviders: Provider[] = ['bloqit', 'myflexbox', 'swipbox', 'keba', 'tamburi', 'quadient', 'locky', 'amazon', 'cainiao']

// Per-carrier provider catalogues. Carriers without an explicit entry use the
// full list (`allProviders`).
const providersByCarrier: Record<string, Provider[]> = {
  'gls-de': ['myflexbox', 'bloqit', 'amazon'],
  'dpd-de': ['bloqit'],
  'gls-at': ['tamburi', 'myflexbox'],
  'gls-it': ['keba', 'bloqit', 'quadient'],
  'gls-es': ['keba', 'bloqit'],
  'gls-pt': ['locky', 'keba'],
}

// Providers available to a given carrier. Falls back to the full list for any
// carrier without an explicit catalogue entry.
export function providersForCarrier(carrierId: string): Provider[] {
  return providersByCarrier[carrierId] ?? allProviders
}

const carrierStatuses: Locker['carrierStatus'][] = ['active', 'active', 'active', 'active', 'active', 'inactive', 'maintenance', 'decommissioned']
const providerStatuses: Locker['providerStatus'][] = ['active', 'active', 'active', 'active', 'inactive']

// Indoor lockers run on host hours. A handful of representative shop schedules
// are sampled per locker; outdoor lockers default to 24/7.
const indoorOpeningHoursPresets: OpeningHours[] = [
  {
    kind: 'business-hours',
    weekdays: { open: '09:00', close: '21:00' },
    saturday: { open: '09:00', close: '20:00' },
    sunday: null,
  },
  {
    kind: 'business-hours',
    weekdays: { open: '08:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: null,
  },
  {
    kind: 'business-hours',
    weekdays: { open: '07:00', close: '23:00' },
    saturday: { open: '07:00', close: '23:00' },
    sunday: { open: '08:00', close: '22:00' },
  },
  {
    kind: 'business-hours',
    weekdays: { open: '10:00', close: '22:00' },
    saturday: { open: '10:00', close: '22:00' },
    sunday: { open: '11:00', close: '20:00' },
  },
  {
    kind: 'business-hours',
    weekdays: { open: '06:30', close: '22:00' },
    saturday: { open: '07:00', close: '20:00' },
    sunday: null,
  },
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Carrier display names used for ownedBy / sharedWith values. Imported lazily to avoid circular deps.
const carrierNames: Record<string, string> = {
  'gls-de': 'GLS Germany',
  'dpd-de': 'DPD Germany',
  'gls-at': 'GLS Austria',
  'gls-it': 'GLS Italy',
  'gls-es': 'GLS Spain',
  'gls-pt': 'GLS Portugal',
}

const providerOwnerLabels: Partial<Record<Provider, string>> = {
  myflexbox: 'Myflexbox',
  amazon: 'Amazon',
}

const providerModelPool: Record<Provider, string[]> = {
  bloqit: ['NXT', 'Pro', 'Lite'],
  myflexbox: ['MyFlexBox S', 'MyFlexBox L', 'MyFlexBox XL'],
  swipbox: ['Infinity Series 2', 'Infinity Series 1'],
  keba: ['KePol Classic', 'KePol XL', 'KePol Urban'],
  tamburi: ['Tamburi Plus', 'Tamburi Compact'],
  quadient: ['Parcel Pending Pro', 'Parcel Pending S'],
  locky: ['Locky Pro', 'Locky Standard'],
  amazon: ['Hub V2', 'Hub V3'],
  cainiao: ['Cainiao Hub', 'Cainiao Hub Lite'],
}

const providerVersionPool = ['v. 1.0.4', 'v. 1.2.1', 'v. 1.2.4', 'v. 1.4.0', 'v. 2.0.1', 'v. 2.1.3']

// Per-carrier ownedBy whitelist. Determines which entities can appear as the
// owner of a locker for that carrier. `ownership` is derived from the chosen
// name (active carrier → 'owned', other carrier → 'shared-carrier', provider
// brand → 'shared-provider'). Carriers without an entry fall back to the
// legacy logic in `generateLockers`.
const ownedByPoolByCarrier: Partial<Record<string, string[]>> = {
  'gls-de': ['GLS Germany', 'DPD Germany', 'Amazon', 'Myflexbox'],
  'dpd-de': ['DPD Germany', 'GLS Germany'],
  'gls-es': ['GLS Spain'],
  'gls-pt': ['GLS Portugal'],
}

const providerBrandSet = new Set(['Amazon', 'Myflexbox'])

function generateLockerId(carrierId: string, rand: () => number): string {
  const hex = (n: number) => n.toString(16)
  const segment = (length: number) =>
    Array.from({ length }, () => hex(Math.floor(rand() * 16))).join('')

  switch (carrierId) {
    case 'gls-es':
    case 'gls-pt':
      // UUID-shaped (not a real v4, but indistinguishable for prototyping).
      return [segment(8), segment(4), segment(4), segment(4), segment(12)].join('-')
    case 'dpd-de':
      // Format: DE + 5 digits, e.g. "DE45817".
      return `DE${10000 + Math.floor(rand() * 89999)}`
    case 'gls-de':
    case 'gls-at':
    case 'gls-it':
    default:
      // 10-digit numeric, e.g. "2760935404".
      return String(1_000_000_000 + Math.floor(rand() * 8_999_999_999))
  }
}

function generateLockers(count: number, carrierId: string): Locker[] {
  const seedMap: Record<string, number> = {
    'gls-de': 42,
    'dpd-de': 137,
    'gls-at': 271,
    'gls-it': 389,
    'gls-es': 547,
    'gls-pt': 631,
  }
  const seed = seedMap[carrierId] ?? 42
  const region = regions[carrierId] ?? regions['gls-de']
  const carrierProviders = providersByCarrier[carrierId] ?? allProviders
  const rand = seededRandom(seed)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const depots = region.depots
  const depotRegionMap: Record<string, string> = {}
  const depotAgencyMap: Record<string, string> = {}
  depots.forEach((d, i) => {
    depotRegionMap[d] = region.regionNames[i % region.regionNames.length]
    depotAgencyMap[d] = region.agencyNames[i % region.agencyNames.length]
  })

  const venueTypes: VenueType[] = [
    'shopping_center',
    'petrol_station',
    'supermarket',
    'laundry',
    'public_transport',
  ]

  const activeCarrierName = carrierNames[carrierId] ?? 'GLS Germany'
  const otherCarrierNames = Object.entries(carrierNames)
    .filter(([id]) => id !== carrierId)
    .map(([, name]) => name)

  return Array.from({ length: count }, (_, i) => {
    const num = 10001 + i
    const streetNum = 1 + Math.floor(rand() * 150)
    const depot = pick(depots)
    // 20% of lockers have expired parcels
    const hasExpired = rand() < 0.2
    const expiredParcelCount = hasExpired ? 1 + Math.floor(rand() * 5) : 0
    const venueType = pick(venueTypes)
    const carrierHostPool = hostsByCarrier[carrierId]?.[venueType] ?? hostsByVenue[venueType]
    const host = pick(carrierHostPool)
    // Petrol stations and public transport skew outdoor; everything else skews indoor
    const outdoorBias = venueType === 'petrol_station' || venueType === 'public_transport'
    const placement: Placement = rand() < (outdoorBias ? 0.75 : 0.2) ? 'outdoor' : 'indoor'
    const provider = pick(carrierProviders)

    // Provider-side identifiers — separate from the carrier's locker.id.
    // Long numeric ID (~40 digits) so it visibly differs from the carrier ID.
    let providerLockerId = ''
    for (let p = 0; p < 40; p++) providerLockerId += Math.floor(rand() * 10).toString()
    const providerLockerModel = pick(providerModelPool[provider])
    const providerLockerVersion = pick(providerVersionPool)

    // Opening hours. Outdoor lockers and a few outlier indoor venues are 24/7;
    // most indoor lockers run on the host's office / shop hours.
    const openingHours: OpeningHours =
      placement === 'outdoor' || rand() < 0.1
        ? { kind: '24/7' }
        : pick(indoorOpeningHoursPresets)

    // Decompose city into postal code + city name (city strings are "PLZ Name" shape)
    const cityFull = pick(region.cities)
    const spaceIdx = cityFull.indexOf(' ')
    const postalCode = spaceIdx > 0 ? cityFull.slice(0, spaceIdx) : ''
    const cityName = spaceIdx > 0 ? cityFull.slice(spaceIdx + 1) : cityFull

    // Ownership assignment. If the carrier has an explicit ownedBy whitelist
    // (gls-de, dpd-de, gls-es, gls-pt) sample from it with a bias toward the
    // active carrier; otherwise fall back to the legacy logic.
    let ownership: LockerOwnership
    let ownedBy: string
    let sharingEnabled = false
    let sharedWith: string | undefined

    const ownedByPool = ownedByPoolByCarrier[carrierId]
    if (ownedByPool && ownedByPool.length > 0) {
      const others = ownedByPool.filter((o) => o !== activeCarrierName)
      const ownedByActive = others.length === 0 || rand() < 0.7
      const chosenOwnedBy = ownedByActive
        ? activeCarrierName
        : others[Math.floor(rand() * others.length)]
      ownedBy = chosenOwnedBy
      if (chosenOwnedBy === activeCarrierName) {
        ownership = 'owned'
        if (others.length > 0 && rand() < 0.2) {
          sharingEnabled = true
          sharedWith = others[Math.floor(rand() * others.length)]
        }
      } else if (providerBrandSet.has(chosenOwnedBy)) {
        ownership = 'shared-provider'
      } else {
        ownership = 'shared-carrier'
      }
    } else {
      const providerOwner = providerOwnerLabels[provider]
      if (providerOwner) {
        ownership = 'shared-provider'
        ownedBy = providerOwner
      } else if (rand() < 0.15) {
        ownership = 'shared-carrier'
        ownedBy = otherCarrierNames[Math.floor(rand() * otherCarrierNames.length)] ?? activeCarrierName
      } else {
        ownership = 'owned'
        ownedBy = activeCarrierName
        if (rand() < 0.2 && otherCarrierNames.length > 0) {
          sharingEnabled = true
          sharedWith = otherCarrierNames[Math.floor(rand() * otherCarrierNames.length)]
        }
      }
    }

    // Activation date somewhere in the past 1–3 years
    const daysAgo = 60 + Math.floor(rand() * (365 * 3))
    const activation = new Date()
    activation.setDate(activation.getDate() - daysAgo)
    const activationDate = activation.toISOString().slice(0, 10)

    // Status-since timestamp: bounded by activation date, biased recent for non-active
    const carrierStatus = pick(carrierStatuses)
    const sinceMaxDays = Math.min(daysAgo, carrierStatus === 'active' ? daysAgo : 45)
    const sinceDays = Math.floor(rand() * sinceMaxDays)
    const since = new Date()
    since.setDate(since.getDate() - sinceDays)
    since.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60), 0, 0)
    const statusSince = since.toISOString()

    // Geolocation roughly centered on the carrier's country with per-locker jitter.
    const geoBias: Record<string, [number, number]> = {
      'gls-de': [51.1, 10.4],
      'dpd-de': [51.1, 10.4],
      'gls-at': [48.2, 16.37],
      'gls-it': [44.5, 11.3],
      'gls-es': [40.4, -3.7],
      'gls-pt': [38.7, -9.1],
    }
    const [latBase, lngBase] = geoBias[carrierId] ?? geoBias['gls-de']
    const latitude = Number((latBase + (rand() - 0.5) * 4).toFixed(4))
    const longitude = Number((lngBase + (rand() - 0.5) * 6).toFixed(4))

    return {
      name: `${region.stationPrefix} #${num}`,
      id: generateLockerId(carrierId, rand),
      street: `${pick(region.streets)} ${streetNum}`,
      houseNumber: String(streetNum),
      postalCode,
      cityName,
      city: cityFull,
      latitude,
      longitude,
      depot,
      region: depotRegionMap[depot],
      agency: depotAgencyMap[depot],
      carrierStatus,
      providerStatus: pick(providerStatuses),
      compartments: Math.floor(rand() * 101),
      provider,
      expiredParcelCount,
      venueType,
      host,
      placement,
      ownership,
      ownedBy,
      sharingEnabled,
      sharedWith,
      activationDate,
      statusSince,
      openingHours,
      providerLockerId,
      providerLockerModel,
      providerLockerVersion,
    }
  })
}

// Default data for backward compatibility
export const lockerData: Locker[] = generateLockers(1000, 'gls-de')

// Per-carrier data cache
const lockerDataCache: Record<string, Locker[]> = {}
export function getLockerDataForCarrier(carrierId: string): Locker[] {
  if (!lockerDataCache[carrierId]) {
    const countMap: Record<string, number> = {
      'gls-de': 1000,
      'dpd-de': 300,
      'gls-at': 85,
      'gls-it': 120,
      'gls-es': 700,
      'gls-pt': 800,
    }
    lockerDataCache[carrierId] = generateLockers(countMap[carrierId] ?? 100, carrierId)
  }
  return lockerDataCache[carrierId]
}

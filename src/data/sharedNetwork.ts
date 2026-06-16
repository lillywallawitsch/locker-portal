import type { Provider } from './lockers'
import { carriers } from './carriers'

export type SharedInviteStatus = 'pending' | 'declined' | 'revoked'

export interface SharedNetworkInvite {
  id: string
  ownedBy: {
    carrierId: string
    name: string
    shortName: string
    brand: 'gls' | 'dpd'
  }
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
  }
  geolocation: {
    lat: number
    lng: number
  }
  provider: Provider
  providerModel?: string
  invitedAt: string
  statusChangedAt: string
  status: SharedInviteStatus
}

interface AddressPool {
  streets: string[]
  cityPostal: Array<{ postalCode: string; city: string; lat: number; lng: number }>
}

const addressPools: Record<string, AddressPool> = {
  'gls-de': {
    streets: [
      'Lindenstraße',
      'Friedrichstraße',
      'Schillerstraße',
      'Bahnhofstraße',
      'Rosenstraße',
      'Königstraße',
      'Hermannstraße',
      'Hauptstraße',
    ],
    cityPostal: [
      { postalCode: '10115', city: 'Berlin', lat: 52.532, lng: 13.388 },
      { postalCode: '70173', city: 'Stuttgart', lat: 48.783, lng: 9.182 },
      { postalCode: '20095', city: 'Hamburg', lat: 53.551, lng: 10.0 },
      { postalCode: '80331', city: 'München', lat: 48.138, lng: 11.575 },
      { postalCode: '50667', city: 'Köln', lat: 50.937, lng: 6.96 },
      { postalCode: '60311', city: 'Frankfurt', lat: 50.11, lng: 8.68 },
    ],
  },
  'dpd-de': {
    streets: [
      'Alexanderplatz',
      'Kurfürstendamm',
      'Unter den Linden',
      'Potsdamer Platz',
      'Marienplatz',
      'Leopoldstraße',
      'Maximilianstraße',
      'Zeil',
    ],
    cityPostal: [
      { postalCode: '10178', city: 'Berlin', lat: 52.521, lng: 13.413 },
      { postalCode: '80331', city: 'München', lat: 48.137, lng: 11.575 },
      { postalCode: '60313', city: 'Frankfurt', lat: 50.117, lng: 8.683 },
      { postalCode: '50667', city: 'Köln', lat: 50.938, lng: 6.956 },
      { postalCode: '20354', city: 'Hamburg', lat: 53.555, lng: 9.991 },
    ],
  },
  'gls-at': {
    streets: [
      'Kärntner Straße',
      'Mariahilfer Straße',
      'Graben',
      'Ringstraße',
      'Getreidegasse',
      'Landstraße',
    ],
    cityPostal: [
      { postalCode: '1010', city: 'Wien', lat: 48.208, lng: 16.373 },
      { postalCode: '5020', city: 'Salzburg', lat: 47.8, lng: 13.045 },
      { postalCode: '8010', city: 'Graz', lat: 47.071, lng: 15.439 },
      { postalCode: '6020', city: 'Innsbruck', lat: 47.268, lng: 11.393 },
    ],
  },
  'gls-it': {
    streets: [
      'Via Roma',
      'Via Garibaldi',
      'Corso Vittorio Emanuele',
      'Via Dante',
      'Via Manzoni',
      'Via Torino',
    ],
    cityPostal: [
      { postalCode: '20121', city: 'Milano', lat: 45.465, lng: 9.19 },
      { postalCode: '00186', city: 'Roma', lat: 41.903, lng: 12.496 },
      { postalCode: '80134', city: 'Napoli', lat: 40.853, lng: 14.268 },
      { postalCode: '40121', city: 'Bologna', lat: 44.494, lng: 11.342 },
    ],
  },
  'gls-es': {
    streets: [
      'Calle Mayor',
      'Gran Vía',
      'Paseo del Prado',
      'Avinguda Diagonal',
      'Rambla de Catalunya',
      'Avenida de la Constitución',
      'Calle Colón',
      'Calle Larios',
    ],
    cityPostal: [
      { postalCode: '28001', city: 'Madrid', lat: 40.418, lng: -3.703 },
      { postalCode: '08001', city: 'Barcelona', lat: 41.385, lng: 2.173 },
      { postalCode: '41001', city: 'Sevilla', lat: 37.392, lng: -5.994 },
      { postalCode: '46001', city: 'Valencia', lat: 39.469, lng: -0.376 },
      { postalCode: '48001', city: 'Bilbao', lat: 43.263, lng: -2.935 },
    ],
  },
  'gls-pt': {
    streets: [
      'Rua Augusta',
      'Avenida da Liberdade',
      'Rua Garrett',
      'Rua de Santa Catarina',
      'Avenida dos Aliados',
      'Avenida da República',
      'Largo do Chiado',
      'Rua das Flores',
    ],
    cityPostal: [
      { postalCode: '1100', city: 'Lisboa', lat: 38.716, lng: -9.139 },
      { postalCode: '4000', city: 'Porto', lat: 41.149, lng: -8.611 },
      { postalCode: '3000', city: 'Coimbra', lat: 40.211, lng: -8.429 },
      { postalCode: '8000', city: 'Faro', lat: 37.018, lng: -7.93 },
      { postalCode: '4700', city: 'Braga', lat: 41.55, lng: -8.42 },
    ],
  },
}

const providers: Provider[] = [
  'keba',
  'bloqit',
  'myflexbox',
  'swipbox',
  'tamburi',
  'quadient',
  'cainiao',
]

const providerModels: Partial<Record<Provider, string[]>> = {
  keba: ['KePol Classic', 'KePol XL', 'KePol Urban'],
  bloqit: ['Bloq Standard', 'Bloq Outdoor'],
  myflexbox: ['MyFlexBox S', 'MyFlexBox L'],
  swipbox: ['Infinity Series 2'],
  tamburi: ['Tamburi Plus'],
  quadient: ['Parcel Pending Pro'],
  cainiao: ['Cainiao Hub'],
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function daysAgoIso(days: number, hour = 14, minute = 30): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const seedMap: Record<string, number> = {
  'gls-de': 73,
  'dpd-de': 211,
  'gls-at': 337,
  'gls-it': 479,
  'gls-es': 593,
  'gls-pt': 661,
}

const countByStatus: Record<SharedInviteStatus, number> = {
  pending: 5,
  declined: 10,
  revoked: 5,
}

export function generateSharedNetworkInvites(carrierId: string): SharedNetworkInvite[] {
  const seed = seedMap[carrierId] ?? 73
  const rand = seededRandom(seed)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const pool = addressPools[carrierId] ?? addressPools['gls-de']
  const owners =
    carrierId === 'dpd-de'
      ? carriers.filter((c) => c.id === 'gls-de')
      : carriers.filter((c) => c.id !== carrierId)
  if (owners.length === 0) return []

  const invites: SharedNetworkInvite[] = []
  const statuses: SharedInviteStatus[] = ['pending', 'declined', 'revoked']
  let idCounter = 1

  for (const status of statuses) {
    const count = countByStatus[status]
    for (let i = 0; i < count; i++) {
      const owner = owners[(i + idCounter) % owners.length]
      const loc = pick(pool.cityPostal)
      const street = pick(pool.streets)
      const houseNumber = String(1 + Math.floor(rand() * 180))
      const provider = pick(providers)
      const models = providerModels[provider]
      const providerModel = models ? pick(models) : undefined
      const invitedDays = status === 'pending' ? 2 + Math.floor(rand() * 14) : 20 + Math.floor(rand() * 90)
      const statusDays =
        status === 'pending'
          ? invitedDays
          : Math.max(1, invitedDays - Math.floor(rand() * 10))

      invites.push({
        id: `${carrierId}-inv-${idCounter++}`,
        ownedBy: {
          carrierId: owner.id,
          name: owner.name,
          shortName: owner.shortName,
          brand: owner.brand,
        },
        address: {
          street,
          houseNumber,
          postalCode: loc.postalCode,
          city: loc.city,
        },
        geolocation: {
          lat: parseFloat((loc.lat + (rand() - 0.5) * 0.04).toFixed(5)),
          lng: parseFloat((loc.lng + (rand() - 0.5) * 0.04).toFixed(5)),
        },
        provider,
        providerModel,
        invitedAt: daysAgoIso(invitedDays, Math.floor(rand() * 24), Math.floor(rand() * 60)),
        statusChangedAt: daysAgoIso(statusDays, Math.floor(rand() * 24), Math.floor(rand() * 60)),
        status,
      })
    }
  }

  return invites
}

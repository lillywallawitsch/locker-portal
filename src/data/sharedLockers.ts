import type { Locker, Provider } from './lockers'
import { carriers } from './carriers'
import type { Carrier } from './carriers'

export type OutgoingShareStatus = 'pending' | 'accepted' | 'declined' | 'revoked'

export interface OutgoingShareInvite {
  id: string
  lockerId: string
  lockerName: string
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
  }
  provider: Provider
  invitedCarrier: {
    carrierId: string
    name: string
    shortName: string
    brand: 'gls' | 'dpd'
  }
  invitedAt: string
  statusChangedAt: string
  status: OutgoingShareStatus
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
  'gls-de': 911,
  'dpd-de': 1093,
  'gls-at': 1277,
  'gls-it': 1453,
  'gls-es': 1601,
  'gls-pt': 1789,
}

const countByStatus: Record<OutgoingShareStatus, number> = {
  pending: 5,
  accepted: 3,
  declined: 3,
  revoked: 2,
}

export function generateOutgoingShares(carrierId: string, lockers: Locker[]): OutgoingShareInvite[] {
  const ownedLockers = lockers.filter((l) => l.ownership === 'owned')
  if (ownedLockers.length === 0) return []

  const seed = seedMap[carrierId] ?? 911
  const rand = seededRandom(seed)

  const invitable: Carrier[] =
    carrierId === 'dpd-de'
      ? carriers.filter((c) => c.id === 'gls-de')
      : carriers.filter((c) => c.id !== carrierId)
  if (invitable.length === 0) return []

  const invites: OutgoingShareInvite[] = []
  const statuses: OutgoingShareStatus[] = ['pending', 'accepted', 'declined', 'revoked']
  let idCounter = 1

  for (const status of statuses) {
    const count = Math.min(countByStatus[status], ownedLockers.length)
    for (let i = 0; i < count; i++) {
      const target = invitable[(i + idCounter) % invitable.length]
      const locker = ownedLockers[(idCounter * 7 + i * 13) % ownedLockers.length]
      const invitedDays = status === 'pending' ? 1 + Math.floor(rand() * 12) : 15 + Math.floor(rand() * 90)
      const statusDays =
        status === 'pending'
          ? invitedDays
          : Math.max(1, invitedDays - Math.floor(rand() * 10))

      invites.push({
        id: `${carrierId}-out-${idCounter++}`,
        lockerId: locker.id,
        lockerName: locker.name,
        address: {
          street: locker.street,
          houseNumber: locker.houseNumber,
          postalCode: locker.postalCode,
          city: locker.cityName,
        },
        provider: locker.provider,
        invitedCarrier: {
          carrierId: target.id,
          name: target.name,
          shortName: target.shortName,
          brand: target.brand,
        },
        invitedAt: daysAgoIso(invitedDays, Math.floor(rand() * 24), Math.floor(rand() * 60)),
        statusChangedAt: daysAgoIso(statusDays, Math.floor(rand() * 24), Math.floor(rand() * 60)),
        status,
      })
    }
  }

  return invites
}

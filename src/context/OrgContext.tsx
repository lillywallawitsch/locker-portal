import { createContext, useContext } from 'react'
import type { Carrier } from '../data/carriers'
import type { Locker } from '../data/lockers'
import type { ParcelOverviewItem } from '../data/parcels'
import type { UserData } from '../data/users'
import type { SharedNetworkInvite } from '../data/sharedNetwork'
import type { OutgoingShareInvite } from '../data/sharedLockers'

export interface AcceptInviteFormValues {
  lockerName: string
  carrierLockerId: string
  activationDate: string
  depot?: string
}

interface OrgContextValue {
  carrier: Carrier
  lockerData: Locker[]
  parcelData: ParcelOverviewItem[]
  userData: UserData[]
  sharedNetworkData: SharedNetworkInvite[]
  outgoingShares: OutgoingShareInvite[]
  acceptInvite: (id: string, details: AcceptInviteFormValues) => Locker | null
  declineInvite: (id: string) => void
  shareLockers: (lockerIds: string[], carrierIds: string[]) => OutgoingShareInvite[]
  updateLocker: (id: string, updates: Partial<Locker>) => void
  addLocker: (locker: Locker) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ value, children }: { value: OrgContextValue; children: React.ReactNode }) {
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrg must be used within OrgProvider')
  return ctx
}

import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ParcelDetail from '../components/ParcelDetail'
import { useOrg } from '../context/OrgContext'
import { carrierSearch } from '../lib/url'

interface ParcelDetailRouteProps {
  carrierId: string
  navCollapsed: boolean
  onNavToggle: () => void
  initialHelpOpen?: boolean
}

interface ParcelNavState {
  from?: 'parcel-overview' | 'locker-detail'
  lockerName?: string
  /** Path+search of the locker detail to return to (when arrived from a locker). */
  backToLocker?: string
  /** Query string of the parcel list to restore (when arrived from the overview). */
  listSearch?: string
}

/**
 * Resolves `/parcels/:parcelId`. Provenance (overview vs locker detail) rides in
 * `location.state`, so a cold-loaded shared link degrades to the overview
 * breadcrumb. A missing id redirects to the parcel overview.
 */
export default function ParcelDetailRoute({ carrierId, navCollapsed, onNavToggle, initialHelpOpen }: ParcelDetailRouteProps) {
  const { parcelData } = useOrg()
  const { parcelId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ParcelNavState | null) ?? {}
  const from = state.from ?? 'parcel-overview'

  const backToOverview = `/parcels${state.listSearch ? `?${state.listSearch}` : carrierSearch(carrierId)}`

  const parcel = parcelData.find((p) => p.parcelId === parcelId)
  if (!parcel) return <Navigate to={backToOverview} replace />

  const breadcrumbBase = from === 'locker-detail' ? state.lockerName ?? 'Locker Detail' : 'Parcel Overview'

  return (
    <ParcelDetail
      parcel={parcel}
      breadcrumbBase={breadcrumbBase}
      onBack={() => {
        if (from === 'locker-detail' && state.backToLocker) navigate(state.backToLocker)
        else navigate(backToOverview)
      }}
      onLockerClick={() =>
        navigate(`/lockers/${encodeURIComponent(parcel.assignedLocker)}${carrierSearch(carrierId)}`)
      }
      navCollapsed={navCollapsed}
      onNavToggle={onNavToggle}
      initialHelpOpen={initialHelpOpen}
    />
  )
}

import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import LockerDetail from '../components/LockerDetail'
import { useOrg } from '../context/OrgContext'
import { carrierSearch } from '../lib/url'

interface LockerDetailRouteProps {
  carrierId: string
  navCollapsed: boolean
  onNavToggle: () => void
  initialHelpOpen?: boolean
}

/**
 * Resolves `/lockers/:lockerId` against the active carrier's data. A missing id
 * (deleted locker or a link shared across carriers) redirects back to the list.
 * `location.state.listSearch` carries the filtered list query so "back" restores it.
 */
export default function LockerDetailRoute({ carrierId, navCollapsed, onNavToggle, initialHelpOpen }: LockerDetailRouteProps) {
  const { lockerData } = useOrg()
  const { lockerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listSearch = (location.state as { listSearch?: string } | null)?.listSearch
  const backToList = `/lockers${listSearch ? `?${listSearch}` : carrierSearch(carrierId)}`

  const locker = lockerData.find((l) => l.id === lockerId)
  if (!locker) return <Navigate to={backToList} replace />

  return (
    <LockerDetail
      locker={locker}
      onBack={() => navigate(backToList)}
      onParcelClick={(parcel) =>
        navigate(`/parcels/${encodeURIComponent(parcel.parcelId)}${carrierSearch(carrierId)}`, {
          state: {
            from: 'locker-detail',
            lockerName: locker.name,
            backToLocker: `${location.pathname}${location.search}`,
          },
        })
      }
      navCollapsed={navCollapsed}
      onNavToggle={onNavToggle}
      initialHelpOpen={initialHelpOpen}
    />
  )
}

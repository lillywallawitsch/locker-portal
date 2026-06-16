import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  Warehouse,
  Map,
  OctagonAlert,
  Store,
  Globe,
  PieChart,
  Clock4,
} from 'lucide-react'
import {
  SearchInput,
  FilterChip,
  TableHeader,
  LockerStatusBadge,
  Pagination,
  ProviderLogo,
  Avatar,
  AdvancedFilterPopover,
  ColumnsPopover,
  columnStateEqualsDefault,
  SavedViewsPopover,
  CompartmentAvailabilityBadge,
  NeutralTag,
  TerraceIcon,
  LocationPinBuildingHomeIcon,
  ParcelStationIcon,
} from '../lib/ooh-kit'
import type { StatusBadgeVariant, ColumnDef, ColumnState, AdvancedFilterGroup } from '../lib/ooh-kit'
import { useTableUrlState } from '../hooks/useTableUrlState'
import type { TableUrlStateConfig } from '../hooks/useTableUrlState'
import {
  providerLabels,
  venueTypeLabels,
  placementLabels,
  getCompartmentAvailabilityForLocker,
  isLockerOffline,
  type Locker,
  type VenueType,
} from '../data/lockers'
import { compareNullsLast } from '../lib/sortComparator'
import { depotTerm, showOwnedBy, showHost, showVenueType } from '../lib/carrierConfig'
import { useOrg } from '../context/OrgContext'
import { CopyButton, Toast } from '../lib/unity'

interface LockerTableProps {
  onLockerClick?: (locker: Locker) => void
}

type SavedFilter = {
  id: string
  name: string
  depots: string[]
  regions: string[]
  agencies: string[]
  carrierStatus: string[]
  providers: string[]
  providerStatus: string[]
  venueTypes: string[]
  hosts: string[]
  placements: string[]
  ownedBy?: string[]
  availability?: string[]
  recentActivity?: string[]
  dateRange?: string[]
}

const SAVED_FILTERS_KEY = 'lockerPortal.savedFilters.v5'
const MY_FILTERS_TOOLTIP_SEEN_KEY = 'lockerPortal.myFiltersTooltipSeen.v1'

// Maps each filter field to its URL query key. Active filters are encoded into
// the URL (one comma-joined param per field) so a filtered view is shareable.
const FILTER_URL_KEYS: Record<string, string> = {
  selectedDepots: 'depots',
  selectedRegions: 'regions',
  selectedAgencies: 'agencies',
  selectedCarrierStatus: 'carrierStatus',
  selectedProviders: 'providers',
  selectedProviderStatus: 'providerStatus',
  selectedVenueTypes: 'venueTypes',
  selectedHosts: 'hosts',
  selectedPlacements: 'placements',
  selectedOwnedBy: 'ownedBy',
  selectedAvailability: 'availability',
  selectedRecentActivity: 'recentActivity',
  selectedDateRange: 'dateRange',
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'name', label: 'Lockers', pinned: true },
  { key: 'address', label: 'Address' },
  { key: 'depot', label: 'Depot' },
  { key: 'carrierStatusCol', label: 'Carrier Status' },
  { key: 'providerStatusCol', label: 'Provider Status' },
  { key: 'provider', label: 'Provider Name' },
  { key: 'compartment', label: 'Compartments' },
  { key: 'region', label: 'Regions' },
  { key: 'venueType', label: 'Location' },
  { key: 'host', label: 'Host' },
  { key: 'placement', label: 'Placement' },
]

const DEFAULT_COLUMN_STATE: ColumnState[] = [
  { key: 'name', visible: true },
  { key: 'address', visible: true },
  { key: 'depot', visible: true },
  { key: 'carrierStatusCol', visible: true },
  { key: 'providerStatusCol', visible: true },
  { key: 'provider', visible: true },
  { key: 'compartment', visible: true },
  { key: 'region', visible: false },
  { key: 'venueType', visible: false },
  { key: 'host', visible: false },
  { key: 'placement', visible: false },
]

function loadJson<T>(key: string, storage: Storage | null, fallback: T): T {
  if (!storage) return fallback
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, storage: Storage | null, value: unknown) {
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota/privacy errors
  }
}

const localStore = typeof window !== 'undefined' ? window.localStorage : null

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

function mergeStatus(locker: Locker): { variant: StatusBadgeVariant; label: string } {
  if (locker.carrierStatus === 'decommissioned') {
    return { variant: 'decommissioned', label: 'Decommissioned' }
  }
  if (locker.carrierStatus === 'inactive' || locker.providerStatus === 'inactive') {
    return { variant: 'inactive', label: 'Inactive' }
  }
  if (locker.carrierStatus === 'maintenance') {
    return { variant: 'maintenance', label: 'Maintenance' }
  }
  return { variant: 'active', label: 'Active' }
}

type ActiveFilterState = {
  selectedDepots: string[]
  selectedRegions: string[]
  selectedAgencies: string[]
  selectedCarrierStatus: string[]
  selectedProviders: string[]
  selectedProviderStatus: string[]
  selectedVenueTypes: string[]
  selectedHosts: string[]
  selectedPlacements: string[]
  selectedOwnedBy: string[]
  selectedAvailability: string[]
  selectedRecentActivity: string[]
  selectedDateRange: string[]
}

const EMPTY_FILTERS: ActiveFilterState = {
  selectedDepots: [],
  selectedRegions: [],
  selectedAgencies: [],
  selectedCarrierStatus: [],
  selectedProviders: [],
  selectedProviderStatus: [],
  selectedVenueTypes: [],
  selectedHosts: [],
  selectedPlacements: [],
  selectedOwnedBy: [],
  selectedAvailability: [],
  selectedRecentActivity: [],
  selectedDateRange: [],
}

const URL_STATE_CONFIG: TableUrlStateConfig<ActiveFilterState> = {
  emptyFilters: EMPTY_FILTERS,
  arrayFilterKeys: FILTER_URL_KEYS,
  columnDefs: COLUMN_DEFS,
  defaultColumnState: DEFAULT_COLUMN_STATE,
  hasItemsPerPage: true,
  defaultItemsPerPage: 10,
}

const DATE_RANGE_OPTIONS = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '48h', label: 'Last 48 hours' },
  { value: '1w', label: 'Last week' },
  { value: '1m', label: 'Last month' },
]

const DATE_RANGE_MS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
}

const DATE_RANGE_LABELS: Record<string, string> = Object.fromEntries(
  DATE_RANGE_OPTIONS.map((o) => [o.value, o.label])
)

function lockerMatchesDateRange(locker: Locker, selected: string[]): boolean {
  if (selected.length === 0) return true
  const date = new Date(locker.statusSince)
  if (Number.isNaN(date.getTime())) return false
  const elapsed = Date.now() - date.getTime()
  return selected.some((key) => {
    const window = DATE_RANGE_MS[key]
    return window !== undefined && elapsed <= window && elapsed >= 0
  })
}

const availabilityOptions = [
  { value: '0-20', label: '< 20%' },
  { value: '21-40', label: '21% - 40%' },
  { value: '41-70', label: '41% - 70%' },
  { value: '71-85', label: '71% - 85%' },
  { value: '86-100', label: '86% - 100%' },
]

const availabilityLabels: Record<string, string> = Object.fromEntries(
  availabilityOptions.map((o) => [o.value, o.label]),
)

function availabilityBucket(percent: number): string {
  if (percent <= 20) return '0-20'
  if (percent <= 40) return '21-40'
  if (percent <= 70) return '41-70'
  if (percent <= 85) return '71-85'
  return '86-100'
}

const RECENT_ACTIVITY_OPTIONS = [
  { value: 'issues-24h', label: 'Issues in last 24h' },
]

const RECENT_ACTIVITY_LABELS: Record<string, string> = Object.fromEntries(
  RECENT_ACTIVITY_OPTIONS.map((o) => [o.value, o.label]),
)

const ISSUE_STATUSES: Locker['carrierStatus'][] = ['inactive', 'maintenance', 'decommissioned']
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function matchesRecentIssues(locker: Locker): boolean {
  if (!ISSUE_STATUSES.includes(locker.carrierStatus)) return false
  return Date.now() - new Date(locker.statusSince).getTime() <= ONE_DAY_MS
}

export default function LockerTable({ onLockerClick }: LockerTableProps) {
  const { lockerData, carrier } = useOrg()
  const term = depotTerm(carrier.id)

  // View state (filters, search, sort, pagination, columns) lives entirely in
  // the URL so any view is a shareable deeplink. See useTableUrlState.
  const {
    filters,
    setFilters,
    updateFilters,
    resetAllFilters: resetAll,
    search,
    setSearch,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    columnState,
    setColumnState,
  } = useTableUrlState<ActiveFilterState>(URL_STATE_CONFIG)

  // Saved filters (localStorage, shared across carriers)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() =>
    loadJson<SavedFilter[]>(SAVED_FILTERS_KEY, localStore, [])
  )
  useEffect(() => {
    saveJson(SAVED_FILTERS_KEY, localStore, savedFilters)
  }, [savedFilters])

  // "Saved to My Filters" toast + first-time tooltip
  const [savedToastVisible, setSavedToastVisible] = useState(false)
  const [showMyFiltersTooltip, setShowMyFiltersTooltip] = useState(false)
  useEffect(() => {
    if (!savedToastVisible) return
    const t = setTimeout(() => setSavedToastVisible(false), 3000)
    return () => clearTimeout(t)
  }, [savedToastVisible])
  useEffect(() => {
    if (!showMyFiltersTooltip) return
    const t = setTimeout(() => setShowMyFiltersTooltip(false), 6000)
    return () => clearTimeout(t)
  }, [showMyFiltersTooltip])

  const depotOptions = useMemo(() => {
    const depots = [...new Set(lockerData.map((l) => l.depot))].sort()
    return depots.map((d) => ({ value: d, label: d }))
  }, [lockerData])

  const regionOptions = useMemo(() => {
    const regions = [...new Set(lockerData.map((l) => l.region))].sort()
    return regions.map((r) => ({ value: r, label: r }))
  }, [lockerData])

  const carrierStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'decommissioned', label: 'Decommissioned' },
  ]

  const providerOptions = useMemo(() => {
    const providers = [...new Set(lockerData.map((l) => l.provider))].sort()
    return providers.map((p) => ({ value: p, label: providerLabels[p] }))
  }, [lockerData])

  const providerStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const venueTypeOptions = useMemo(() => {
    const vts = [...new Set(lockerData.map((l) => l.venueType))].sort()
    return vts.map((v) => ({ value: v, label: venueTypeLabels[v as VenueType] }))
  }, [lockerData])

  const hostOptions = useMemo(() => {
    const hosts = [...new Set(lockerData.map((l) => l.host))].sort()
    return hosts.map((h) => ({ value: h, label: h }))
  }, [lockerData])

  const placementOptions = [
    { value: 'indoor', label: placementLabels.indoor },
    { value: 'outdoor', label: placementLabels.outdoor },
  ]

  const ownedByOptions = useMemo(() => {
    const owners = [...new Set(lockerData.map((l) => l.ownedBy))].sort()
    return owners.map((o) => ({ value: o, label: o }))
  }, [lockerData])

  const availabilityByLockerId = useMemo(() => {
    const map: Record<string, ReturnType<typeof getCompartmentAvailabilityForLocker>> = {}
    for (const l of lockerData) map[l.id] = getCompartmentAvailabilityForLocker(l.id)
    return map
  }, [lockerData])

  const lockerAvailability = (lockerId: string) =>
    availabilityByLockerId[lockerId] ?? getCompartmentAvailabilityForLocker(lockerId)

  const filteredLockers = useMemo(() => {
    return lockerData.filter((locker) => {
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          locker.name.toLowerCase().includes(q) ||
          locker.id.toLowerCase().includes(q) ||
          locker.street.toLowerCase().includes(q) ||
          locker.city.toLowerCase().includes(q) ||
          locker.depot.toLowerCase().includes(q) ||
          locker.region.toLowerCase().includes(q) ||
          locker.agency.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }
      if (filters.selectedDepots.length > 0 && !filters.selectedDepots.includes(locker.depot)) return false
      if (filters.selectedRegions.length > 0 && !filters.selectedRegions.includes(locker.region)) return false
      if (filters.selectedAgencies.length > 0 && !filters.selectedAgencies.includes(locker.agency)) return false
      if (filters.selectedCarrierStatus.length > 0 && !filters.selectedCarrierStatus.includes(locker.carrierStatus)) return false
      if (filters.selectedProviders.length > 0 && !filters.selectedProviders.includes(locker.provider)) return false
      if (filters.selectedProviderStatus.length > 0 && !filters.selectedProviderStatus.includes(locker.providerStatus)) return false
      if (filters.selectedVenueTypes.length > 0 && !filters.selectedVenueTypes.includes(locker.venueType)) return false
      if (filters.selectedHosts.length > 0 && !filters.selectedHosts.includes(locker.host)) return false
      if (filters.selectedPlacements.length > 0 && !filters.selectedPlacements.includes(locker.placement)) return false
      if (filters.selectedOwnedBy.length > 0 && !filters.selectedOwnedBy.includes(locker.ownedBy)) return false
      if (filters.selectedAvailability.length > 0) {
        // Offline lockers report no capacity (shown as "–"), so they match no
        // availability bucket.
        if (isLockerOffline(locker)) return false
        const bucket = availabilityBucket(lockerAvailability(locker.id).percent)
        if (!filters.selectedAvailability.includes(bucket)) return false
      }
      if (filters.selectedRecentActivity.includes('issues-24h') && !matchesRecentIssues(locker)) return false
      if (filters.selectedDateRange.length > 0 && !lockerMatchesDateRange(locker, filters.selectedDateRange)) return false
      return true
    })
  }, [lockerData, search, filters])

  const getLockerSortValue = (locker: Locker, key: string): string | number | null => {
    switch (key) {
      case 'name': return locker.name
      case 'address': return `${locker.street} ${locker.city}`
      case 'depot': return locker.depot
      case 'region': return locker.region
      case 'carrierStatusCol': return locker.carrierStatus
      case 'providerStatusCol': return locker.providerStatus
      case 'compartment': return isLockerOffline(locker) ? null : lockerAvailability(locker.id).percent
      case 'provider': return providerLabels[locker.provider]
      case 'venueType': return venueTypeLabels[locker.venueType]
      case 'host': return locker.host
      case 'placement': return placementLabels[locker.placement]
      default: return ''
    }
  }

  const sortedLockers = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredLockers
    const dir = sortDirection === 'asc' ? 1 : -1
    return [...filteredLockers].sort((a, b) =>
      compareNullsLast(getLockerSortValue(a, sortKey), getLockerSortValue(b, sortKey), dir),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLockers, sortKey, sortDirection])

  const totalItems = sortedLockers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const page = Math.min(currentPage, totalPages)
  const paginatedLockers = sortedLockers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const activeFilterCount =
    filters.selectedDepots.length +
    filters.selectedRegions.length +
    filters.selectedAgencies.length +
    filters.selectedCarrierStatus.length +
    filters.selectedProviders.length +
    filters.selectedProviderStatus.length +
    filters.selectedVenueTypes.length +
    filters.selectedHosts.length +
    filters.selectedPlacements.length +
    filters.selectedOwnedBy.length +
    filters.selectedAvailability.length +
    filters.selectedRecentActivity.length +
    filters.selectedDateRange.length

  const applySavedFilter = (sf: SavedFilter) => {
    setFilters({
      selectedDepots: sf.depots ?? [],
      selectedRegions: sf.regions ?? [],
      selectedAgencies: sf.agencies ?? [],
      selectedCarrierStatus: sf.carrierStatus ?? [],
      selectedProviders: sf.providers ?? [],
      selectedProviderStatus: sf.providerStatus ?? [],
      selectedVenueTypes: sf.venueTypes ?? [],
      selectedHosts: sf.hosts ?? [],
      selectedPlacements: sf.placements ?? [],
      selectedOwnedBy: sf.ownedBy ?? [],
      selectedAvailability: sf.availability ?? [],
      selectedRecentActivity: sf.recentActivity ?? [],
      selectedDateRange: sf.dateRange ?? [],
    })
  }

  const removeSavedFilter = (id: string) => {
    setSavedFilters((prev) => prev.filter((sf) => sf.id !== id))
  }

  const renameSavedFilter = (id: string, name: string) => {
    setSavedFilters((prev) => prev.map((sf) => (sf.id === id ? { ...sf, name } : sf)))
  }

  const matchesCurrent = (sf: SavedFilter) =>
    arraysEqual(sf.depots ?? [], filters.selectedDepots) &&
    arraysEqual(sf.regions ?? [], filters.selectedRegions) &&
    arraysEqual(sf.agencies ?? [], filters.selectedAgencies) &&
    arraysEqual(sf.carrierStatus ?? [], filters.selectedCarrierStatus) &&
    arraysEqual(sf.providers ?? [], filters.selectedProviders) &&
    arraysEqual(sf.providerStatus ?? [], filters.selectedProviderStatus) &&
    arraysEqual(sf.venueTypes ?? [], filters.selectedVenueTypes) &&
    arraysEqual(sf.hosts ?? [], filters.selectedHosts) &&
    arraysEqual(sf.placements ?? [], filters.selectedPlacements) &&
    arraysEqual(sf.ownedBy ?? [], filters.selectedOwnedBy) &&
    arraysEqual(sf.availability ?? [], filters.selectedAvailability) &&
    arraysEqual(sf.recentActivity ?? [], filters.selectedRecentActivity) &&
    arraysEqual(sf.dateRange ?? [], filters.selectedDateRange)

  const activeViewId = useMemo(
    () => savedFilters.find(matchesCurrent)?.id ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedFilters, filters]
  )

  const activeFilterChips = useMemo(() => {
    const statusLabels: Record<string, string> = Object.fromEntries(
      carrierStatusOptions.map((o) => [o.value, `Carrier ${o.label.toLowerCase()}`])
    )
    const providerStatusLabels: Record<string, string> = Object.fromEntries(
      providerStatusOptions.map((o) => [o.value, `Provider ${o.label.toLowerCase()}`])
    )
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    const add = <K extends keyof ActiveFilterState>(
      groupKey: K,
      labelMap?: Record<string, string>
    ) => {
      filters[groupKey].forEach((value) => {
        chips.push({
          key: `${groupKey}:${value}`,
          label: labelMap ? labelMap[value] ?? value : value,
          onRemove: () =>
            updateFilters({
              [groupKey]: filters[groupKey].filter((v) => v !== value),
            } as Partial<ActiveFilterState>),
        })
      })
    }
    add('selectedRegions')
    add('selectedDepots')
    add('selectedAgencies')
    add('selectedCarrierStatus', statusLabels)
    add('selectedProviders', providerLabels)
    add('selectedProviderStatus', providerStatusLabels)
    add('selectedVenueTypes', venueTypeLabels)
    add('selectedHosts')
    add('selectedPlacements', placementLabels)
    add('selectedOwnedBy')
    add('selectedAvailability', availabilityLabels)
    add('selectedRecentActivity', RECENT_ACTIVITY_LABELS)
    add('selectedDateRange', DATE_RANGE_LABELS)
    return chips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const saveCurrentFilter = () => {
    const labels = activeFilterChips.map((c) => c.label)
    const fallback = `View ${savedFilters.length + 1}`
    const joined = labels.join(' · ')
    const name = labels.length === 0 ? fallback : joined.length > 60 ? `${joined.slice(0, 57)}…` : joined
    const sf: SavedFilter = {
      id: `${Date.now()}`,
      name,
      depots: filters.selectedDepots,
      regions: filters.selectedRegions,
      agencies: filters.selectedAgencies,
      carrierStatus: filters.selectedCarrierStatus,
      providers: filters.selectedProviders,
      providerStatus: filters.selectedProviderStatus,
      venueTypes: filters.selectedVenueTypes,
      hosts: filters.selectedHosts,
      placements: filters.selectedPlacements,
      ownedBy: filters.selectedOwnedBy,
      availability: filters.selectedAvailability,
      recentActivity: filters.selectedRecentActivity,
      dateRange: filters.selectedDateRange,
    }
    setSavedFilters((prev) => [...prev, sf])
    setSavedToastVisible(true)
    if (localStore && !localStore.getItem(MY_FILTERS_TOOLTIP_SEEN_KEY)) {
      setShowMyFiltersTooltip(true)
      localStore.setItem(MY_FILTERS_TOOLTIP_SEEN_KEY, '1')
    }
  }

  // Column rendering helpers
  const columnWidths: Record<string, string> = {
    name: 'w-[248px]',
    address: 'w-[235px]',
    depot: 'w-[160px]',
    region: 'w-[160px]',
    carrierStatusCol: 'w-[160px]',
    providerStatusCol: 'w-[160px]',
    compartment: 'w-[180px]',
    provider: 'w-[140px]',
    venueType: 'w-[160px]',
    host: 'w-[160px]',
    placement: 'w-[120px]',
  }

  // Carrier-aware columns: drop dimensions the carrier doesn't expose (Host /
  // Location for Austria) and relabel the single depot column (Agency for ES/PT).
  const displayColumnDefs = useMemo(
    () =>
      COLUMN_DEFS.filter(
        (c) =>
          (c.key !== 'host' || showHost(carrier.id)) &&
          (c.key !== 'venueType' || showVenueType(carrier.id)),
      ).map((c) => (c.key === 'depot' ? { ...c, label: term } : c)),
    [carrier.id, term],
  )
  const allowedColumnKeys = useMemo(
    () => new Set(displayColumnDefs.map((c) => c.key)),
    [displayColumnDefs],
  )
  const visibleColumns = columnState
    .filter((c) => c.visible && allowedColumnKeys.has(c.key))
    .map((c) => c.key)
  const columnLabel: Record<string, string> = Object.fromEntries(
    displayColumnDefs.map((c) => [c.key, c.label])
  )

  const renderCell = (locker: Locker, key: string) => {
    const base = 'bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2'
    switch (key) {
      case 'name':
        return (
          <td key={key} className={base}>
            <div className="flex items-center gap-3">
              <Avatar type="locker" size="sm" status={locker.carrierStatus} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[22px] truncate">
                    {locker.name}
                  </span>
                  <CopyButton
                    value={locker.name}
                    ariaLabel="Copy locker name"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                    ID: {locker.id}
                  </span>
                  <CopyButton
                    value={locker.id}
                    ariaLabel="Copy locker ID"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  />
                </div>
              </div>
            </div>
          </td>
        )
      case 'address':
        return (
          <td key={key} className={base}>
            <div className="flex flex-col">
              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px] truncate">
                {locker.street}
              </span>
              <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                {locker.city}
              </span>
            </div>
          </td>
        )
      case 'depot':
        return (
          <td key={key} className={base}>
            <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
              {locker.depot}
            </span>
          </td>
        )
      case 'region':
        return (
          <td key={key} className={base}>
            <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
              {locker.region}
            </span>
          </td>
        )
      case 'carrierStatusCol': {
        const labels: Record<Locker['carrierStatus'], string> = {
          active: 'Active',
          inactive: 'Inactive',
          maintenance: 'Maintenance',
          decommissioned: 'Decommissioned',
        }
        return (
          <td key={key} className={base}>
            <LockerStatusBadge
              status={locker.carrierStatus}
              label={labels[locker.carrierStatus]}
              since={locker.statusSince}
            />
          </td>
        )
      }
      case 'providerStatusCol': {
        const labels: Record<Locker['providerStatus'], string> = {
          active: 'Active',
          inactive: 'Inactive',
        }
        return (
          <td key={key} className={base}>
            <LockerStatusBadge
              status={locker.providerStatus}
              label={labels[locker.providerStatus]}
              since={locker.statusSince}
            />
          </td>
        )
      }
      case 'compartment': {
        if (isLockerOffline(locker)) {
          return (
            <td key={key} className={base}>
              <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">–</span>
            </td>
          )
        }
        const { percent } = lockerAvailability(locker.id)
        return (
          <td key={key} className={base}>
            <CompartmentAvailabilityBadge percent={percent} />
          </td>
        )
      }
      case 'provider':
        return (
          <td key={key} className={base}>
            <div className="flex items-center gap-2">
              <ProviderLogo provider={locker.provider} size="sm" />
              <span className="text-xs text-text-foreground font-medium">
                {providerLabels[locker.provider]}
              </span>
            </div>
          </td>
        )
      case 'venueType':
        return (
          <td key={key} className={base}>
            <NeutralTag label={venueTypeLabels[locker.venueType]} />
          </td>
        )
      case 'host':
        return (
          <td key={key} className={base}>
            <NeutralTag label={locker.host} />
          </td>
        )
      case 'placement':
        return (
          <td key={key} className={base}>
            <NeutralTag label={placementLabels[locker.placement]} />
          </td>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Toolbar + active chips */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              infoTooltip={`Search by locker name, ID, address, ${term.toLowerCase()}, or region.`}
            />

            <AdvancedFilterPopover
              activeCount={activeFilterCount}
              onResetAll={resetAll}
              onSave={saveCurrentFilter}
              groups={([
                {
                  key: 'depot',
                  label: term,
                  icon: <Warehouse size={16} />,
                  options: depotOptions,
                  selected: filters.selectedDepots,
                  onChange: (next) => updateFilters({ selectedDepots: next }),
                },
                {
                  key: 'region',
                  label: 'Region',
                  icon: <Map size={16} />,
                  options: regionOptions,
                  selected: filters.selectedRegions,
                  onChange: (next) => updateFilters({ selectedRegions: next }),
                },
                {
                  key: 'carrier-status',
                  label: 'Carrier Status',
                  icon: <OctagonAlert size={16} />,
                  options: carrierStatusOptions,
                  selected: filters.selectedCarrierStatus,
                  onChange: (next) => updateFilters({ selectedCarrierStatus: next }),
                  searchable: false,
                },
                {
                  key: 'provider-status',
                  label: 'Provider Status',
                  icon: <OctagonAlert size={16} />,
                  options: providerStatusOptions,
                  selected: filters.selectedProviderStatus,
                  onChange: (next) => updateFilters({ selectedProviderStatus: next }),
                  searchable: false,
                },
                {
                  key: 'provider',
                  label: 'Locker Provider',
                  icon: <ParcelStationIcon size={16} />,
                  options: providerOptions,
                  selected: filters.selectedProviders,
                  onChange: (next) => updateFilters({ selectedProviders: next }),
                  searchable: false,
                },
                {
                  key: 'venue-type',
                  label: 'Location',
                  icon: <LocationPinBuildingHomeIcon size={16} />,
                  options: venueTypeOptions,
                  selected: filters.selectedVenueTypes,
                  onChange: (next) => updateFilters({ selectedVenueTypes: next }),
                },
                {
                  key: 'host',
                  label: 'Host',
                  icon: <Store size={16} />,
                  options: hostOptions,
                  selected: filters.selectedHosts,
                  onChange: (next) => updateFilters({ selectedHosts: next }),
                },
                {
                  key: 'placement',
                  label: 'Placement',
                  icon: <TerraceIcon size={16} />,
                  options: placementOptions,
                  selected: filters.selectedPlacements,
                  onChange: (next) => updateFilters({ selectedPlacements: next }),
                  searchable: false,
                },
                {
                  key: 'owned-by',
                  label: 'Owned by',
                  icon: <Globe size={16} />,
                  options: ownedByOptions,
                  selected: filters.selectedOwnedBy,
                  onChange: (next) => updateFilters({ selectedOwnedBy: next }),
                  searchable: false,
                },
                {
                  key: 'availability',
                  label: 'Avail. Compartments',
                  icon: <PieChart size={16} />,
                  options: availabilityOptions,
                  selected: filters.selectedAvailability,
                  onChange: (next) => updateFilters({ selectedAvailability: next }),
                  searchable: false,
                },
                {
                  key: 'recent-activity',
                  label: 'Recent Activity',
                  icon: <Clock4 size={16} />,
                  options: RECENT_ACTIVITY_OPTIONS,
                  selected: filters.selectedRecentActivity,
                  onChange: (next) => updateFilters({ selectedRecentActivity: next }),
                  searchable: false,
                },
              ] as AdvancedFilterGroup[]).filter((g) => {
                // Only show filters for dimensions this carrier exposes.
                if (g.key === 'owned-by') return showOwnedBy(carrier.id)
                if (g.key === 'host') return showHost(carrier.id)
                if (g.key === 'venue-type') return showVenueType(carrier.id)
                return true
              })}
            />
            <SavedViewsPopover
              views={savedFilters.map((sf) => ({ id: sf.id, name: sf.name }))}
              activeViewId={activeViewId}
              onApply={(id) => {
                const sf = savedFilters.find((s) => s.id === id)
                if (sf) applySavedFilter(sf)
              }}
              onClear={resetAll}
              onRemove={removeSavedFilter}
              onRename={renameSavedFilter}
              firstTimeTooltip={
                showMyFiltersTooltip
                  ? 'Your saved filters appear here and can be activated during any session.'
                  : null
              }
              onDismissFirstTimeTooltip={() => setShowMyFiltersTooltip(false)}
            />
          </div>

          <div className="flex items-center gap-2">
            <ColumnsPopover
              columns={displayColumnDefs}
              state={columnState}
              onChange={setColumnState}
              onReset={() => setColumnState(DEFAULT_COLUMN_STATE)}
              isDefault={columnStateEqualsDefault(columnState, DEFAULT_COLUMN_STATE)}
            />
          </div>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilterChips.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                onRemove={chip.onRemove}
                tone="primary"
              />
            ))}
            <button
              type="button"
              onClick={resetAll}
              className="text-sm text-text-primary font-medium tracking-[-0.14px] bg-transparent border-0 cursor-pointer p-0 ml-1 hover:underline transition-colors"
            >
              Clear all Filters
            </button>
          </div>
        )}
      </div>

      {savedToastVisible && (
        <Toast position="bottom-right" variant="success">
          Saved to My Saved Filters
        </Toast>
      )}

      {/* Content */}
      <div className="flex flex-col">
        {/* Mobile card list */}
        <div className="flex flex-col gap-3 md:hidden">
          {paginatedLockers.map((locker, i) => {
            const merged = mergeStatus(locker)
            return (
              <div
                key={i}
                onClick={() => onLockerClick?.(locker)}
                className="border border-border-default rounded-[10px] bg-surface-card p-4 flex flex-col gap-3 cursor-pointer active:bg-surface-card-hover"
              >
                <div className="flex items-center gap-3">
                  <Avatar type="locker" size="sm" status={locker.carrierStatus} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[22px] truncate">
                      {locker.name}
                    </span>
                    <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                      {locker.street}, {locker.city}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-text-light shrink-0" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <LockerStatusBadge status={merged.variant} label={merged.label} since={locker.statusSince} />
                  <span className="text-xs text-text-light">
                    {locker.depot} · {locker.region}
                  </span>
                </div>
              </div>
            )
          })}
          {paginatedLockers.length === 0 && (
            <div className="text-center py-6">
              <span className="text-sm text-text-light tracking-[-0.14px]">No lockers match your filters</span>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="border border-border-default rounded-[10px] overflow-x-auto hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {visibleColumns.map((key) => (
                  <TableHeader
                    key={key}
                    label={columnLabel[key]}
                    width={columnWidths[key]}
                    sortDirection={sortKey === key ? sortDirection : null}
                    onSort={() => handleSort(key)}
                  />
                ))}
                <th className="bg-surface-card border-b border-border-default h-9 w-[59px]" />
              </tr>
            </thead>
            <tbody>
              {paginatedLockers.map((locker, i) => (
                <tr
                  key={i}
                  onClick={() => onLockerClick?.(locker)}
                  className="group cursor-pointer"
                >
                  {visibleColumns.map((key) => renderCell(locker, key))}
                  <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                    <div className="flex items-center justify-center">
                      <ChevronRight size={20} className="text-text-light group-hover:text-text-foreground transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedLockers.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-center"
                  >
                    <span className="text-sm text-text-light tracking-[-0.14px]">
                      No lockers match your filters
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(n) => setItemsPerPage(n)}
        />
      </div>
    </div>
  )
}

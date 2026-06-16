import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  Package,
  MapPinned,
  Clock4,
  CalendarX,
  AlertCircle,
} from 'lucide-react'
import {
  SearchInput,
  FilterChip,
  TableHeader,
  Pagination,
  Avatar,
  ParcelStatusBadge,
  ShipmentTypeBadge,
  NeutralTag,
  AdvancedFilterPopover,
  ColumnsPopover,
  columnStateEqualsDefault,
  SavedViewsPopover,
  ParcelStationIcon,
  WarehouseIcon,
  ShippingBoxIcon,
  ShipmentTimeIcon,
  MapFoldIcon,
} from '../lib/ooh-kit'
import type { ColumnDef, ColumnState, AdvancedFilterGroup } from '../lib/ooh-kit'
import { formatDateTimeWithAge, formatAgeDuration, parseParcelTimestamp } from '../lib/ooh-kit/components/_formatDateTimeWithAge'
import { useTableUrlState } from '../hooks/useTableUrlState'
import type { TableUrlStateConfig } from '../hooks/useTableUrlState'
import type { ParcelOverviewItem, ShipmentType, ParcelStatus } from '../data/parcels'
import { providerLabels } from '../data/lockers'
import type { Provider } from '../data/lockers'
import { compareNullsLast } from '../lib/sortComparator'
import { depotTerm } from '../lib/carrierConfig'
import { useOrg } from '../context/OrgContext'
import { CopyButton } from '../lib/unity'

type ReadyToPickup = 'consignee' | 'driver'

type InsightKey =
  | 'driver-pickup'
  | 'first-mile'
  | 'expired-last-mile'
  | 'expected'
  | 'hard-reservation'
  | 'soft-reservation'
  | 'rejected'
  | 'rejected-24h'
  | 'rejected-7d'

type ActiveFilterState = {
  selectedDepots: string[]
  selectedRegions: string[]
  selectedProviders: string[]
  selectedAssignedLockers: string[]
  selectedAddresses: string[]
  selectedShipmentTypes: string[]
  selectedStatuses: string[]
  selectedReadyToPickup: string[]
  selectedDateRange: string[]
  selectedInsights: string[]
  /** Predefined timeframe code (see AGE_FILTER_OPTIONS) — show parcels deposited within that window. */
  depositedSince: string | null
  /** Predefined timeframe code (see AGE_FILTER_OPTIONS) — show Expired parcels whose expiry was within that window. */
  expiredSince: string | null
}

type SavedFilter = {
  id: string
  name: string
  depots: string[]
  regions: string[]
  providers?: string[]
  assignedLockers: string[]
  addresses?: string[]
  shipmentTypes: string[]
  statuses: string[]
  readyToPickup: string[]
  dateRange?: string[]
  insights?: string[]
  depositedSince?: string | null
  expiredSince?: string | null
}

const SAVED_FILTERS_KEY = 'parcelPortal.savedFilters.v1'

// Maps each filter field to its URL query key so a filtered view is shareable.
const FILTER_URL_KEYS: Record<string, string> = {
  selectedDepots: 'depots',
  selectedRegions: 'regions',
  selectedProviders: 'providers',
  selectedAssignedLockers: 'lockers',
  selectedAddresses: 'addresses',
  selectedShipmentTypes: 'shipmentTypes',
  selectedStatuses: 'statuses',
  selectedReadyToPickup: 'ready',
  selectedDateRange: 'dateRange',
  selectedInsights: 'insights',
}

// Single-value (string | null) filter fields.
const SCALAR_FILTER_URL_KEYS: Record<string, string> = {
  depositedSince: 'depositedSince',
  expiredSince: 'expiredSince',
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'parcelId', label: 'Parcel ID', pinned: true },
  { key: 'assignedLocker', label: 'Assigned Locker' },
  { key: 'address', label: 'Locker Address' },
  { key: 'depot', label: 'Depot' },
  { key: 'shipmentType', label: 'Shipment Type' },
  { key: 'status', label: 'Status' },
  { key: 'lastActivity', label: 'Last Activity' },
  { key: 'region', label: 'Region' },
  { key: 'reservation', label: 'Reservation' },
  { key: 'compartmentSize', label: 'Size' },
  { key: 'provider', label: 'Locker Provider' },
  { key: 'depositedOn', label: 'Deposited on' },
  { key: 'expiredOn', label: 'Expired on' },
]

const DEFAULT_COLUMN_STATE: ColumnState[] = [
  { key: 'parcelId', visible: true },
  { key: 'assignedLocker', visible: true },
  { key: 'address', visible: true },
  { key: 'depot', visible: true },
  { key: 'shipmentType', visible: true },
  { key: 'status', visible: true },
  { key: 'lastActivity', visible: false },
  { key: 'region', visible: false },
  { key: 'reservation', visible: false },
  { key: 'compartmentSize', visible: false },
  { key: 'provider', visible: false },
  { key: 'depositedOn', visible: false },
  { key: 'expiredOn', visible: false },
]

const EMPTY_FILTERS: ActiveFilterState = {
  selectedDepots: [],
  selectedRegions: [],
  selectedProviders: [],
  selectedAssignedLockers: [],
  selectedAddresses: [],
  selectedShipmentTypes: [],
  selectedStatuses: [],
  selectedReadyToPickup: [],
  selectedDateRange: [],
  selectedInsights: [],
  depositedSince: null,
  expiredSince: null,
}

const URL_STATE_CONFIG: TableUrlStateConfig<ActiveFilterState> = {
  emptyFilters: EMPTY_FILTERS,
  arrayFilterKeys: FILTER_URL_KEYS,
  scalarFilterKeys: SCALAR_FILTER_URL_KEYS,
  columnDefs: COLUMN_DEFS,
  defaultColumnState: DEFAULT_COLUMN_STATE,
  defaultItemsPerPage: 10,
}

// Predefined timeframes for the "Deposited since" / "Expired since" filters.
// Values are encoded as strings so they map cleanly to the checkbox option keys;
// the `days` field is what the matcher uses to evaluate max-age against now.
const AGE_FILTER_OPTIONS: { value: string; label: string; days: number }[] = [
  { value: '1h', label: 'Last 1 hour', days: 1 / 24 },
  { value: '12h', label: 'Last 12 hours', days: 12 / 24 },
  { value: '24h', label: 'Last 24 hours', days: 1 },
  { value: '48h', label: 'Last 48 hours', days: 2 },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '14d', label: 'Last 14 days', days: 14 },
  { value: '30d', label: 'Last 30 days', days: 30 },
]

const AGE_FILTER_LABELS: Record<string, string> = Object.fromEntries(
  AGE_FILTER_OPTIONS.map((o) => [o.value, o.label])
)

const AGE_FILTER_DAYS: Record<string, number> = Object.fromEntries(
  AGE_FILTER_OPTIONS.map((o) => [o.value, o.days])
)

// "Last Activity" shares the same timeframes as the Deposited/Expired since filters.
const DATE_RANGE_OPTIONS = AGE_FILTER_OPTIONS.map(({ value, label }) => ({ value, label }))

const DATE_RANGE_MS: Record<string, number> = Object.fromEntries(
  AGE_FILTER_OPTIONS.map((o) => [o.value, o.days * 86_400_000])
)

const DATE_RANGE_CHIP_LABELS: Record<string, string> = Object.fromEntries(
  AGE_FILTER_OPTIONS.map((o) => [o.value, `Last Activity: ${o.label.replace(/^Last\s+/, '')}`])
)

function matchesDateRange(activity: string, selected: string[]): boolean {
  if (selected.length === 0) return true
  const date = parseParcelTimestamp(activity)
  if (!date) return false
  const elapsed = Date.now() - date.getTime()
  return selected.some((key) => {
    const window = DATE_RANGE_MS[key]
    return window !== undefined && elapsed <= window && elapsed >= 0
  })
}

function matchesMaxAgeDays(stamp: string | undefined, maxDays: number | null, now: number): boolean {
  if (maxDays === null) return true
  const date = parseParcelTimestamp(stamp)
  if (!date) return false
  const ageDays = Math.max(0, (now - date.getTime()) / 86_400_000)
  return ageDays <= maxDays
}

type InsightDef = {
  key: InsightKey
  label: string
  chipLabel: string
  matches: (parcel: ParcelOverviewItem) => boolean
}

const DRIVER_PICKUP_TYPES: ShipmentType[] = ['Return', 'First Mile', 'Alternative Delivery']

function matchesDriverPickup(p: ParcelOverviewItem): boolean {
  if (!p.compartmentId) return false
  if (p.status === 'Ready for Pickup' && DRIVER_PICKUP_TYPES.includes(p.shipmentType)) return true
  if (p.status === 'Expired' && p.shipmentType === 'Last Mile') return true
  return false
}

const INSIGHTS: InsightDef[] = [
  {
    key: 'driver-pickup',
    label: 'Ready to Pickup by Drivers',
    chipLabel: 'Ready to Pickup by Drivers',
    matches: matchesDriverPickup,
  },
  {
    key: 'first-mile',
    label: 'First Mile',
    chipLabel: 'First Mile',
    matches: (p) =>
      p.status === 'Ready for Pickup' &&
      p.shipmentType === 'First Mile' &&
      !!p.compartmentId,
  },
  {
    key: 'expired-last-mile',
    label: 'Expired Last Mile',
    chipLabel: 'In Locker: Expired',
    matches: (p) =>
      p.status === 'Expired' &&
      p.shipmentType === 'Last Mile' &&
      !!p.compartmentId,
  },
  {
    key: 'expected',
    label: 'Bookings',
    chipLabel: 'Expected',
    matches: (p) => p.status === 'Expected',
  },
  {
    key: 'hard-reservation',
    label: 'Hard Reservations',
    chipLabel: 'Hard Reservations',
    matches: (p) => p.status === 'Expected' && p.reservation === 'Hard Reservation',
  },
  {
    key: 'soft-reservation',
    label: 'Soft Reservations',
    chipLabel: 'Soft Reservations',
    matches: (p) => p.status === 'Expected' && p.reservation === 'Soft Reservation',
  },
  {
    key: 'rejected',
    label: 'Rejected Bookings',
    chipLabel: 'Booking Rejected',
    matches: (p) => p.status === 'Booking Rejected',
  },
  {
    key: 'rejected-24h',
    label: 'Last 24 hours',
    chipLabel: 'Last 24 hours',
    matches: (p) =>
      p.status === 'Booking Rejected' && /15\.04\.2025/.test(p.lastActivity),
  },
  {
    key: 'rejected-7d',
    label: 'Last 7 days',
    chipLabel: 'Last 7 days',
    matches: (p) => p.status === 'Booking Rejected',
  },
]

const SHIPMENT_TYPE_OPTIONS: { value: ShipmentType; label: string }[] = [
  { value: 'First Mile', label: 'First Mile' },
  { value: 'Last Mile', label: 'Last Mile' },
  { value: 'Alternative Delivery', label: 'Alt. Delivery' },
  { value: 'Return', label: 'Return' },
]

const STATUS_OPTIONS: { value: ParcelStatus; label: string }[] = [
  { value: 'Ready for Pickup', label: 'In Locker' },
  { value: 'Expired', label: 'In Locker: Expired' },
  { value: 'Expected', label: 'Expected' },
  { value: 'Consignee Collected', label: 'Consignee Collected' },
  { value: 'Courier Collected', label: 'Courier Collected' },
  { value: 'Booking Cancelled', label: 'Booking Cancelled' },
  { value: 'Booking Rejected', label: 'Booking Rejected' },
]

const READY_TO_PICKUP_OPTIONS: { value: ReadyToPickup; label: string }[] = [
  { value: 'consignee', label: 'Ready for Consignee' },
  { value: 'driver', label: 'Ready for Driver' },
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

function parcelMatchesReadyToPickup(parcel: ParcelOverviewItem, kinds: string[]): boolean {
  // Only parcels still bound to a compartment are physically in the locker.
  // Historical Expired entries (driver already collected) carry no compartmentId
  // and must not show up in the ready-for-pickup queue.
  const stillInLocker = !!parcel.compartmentId
  const inLocker = parcel.status === 'Ready for Pickup' && stillInLocker
  const isExpired = parcel.status === 'Expired' && stillInLocker
  const isDriverShipment = DRIVER_PICKUP_TYPES.includes(parcel.shipmentType)
  // Driver collects: First Mile / Return / Alt Delivery in locker, plus
  // expired parcels still sitting in a compartment.
  const readyForDriver = (inLocker && isDriverShipment) || isExpired
  // Consignee picks up Last Mile parcels in locker.
  const readyForConsignee = inLocker && !isDriverShipment
  if (kinds.includes('driver') && readyForDriver) return true
  if (kinds.includes('consignee') && readyForConsignee) return true
  return false
}

export default function ParcelTable({ onParcelClick }: { onParcelClick?: (parcel: ParcelOverviewItem) => void }) {
  const { parcelData, carrier } = useOrg()
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
    columnState,
    setColumnState,
  } = useTableUrlState<ActiveFilterState>(URL_STATE_CONFIG)

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() =>
    loadJson<SavedFilter[]>(SAVED_FILTERS_KEY, localStore, [])
  )
  useEffect(() => {
    saveJson(SAVED_FILTERS_KEY, localStore, savedFilters)
  }, [savedFilters])

  // Filter options are derived purely from parcel data — every field they
  // need (depot, region, assigned locker name) lives on the parcel itself,
  // so the dropdowns can't drift out of sync with the locker cache.
  const depotOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of parcelData) {
      if (!p.depot) continue
      set.add(p.depot)
    }
    return [...set].sort().map((d) => ({ value: d, label: d }))
  }, [parcelData])

  const providerOptions = useMemo(() => {
    const set = new Set<Provider>()
    for (const p of parcelData) {
      if (!p.provider) continue
      set.add(p.provider)
    }
    return [...set]
      .map((value) => ({ value, label: providerLabels[value] ?? value }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [parcelData])

  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of parcelData) {
      if (!p.region) continue
      set.add(p.region)
    }
    return [...set].sort().map((r) => ({ value: r, label: r }))
  }, [parcelData])

  const assignedLockerOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { value: string; label: string; subtitle: string }[] = []
    for (const p of parcelData) {
      if (seen.has(p.assignedLocker)) continue
      seen.add(p.assignedLocker)
      opts.push({
        value: p.assignedLocker,
        label: p.assignedLockerName,
        subtitle: `ID: ${p.assignedLocker}`,
      })
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label))
  }, [parcelData])

  // Address filter options derived from parcels' assigned lockers.
  // value is an `${street}|${city}` key so duplicate streets in different cities stay distinct.
  const addressOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { value: string; label: string; subtitle: string }[] = []
    for (const p of parcelData) {
      const street = p.assignedLockerStreet
      const city = p.assignedLockerCity
      if (!street && !city) continue
      const key = `${street}|${city}`
      if (seen.has(key)) continue
      seen.add(key)
      opts.push({ value: key, label: street, subtitle: city })
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label))
  }, [parcelData])

  // Parcels narrowed by every filter EXCEPT the insight tiles. Used as the base
  // for insight tile counts so picking a tile doesn't zero out the others.
  const scopedParcels = useMemo(() => {
    const now = Date.now()
    return parcelData.filter((parcel) => {
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          parcel.parcelId.toLowerCase().includes(q) ||
          parcel.assignedLocker.toLowerCase().includes(q) ||
          parcel.assignedLockerName.toLowerCase().includes(q) ||
          parcel.assignedLockerStreet.toLowerCase().includes(q) ||
          parcel.assignedLockerCity.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }
      if (filters.selectedDepots.length > 0 && !filters.selectedDepots.includes(parcel.depot)) return false
      if (filters.selectedRegions.length > 0 && !filters.selectedRegions.includes(parcel.region)) return false
      if (filters.selectedProviders.length > 0 && !filters.selectedProviders.includes(parcel.provider)) return false
      if (filters.selectedAssignedLockers.length > 0 && !filters.selectedAssignedLockers.includes(parcel.assignedLocker)) return false
      if (filters.selectedAddresses.length > 0) {
        const addressKey = `${parcel.assignedLockerStreet}|${parcel.assignedLockerCity}`
        if (!filters.selectedAddresses.includes(addressKey)) return false
      }
      if (filters.selectedShipmentTypes.length > 0 && !filters.selectedShipmentTypes.includes(parcel.shipmentType)) return false
      if (filters.selectedStatuses.length > 0) {
        // "Ready for Pickup" is asymmetric: it includes Expired parcels
        // (consignee no-show, still pending driver collection). The reverse is
        // not true — selecting "Expired" only matches Expired parcels.
        const matchesStatus =
          filters.selectedStatuses.includes(parcel.status) ||
          (filters.selectedStatuses.includes('Ready for Pickup') && parcel.status === 'Expired')
        if (!matchesStatus) return false
      }
      if (filters.selectedReadyToPickup.length > 0 && !parcelMatchesReadyToPickup(parcel, filters.selectedReadyToPickup)) return false
      if (filters.selectedDateRange.length > 0 && !matchesDateRange(parcel.lastActivity, filters.selectedDateRange)) return false
      if (filters.depositedSince !== null && !matchesMaxAgeDays(parcel.depositedAt, AGE_FILTER_DAYS[filters.depositedSince] ?? null, now)) return false
      if (filters.expiredSince !== null) {
        // Only Expired-status parcels are eligible — matches the column visibility rule.
        if (parcel.status !== 'Expired') return false
        if (!matchesMaxAgeDays(parcel.expiresAt, AGE_FILTER_DAYS[filters.expiredSince] ?? null, now)) return false
      }
      return true
    })
  }, [parcelData, search, filters])

  const filteredParcels = useMemo(() => {
    if (filters.selectedInsights.length === 0) return scopedParcels
    return scopedParcels.filter((parcel) =>
      INSIGHTS.some((i) => filters.selectedInsights.includes(i.key) && i.matches(parcel))
    )
  }, [scopedParcels, filters.selectedInsights])

  const compartmentSizeOrder: Record<string, number> = { S: 0, M: 1, L: 2, XL: 3 }

  const getParcelSortValue = (parcel: ParcelOverviewItem, key: string): string | number | null => {
    switch (key) {
      case 'parcelId': return parcel.parcelId
      case 'assignedLocker': return parcel.assignedLockerName
      case 'address': return `${parcel.assignedLockerStreet} ${parcel.assignedLockerCity}`
      case 'depot': return parcel.depot ?? ''
      case 'region': return parcel.region ?? ''
      case 'provider': return providerLabels[parcel.provider] ?? ''
      case 'shipmentType': return parcel.shipmentType
      case 'status': return parcel.status
      case 'reservation': return parcel.reservation
      case 'compartmentSize': return compartmentSizeOrder[parcel.compartmentSize] ?? 99
      case 'lastActivity': return parcel.lastActivity
      case 'depositedOn':
        return parseParcelTimestamp(parcel.depositedAt)?.getTime() ?? null
      case 'expiredOn':
        return parseParcelTimestamp(parcel.expiresAt)?.getTime() ?? null
      default: return ''
    }
  }

  const sortedParcels = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredParcels
    const dir = sortDirection === 'asc' ? 1 : -1
    return [...filteredParcels].sort((a, b) =>
      compareNullsLast(getParcelSortValue(a, sortKey), getParcelSortValue(b, sortKey), dir),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredParcels, sortKey, sortDirection])

  const totalItems = sortedParcels.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const page = Math.min(currentPage, totalPages)
  const paginatedParcels = sortedParcels.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const activeFilterCount =
    filters.selectedDepots.length +
    filters.selectedRegions.length +
    filters.selectedProviders.length +
    filters.selectedAssignedLockers.length +
    filters.selectedAddresses.length +
    filters.selectedShipmentTypes.length +
    filters.selectedStatuses.length +
    filters.selectedReadyToPickup.length +
    filters.selectedDateRange.length +
    filters.selectedInsights.length +
    (filters.depositedSince !== null ? 1 : 0) +
    (filters.expiredSince !== null ? 1 : 0)

  const applySavedFilter = (sf: SavedFilter) => {
    setFilters({
      selectedDepots: sf.depots ?? [],
      selectedRegions: sf.regions ?? [],
      selectedProviders: sf.providers ?? [],
      selectedAssignedLockers: sf.assignedLockers ?? [],
      selectedAddresses: sf.addresses ?? [],
      selectedShipmentTypes: sf.shipmentTypes ?? [],
      selectedStatuses: sf.statuses ?? [],
      selectedReadyToPickup: sf.readyToPickup ?? [],
      selectedDateRange: sf.dateRange ?? [],
      selectedInsights: sf.insights ?? [],
      depositedSince: sf.depositedSince ?? null,
      expiredSince: sf.expiredSince ?? null,
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
    arraysEqual(sf.providers ?? [], filters.selectedProviders) &&
    arraysEqual(sf.assignedLockers ?? [], filters.selectedAssignedLockers) &&
    arraysEqual(sf.addresses ?? [], filters.selectedAddresses) &&
    arraysEqual(sf.shipmentTypes ?? [], filters.selectedShipmentTypes) &&
    arraysEqual(sf.statuses ?? [], filters.selectedStatuses) &&
    arraysEqual(sf.readyToPickup ?? [], filters.selectedReadyToPickup) &&
    arraysEqual(sf.dateRange ?? [], filters.selectedDateRange) &&
    arraysEqual(sf.insights ?? [], filters.selectedInsights) &&
    (sf.depositedSince ?? null) === filters.depositedSince &&
    (sf.expiredSince ?? null) === filters.expiredSince

  const activeViewId = useMemo(
    () => savedFilters.find(matchesCurrent)?.id ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedFilters, filters]
  )

  const activeFilterChips = useMemo(() => {
    const lockerNameMap: Record<string, string> = Object.fromEntries(
      assignedLockerOptions.map((o) => [o.value, o.label])
    )
    const addressLabelMap: Record<string, string> = Object.fromEntries(
      addressOptions.map((o) => [o.value, `${o.label}, ${o.subtitle}`])
    )
    const readyMap: Record<string, string> = Object.fromEntries(
      READY_TO_PICKUP_OPTIONS.map((o) => [o.value, o.label])
    )
    const shipmentMap: Record<string, string> = Object.fromEntries(
      SHIPMENT_TYPE_OPTIONS.map((o) => [o.value, o.label])
    )
    const providerMap: Record<string, string> = Object.fromEntries(
      providerOptions.map((o) => [o.value, o.label])
    )
    type StringArrayKey = {
      [K in keyof ActiveFilterState]: ActiveFilterState[K] extends string[] ? K : never
    }[keyof ActiveFilterState]
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    const add = <K extends StringArrayKey>(
      groupKey: K,
      labelMap?: Record<string, string>
    ) => {
      const values = filters[groupKey] as string[]
      values.forEach((value) => {
        chips.push({
          key: `${groupKey}:${value}`,
          label: labelMap ? labelMap[value] ?? value : value,
          onRemove: () =>
            updateFilters({
              [groupKey]: values.filter((v) => v !== value),
            } as Partial<ActiveFilterState>),
        })
      })
    }
    add('selectedDepots')
    add('selectedRegions')
    add('selectedProviders', providerMap)
    add('selectedAssignedLockers', lockerNameMap)
    add('selectedAddresses', addressLabelMap)
    add('selectedShipmentTypes', shipmentMap)
    add('selectedStatuses')
    add('selectedReadyToPickup', readyMap)
    add('selectedDateRange', DATE_RANGE_CHIP_LABELS)
    const insightLabelMap: Record<string, string> = Object.fromEntries(
      INSIGHTS.map((i) => [i.key, i.chipLabel])
    )
    add('selectedInsights', insightLabelMap)
    if (filters.depositedSince !== null) {
      chips.push({
        key: 'depositedSince',
        label: `Deposited within ${AGE_FILTER_LABELS[filters.depositedSince] ?? filters.depositedSince}`,
        onRemove: () => updateFilters({ depositedSince: null }),
      })
    }
    if (filters.expiredSince !== null) {
      chips.push({
        key: 'expiredSince',
        label: `Expired within ${AGE_FILTER_LABELS[filters.expiredSince] ?? filters.expiredSince}`,
        onRemove: () => updateFilters({ expiredSince: null }),
      })
    }
    return chips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, assignedLockerOptions, addressOptions, providerOptions])

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
      providers: filters.selectedProviders,
      assignedLockers: filters.selectedAssignedLockers,
      addresses: filters.selectedAddresses,
      shipmentTypes: filters.selectedShipmentTypes,
      statuses: filters.selectedStatuses,
      readyToPickup: filters.selectedReadyToPickup,
      dateRange: filters.selectedDateRange,
      insights: filters.selectedInsights,
      depositedSince: filters.depositedSince,
      expiredSince: filters.expiredSince,
    }
    setSavedFilters((prev) => [...prev, sf])
  }

  const columnWidths: Record<string, string> = {
    parcelId: 'w-[200px]',
    assignedLocker: 'w-[200px]',
    address: 'w-[235px]',
    depot: 'w-[160px]',
    region: 'w-[160px]',
    provider: 'w-[160px]',
    shipmentType: 'w-[160px]',
    status: 'w-[180px]',
    reservation: 'w-[170px]',
    compartmentSize: 'w-[140px]',
    lastActivity: 'w-[200px]',
    depositedOn: 'w-[220px]',
    expiredOn: 'w-[220px]',
  }

  const visibleColumns = columnState.filter((c) => c.visible).map((c) => c.key)
  // Relabel the single depot column to "Agency" for ES/PT (same underlying data).
  const displayColumnDefs = useMemo(
    () =>
      COLUMN_DEFS.map((c) =>
        c.key === 'depot' ? { ...c, label: term } : c,
      ),
    [term],
  )
  const columnLabel: Record<string, string> = Object.fromEntries(
    displayColumnDefs.map((c) => [c.key, c.label])
  )

  const emptyTimestampCell = (key: string, base: string) => (
    <td key={key} className={base}>
      <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">—</span>
    </td>
  )

  const renderDepositedCell = (parcel: ParcelOverviewItem, key: string, base: string) => {
    const formatted = formatDateTimeWithAge(parcel.depositedAt)
    if (!formatted) return emptyTimestampCell(key, base)
    // Once a parcel has been collected it's no longer in the locker, so the
    // "In Locker since" age is meaningless — show only the deposit timestamp.
    const collected =
      parcel.status === 'Consignee Collected' || parcel.status === 'Courier Collected'
    return (
      <td key={key} className={base}>
        <div className="flex flex-col">
          <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
            {formatted.dateLine}, {formatted.timeLine}
          </span>
          {!collected && (
            <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
              In Locker since {formatAgeDuration(Math.max(0, Date.now() - formatted.date.getTime()))}
            </span>
          )}
        </div>
      </td>
    )
  }

  const renderExpiresCell = (parcel: ParcelOverviewItem, key: string, base: string) => {
    const formatted = formatDateTimeWithAge(parcel.expiresAt)
    if (!formatted) return emptyTimestampCell(key, base)
    const expired = parcel.status === 'Expired'
    const duration = formatAgeDuration(Math.abs(formatted.date.getTime() - Date.now()))
    return (
      <td key={key} className={base}>
        <div className="flex flex-col">
          <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
            {formatted.dateLine}, {formatted.timeLine}
          </span>
          {expired ? (
            <span className="inline-flex items-center gap-1 text-xs text-text-warning tracking-[-0.12px] leading-5">
              <AlertCircle size={12} aria-hidden="true" />
              Expired since {duration}
            </span>
          ) : (
            <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
              Expires in {duration}
            </span>
          )}
        </div>
      </td>
    )
  }

  const renderCell = (parcel: ParcelOverviewItem, key: string) => {
    const base = 'bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2'
    switch (key) {
      case 'parcelId':
        return (
          <td key={key} className={base}>
            <div className="flex items-center gap-3">
              <Avatar type="parcel" size="sm" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[22px] truncate">
                  {parcel.parcelId}
                </span>
                <CopyButton
                  value={parcel.parcelId}
                  ariaLabel="Copy parcel ID"
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                />
              </div>
            </div>
          </td>
        )
      case 'assignedLocker':
        return (
          <td key={key} className={base}>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[22px] truncate">
                  {parcel.assignedLockerName}
                </span>
                <CopyButton
                  value={parcel.assignedLockerName}
                  ariaLabel="Copy assigned locker name"
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                  ID: {parcel.assignedLocker}
                </span>
                <CopyButton
                  value={parcel.assignedLocker}
                  ariaLabel="Copy assigned locker ID"
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                />
              </div>
            </div>
          </td>
        )
      case 'address':
        return (
          <td key={key} className={base}>
            <div className="flex flex-col">
              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px] truncate">
                {parcel.assignedLockerStreet}
              </span>
              <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                {parcel.assignedLockerCity}
              </span>
            </div>
          </td>
        )
      case 'depot':
        return (
          <td key={key} className={base}>
            <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
              {parcel.depot || '—'}
            </span>
          </td>
        )
      case 'region':
        return (
          <td key={key} className={base}>
            <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
              {parcel.region || '—'}
            </span>
          </td>
        )
      case 'provider':
        return (
          <td key={key} className={base}>
            <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
              {providerLabels[parcel.provider] ?? '—'}
            </span>
          </td>
        )
      case 'shipmentType':
        return (
          <td key={key} className={base}>
            <ShipmentTypeBadge type={parcel.shipmentType} />
          </td>
        )
      case 'status':
        return (
          <td key={key} className={base}>
            <ParcelStatusBadge
              status={parcel.status}
              since={parcel.lastActivity}
              compartmentId={parcel.compartmentId}
            />
          </td>
        )
      case 'reservation':
        return (
          <td key={key} className={base}>
            <NeutralTag label={parcel.reservation} />
          </td>
        )
      case 'compartmentSize':
        return (
          <td key={key} className={base}>
            <NeutralTag label={parcel.dimensions} />
          </td>
        )
      case 'lastActivity': {
        const formatted = formatDateTimeWithAge(parcel.lastActivity)
        const actor =
          parcel.status === 'Consignee Collected' ? 'By Consignee' :
          parcel.status === 'Courier Collected' ? 'By Courier' :
          parcel.status === 'Ready for Pickup' || parcel.status === 'Expected' ? 'By Courier' :
          parcel.status === 'Expired' ? 'By Consignee' :
          null
        if (!formatted) {
          return (
            <td key={key} className={base}>
              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                {parcel.lastActivity}
              </span>
            </td>
          )
        }
        return (
          <td key={key} className={base}>
            <div className="flex flex-col">
              <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                {formatted.dateLine}, {formatted.timeLine}
              </span>
              {actor && (
                <span className="text-xs text-text-light tracking-[-0.12px] leading-5">
                  {actor}
                </span>
              )}
            </div>
          </td>
        )
      }
      case 'depositedOn':
        return renderDepositedCell(parcel, key, base)
      case 'expiredOn':
        return renderExpiresCell(parcel, key, base)
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput placeholder="Search by Parcel ID, Locker Name, ID or Address" value={search} onChange={setSearch} />

          <AdvancedFilterPopover
            activeCount={activeFilterCount}
            onResetAll={resetAll}
            onSave={saveCurrentFilter}
            groups={[
              {
                key: 'depot',
                label: term,
                icon: <WarehouseIcon size={16} />,
                options: depotOptions,
                selected: filters.selectedDepots,
                onChange: (next) => updateFilters({ selectedDepots: next }),
              },
              {
                key: 'region',
                label: 'Region',
                icon: <MapFoldIcon size={16} />,
                options: regionOptions,
                selected: filters.selectedRegions,
                onChange: (next) => updateFilters({ selectedRegions: next }),
              },
              {
                key: 'shipment-type',
                label: 'Shipment Type',
                icon: <Package size={16} />,
                options: SHIPMENT_TYPE_OPTIONS,
                selected: filters.selectedShipmentTypes,
                onChange: (next) => updateFilters({ selectedShipmentTypes: next }),
                searchable: false,
              },
              {
                key: 'status',
                label: 'Parcel Status',
                icon: <ShippingBoxIcon size={16} />,
                options: STATUS_OPTIONS,
                selected: filters.selectedStatuses,
                onChange: (next) => updateFilters({ selectedStatuses: next }),
                searchable: false,
              },
              {
                key: 'assigned-locker',
                label: 'Assigned Locker',
                icon: <ParcelStationIcon size={16} />,
                options: assignedLockerOptions,
                selected: filters.selectedAssignedLockers,
                onChange: (next) => updateFilters({ selectedAssignedLockers: next }),
              },
              {
                key: 'address',
                label: 'Locker Address',
                icon: <MapPinned size={16} />,
                options: addressOptions,
                selected: filters.selectedAddresses,
                onChange: (next) => updateFilters({ selectedAddresses: next }),
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
                key: 'last-activity',
                label: 'Last Activity',
                icon: <Clock4 size={16} />,
                options: DATE_RANGE_OPTIONS,
                selected: filters.selectedDateRange,
                onChange: (next) => {
                  const added = next.find((v) => !filters.selectedDateRange.includes(v))
                  updateFilters({ selectedDateRange: added ? [added] : [] })
                },
                searchable: false,
              },
              {
                type: 'single-options',
                key: 'deposited-since',
                label: 'Deposited within',
                icon: <ShipmentTimeIcon size={16} />,
                options: AGE_FILTER_OPTIONS,
                value: filters.depositedSince,
                onChange: (next) => updateFilters({ depositedSince: next }),
              },
              {
                type: 'single-options',
                key: 'expired-since',
                label: 'Expired within',
                icon: <CalendarX size={16} />,
                options: AGE_FILTER_OPTIONS,
                value: filters.expiredSince,
                onChange: (next) => updateFilters({ expiredSince: next }),
              },
            ] satisfies AdvancedFilterGroup[]}
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
          />
        </div>

        <ColumnsPopover
          columns={displayColumnDefs}
          state={columnState}
          onChange={setColumnState}
          onReset={() => setColumnState(DEFAULT_COLUMN_STATE)}
          isDefault={columnStateEqualsDefault(columnState, DEFAULT_COLUMN_STATE)}
        />
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
            className="text-sm text-text-foreground font-medium tracking-[-0.14px] bg-transparent border-0 cursor-pointer p-0 ml-1 hover:text-text-primary transition-colors"
          >
            Clear all Filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex flex-col">
        <div className="border border-border-default rounded-[10px] overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
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
              {paginatedParcels.map((parcel, i) => (
                <tr
                  key={i}
                  className="group cursor-pointer"
                  onClick={() => onParcelClick?.(parcel)}
                >
                  {visibleColumns.map((key) => renderCell(parcel, key))}
                  <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                    <div className="flex items-center justify-center">
                      <ChevronRight size={20} className="text-text-light group-hover:text-text-foreground transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedParcels.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-center"
                  >
                    <span className="text-sm text-text-light tracking-[-0.14px]">
                      No parcels match your filters
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
        />
      </div>
    </div>
  )
}

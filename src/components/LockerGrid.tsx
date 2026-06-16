import { useMemo, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import {
  SearchInput,
  FilterButton,
  SegmentedControl,
  LockerStatusBadge,
  CompartmentBadge,
  ProviderLogo,
  Avatar,
} from '../lib/ooh-kit'
import type { Locker } from '../data/lockers'
import { useOrg } from '../context/OrgContext'
import { depotTerm } from '../lib/carrierConfig'

interface LockerGridProps {
  onLockerClick?: (locker: Locker) => void
  onViewChange?: (view: 'grid' | 'list') => void
  /** Active view, reflected from the `?view` URL param. */
  view?: 'grid' | 'list'
}

export default function LockerGrid({
  onLockerClick,
  onViewChange,
  view = 'grid',
}: LockerGridProps) {
  const { lockerData, carrier } = useOrg()
  const [search, setSearch] = useState('')
  const [selectedCarrierStatus, setSelectedCarrierStatus] = useState<string[]>(
    []
  )
  const [selectedDepots, setSelectedDepots] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedProviderStatus, setSelectedProviderStatus] = useState<string[]>([])

  const depotOptions = useMemo(() => {
    const depots = [...new Set(lockerData.map((l) => l.depot))].sort()
    return depots.map((d) => ({ value: d, label: d }))
  }, [])

  const carrierStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const providerOptions = useMemo(() => {
    const providers = [...new Set(lockerData.map((l) => l.provider))].sort()
    return providers.map((p) => ({ value: p, label: p }))
  }, [])

  const providerStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const filteredLockers = useMemo(() => {
    return lockerData.filter((locker) => {
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          locker.name.toLowerCase().includes(q) ||
          locker.id.toLowerCase().includes(q) ||
          locker.street.toLowerCase().includes(q) ||
          locker.city.toLowerCase().includes(q) ||
          locker.depot.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }
      if (selectedCarrierStatus.length > 0 && !selectedCarrierStatus.includes(locker.carrierStatus))
        return false
      if (selectedDepots.length > 0 && !selectedDepots.includes(locker.depot))
        return false
      if (selectedProviders.length > 0 && !selectedProviders.includes(locker.provider))
        return false
      if (selectedProviderStatus.length > 0 && !selectedProviderStatus.includes(locker.providerStatus))
        return false
      return true
    })
  }, [search, selectedCarrierStatus, selectedDepots, selectedProviders, selectedProviderStatus])

  return (
    <div className="flex flex-col gap-12">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:h-[38px]">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} />
          <div className="w-px h-4 bg-border-default" />
          <FilterButton
            label="Carrier Status"
            options={carrierStatusOptions}
            selected={selectedCarrierStatus}
            onChange={setSelectedCarrierStatus}
          />
          <FilterButton
            label={`${depotTerm(carrier.id)} & Partners`}
            options={depotOptions}
            selected={selectedDepots}
            onChange={setSelectedDepots}
            searchable
          />
          <FilterButton
            label="Provider"
            options={providerOptions}
            selected={selectedProviders}
            onChange={setSelectedProviders}
          />
          <FilterButton
            label="Provider Status"
            options={providerStatusOptions}
            selected={selectedProviderStatus}
            onChange={setSelectedProviderStatus}
          />
        </div>
        <SegmentedControl
          items={[
            {
              key: 'grid',
              label: 'Grid view',
              icon: <LayoutGrid size={20} className="text-text-foreground" />,
            },
            {
              key: 'list',
              label: 'List view',
              icon: <List size={20} className="text-text-foreground" />,
            },
          ]}
          activeKey={view}
          onChange={(key) => onViewChange?.(key as 'grid' | 'list')}
        />
      </div>

      {/* Grid */}
      <div className="-mt-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {filteredLockers.map((locker, i) => (
            <div
              key={i}
              onClick={() => onLockerClick?.(locker)}
              className="flex flex-col p-4 border border-border-default rounded-[10px] bg-surface-card cursor-pointer hover:bg-surface-card-hover transition-colors"
            >
              {/* Header: provider badge + ID */}
              <div className="flex items-center gap-1.5 mb-2">
                <ProviderLogo provider={locker.provider} size="sm" />
                <span className="text-xs text-text-light tracking-[-0.12px] leading-5 truncate">
                  {locker.id}
                </span>
              </div>

              {/* Body: name, address, avatar */}
              <div className="flex justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[18px] line-clamp-2">
                    {locker.name}
                  </span>
                  <div className="flex flex-col mt-1">
                    <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px] truncate">
                      {locker.street}
                    </span>
                    <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px] truncate">
                      {locker.city}
                    </span>
                  </div>
                </div>
                <Avatar type="locker" size="sm" status={locker.carrierStatus} />
              </div>

              {/* Divider + badges */}
              <div className="mt-3 pt-3 border-t border-border-default">
                <div className="flex items-center justify-between">
                  <CompartmentBadge percentage={locker.compartments} />
                  <LockerStatusBadge status={locker.carrierStatus} since={locker.statusSince} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLockers.length === 0 && (
          <div className="flex items-center justify-center h-[196px]">
            <span className="text-sm text-text-light tracking-[-0.14px]">
              No lockers match your filters
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 py-4">
          <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
            {filteredLockers.length} Lockers in Total
          </span>
        </div>
      </div>
    </div>
  )
}

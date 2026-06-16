import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  TableHeader,
  NeutralTag,
  Pagination,
  StatusBadge,
} from '../lib/ooh-kit'
import type { Compartment, CompartmentSize, CompartmentStatus } from '../data/lockers'

interface CompartmentTableProps {
  compartments: Compartment[]
  onCompartmentClick: (compartment: Compartment) => void
}

const sizeLabel: Record<CompartmentSize, string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'Extra Large',
}

const lastActivityByStatus: Record<CompartmentStatus, string> = {
  available: 'Yesterday, 14:30',
  occupied: 'Today, 08:15',
  reserved: 'Today, 10:42',
  defective: 'Mo., 21.4.2025, 09:12',
}

export default function CompartmentTable({ compartments, onCompartmentClick }: CompartmentTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to first page whenever the filtered set changes shape
  useEffect(() => {
    setPage(1)
  }, [compartments])

  const totalPages = Math.max(1, Math.ceil(compartments.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const paginated = compartments.slice(pageStart, pageStart + pageSize)

  // Hide the Assigned parcel column entirely when no row in the filtered set
  // has an assigned parcel. Using the full set (not just the current page)
  // keeps the column stable as the user paginates.
  const showAssignedColumn = compartments.some(
    (c) => c.status === 'occupied' || c.status === 'reserved',
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-border-default rounded-[10px] overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <TableHeader label="Compartment" width="w-[180px]" />
              <TableHeader label="Size" width="w-[140px]" />
              <TableHeader label="Status" width="w-[180px]" />
              {showAssignedColumn && <TableHeader label="Assigned parcel" width="w-[260px]" />}
              <TableHeader label="Last activity" width="w-[200px]" />
              <th className="bg-surface-card border-b border-border-default h-9 w-[59px]" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((compartment) => (
              <tr
                key={compartment.id}
                className="group cursor-pointer"
                onClick={() => onCompartmentClick(compartment)}
              >
                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                  <span className="text-sm font-medium text-text-foreground tracking-[-0.14px]">
                    {compartment.id}
                  </span>
                </td>
                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                  <NeutralTag label={sizeLabel[compartment.size]} />
                </td>
                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                  <StatusBadge status={compartment.status} />
                </td>
                {showAssignedColumn && (
                  <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                    {compartment.status !== 'available' && compartment.status !== 'defective' && (
                      <span className="text-sm text-text-foreground tracking-[-0.14px]">
                        {compartment.parcelId ?? '—'}
                      </span>
                    )}
                  </td>
                )}
                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                  <span className="text-sm text-text-foreground tracking-[-0.14px]">
                    {lastActivityByStatus[compartment.status]}
                  </span>
                </td>
                <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                  <div className="flex items-center justify-center">
                    <ChevronRight size={20} className="text-text-light group-hover:text-text-foreground transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
            {compartments.length === 0 && (
              <tr>
                <td colSpan={showAssignedColumn ? 6 : 5} className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-center">
                  <span className="text-sm text-text-light tracking-[-0.14px]">
                    No compartments match the current filters
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {compartments.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={compartments.length}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={(n) => {
            setPageSize(n)
            setPage(1)
          }}
        />
      )}
    </div>
  )
}

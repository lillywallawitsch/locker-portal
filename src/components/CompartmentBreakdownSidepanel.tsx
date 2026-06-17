import { AlertCircle, X } from 'lucide-react'
import { Sidepanel } from '../lib/ooh-kit'
import type { Compartment } from '../data/lockers'

interface Props {
  open: boolean
  onClose: () => void
  lockerId: string
  lockerName: string
  compartments: Compartment[]
}

// Deterministic pseudo-random seeded by string — gives each locker stable mock numbers
function seeded(seed: string, index: number, min: number, max: number): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  h ^= index * 2654435761
  h = (h * 2246822519) >>> 0
  return min + (h % (max - min + 1))
}

interface StatItemProps {
  value: number | string
  label: string
  warning?: boolean
}

function StatItem({ value, label, warning = false }: StatItemProps) {
  return (
    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={`text-xl font-semibold leading-8 tracking-[-0.2px] ${warning ? 'text-text-warning' : 'text-text-foreground'}`}>
          {value}
        </span>
        {warning && <AlertCircle size={16} className="text-text-warning shrink-0" />}
      </div>
      <span className="text-sm text-text-light tracking-[-0.14px] leading-[18px]">{label}</span>
    </div>
  )
}

function SummaryCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-card border border-border-default rounded-[10px] p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground">{title}</span>
        {subtitle && <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">{subtitle}</span>}
      </div>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

function StatRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 items-start">{children}</div>
}

function Divider() {
  return <div className="h-px bg-border-light w-full" />
}

export default function CompartmentBreakdownSidepanel({ open, onClose, lockerId, lockerName, compartments }: Props) {
  const s = lockerId // use stable locker ID as seed for per-locker variation

  // --- Availability by compartment size (derived from real data) ---
  const sizes = ['S', 'M', 'L', 'XL'] as const
  const sizeLabels: Record<string, string> = { S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra Large' }
  const availBySize = sizes.map((sz) => {
    const total = compartments.filter(c => c.size === sz).length
    const available = compartments.filter(c => c.size === sz && c.status === 'available').length
    return { size: sz, label: sizeLabels[sz], available, total }
  }).filter(item => item.total > 0)

  const totalAvailable = compartments.filter(c => c.status === 'available').length
  const totalCompartments = compartments.length

  // --- Occupied (real counts, seeded split into first/last mile) ---
  const occupied = compartments.filter(c => c.status === 'occupied').length
  const firstMile = Math.max(0, Math.round(occupied * 0.4) + seeded(s, 1, -1, 2))
  const firstMileOld = seeded(s, 2, 0, Math.max(0, Math.floor(firstMile * 0.45)))
  const lastMile = Math.max(0, occupied - firstMile)
  const expiredLastMile = seeded(s, 3, 0, Math.max(0, Math.floor(lastMile * 0.35)))

  // --- Reserved (real counts, seeded split into hard/soft) ---
  const reserved = compartments.filter(c => c.status === 'reserved').length
  const hard = Math.max(0, Math.round(reserved * 0.6) + seeded(s, 4, -1, 1))
  const hardOld = seeded(s, 5, 0, Math.max(0, Math.floor(hard * 0.45)))
  const soft = Math.max(0, reserved - hard)

  // --- Rejected bookings — scale with locker activity (occupied + reserved) ---
  const activity = occupied + reserved
  const rejectedBase = Math.max(1, Math.round(activity * 0.4))
  const rejectedTotal = rejectedBase + seeded(s, 6, 0, Math.max(1, Math.round(rejectedBase * 0.6)))
  const rejected24h = seeded(s, 7, 0, Math.max(1, Math.round(rejectedTotal * 0.35)))

  // --- Collected parcels — scale with total compartments throughput ---
  const throughputBase = Math.max(1, Math.round(totalCompartments * 0.25))
  const collectedDriver = throughputBase + seeded(s, 8, 0, Math.max(1, Math.round(throughputBase * 0.5)))
  const collectedConsignee = throughputBase + seeded(s, 9, 0, Math.max(1, Math.round(throughputBase * 0.7)))

  // --- Cancelled bookings — scale with activity ---
  const cancelledBase = Math.max(1, Math.round(activity * 0.5))
  const cancelledTotal = cancelledBase + seeded(s, 10, 0, Math.max(1, Math.round(cancelledBase * 0.6)))
  const cancelled24h = seeded(s, 11, 0, Math.max(1, Math.round(cancelledTotal * 0.3)))

  return (
    <Sidepanel open={open} onClose={onClose} backdrop="dim">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-6 border-b border-border-default shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
            Compartment Availability
          </h2>
          <span className="text-sm text-text-light tracking-[-0.14px] leading-[18px]">
            Detailed Breakdown for {lockerName}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-secondary hover:bg-surface-secondary/80 transition-colors shrink-0 mt-0.5"
        >
          <X size={15} className="text-text-foreground" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 px-6 py-6">

        {/* Card 1: Availability by Compartment Size */}
        <SummaryCard
          title="Availability by Compartment Size"
          subtitle={`${totalAvailable} of ${totalCompartments} available Compartments in total`}
        >
          <StatRow>
            {availBySize.slice(0, 2).map(item => (
              <StatItem
                key={item.size}
                value={`${item.available}/${item.total}`}
                label={item.label}
                warning={item.available === 0}
              />
            ))}
          </StatRow>
          {availBySize.length > 2 && (
            <StatRow>
              {availBySize.slice(2, 4).map(item => (
                <StatItem
                  key={item.size}
                  value={`${item.available}/${item.total}`}
                  label={item.label}
                  warning={item.available === 0}
                />
              ))}
            </StatRow>
          )}
        </SummaryCard>

        {/* Card 2: Occupied Compartments */}
        <SummaryCard title="Occupied Compartments">
          <StatRow>
            <StatItem value={firstMile} label="First Mile Parcels" />
            <StatItem value={firstMileOld} label="Older than 24h" warning={firstMileOld > 0} />
          </StatRow>
          <Divider />
          <StatRow>
            <StatItem value={lastMile} label="Last Mile Parcels" />
            <StatItem value={expiredLastMile} label="Expired Last Mile Parcels" warning={expiredLastMile > 0} />
          </StatRow>
        </SummaryCard>

        {/* Card 3: Reserved Compartments */}
        <SummaryCard title="Reserved Compartments">
          <StatRow>
            <StatItem value={hard} label="Hard Reservations" />
            <StatItem value={hardOld} label="Older than 24h" warning={hardOld > 0} />
          </StatRow>
          <Divider />
          <StatRow>
            <StatItem value={soft} label="Soft Reservations" />
          </StatRow>
        </SummaryCard>

        {/* Card 4: Rejected Bookings */}
        <SummaryCard title="Rejected Bookings">
          <StatRow>
            <StatItem value={rejectedTotal} label="In Total" />
            <StatItem value={rejected24h} label="Last 24h" />
          </StatRow>
        </SummaryCard>

        {/* Card 5: Collected Parcels */}
        <SummaryCard title="Collected Parcels">
          <StatRow>
            <StatItem value={collectedDriver} label="By Driver (last 24h)" />
            <StatItem value={collectedConsignee} label="By Consignee (last 24h)" />
          </StatRow>
        </SummaryCard>

        {/* Card 6: Cancelled Bookings */}
        <SummaryCard title="Cancelled Bookings">
          <StatRow>
            <StatItem value={cancelledTotal} label="In Total" />
            <StatItem value={cancelled24h} label="Last 24h" />
          </StatRow>
        </SummaryCard>

      </div>
    </Sidepanel>
  )
}

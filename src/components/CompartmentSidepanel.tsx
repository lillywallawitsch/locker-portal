import { X, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'

interface SizeBreakdown {
  small: { available: number; total: number }
  medium: { available: number; total: number }
  large: { available: number; total: number }
  extraLarge: { available: number; total: number }
}

interface CompartmentSidepanelProps {
  open: boolean
  onClose: () => void
  lockerName: string
  totalAvailable: number
  totalCompartments: number
  sizeBreakdown: SizeBreakdown
}

export default function CompartmentSidepanel({
  open,
  onClose,
  lockerName,
  totalAvailable,
  totalCompartments,
  sizeBreakdown,
}: CompartmentSidepanelProps) {
  return (
    <Sidepanel open={open} onClose={onClose} backdrop="dim" surface="card" className="overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border-default px-6 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
                Compartment Availability
              </h2>
              <p className="text-sm text-text-light tracking-[-0.14px] m-0">
                Detailed Breakdown for {lockerName}
              </p>
            </div>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-6 pt-8 pb-6">
          {/* Availability by Compartment Size */}
          <SummaryCard
            title="Availability by Compartment Size"
            subtitle={`${totalAvailable} of ${totalCompartments} available Compartments in total`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <SizeItem label="Small" value={`${sizeBreakdown.small.available}/${sizeBreakdown.small.total}`} warning={sizeBreakdown.small.available === 0} />
                <SizeItem label="Medium" value={`${sizeBreakdown.medium.available}/${sizeBreakdown.medium.total}`} warning={sizeBreakdown.medium.available === 0} />
              </div>
              <div className="flex gap-3">
                <SizeItem label="Large" value={`${sizeBreakdown.large.available}/${sizeBreakdown.large.total}`} warning={sizeBreakdown.large.available === 0} />
                <SizeItem label="Extra Large" value={`${sizeBreakdown.extraLarge.available}/${sizeBreakdown.extraLarge.total}`} warning={sizeBreakdown.extraLarge.available === 0} />
              </div>
            </div>
          </SummaryCard>

          {/* Occupied Compartments */}
          <SummaryCard title="Occupied Compartments" link="In-depth Analysis">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <StatItem label="First Mile Parcels" value="12" />
                <StatItem label="Older than 24h" value="5" warning helpIcon />
              </div>
              <div className="h-px bg-border-default" />
              <div className="flex gap-3">
                <StatItem label="Last Mile Parcels" value="8" />
                <StatItem label="Expired Last Mile Parcels" value="3" warning helpIcon />
              </div>
            </div>
          </SummaryCard>

          {/* Reserved Compartments */}
          <SummaryCard title="Reserved Compartments" link="In-depth Analysis">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <StatItem label="Hard Reservations" value="12" helpIcon />
                <StatItem label="Older than 24h" value="5" warning helpIcon />
              </div>
              <div className="h-px bg-border-default" />
              <div className="flex gap-3">
                <StatItem label="Soft Reservations" value="8" helpIcon />
              </div>
            </div>
          </SummaryCard>

          {/* Rejected Bookings */}
          <SummaryCard title="Rejected Bookings" link="In-depth Analysis">
            <div className="flex gap-3">
              <StatItem label="In Total" value="12" />
              <StatItem label="Last 24h" value="5" />
            </div>
          </SummaryCard>

          {/* Collected Parcels */}
          <SummaryCard title="Collected Parcels" link="In-depth Analysis">
            <div className="flex gap-3">
              <StatItem label="By Driver (last 24h)" value="12" />
              <StatItem label="By Consignee (last 24h)" value="5" />
            </div>
          </SummaryCard>

          {/* Cancelled Bookings */}
          <SummaryCard title="Cancelled Bookings" link="In-depth Analysis">
            <div className="flex gap-3">
              <StatItem label="In Total" value="12" />
              <StatItem label="Last 24h" value="5" />
            </div>
          </SummaryCard>
        </div>
    </Sidepanel>
  )
}

function SummaryCard({
  title,
  subtitle,
  link,
  children,
}: {
  title: string
  subtitle?: string
  link?: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border-default rounded-[10px] bg-surface-card p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[22px] m-0">
            {subtitle}
          </p>
        )}
        {link && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text-primary tracking-[-0.14px] leading-[22px]">
              {link}
            </span>
            <ExternalLink size={14} className="text-text-primary" />
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

function SizeItem({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="flex-1 flex gap-1.5 items-start rounded-lg">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-xl font-semibold leading-8 tracking-[-0.2px] ${warning ? 'text-text-warning' : 'text-text-foreground'}`}>
            {value}
          </span>
          {warning && <AlertCircle size={16} className="text-text-warning" />}
        </div>
        <span className="text-sm text-text-light tracking-[-0.14px]">{label}</span>
      </div>
    </div>
  )
}

function StatItem({ label, value, warning, helpIcon }: { label: string; value: string; warning?: boolean; helpIcon?: boolean }) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className={`text-xl font-semibold leading-8 tracking-[-0.2px] ${warning ? 'text-text-warning' : 'text-text-foreground'}`}>
          {value}
        </span>
        {warning && <AlertCircle size={16} className="text-text-warning" />}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-text-light tracking-[-0.14px]">{label}</span>
        {helpIcon && <AlertCircle size={14} className="text-text-light" />}
      </div>
    </div>
  )
}

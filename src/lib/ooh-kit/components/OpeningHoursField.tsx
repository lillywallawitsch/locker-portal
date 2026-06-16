import { ChevronDown } from 'lucide-react'

export type OpeningWindow = { open: string; close: string } // 'HH:MM' 24h format

export type OpeningHours =
  | { kind: '24/7' }
  | {
      kind: 'business-hours'
      weekdays: OpeningWindow // Mon–Fri
      saturday: OpeningWindow | null
      sunday: OpeningWindow | null
    }

interface OpeningHoursFieldProps {
  hours: OpeningHours
  expanded: boolean
  onToggle: () => void
}

interface OpeningStatusBadgeProps {
  hours: OpeningHours
  /** Override the current time — useful for stable Storybook screenshots. */
  now?: Date
}

function parseHHMM(value: string): number {
  const [h, m] = value.split(':').map((n) => parseInt(n, 10))
  return (h ?? 0) * 60 + (m ?? 0)
}

function todayWindow(
  hours: Extract<OpeningHours, { kind: 'business-hours' }>,
  dayOfWeek: number,
): OpeningWindow | null {
  if (dayOfWeek === 0) return hours.sunday
  if (dayOfWeek === 6) return hours.saturday
  return hours.weekdays
}

function formatWindow(win: OpeningWindow | null): string {
  return win ? `${win.open} – ${win.close}` : 'Closed'
}

function todaySummary(hours: OpeningHours, now = new Date()): { label: string; open: boolean } {
  if (hours.kind === '24/7') return { label: 'Open 24/7', open: true }
  const win = todayWindow(hours, now.getDay())
  if (!win) return { label: 'Closed today', open: false }
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes < parseHHMM(win.open)) return { label: `Opens ${win.open}`, open: false }
  if (minutes < parseHHMM(win.close)) return { label: `Open until ${win.close}`, open: true }
  return { label: `Closed at ${win.close}`, open: false }
}

/**
 * Compact "Open" / "Closed" pill — pairs with a `Card` header on a Location
 * card to indicate whether the locker is accessible right now. Reads the
 * carrier's opening hours and the current time.
 */
export function OpeningStatusBadge({ hours, now }: OpeningStatusBadgeProps) {
  const summary = todaySummary(hours, now)
  return (
    <span
      className={`inline-flex items-center px-2 py-1 h-6 border rounded-[10px] text-xs font-medium tracking-[-0.14px] uppercase leading-[18px] whitespace-nowrap ${
        summary.open
          ? 'bg-surface-success border-border-success text-text-success'
          : 'bg-surface-bg border-border-default text-text-foreground'
      }`}
    >
      {summary.open ? 'Open' : 'Closed'}
    </span>
  )
}

function DayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-text-light tracking-[-0.14px]">{label}</span>
      <span className="text-sm text-text-foreground tracking-[-0.14px]">{value}</span>
    </div>
  )
}

/**
 * Foldable opening-hours field used inside `Card`. Header shows "Opening
 * Hours" with a live status (`Open until …`, `Opens …`, `Closed today`,
 * `Open 24/7`) on the right and a chevron to expand. The expanded view
 * lists Monday through Sunday with their open/close window.
 */
export default function OpeningHoursField({
  hours,
  expanded,
  onToggle,
}: OpeningHoursFieldProps) {
  const summary = todaySummary(hours)
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-light tracking-[-0.12px] leading-4">Opening Hours</span>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex items-center justify-between gap-2 bg-transparent border-0 p-0 m-0 cursor-pointer text-left"
      >
        <span
          className={`text-sm font-medium tracking-[-0.14px] leading-5 ${
            summary.open ? 'text-text-success' : 'text-text-foreground'
          }`}
        >
          {summary.label}
        </span>
        <ChevronDown
          size={16}
          className={`text-text-light transition-transform shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expanded && (
        <div className="flex flex-col gap-1 mt-2">
          {hours.kind === '24/7' ? (
            <span className="text-sm text-text-light tracking-[-0.14px]">
              Accessible 24 hours a day, 7 days a week.
            </span>
          ) : (
            <>
              <DayRow label="Monday" value={formatWindow(hours.weekdays)} />
              <DayRow label="Tuesday" value={formatWindow(hours.weekdays)} />
              <DayRow label="Wednesday" value={formatWindow(hours.weekdays)} />
              <DayRow label="Thursday" value={formatWindow(hours.weekdays)} />
              <DayRow label="Friday" value={formatWindow(hours.weekdays)} />
              <DayRow label="Saturday" value={formatWindow(hours.saturday)} />
              <DayRow label="Sunday" value={formatWindow(hours.sunday)} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

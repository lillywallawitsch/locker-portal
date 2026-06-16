// Shared parser/formatter for the mocked parcel timestamp strings.
// Accepts: "Today, HH:mm", "Yesterday, HH:mm", "Xx., DD.MM.YYYY, HH:mm".
// Two-line date + time and a relative age hint that flips from minutes → hours
// → days. Returns null for empty / "—" / unparseable input so callers can render
// an em-dash placeholder.

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const pad = (n: number) => n.toString().padStart(2, '0')

export function parseParcelTimestamp(s: string | null | undefined): Date | null {
  if (!s || s === '—') return null
  const now = new Date()
  let m = /^Today,\s*(\d{1,2}):(\d{2})$/.exec(s)
  if (m) {
    const d = new Date(now)
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0)
    return d
  }
  m = /^Yesterday,\s*(\d{1,2}):(\d{2})$/.exec(s)
  if (m) {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0)
    return d
  }
  m = /^[A-Za-z]{2}\.,\s*(\d{1,2})\.(\d{1,2})\.(\d{4}),\s*(\d{1,2}):(\d{2})$/.exec(s)
  if (m) {
    return new Date(
      parseInt(m[3], 10),
      parseInt(m[2], 10) - 1,
      parseInt(m[1], 10),
      parseInt(m[4], 10),
      parseInt(m[5], 10),
    )
  }
  return null
}

export type DateTimeWithAge = {
  date: Date
  dateLine: string
  timeLine: string
  ageHint: string
  ageHours: number
}

function pluralize(n: number, singular: string): string {
  return `${n} ${n === 1 ? singular : `${singular}s`}`
}

/**
 * Long-form compound elapsed duration, e.g. "5 days and 3 hours". Skips a
 * trailing zero unit ("5 days" not "5 days and 0 hours"). Sub-hour times
 * collapse to minutes only.
 */
export function formatAgeDuration(elapsedMs: number): string {
  const totalMinutes = Math.floor(Math.max(0, elapsedMs) / 60_000)
  const totalHours = Math.floor(Math.max(0, elapsedMs) / 3_600_000)
  const totalDays = Math.floor(Math.max(0, elapsedMs) / 86_400_000)
  if (totalHours < 1) return pluralize(totalMinutes, 'minute')
  if (totalHours < 24) {
    const m = totalMinutes - totalHours * 60
    return m === 0
      ? pluralize(totalHours, 'hour')
      : `${pluralize(totalHours, 'hour')} and ${pluralize(m, 'minute')}`
  }
  const h = totalHours - totalDays * 24
  return h === 0
    ? pluralize(totalDays, 'day')
    : `${pluralize(totalDays, 'day')} and ${pluralize(h, 'hour')}`
}

function formatAgeHint(elapsedMs: number): string {
  return `since ${formatAgeDuration(elapsedMs)}`
}

/** Convenience: parse a parcel timestamp string and return the "X days and Y hours" duration since then. Null if unparseable. */
export function formatAgeSince(
  stamp: string | null | undefined,
  now: number = Date.now(),
): string | null {
  const d = parseParcelTimestamp(stamp)
  if (!d) return null
  return formatAgeDuration(Math.max(0, now - d.getTime()))
}

export function formatDateTimeWithAge(
  s: string | null | undefined,
  now: number = Date.now(),
): DateTimeWithAge | null {
  const d = parseParcelTimestamp(s)
  if (!d) return null
  const dateLine = `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
  const timeLine = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const elapsedMs = Math.max(0, now - d.getTime())
  return {
    date: d,
    dateLine,
    timeLine,
    ageHint: formatAgeHint(elapsedMs),
    ageHours: elapsedMs / 3_600_000,
  }
}

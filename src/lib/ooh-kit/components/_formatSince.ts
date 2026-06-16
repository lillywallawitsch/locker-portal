// ISO timestamps get reformatted; already-formatted strings (e.g. "Today, 08:00")
// pass through untouched so badges from any data source render naturally.
export function formatSince(value: string): string {
  const isoLike = /^\d{4}-\d{2}-\d{2}/.test(value)
  if (!isoLike) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const hasTime = /T\d{2}:\d{2}/.test(value)
  if (!hasTime) return date
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

export function formatRelative(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const diffMin = Math.floor((now - t) / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return formatSince(iso)
}

// Shared table sort comparator. Empty values (null / undefined / "") always
// sort to the bottom, regardless of sort direction — so a column with missing
// data (e.g. capacity for an offline locker, or a parcel with no expiry date)
// never floats to the top when sorting descending. Non-empty values compare
// numerically when both are numbers, otherwise via locale-aware string compare.

export type SortValue = string | number | null | undefined

export function compareNullsLast(a: SortValue, b: SortValue, dir: 1 | -1): number {
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir
  return String(a).localeCompare(String(b)) * dir
}

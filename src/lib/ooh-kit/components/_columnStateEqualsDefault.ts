import type { ColumnState } from './ColumnsPopover'

export function columnStateEqualsDefault(a: ColumnState[], b: ColumnState[]): boolean {
  if (a.length !== b.length) return false
  return a.every((s, i) => s.key === b[i].key && s.visible === b[i].visible)
}

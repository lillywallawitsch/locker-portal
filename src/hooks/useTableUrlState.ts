import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { columnStateEqualsDefault } from '../lib/ooh-kit'
import type { ColumnDef, ColumnState, SortDirection } from '../lib/ooh-kit'

/**
 * Drives a table's view state (filters, search, sort, pagination, columns)
 * entirely from the URL query string, so any view is a shareable deeplink.
 *
 * The URL is the single source of truth — values are derived from
 * `useSearchParams` on every render and there is no mirrored `useState`, so
 * there is no render loop by construction. Setters perform exactly one
 * `setSearchParams` call each (batching every related change, e.g. resetting
 * the page when filters change) to avoid clobbering between rapid updates.
 *
 * Params are omitted when at their default/empty value to keep links minimal,
 * and individual filter values are `encodeURIComponent`-encoded before being
 * comma-joined so values containing commas survive the round-trip.
 */

// Reserved (non-filter) query keys.
const SORT_KEY = 'sort'
const DIR_KEY = 'dir'
const PAGE_KEY = 'page'
const PER_PAGE_KEY = 'perPage'
const SEARCH_KEY = 'q'
const COLS_KEY = 'cols'

export interface TableUrlStateConfig<F> {
  /** Empty filter object — defines the full set of filter fields and their default (empty) values. */
  emptyFilters: F
  /** Map of `string[]` filter field name → URL param key. */
  arrayFilterKeys: Record<string, string>
  /** Map of `string | null` filter field name → URL param key. */
  scalarFilterKeys?: Record<string, string>
  columnDefs: ColumnDef[]
  defaultColumnState: ColumnState[]
  /** When true, exposes a configurable items-per-page (`?perPage`). */
  hasItemsPerPage?: boolean
  defaultItemsPerPage?: number
}

export interface TableUrlState<F> {
  filters: F
  setFilters: (next: F) => void
  updateFilters: (patch: Partial<F>) => void
  resetAllFilters: () => void
  search: string
  setSearch: (value: string) => void
  sortKey: string | null
  sortDirection: SortDirection
  handleSort: (key: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  setItemsPerPage: (n: number) => void
  columnState: ColumnState[]
  setColumnState: (next: ColumnState[]) => void
}

function decodeArray(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((v) => {
      try {
        return decodeURIComponent(v)
      } catch {
        return v
      }
    })
    .filter((v) => v.length > 0)
}

function encodeArray(values: string[]): string {
  return values.map((v) => encodeURIComponent(v)).join(',')
}

function parseInteger(raw: string | null, fallback: number, min: number): number {
  const n = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(n) && n >= min ? n : fallback
}

export function useTableUrlState<F extends Record<string, unknown>>(
  config: TableUrlStateConfig<F>,
): TableUrlState<F> {
  const {
    emptyFilters,
    arrayFilterKeys,
    scalarFilterKeys = {},
    columnDefs,
    defaultColumnState,
    hasItemsPerPage = false,
    defaultItemsPerPage = 10,
  } = config

  const [searchParams, setSearchParams] = useSearchParams()

  const validColumnKeys = useMemo(() => new Set(columnDefs.map((c) => c.key)), [columnDefs])

  // --- Pure parse/serialize of the filter object against URLSearchParams ---
  const parseFilters = useCallback(
    (sp: URLSearchParams): F => {
      const f: Record<string, unknown> = { ...emptyFilters }
      for (const [field, key] of Object.entries(arrayFilterKeys)) {
        f[field] = decodeArray(sp.get(key))
      }
      for (const [field, key] of Object.entries(scalarFilterKeys)) {
        const v = sp.get(key)
        f[field] = v && v.length > 0 ? v : null
      }
      return f as F
    },
    [emptyFilters, arrayFilterKeys, scalarFilterKeys],
  )

  const writeFilters = useCallback(
    (sp: URLSearchParams, f: F) => {
      for (const [field, key] of Object.entries(arrayFilterKeys)) {
        const arr = (f[field] as string[] | undefined) ?? []
        if (arr.length > 0) sp.set(key, encodeArray(arr))
        else sp.delete(key)
      }
      for (const [field, key] of Object.entries(scalarFilterKeys)) {
        const v = f[field] as string | null | undefined
        if (v) sp.set(key, v)
        else sp.delete(key)
      }
    },
    [arrayFilterKeys, scalarFilterKeys],
  )

  const filters = useMemo(() => parseFilters(searchParams), [parseFilters, searchParams])

  const setFilters = useCallback(
    (next: F) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          writeFilters(sp, next)
          sp.delete(PAGE_KEY)
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams, writeFilters],
  )

  const updateFilters = useCallback(
    (patch: Partial<F>) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          const merged = { ...parseFilters(prev), ...patch } as F
          writeFilters(sp, merged)
          sp.delete(PAGE_KEY)
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams, parseFilters, writeFilters],
  )

  const resetAllFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev)
        for (const key of Object.values(arrayFilterKeys)) sp.delete(key)
        for (const key of Object.values(scalarFilterKeys)) sp.delete(key)
        sp.delete(PAGE_KEY)
        return sp
      },
      { replace: true },
    )
  }, [setSearchParams, arrayFilterKeys, scalarFilterKeys])

  // --- Search ---
  const search = searchParams.get(SEARCH_KEY) ?? ''
  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          if (value) sp.set(SEARCH_KEY, value)
          else sp.delete(SEARCH_KEY)
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // --- Sort (tri-state cycle: none → asc → desc → none) ---
  const sortKey = searchParams.get(SORT_KEY) || null
  const dirRaw = searchParams.get(DIR_KEY)
  const sortDirection: SortDirection = dirRaw === 'asc' || dirRaw === 'desc' ? dirRaw : null

  const handleSort = useCallback(
    (key: string) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          const curKey = prev.get(SORT_KEY) || null
          const curDir = prev.get(DIR_KEY)
          if (curKey !== key) {
            sp.set(SORT_KEY, key)
            sp.set(DIR_KEY, 'asc')
          } else if (curDir === 'asc') {
            sp.set(DIR_KEY, 'desc')
          } else {
            sp.delete(SORT_KEY)
            sp.delete(DIR_KEY)
          }
          sp.delete(PAGE_KEY)
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // --- Pagination ---
  const currentPage = parseInteger(searchParams.get(PAGE_KEY), 1, 1)
  const setCurrentPage = useCallback(
    (page: number) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          if (page <= 1) sp.delete(PAGE_KEY)
          else sp.set(PAGE_KEY, String(page))
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const itemsPerPage = hasItemsPerPage
    ? parseInteger(searchParams.get(PER_PAGE_KEY), defaultItemsPerPage, 1)
    : defaultItemsPerPage
  const setItemsPerPage = useCallback(
    (n: number) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          if (n === defaultItemsPerPage) sp.delete(PER_PAGE_KEY)
          else sp.set(PER_PAGE_KEY, String(n))
          sp.delete(PAGE_KEY)
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams, defaultItemsPerPage],
  )

  // --- Columns ---
  // Lossless encoding: every column in order, hidden ones prefixed with `-`.
  // Unknown keys (stale links after a schema change) are dropped and any
  // missing columns are appended in their default visibility/order.
  const columnState = useMemo<ColumnState[]>(() => {
    const raw = searchParams.get(COLS_KEY)
    if (raw == null) return defaultColumnState
    const seen = new Set<string>()
    const result: ColumnState[] = []
    for (const part of raw.split(',')) {
      const hidden = part.startsWith('-')
      const key = hidden ? part.slice(1) : part
      if (!validColumnKeys.has(key) || seen.has(key)) continue
      seen.add(key)
      result.push({ key, visible: !hidden })
    }
    for (const def of columnDefs) {
      if (seen.has(def.key)) continue
      const fallback = defaultColumnState.find((s) => s.key === def.key)
      result.push({ key: def.key, visible: fallback?.visible ?? false })
    }
    return result
  }, [searchParams, validColumnKeys, columnDefs, defaultColumnState])

  const setColumnState = useCallback(
    (next: ColumnState[]) => {
      const isDefault = columnStateEqualsDefault(next, defaultColumnState)
      const encoded = next.map((c) => (c.visible ? c.key : `-${c.key}`)).join(',')
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          if (isDefault) sp.delete(COLS_KEY)
          else sp.set(COLS_KEY, encoded)
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams, defaultColumnState],
  )

  return {
    filters,
    setFilters,
    updateFilters,
    resetAllFilters,
    search,
    setSearch,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    columnState,
    setColumnState,
  }
}

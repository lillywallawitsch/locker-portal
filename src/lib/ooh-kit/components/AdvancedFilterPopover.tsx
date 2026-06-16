import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BookmarkPlus, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '../../unity'

interface FilterOption {
  value: string
  label: string
  subtitle?: string
}

export type AdvancedFilterOptionsGroup = {
  type?: 'options'
  key: string
  label: string
  icon: ReactNode
  options: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
  /** When false, hide the in-pane search box. Defaults to true. */
  searchable?: boolean
}

interface SingleOption {
  value: string
  label: string
}

export type AdvancedFilterSingleOptionsGroup = {
  type: 'single-options'
  key: string
  label: string
  icon: ReactNode
  options: SingleOption[]
  value: string | null
  onChange: (next: string | null) => void
  title?: string
  hint?: string
}

export type AdvancedFilterGroup =
  | AdvancedFilterOptionsGroup
  | AdvancedFilterSingleOptionsGroup

interface AdvancedFilterPopoverProps {
  groups: AdvancedFilterGroup[]
  activeCount: number
  onResetAll: () => void
  onSave: () => void
}

// Pixel values mirroring the sidebar's Tailwind classes: nav button `h-8`,
// `gap-0.5` between buttons, and container `py-3` (12px top + bottom).
const SIDEBAR_BUTTON_PX = 32
const SIDEBAR_GAP_PX = 2
const SIDEBAR_PADDING_Y_PX = 24

function sidebarHeight(count: number): number {
  return count * SIDEBAR_BUTTON_PX + Math.max(0, count - 1) * SIDEBAR_GAP_PX + SIDEBAR_PADDING_Y_PX
}

function groupSelectedCount(g: AdvancedFilterGroup): number {
  if (g.type === 'single-options') return g.value ? 1 : 0
  return g.selected.length
}

export default function AdvancedFilterPopover({
  groups,
  activeCount,
  onResetAll,
  onSave,
}: AdvancedFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? '')
  const [search, setSearch] = useState('')
  const [alignRight, setAlignRight] = useState(false)
  const [maxHeight, setMaxHeight] = useState<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open || !wrapperRef.current) return
    const update = () => {
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      const popoverWidth = Math.min(620, window.innerWidth - 32)
      setAlignRight(rect.left + popoverWidth > window.innerWidth - 16)
      const gap = 6 + 16
      setMaxHeight(Math.min(560, Math.max(280, window.innerHeight - rect.bottom - gap)))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  const activeGroup = groups.find((g) => g.key === activeKey) ?? groups[0]

  useEffect(() => {
    setSearch('')
  }, [activeKey])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center gap-2 h-[38px] px-4 border rounded-lg bg-surface-default cursor-pointer transition-shadow ${
          open
            ? 'border-border-primary shadow-[0px_0px_0px_1.5px_var(--color-border-primary),0px_0px_0px_3px_var(--color-neutral-200)]'
            : 'border-border-filter'
        }`}
      >
        <SlidersHorizontal size={16} className="text-text-foreground" aria-hidden="true" />
        <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] whitespace-nowrap leading-[18px]">
          Filters
        </span>
        {activeCount > 0 && (
          <span
            aria-label={`${activeCount} active`}
            className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-surface-primary text-[11px] font-semibold leading-none tracking-[-0.11px] text-text-inverted"
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filters"
          style={maxHeight != null ? { maxHeight } : undefined}
          className={`absolute top-full mt-1.5 z-20 w-[500px] max-w-[calc(100vw-32px)] bg-surface-card border border-border-default rounded-xl shadow-[0px_80px_40px_0px_rgba(0,0,0,0.01),0px_56px_34px_0px_rgba(0,0,0,0.02),0px_20px_25px_0px_rgba(0,0,0,0.04),0px_6px_13px_0px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col ${alignRight ? 'right-0' : 'left-0'}`}
        >
          <div
            className="flex flex-1 min-h-0"
            style={{ height: sidebarHeight(groups.length) }}
          >
            {/* Sidebar */}
            <div className="w-[200px] shrink-0 border-r border-border-light bg-surface-input px-1 py-3 overflow-y-auto">
              <nav className="flex flex-col gap-0.5">
                {groups.map((g) => {
                  const isActive = g.key === activeGroup.key
                  const count = groupSelectedCount(g)
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => {
                        setActiveKey(g.key)
                        setSearch('')
                      }}
                      className={`flex items-center gap-2 h-8 px-2 py-1.5 text-left rounded-md border-0 cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-surface-secondary text-text-foreground'
                          : 'bg-transparent text-text-light hover:bg-surface-secondary/60'
                      }`}
                    >
                      <span className={`shrink-0 flex items-center justify-center ${isActive ? 'text-text-foreground' : 'text-text-light'}`}>
                        {g.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium tracking-[-0.14px] truncate leading-[18px]">
                        {g.label}
                      </span>
                      {count > 0 && (
                        <span className="flex items-center justify-center h-[22px] px-3 rounded-full bg-surface-surface border border-border-default text-xs text-text-foreground tracking-[-0.12px] leading-4">
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col min-h-0 py-3 gap-3">
              {activeGroup.type === 'single-options' ? (
                <SingleOptionsPane group={activeGroup} />
              ) : (
                <OptionsPane group={activeGroup} search={search} setSearch={setSearch} />
              )}
            </div>
          </div>

          {/* Footer */}
          {activeCount > 0 && (
            <div className="flex items-center justify-between h-14 p-3 border-t border-border-default bg-surface-card shrink-0">
              <div className="flex items-center gap-1 text-xs tracking-[-0.12px] leading-4">
                <span className="text-text-light">{activeCount} Filters active</span>
                <span className="text-text-light">·</span>
                <button
                  type="button"
                  onClick={onResetAll}
                  className="text-text-primary font-medium bg-transparent border-0 cursor-pointer p-0 hover:underline"
                >
                  Clear all Filters
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<BookmarkPlus size={14} aria-hidden="true" />}
                onClick={() => {
                  onSave()
                  setOpen(false)
                }}
              >
                Save active Filters for later
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OptionsPane({
  group,
  search,
  setSearch,
}: {
  group: AdvancedFilterOptionsGroup
  search: string
  setSearch: (s: string) => void
}) {
  const searchable = group.searchable !== false
  const visibleOptions = searchable && search
    ? group.options.filter((o) => {
        const q = search.toLowerCase()
        return (
          o.label.toLowerCase().includes(q) ||
          (o.subtitle?.toLowerCase().includes(q) ?? false)
        )
      })
    : group.options

  const toggle = (value: string) => {
    const next = group.selected.includes(value)
      ? group.selected.filter((v) => v !== value)
      : [...group.selected, value]
    group.onChange(next)
  }

  return (
    <>
      {searchable && (
        <div className="px-2 shrink-0">
          <div className="flex items-center gap-2 h-8 px-2 border border-border-default rounded-md bg-surface-default box-border">
            <Search size={14} aria-hidden="true" className="text-icon-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${group.label.toLowerCase()}…`}
              aria-label="Filter search"
              className="flex-1 min-w-0 h-full text-sm leading-[18px] text-text-foreground tracking-[-0.14px] bg-transparent border-0 outline-none p-0 m-0 placeholder:text-text-light"
            />
          </div>
        </div>
      )}

      {/* Options list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {visibleOptions.map((option) => {
          const isChecked = group.selected.includes(option.value)
          return (
            <label
              key={option.value}
              className={`flex items-center gap-2.5 px-2 mx-0 rounded-md cursor-pointer hover:bg-surface-secondary/60 transition-colors ${
                option.subtitle ? 'py-1.5' : 'h-8'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(option.value)}
                className="w-4 h-4 rounded border-border-default accent-surface-primary cursor-pointer shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm text-text-foreground tracking-[-0.14px] truncate leading-[18px]">
                  {option.label}
                </span>
                {option.subtitle && (
                  <span className="text-xs text-text-light tracking-[-0.12px] truncate leading-4">
                    {option.subtitle}
                  </span>
                )}
              </div>
            </label>
          )
        })}
        {visibleOptions.length === 0 && (
          <div className="px-2 py-6 text-center">
            <span className="text-sm text-text-light tracking-[-0.14px]">No results</span>
          </div>
        )}
      </div>
    </>
  )
}

function SingleOptionsPane({ group }: { group: AdvancedFilterSingleOptionsGroup }) {
  const toggle = (value: string) => {
    group.onChange(group.value === value ? null : value)
  }

  return (
    <>
      {group.title && (
        <div className="px-4 flex flex-col gap-1 shrink-0">
          <span className="text-sm font-medium text-text-foreground tracking-[-0.14px] leading-[18px]">
            {group.title}
          </span>
          {group.hint && (
            <span className="text-xs text-text-light tracking-[-0.12px] leading-4">
              {group.hint}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {group.options.map((option) => {
          const isChecked = group.value === option.value
          return (
            <label
              key={option.value}
              className="flex items-center gap-2.5 px-2 mx-0 h-8 rounded-md cursor-pointer hover:bg-surface-secondary/60 transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(option.value)}
                className="w-4 h-4 rounded border-border-default accent-surface-primary cursor-pointer shrink-0"
              />
              <span className="flex-1 text-sm text-text-foreground tracking-[-0.14px] truncate leading-[18px]">
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </>
  )
}

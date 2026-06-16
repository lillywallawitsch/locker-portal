import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react'
import { Check, Search } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
  subtitle?: string
}

interface FilterSection {
  title: string
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

interface FilterButtonProps {
  label: string
  icon?: ReactNode
  options?: FilterOption[]
  selected?: string[]
  onChange?: (selected: string[]) => void
  sections?: FilterSection[]
  onClick?: () => void
  searchable?: boolean
  searchPlaceholder?: string
}

export default function FilterButton({
  label,
  icon,
  options,
  selected = [],
  onChange,
  sections,
  onClick,
  searchable = false,
  searchPlaceholder,
}: FilterButtonProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = useMemo(() => {
    if (!options || !search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search])

  const filteredSections = useMemo(() => {
    if (!sections) return undefined
    if (!search) return sections
    const q = search.toLowerCase()
    return sections
      .map((s) => ({
        ...s,
        options: s.options.filter((o) => o.label.toLowerCase().includes(q)),
      }))
      .filter((s) => s.options.length > 0)
  }, [sections, search])

  const totalSelected = sections
    ? sections.reduce((sum, s) => sum + s.selected.length, 0)
    : selected.length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchInputRef.current?.focus())
    }
  }, [open, searchable])

  const hasSelection = totalSelected > 0
  const isActive = open

  const handleToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange?.(next)
  }

  const handleSectionToggle = (section: FilterSection, value: string) => {
    const next = section.selected.includes(value)
      ? section.selected.filter((v) => v !== value)
      : [...section.selected, value]
    section.onChange(next)
  }

  const clearAll = () => {
    if (sections) {
      sections.forEach((s) => s.onChange([]))
    } else {
      onChange?.([])
    }
  }

  const hasItems = Boolean(options || sections)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          if (hasItems) {
            setOpen(!open)
          } else {
            onClick?.()
          }
        }}
        aria-haspopup={hasItems ? 'true' : undefined}
        aria-expanded={hasItems ? open : undefined}
        className={`flex items-center gap-2 h-[38px] px-4 border rounded-lg bg-surface-default cursor-pointer transition-shadow ${
          isActive
            ? 'border-border-primary shadow-[0px_0px_0px_1.5px_var(--color-border-primary),0px_0px_0px_3px_var(--color-neutral-200)]'
            : 'border-border-filter'
        }`}
      >
        {icon && (
          <span aria-hidden="true" className="shrink-0 flex items-center justify-center text-text-foreground">
            {icon}
          </span>
        )}
        <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] whitespace-nowrap leading-[18px]">
          {label}
        </span>
        {hasSelection && (
          <span
            aria-label={`${totalSelected} Filters active`}
            className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-surface-primary text-[11px] font-semibold leading-none tracking-[-0.11px] text-text-inverted"
          >
            {totalSelected}
          </span>
        )}
      </button>

      {open && hasItems && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[260px] bg-surface-card border border-border-default rounded-lg shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)] overflow-hidden z-10">
          {searchable && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2 h-8 px-2 border border-border-default rounded-md bg-surface-default">
                <Search size={14} aria-hidden="true" className="text-icon-muted shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    searchPlaceholder ??
                    (sections
                      ? `Search ${sections.map((s) => s.title.toLowerCase()).join(' or ')}…`
                      : 'Search...')
                  }
                  aria-label="Filter search"
                  className="flex-1 text-sm text-text-foreground tracking-[-0.14px] bg-transparent border-0 outline-none placeholder:text-text-light"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col py-2 max-h-[min(60vh,420px)] overflow-y-auto">
            {options && filteredOptions?.map((option) => {
              const isChecked = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => handleToggle(option.value)}
                  className="flex items-center gap-2 px-3 py-2 bg-surface-default hover:bg-surface-secondary cursor-pointer border-0 text-left w-full"
                >
                  <div
                    aria-hidden="true"
                    className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 ${
                      isChecked
                        ? 'bg-surface-primary border-border-primary'
                        : 'bg-surface-default border-border-default'
                    }`}
                  >
                    {isChecked && <Check size={12} className="text-white" />}
                  </div>
                  <span className="flex flex-col min-w-0 flex-1 items-start">
                    <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[18px] truncate max-w-full">
                      {option.label}
                    </span>
                    {option.subtitle && (
                      <span className="text-xs text-text-light tracking-[-0.12px] leading-4 truncate max-w-full">
                        {option.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
            {options && filteredOptions?.length === 0 && (
              <span className="px-3 py-2 text-sm text-text-light tracking-[-0.14px]">
                No results
              </span>
            )}

            {filteredSections?.map((section, si) => (
              <div key={section.title} className={si > 0 ? 'border-t border-border-default mt-1 pt-2' : ''}>
                <div className="px-3 pb-1">
                  <span className="text-xs text-text-light font-medium uppercase tracking-[0.06em]">
                    {section.title}
                  </span>
                </div>
                {section.options.map((option) => {
                  const isChecked = section.selected.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => handleSectionToggle(section, option.value)}
                      className="flex items-center gap-2 px-3 py-2 bg-surface-default hover:bg-surface-secondary cursor-pointer border-0 text-left w-full"
                    >
                      <div
                        aria-hidden="true"
                        className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 ${
                          isChecked
                            ? 'bg-surface-primary border-border-primary'
                            : 'bg-surface-default border-border-default'
                        }`}
                      >
                        {isChecked && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[18px] truncate">
                        {option.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
            {sections && filteredSections?.length === 0 && (
              <span className="px-3 py-2 text-sm text-text-light tracking-[-0.14px]">
                No results
              </span>
            )}
          </div>
          {hasSelection && (
            <div className="flex items-center px-4 py-3 border-t border-border-default bg-surface-card">
              <div className="flex items-center gap-1 text-xs tracking-[-0.12px] leading-4">
                <span className="text-text-light">{totalSelected} Filters active</span>
                <span className="text-text-light">·</span>
                <button
                  onClick={clearAll}
                  className="text-text-primary font-medium bg-transparent border-0 cursor-pointer p-0 hover:underline"
                >
                  Clear all Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

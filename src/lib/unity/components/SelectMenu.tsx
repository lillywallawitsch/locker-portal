import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

interface SelectMenuProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  actionLabel?: string
  onAction?: () => void
  selectSize?: 'md' | 'lg'
  error?: string
  disabled?: boolean
  /** Show a search field at the top of the dropdown to filter options. */
  searchable?: boolean
  searchPlaceholder?: string
}

export default function SelectMenu({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  actionLabel,
  onAction,
  selectSize = 'lg',
  error,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
}: SelectMenuProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number; width: number } | null>(null)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)
  const selected = options.find((o) => o.value === value)
  const hasValue = !!selected
  const showLabel = !!label && (hasValue || open)

  const trimmedQuery = query.trim().toLowerCase()
  const filteredOptions =
    searchable && trimmedQuery
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(trimmedQuery) ||
            (o.description?.toLowerCase().includes(trimmedQuery) ?? false),
        )
      : options

  useLayoutEffect(() => {
    if (!open) {
      setPopoverStyle(null)
      setQuery('')
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setPopoverStyle({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    }
  }, [open])

  // Cap the options list at 12 rows, but never let it overflow the viewport —
  // the remainder scrolls. Measured because rows vary in height (some have a
  // description line). Runs in a layout effect so the constrained height is
  // applied before paint (no flash of a full-length list).
  useLayoutEffect(() => {
    if (!open || !popoverStyle || !listRef.current) {
      setMaxHeight(undefined)
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    const viewportCap = window.innerHeight - (rect?.bottom ?? 0) - 6 - 8 // dropdown gap + bottom margin
    const rows = Array.from(listRef.current.children) as HTMLElement[]
    let twelveRows = 0
    for (let i = 0; i < Math.min(12, rows.length); i++) twelveRows += rows[i].offsetHeight
    setMaxHeight(Math.max(72, Math.min(twelveRows, viewportCap)))
  }, [open, popoverStyle, options, trimmedQuery])

  // Focus the search field when the dropdown opens so users can type immediately.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus()
  }, [open, searchable])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    const onScroll = (e: Event) => {
      const target = e.target as Node | null
      if (target && popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const heightClass = selectSize === 'lg' ? 'h-[54px]' : 'h-12'
  const paddingClass = selectSize === 'lg' ? 'py-2' : 'py-1.5'
  const stackGapClass = selectSize === 'lg' ? 'gap-2' : 'gap-0.5'
  const floatingTextClass =
    selectSize === 'lg'
      ? 'text-base leading-5 tracking-[-0.16px]'
      : 'text-sm leading-[18px] tracking-[-0.14px]'
  const valueTextClass = showLabel
    ? floatingTextClass
    : 'text-base leading-5 tracking-[-0.16px]'

  const borderClass = error
    ? 'border-border-error'
    : open
    ? 'border-border-active'
    : 'border-border-default'
  const bgClass = disabled ? 'bg-surface-secondary' : 'bg-surface-default'
  const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer'
  const valueColorClass = disabled
    ? 'text-text-muted'
    : selected
    ? 'text-text-foreground'
    : 'text-text-light'
  const labelColorClass = disabled ? 'text-text-muted' : 'text-text-label'

  return (
    <div className="relative flex flex-col gap-1.5">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-label={!showLabel && label ? label : (label || placeholder)}
        className={`${bgClass} border ${borderClass} rounded-lg flex items-center justify-between gap-2.5 px-3 ${paddingClass} ${heightClass} ${cursorClass} transition-colors`}
      >
        <div className={`flex flex-col ${stackGapClass} items-start justify-center flex-1 min-w-0`}>
          {showLabel && (
            <span className={`text-xs ${labelColorClass} leading-4 tracking-[-0.12px]`}>{label}</span>
          )}
          <span className={`${valueTextClass} truncate w-full text-left ${valueColorClass}`}>
            {selected?.label ?? placeholder}
          </span>
        </div>
        <ChevronDown size={20} aria-hidden="true" className={`${disabled ? 'text-text-muted' : 'text-text-foreground'} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && popoverStyle && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          style={{ position: 'fixed', top: popoverStyle.top, left: popoverStyle.left, width: popoverStyle.width, zIndex: 60 }}
          className="bg-surface-input border border-border-default rounded-md shadow-[0px_16px_10px_0px_rgba(0,0,0,0.01),0px_2px_4px_0px_rgba(0,0,0,0.01),0px_7px_7px_0px_rgba(0,0,0,0.01)] overflow-hidden"
        >
          {searchable && (
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-border-default bg-surface-input">
              <Search size={16} aria-hidden="true" className="text-text-light shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="flex-1 min-w-0 text-sm text-text-foreground tracking-[-0.14px] leading-[18px] bg-transparent border-none outline-none placeholder:text-text-light"
              />
            </div>
          )}
          <div ref={listRef} style={{ maxHeight, overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-light tracking-[-0.14px] leading-[18px]">
                No results
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => { onChange?.(option.value); setOpen(false) }}
                  className="flex flex-col items-start gap-0.5 w-full px-3 py-2 bg-surface-default hover:bg-surface-secondary cursor-pointer text-left transition-colors min-w-0"
                >
                  <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[18px] truncate max-w-full">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-xs text-text-light tracking-[-0.12px] leading-4 truncate max-w-full">
                      {option.description}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="flex items-center w-full h-[41px] px-2.5 border-t border-border-default bg-surface-input text-sm text-text-label leading-[18px] tracking-[-0.14px] cursor-pointer hover:bg-surface-secondary transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>,
        document.body
      )}
      {error && (
        <span className="text-xs text-text-error leading-4" role="alert">{error}</span>
      )}
    </div>
  )
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  inputSize?: 'md' | 'lg'
  readOnly?: boolean
  disabled?: boolean
  disablePast?: boolean
  error?: string
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toIsoDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function DatePicker({
  label,
  placeholder = 'Select date',
  value,
  onChange,
  inputSize = 'lg',
  readOnly = false,
  disabled = false,
  disablePast = false,
  error,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number } | null>(null)
  const selected = useMemo(() => parseIsoDate(value), [value])
  const today = useMemo(() => new Date(), [])
  const startOfToday = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const isAtCurrentMonth =
    viewMonth.getFullYear() === startOfToday.getFullYear() &&
    viewMonth.getMonth() === startOfToday.getMonth()
  const prevDisabled = disablePast && isAtCurrentMonth

  useEffect(() => {
    if (!open) return
    const base = selected ?? today
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1))
  }, [open, selected, today])

  useLayoutEffect(() => {
    if (!open) {
      setPopoverStyle(null)
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setPopoverStyle({ top: rect.bottom + 6, left: rect.left })
    }
  }, [open])

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

  const hasValue = !!selected
  const showLabel = !!label && (hasValue || open)

  const heightClass = inputSize === 'lg' ? 'h-[54px]' : 'h-12'
  const paddingClass = inputSize === 'lg' ? 'py-2' : 'py-1.5'
  const gapClass = inputSize === 'lg' ? 'gap-2' : 'gap-0.5'
  const floatingTextClass =
    inputSize === 'lg'
      ? 'text-base leading-5 tracking-[-0.16px]'
      : 'text-sm leading-[18px] tracking-[-0.14px]'
  const valueTextClass = showLabel
    ? floatingTextClass
    : 'text-base leading-5 tracking-[-0.16px]'

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const startDay = firstOfMonth.getDay()
    const gridStart = new Date(firstOfMonth)
    gridStart.setDate(firstOfMonth.getDate() - startDay)
    const result: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      result.push(d)
    }
    return result
  }, [viewMonth])

  const handlePrev = () => {
    if (prevDisabled) return
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  }
  const handleNext = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
  }
  const handlePick = (d: Date) => {
    if (disablePast && d < startOfToday) return
    onChange?.(toIsoDate(d))
    setOpen(false)
  }

  const displayText = selected ? formatDisplay(selected) : placeholder

  return (
    <div className="relative flex flex-col gap-1.5">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !readOnly && !disabled && setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={!showLabel && label ? label : (label || placeholder)}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        className={`bg-surface-input border ${error ? 'border-border-error' : open ? 'border-border-active' : 'border-border-default'} rounded-lg flex items-center justify-between gap-3 px-3 ${paddingClass} ${heightClass} text-left transition-colors ${readOnly || disabled ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Calendar size={20} className="text-text-foreground shrink-0" aria-hidden="true" />
          <div className={`flex flex-col ${gapClass} items-start justify-center flex-1 min-w-0`}>
            {showLabel && (
              <span className="text-xs text-text-label leading-4 tracking-[-0.12px]">{label}</span>
            )}
            <span className={`${valueTextClass} truncate w-full text-left ${selected ? 'text-text-foreground' : 'text-text-light'}`}>
              {displayText}
            </span>
          </div>
        </div>
        <ChevronDown size={20} aria-hidden="true" className={`text-text-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && popoverStyle && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Choose date"
          style={{ position: 'fixed', top: popoverStyle.top, left: popoverStyle.left, zIndex: 60 }}
          className="w-[308px] bg-surface-surface border border-border-default rounded-md p-3 flex flex-col gap-3 shadow-[0px_16px_10px_0px_rgba(0,0,0,0.01),0px_2px_4px_0px_rgba(0,0,0,0.01),0px_7px_7px_0px_rgba(0,0,0,0.01)]"
        >
          <div className="flex items-center justify-center w-full">
            <button
              type="button"
              onClick={handlePrev}
              disabled={prevDisabled}
              aria-label="Previous month"
              className={`size-9 rounded-sm bg-surface-secondary flex items-center justify-center shrink-0 transition-colors ${prevDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-border-default cursor-pointer'}`}
            >
              <ChevronLeft size={16} className="text-text-foreground" />
            </button>
            <div className="flex-1 text-center text-base font-medium leading-6 tracking-[-0.16px] text-text-foreground">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next month"
              className="size-9 rounded-sm bg-surface-secondary flex items-center justify-center shrink-0 hover:bg-border-default transition-colors cursor-pointer"
            >
              <ChevronRight size={16} className="text-text-foreground" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="size-8 flex items-center justify-center text-sm leading-[22px] tracking-[-0.14px] text-text-muted"
                >
                  {wd}
                </div>
              ))}
            </div>

            {Array.from({ length: 6 }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex items-start justify-between">
                {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((d) => {
                  const inMonth = d.getMonth() === viewMonth.getMonth()
                  const isSelected = selected ? isSameDay(d, selected) : false
                  const isToday = isSameDay(d, today)
                  const isPast = disablePast && d < startOfToday
                  const bg = isSelected
                    ? 'bg-surface-primary'
                    : isPast
                    ? 'bg-surface-surface'
                    : isToday
                    ? 'bg-surface-secondary'
                    : 'bg-surface-surface hover:bg-surface-secondary'
                  const textColor = isSelected
                    ? 'text-text-inverted'
                    : isPast
                    ? 'text-text-muted'
                    : inMonth
                    ? 'text-text-foreground'
                    : 'text-text-muted'
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => handlePick(d)}
                      disabled={isPast}
                      aria-label={d.toDateString()}
                      aria-selected={isSelected}
                      aria-disabled={isPast}
                      className={`size-8 rounded-sm flex items-center justify-center text-sm leading-[22px] tracking-[-0.14px] transition-colors ${isPast ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${bg} ${textColor}`}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
      {error && (
        <span className="text-xs text-text-error leading-4" role="alert">{error}</span>
      )}
    </div>
  )
}

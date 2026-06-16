import { useCallback, useEffect, useRef, useState } from 'react'

export type SliderUnit = 'plain' | 'hours' | 'days' | 'auto'

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (next: number) => void
  /**
   * 'plain' → raw number. 'hours' → `Nh`. 'days' → `Nd`. 'auto' → `Nh` below 24,
   * `Nd` at/above. Underlying value stays in raw units so step math is precise.
   */
  unit?: SliderUnit
  step?: number
  /**
   * Optional axis labels rendered under the track at proportional positions.
   * Useful for orientation on wide ranges (e.g. [0, 7, 14, 21, 30] days).
   */
  ticks?: number[]
  disabled?: boolean
  ariaLabel?: string
}

export function formatTick(value: number, unit: SliderUnit): string {
  if (unit === 'plain') return String(value)
  if (unit === 'hours') return `${Math.round(value)}h`
  if (unit === 'days') return `${Math.round(value)}d`
  // auto
  if (value < 24) return `${Math.round(value)}h`
  return `${Math.round(value / 24)}d`
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export default function Slider({
  min,
  max,
  value,
  onChange,
  unit = 'plain',
  step = 1,
  ticks,
  disabled = false,
  ariaLabel,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const span = Math.max(1, max - min)
  const pct = ((value - min) / span) * 100

  const valueFromClientX = useCallback(
    (clientX: number): number => {
      const track = trackRef.current
      if (!track) return min
      const rect = track.getBoundingClientRect()
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      const raw = min + ratio * span
      const stepped = Math.round(raw / step) * step
      return clamp(stepped, min, max)
    },
    [min, max, span, step],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging) return
      onChange(valueFromClientX(e.clientX))
    },
    [dragging, valueFromClientX, onChange],
  )

  const handlePointerUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragging, handlePointerMove, handlePointerUp])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    let delta = 0
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step
    else if (e.key === 'PageDown') delta = -step * 10
    else if (e.key === 'PageUp') delta = step * 10
    else if (e.key === 'Home') {
      e.preventDefault()
      onChange(min)
      return
    } else if (e.key === 'End') {
      e.preventDefault()
      onChange(max)
      return
    } else return
    e.preventDefault()
    onChange(clamp(value + delta, min, max))
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    onChange(valueFromClientX(e.clientX))
    setDragging(true)
  }

  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        className="relative h-1.5 rounded-full bg-surface-secondary select-none"
        aria-label={ariaLabel}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-surface-primary"
          style={{ width: `${pct}%` }}
        />
        {ticks && ticks.length > 0 && ticks.map((t) => {
          const tPct = ((clamp(t, min, max) - min) / span) * 100
          return (
            <span
              key={t}
              aria-hidden="true"
              style={{ left: `${tPct}%` }}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-2 bg-border-default"
            />
          )
        })}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuetext={formatTick(value, unit)}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled || undefined}
          onPointerDown={(e) => {
            if (disabled) return
            e.stopPropagation()
            setDragging(true)
          }}
          onKeyDown={onKeyDown}
          style={{ left: `${pct}%` }}
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-surface-card border-2 border-surface-primary shadow-[0px_1px_3px_0px_rgba(0,0,0,0.18)] outline-none ${
            disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-surface-primary/40'
          }`}
        />
      </div>

      {ticks && ticks.length > 0 ? (
        <div className="relative h-4 mt-1">
          {ticks.map((t) => {
            const tPct = ((clamp(t, min, max) - min) / span) * 100
            const isActive = value >= t
            return (
              <span
                key={t}
                style={{ left: `${tPct}%` }}
                className={`absolute -translate-x-1/2 text-[11px] tracking-[-0.11px] leading-4 ${
                  isActive ? 'text-text-foreground font-medium' : 'text-text-light'
                }`}
              >
                {formatTick(t, unit)}
              </span>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs tracking-[-0.12px] text-text-light leading-4">
          <span>{formatTick(min, unit)}</span>
          <span className="text-text-foreground font-medium">{formatTick(value, unit)}</span>
          <span>{formatTick(max, unit)}</span>
        </div>
      )}
    </div>
  )
}

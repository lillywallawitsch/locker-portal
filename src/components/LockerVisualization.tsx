import { Monitor } from 'lucide-react'
import type { Compartment, CompartmentStatus, CompartmentSize } from '../data/lockers'

interface LockerVisualizationProps {
  compartments: Compartment[]
  onCompartmentClick?: (compartment: Compartment) => void
  // Optional set of ids that pass current filters; non-matching boxes render
  // with reduced opacity so the physical locker layout stays intact.
  matchedIds?: Set<string>
}

const statusStyle: Record<CompartmentStatus, string> = {
  available: 'bg-surface-success text-text-success border-border-success',
  occupied: 'bg-surface-primary-light text-text-primary border-border-primary-light',
  reserved: 'bg-surface-secondary text-text-foreground border-border-default',
  defective: 'bg-surface-error text-text-error border-border-error',
}

// Relative weights — used as flex-grow values so compartments stretch to fill
// each column completely. Larger sizes claim proportionally more vertical space.
const sizeWeight: Record<CompartmentSize, number> = {
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
}

const COL_COUNT = 5
const SCREEN_AT_COL = 2 // index of the column that has the screen overlay
const SCREEN_WEIGHT = 2 // same vertical weight as a Small compartment
const COLUMN_HEIGHT = 'h-[420px]'

export default function LockerVisualization({
  compartments,
  onCompartmentClick,
  matchedIds,
}: LockerVisualizationProps) {
  const perCol = Math.ceil(compartments.length / COL_COUNT)
  const columns: Compartment[][] = []
  for (let i = 0; i < COL_COUNT; i++) {
    columns.push(compartments.slice(i * perCol, (i + 1) * perCol))
  }

  return (
    <div className="bg-surface-bg border border-border-default rounded-lg p-3 flex flex-col gap-2">
      <div className={`flex gap-1.5 ${COLUMN_HEIGHT}`}>
        {columns.map((col, ci) => {
          const renderCompartment = (c: Compartment) => {
            const number = c.id.replace(/^C-0*/, '')
            const dimmed = matchedIds && !matchedIds.has(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCompartmentClick?.(c)}
                title={`${c.id} · ${c.size} · ${c.status}`}
                style={{ flex: sizeWeight[c.size] }}
                className={`${statusStyle[c.status]} ${dimmed ? 'opacity-25' : ''} w-full rounded border flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity text-sm font-medium tracking-[-0.14px]`}
              >
                {number}
              </button>
            )
          }

          if (ci === SCREEN_AT_COL) {
            // Place the screen in the vertical center of the middle column.
            const mid = Math.ceil(col.length / 2)
            const above = col.slice(0, mid)
            const below = col.slice(mid)
            return (
              <div key={ci} className="flex-1 flex flex-col gap-1.5 min-w-0">
                {above.map(renderCompartment)}
                <div
                  style={{ flex: SCREEN_WEIGHT }}
                  className="rounded bg-text-foreground flex items-center justify-center gap-1.5 text-text-inverted text-xs font-medium tracking-[-0.12px]"
                >
                  <Monitor size={14} />
                  Screen
                </div>
                {below.map(renderCompartment)}
              </div>
            )
          }

          return (
            <div key={ci} className="flex-1 flex flex-col gap-1.5 min-w-0">
              {col.map(renderCompartment)}
            </div>
          )
        })}
      </div>
      {/* Locker base */}
      <div className="h-2.5 bg-text-foreground rounded" />
    </div>
  )
}

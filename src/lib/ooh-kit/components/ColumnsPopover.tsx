import { useEffect, useRef, useState } from 'react'
import { ChevronDown, GripVertical, Lock, Table } from 'lucide-react'

export interface ColumnDef {
  key: string
  label: string
  pinned?: boolean
}

export interface ColumnState {
  key: string
  visible: boolean
}

interface ColumnsPopoverProps {
  columns: ColumnDef[]
  state: ColumnState[]
  onChange: (next: ColumnState[]) => void
  onReset: () => void
  /** When true, the Reset to Default action is hidden. */
  isDefault?: boolean
}

export default function ColumnsPopover({ columns, state, onChange, onReset, isDefault = false }: ColumnsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const columnMap = Object.fromEntries(columns.map((c) => [c.key, c]))

  const toggleVisible = (key: string) => {
    const col = columnMap[key]
    if (col.pinned) return
    onChange(state.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)))
  }

  const handleDrop = (target: string) => {
    if (!dragKey || dragKey === target) {
      setDragKey(null)
      setDragOverKey(null)
      return
    }
    const targetCol = columnMap[target]
    const dragCol = columnMap[dragKey]
    if (targetCol?.pinned || dragCol?.pinned) {
      setDragKey(null)
      setDragOverKey(null)
      return
    }
    const next = [...state]
    const from = next.findIndex((s) => s.key === dragKey)
    const to = next.findIndex((s) => s.key === target)
    if (from < 0 || to < 0) return
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
    setDragKey(null)
    setDragOverKey(null)
  }

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
        <Table size={16} className="text-text-foreground" aria-hidden="true" />
        <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] whitespace-nowrap leading-[18px]">
          Edit Columns
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`text-text-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Customize columns"
          className="absolute top-full right-0 mt-1.5 z-20 w-[280px] bg-surface-card border border-border-default rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.08),0px_8px_10px_-6px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
        >
          <div className="flex flex-col px-1 py-2 max-h-[320px] overflow-y-auto">
            {state.map((s) => {
              const col = columnMap[s.key]
              if (!col) return null
              const isPinned = col.pinned
              const isDraggingOver = dragOverKey === s.key && dragKey && dragKey !== s.key
              return (
                <div
                  key={s.key}
                  draggable={!isPinned}
                  onDragStart={(e) => {
                    if (isPinned) return
                    e.dataTransfer.setData('text/plain', s.key)
                    e.dataTransfer.effectAllowed = 'move'
                    setDragKey(s.key)
                  }}
                  onDragOver={(e) => {
                    if (isPinned) return
                    e.preventDefault()
                    setDragOverKey(s.key)
                  }}
                  onDragLeave={() => setDragOverKey((k) => (k === s.key ? null : k))}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDrop(s.key)
                  }}
                  onDragEnd={() => {
                    setDragKey(null)
                    setDragOverKey(null)
                  }}
                  className={`flex items-center gap-2.5 h-8 px-3 rounded-md transition-colors ${
                    isPinned ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:bg-surface-secondary/60'
                  } ${isDraggingOver ? 'bg-surface-secondary' : ''} ${dragKey === s.key ? 'opacity-40' : ''}`}
                >
                  <label className={`flex items-center gap-2 flex-1 min-w-0 ${isPinned ? 'cursor-default' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={s.visible}
                      disabled={isPinned}
                      onChange={() => toggleVisible(s.key)}
                      className="w-4 h-4 rounded border-border-default accent-surface-primary cursor-pointer disabled:cursor-default"
                    />
                    <span className={`text-sm tracking-[-0.14px] truncate leading-[18px] ${isPinned ? 'text-text-light' : 'text-text-foreground'}`}>
                      {col.label}
                    </span>
                  </label>
                  {isPinned ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] uppercase tracking-[-0.1px] leading-[14px] text-text-light">
                        PINNED
                      </span>
                      <Lock size={14} aria-hidden="true" className="text-text-light opacity-60" />
                    </div>
                  ) : (
                    <GripVertical size={14} aria-hidden="true" className="text-text-light shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {!isDefault && (
            <div className="flex items-center p-3 border-t border-border-default bg-surface-card">
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-text-primary font-medium tracking-[-0.12px] leading-4 bg-transparent border-0 cursor-pointer p-0 hover:underline"
              >
                Reset to Default
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

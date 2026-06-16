import { useEffect, useRef, useState } from 'react'
import { Bookmark, Check, Pencil, Trash2, X } from 'lucide-react'

export interface SavedView {
  id: string
  name: string
}

interface SavedViewsPopoverProps {
  views: SavedView[]
  activeViewId: string | null
  onApply: (id: string) => void
  onClear: () => void
  onRemove: (id: string) => void
  onRename: (id: string, nextName: string) => void
  firstTimeTooltip?: string | null
  onDismissFirstTimeTooltip?: () => void
}

export default function SavedViewsPopover({
  views,
  activeViewId,
  onApply,
  onClear,
  onRemove,
  onRename,
  firstTimeTooltip = null,
  onDismissFirstTimeTooltip,
}: SavedViewsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
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

  const handleTriggerClick = () => {
    setOpen((v) => !v)
    if (firstTimeTooltip) onDismissFirstTimeTooltip?.()
  }

  const selectedCount = activeViewId ? 1 : 0

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center gap-2 h-[38px] px-4 border rounded-lg bg-surface-default cursor-pointer transition-shadow ${
          open
            ? 'border-border-primary shadow-[0px_0px_0px_1.5px_var(--color-border-primary),0px_0px_0px_3px_var(--color-neutral-200)]'
            : 'border-border-filter'
        }`}
      >
        <Bookmark size={16} className="text-text-foreground" aria-hidden="true" />
        <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] whitespace-nowrap leading-[18px]">
          My Saved Filters
        </span>
      </button>

      {firstTimeTooltip && !open && (
        <div
          role="tooltip"
          className="absolute top-full right-0 mt-2 z-30 w-[260px] px-3 py-2 bg-surface-tooltip text-text-inverted text-xs tracking-[-0.12px] leading-[18px] rounded-lg shadow-[0px_8px_20px_-4px_rgba(0,0,0,0.18)]"
        >
          <span
            aria-hidden="true"
            className="absolute -top-1.5 right-6 w-3 h-3 bg-surface-tooltip rotate-45"
          />
          <span className="relative">{firstTimeTooltip}</span>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="My Saved Filters"
          className="absolute top-full right-0 mt-1.5 z-20 w-[320px] bg-surface-card border border-border-default rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.08),0px_8px_10px_-6px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
        >
          {views.length === 0 ? (
            <div className="p-1">
              <div className="flex flex-col gap-1 px-4 py-3">
                <p className="text-sm text-text-foreground tracking-[-0.14px] leading-[18px] text-center">
                  No Filters Saved Yet
                </p>
                <p className="text-xs text-text-light tracking-[-0.12px] leading-4 text-center">
                  Choose filters in the Filters Panel and save your active filter for later
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col px-1 py-2 max-h-[280px] overflow-y-auto">
              {views.map((v) => {
                const isActive = v.id === activeViewId
                const isEditing = editingId === v.id

                const startEditing = () => {
                  setEditingId(v.id)
                  setDraftName(v.name)
                }
                const commitRename = () => {
                  const trimmed = draftName.trim()
                  if (trimmed && trimmed !== v.name) onRename(v.id, trimmed)
                  setEditingId(null)
                }
                const cancelRename = () => {
                  setEditingId(null)
                }

                if (isEditing) {
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-surface-secondary/40"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        disabled
                        className="w-4 h-4 rounded border-border-default accent-surface-primary shrink-0 cursor-default mr-1"
                      />
                      <input
                        ref={(el) => {
                          if (el && document.activeElement !== el) {
                            el.focus()
                            el.select()
                          }
                        }}
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            commitRename()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            cancelRename()
                          }
                        }}
                        aria-label={`Rename ${v.name}`}
                        className="flex-1 min-w-0 text-sm text-text-foreground tracking-[-0.14px] leading-[18px] bg-transparent border-0 outline-none focus:ring-1 focus:ring-border-primary rounded-sm px-1 -mx-1"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={commitRename}
                        aria-label="Save name"
                        className="flex items-center justify-center w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer hover:bg-surface-secondary"
                      >
                        <Check size={14} className="text-text-success" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={cancelRename}
                        aria-label="Cancel rename"
                        className="flex items-center justify-center w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer hover:bg-surface-secondary"
                      >
                        <X size={14} className="text-text-error" />
                      </button>
                    </div>
                  )
                }

                return (
                  <label
                    key={v.id}
                    className="group flex items-center gap-2.5 h-8 px-3 rounded-md cursor-pointer transition-colors hover:bg-surface-secondary/60"
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => (isActive ? onClear() : onApply(v.id))}
                      className="w-4 h-4 rounded border-border-default accent-surface-primary cursor-pointer shrink-0"
                    />
                    <span className="flex-1 min-w-0 text-sm text-text-foreground tracking-[-0.14px] truncate leading-[18px]">
                      {v.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        startEditing()
                      }}
                      aria-label={`Rename ${v.name}`}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer hover:bg-surface-secondary transition-opacity"
                    >
                      <Pencil size={14} className="text-text-light" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onRemove(v.id)
                      }}
                      aria-label={`Delete ${v.name}`}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer hover:bg-surface-secondary transition-opacity"
                    >
                      <Trash2 size={14} className="text-text-error" />
                    </button>
                  </label>
                )
              })}
            </div>
          )}

          {views.length > 0 && selectedCount > 0 && (
            <div className="flex items-center px-4 py-3 border-t border-border-default bg-surface-card shrink-0">
              <div className="flex items-center gap-1 text-xs tracking-[-0.12px] leading-4">
                <span className="text-text-light">{selectedCount} Filters active</span>
                <span className="text-text-light">·</span>
                <button
                  type="button"
                  onClick={onClear}
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

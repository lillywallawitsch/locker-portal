import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { Button } from '../lib/unity'

export interface ActionMenuItem {
  key: string
  label: string
  icon?: ReactNode
  destructive?: boolean
  onClick: () => void
}

type ActionMenuTrigger = 'icon' | 'edit-button'

interface ActionMenuProps {
  items: ActionMenuItem[]
  ariaLabel?: string
  align?: 'left' | 'right'
  trigger?: ActionMenuTrigger
  triggerLabel?: string
}

export default function ActionMenu({
  items,
  ariaLabel = 'Actions',
  align = 'right',
  trigger = 'icon',
  triggerLabel = 'Edit',
}: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [open])

  if (items.length === 0) return null

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  return (
    <div ref={ref} className="relative">
      {trigger === 'edit-button' ? (
        <Button
          variant="secondary"
          size="sm"
          icon={<Pencil size={14} className="text-text-foreground" />}
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={handleTriggerClick}
        >
          {triggerLabel}
        </Button>
      ) : (
        <button
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={handleTriggerClick}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-card-hover transition-colors border-0 bg-transparent cursor-pointer"
        >
          <MoreHorizontal size={16} className="text-text-foreground" />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute top-full mt-1 min-w-[200px] bg-surface-card border border-border-default rounded-md shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)] overflow-hidden z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                item.onClick()
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 bg-surface-default hover:bg-surface-secondary border-0 cursor-pointer text-left ${
                item.destructive ? 'text-text-error' : 'text-text-foreground'
              }`}
            >
              {item.icon && (
                <span className="flex items-center justify-center size-3.5 shrink-0">
                  {item.icon}
                </span>
              )}
              <span className="text-sm tracking-[-0.14px] leading-[18px] truncate">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

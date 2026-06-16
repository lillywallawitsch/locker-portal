import type { ReactNode } from 'react'

interface SegmentedControlItem {
  key: string
  icon: ReactNode
  label: string
}

interface SegmentedControlProps {
  items: SegmentedControlItem[]
  activeKey: string
  onChange: (key: string) => void
}

export default function SegmentedControl({
  items,
  activeKey,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="flex h-8 rounded bg-black/[0.06]" role="group">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          aria-label={item.label}
          aria-pressed={activeKey === item.key}
          className={`flex items-center justify-center px-4 h-full rounded cursor-pointer ${
            activeKey === item.key
              ? 'bg-surface-default border border-border-default'
              : 'bg-transparent border-0'
          }`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}

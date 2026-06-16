import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface LastUpdatedButtonProps {
  onRefresh?: () => void
}

function labelFor(diffMs: number): string {
  const diff = Math.floor(diffMs / 1000)
  if (diff < 5) return 'Last updated just now'
  if (diff < 60) return `Last updated ${diff}s ago`
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `Last updated ${mins} min ago`
  const hours = Math.floor(mins / 60)
  return `Last updated ${hours}h ago`
}

export default function LastUpdatedButton({ onRefresh }: LastUpdatedButtonProps) {
  const [lastRefresh, setLastRefresh] = useState(() => Date.now())
  const [label, setLabel] = useState(() => labelFor(0))
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    const tick = () => setLabel(labelFor(Date.now() - lastRefresh))
    tick()
    const interval = setInterval(tick, 10_000)
    return () => clearInterval(interval)
  }, [lastRefresh])

  const handleClick = () => {
    setLastRefresh(Date.now())
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 600)
    onRefresh?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Refresh data"
      className="inline-flex items-center gap-1.5 text-sm text-text-primary font-medium tracking-[-0.14px] leading-[22px] no-underline cursor-pointer bg-transparent border-0 p-0 m-0 hover:underline"
    >
      {label}
      <RefreshCw
        size={16}
        className={`text-text-primary ${spinning ? 'animate-spin' : ''}`}
      />
    </button>
  )
}

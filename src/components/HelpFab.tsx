import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface HelpFabProps {
  onClick: () => void
  /** Short tooltip label, e.g. "Ask about this locker" */
  tooltip: string
}

export default function HelpFab({ onClick, tooltip }: HelpFabProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40 drop-shadow-xl flex items-center justify-end gap-2">
      {/* Tooltip — slides in from right when hovered */}
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5
          bg-[#1a1a2e] text-white text-sm font-medium
          rounded-lg whitespace-nowrap pointer-events-none
          transition-all duration-200
          ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}
        aria-hidden="true"
      >
        {tooltip}
        <kbd className="text-xs font-mono opacity-60 bg-white/10 px-1.5 py-0.5 rounded">⌘J</kbd>
      </div>

      {/* Animated gradient border wrapper */}
      <div
        className="ai-fab-ring p-[3px] rounded-[13px] shrink-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Button — plain primary blue */}
        <button
          onClick={onClick}
          aria-label={tooltip}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] text-sm font-medium tracking-[-0.16px] leading-5 text-text-button bg-surface-primary cursor-pointer hover:opacity-90 transition-opacity border-0 whitespace-nowrap"
        >
          <span className="flex items-center justify-center size-5">
            <MessageCircle size={16} />
          </span>
          Help
        </button>
      </div>
    </div>
  )
}

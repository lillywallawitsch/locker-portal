import type { ReactNode } from 'react'

interface CardProps {
  title: string
  /** Trailing element rendered next to the title — typically a status badge. */
  headerRight?: ReactNode
  children: ReactNode
}

/**
 * Sidebar info card with a header (title + optional trailing element) and a
 * vertical content stack. Used on the Locker / Parcel detail pages to group
 * related fields under a labelled section.
 */
export default function Card({ title, headerRight, children }: CardProps) {
  return (
    <div className="border border-border-default rounded-[10px] bg-surface-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold leading-6 tracking-[-0.28px] text-text-foreground m-0">
          {title}
        </h3>
        {headerRight}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

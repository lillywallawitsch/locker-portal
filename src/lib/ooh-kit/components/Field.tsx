import type { ReactNode } from 'react'

interface FieldProps {
  /** Small light-gray label above the value. */
  label: string
  /** The field value — typically text, but accepts any node. */
  children: ReactNode
  /** Optional trailing slot rendered to the right of the value (e.g. a copy
   *  button or a chevron arrow). Aligned to the row centre. */
  trailing?: ReactNode
}

/**
 * Stacked label-above-value field used inside `Card`. Mirrors the Figma
 * "form field" pattern: small uppercase-style label on top, medium-weight
 * value below, optional trailing icon button (copy / nav / chevron) sharing
 * the value row.
 */
export default function Field({ label, children, trailing }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-light tracking-[-0.12px] leading-4">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 text-sm font-medium text-text-foreground tracking-[-0.14px] leading-5">
          {children}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </div>
  )
}

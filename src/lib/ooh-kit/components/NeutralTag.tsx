interface NeutralTagProps {
  label: string
}

export default function NeutralTag({ label }: NeutralTagProps) {
  return (
    <div className="inline-flex items-center px-2 py-1 h-6 border border-border-default rounded-[10px] bg-surface-default">
      <span className="text-xs font-medium tracking-[-0.14px] uppercase leading-[18px] text-text-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}

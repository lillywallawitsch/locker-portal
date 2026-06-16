interface RadioProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  name?: string
  value?: string
  disabled?: boolean
}

export default function Radio({
  label,
  checked = false,
  onChange,
  name,
  value,
  disabled = false,
}: RadioProps) {
  return (
    <label className={`inline-flex gap-2 items-center ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span className="relative flex items-center justify-center size-6">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <span className="size-5 rounded-full border-2 border-border-default peer-checked:border-surface-primary transition-colors" />
        <span className="absolute size-2.5 rounded-full bg-surface-primary scale-0 peer-checked:scale-100 transition-transform" />
      </span>
      <span className="text-base text-text-foreground leading-5 tracking-[-0.16px]">
        {label}
      </span>
    </label>
  )
}

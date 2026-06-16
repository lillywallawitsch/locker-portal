interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  ariaLabel?: string
}

export default function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label,
  ariaLabel,
}: ToggleProps) {
  return (
    <label className={`inline-flex gap-2 items-center ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label ?? 'Toggle'}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-[38px] shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-surface-primary' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] transition-transform ${
            checked ? 'translate-x-[16px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
      {label && (
        <span className="text-base text-text-foreground leading-5 tracking-[-0.16px]">
          {label}
        </span>
      )}
    </label>
  )
}

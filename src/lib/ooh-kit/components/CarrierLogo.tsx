interface CarrierLogoProps {
  brand: 'gls' | 'dpd'
  /** Accessible label, e.g. carrier shortName. */
  shortName?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CarrierLogo({ brand, shortName, size = 'md' }: CarrierLogoProps) {
  const label = shortName ?? (brand === 'dpd' ? 'DPD' : 'GLS')

  const sizeClass =
    size === 'sm'
      ? 'w-[21px] h-4 rounded-xs'
      : size === 'lg'
      ? 'w-10 h-10 rounded-lg'
      : 'w-8 h-8 rounded-lg'

  return (
    <img
      src={`/carriers/${brand}.svg`}
      alt={label}
      className={`${sizeClass} shrink-0 object-contain`}
    />
  )
}

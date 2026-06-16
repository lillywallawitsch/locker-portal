import type { Provider } from '../../../data/lockers'

interface ProviderLogoProps {
  provider: Provider
  size?: 'sm' | 'md'
}

// Third-party provider brand colors — locked to each provider's brand identity.
const bgColors: Partial<Record<Provider, string>> = {
  tamburi: 'bg-[#ea5b0c]',
  quadient: 'bg-[#ff4200]',
}

const fileExtensions: Record<Provider, string> = {
  bloqit: 'svg',
  myflexbox: 'svg',
  swipbox: 'svg',
  keba: 'svg',
  tamburi: 'svg',
  cainiao: 'svg',
  amazon: 'png',
  locky: 'png',
  quadient: 'svg',
}

const padding: Partial<Record<Provider, string>> = {
  bloqit: 'p-[2px]',
  myflexbox: 'p-[2px]',
  swipbox: 'p-[2px]',
  keba: 'p-[2px]',
  cainiao: 'p-[2px]',
  tamburi: 'p-[3px]',
  quadient: 'p-[3px]',
}

export default function ProviderLogo({ provider, size = 'sm' }: ProviderLogoProps) {
  const sizeClass = size === 'sm' ? 'w-[18px] h-[18px]' : 'w-8 h-8'
  const bg = bgColors[provider] ?? 'bg-surface-bg'
  const ext = fileExtensions[provider]
  const pad = padding[provider] ?? ''

  if (provider === 'locky') {
    return (
      <div className={`${sizeClass} rounded-sm ${bg} overflow-hidden shrink-0 relative`}>
        <img
          src={`/providers/locky.png`}
          alt="Locky"
          className="absolute max-w-none h-auto"
          style={{ width: '610%', left: '-170%', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-sm ${bg} overflow-hidden shrink-0 ${pad}`}>
      <img
        src={`/providers/${provider}.${ext}`}
        alt={provider}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

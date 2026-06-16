export type ProviderExpiryRule = {
  firstMileHours: number
  lastMileHours: number
  updatedAt: string
  updatedBy: string
}

export type CarrierExpirySettings = {
  default: ProviderExpiryRule
}

const seeds: Record<string, CarrierExpirySettings> = {
  'gls-de': {
    default: { firstMileHours: 48, lastMileHours: 72, updatedAt: '2026-04-21', updatedBy: 'Simon Goat' },
  },
  'dpd-de': {
    default: { firstMileHours: 48, lastMileHours: 72, updatedAt: '2026-04-12', updatedBy: 'Provider default' },
  },
  'gls-at': {
    default: { firstMileHours: 36, lastMileHours: 72, updatedAt: '2026-03-15', updatedBy: 'Provider default' },
  },
  'gls-it': {
    default: { firstMileHours: 48, lastMileHours: 96, updatedAt: '2026-02-08', updatedBy: 'Provider default' },
  },
  'gls-es': {
    default: { firstMileHours: 36, lastMileHours: 72, updatedAt: '2026-04-08', updatedBy: 'Carlos García' },
  },
  'gls-pt': {
    default: { firstMileHours: 48, lastMileHours: 72, updatedAt: '2026-03-20', updatedBy: 'João Silva' },
  },
}

export function getCarrierExpirySettings(carrierId: string): CarrierExpirySettings {
  return (
    seeds[carrierId] ?? {
      default: { firstMileHours: 48, lastMileHours: 72, updatedAt: '2026-04-12', updatedBy: 'Provider default' },
    }
  )
}

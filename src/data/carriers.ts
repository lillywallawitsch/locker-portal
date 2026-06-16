export interface Carrier {
  id: string
  name: string
  shortName: string
  brand: 'gls' | 'dpd'
  color: string
}

export const carriers: Carrier[] = [
  { id: 'gls-de', name: 'GLS Germany', shortName: 'GLS', brand: 'gls', color: '#061ab1' },
  { id: 'dpd-de', name: 'DPD Germany', shortName: 'DPD', brand: 'dpd', color: '#dc0032' },
  { id: 'gls-at', name: 'GLS Austria', shortName: 'GLS', brand: 'gls', color: '#061ab1' },
  { id: 'gls-it', name: 'GLS Italy', shortName: 'GLS', brand: 'gls', color: '#061ab1' },
  { id: 'gls-es', name: 'GLS Spain', shortName: 'GLS', brand: 'gls', color: '#061ab1' },
  { id: 'gls-pt', name: 'GLS Portugal', shortName: 'GLS', brand: 'gls', color: '#061ab1' },
]

export const defaultCarrierId = 'gls-de'

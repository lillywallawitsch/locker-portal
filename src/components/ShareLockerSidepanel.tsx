import { useMemo, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { Button, SelectTile } from '../lib/unity'
import { CarrierLogo, ProviderLogo, SearchInput, Sidepanel } from '../lib/ooh-kit'
import type { Locker } from '../data/lockers'
import { carriers } from '../data/carriers'
import { useOrg } from '../context/OrgContext'

interface ShareLockerSidepanelProps {
  onClose: () => void
  onShared: (lockerCount: number, carrierCount: number) => void
}

type Step = 'lockers' | 'carriers'

export default function ShareLockerSidepanel({ onClose, onShared }: ShareLockerSidepanelProps) {
  const { lockerData, shareLockers, carrier: activeCarrier } = useOrg()

  const [step, setStep] = useState<Step>('lockers')
  const [lockerQuery, setLockerQuery] = useState('')
  const [carrierQuery, setCarrierQuery] = useState('')
  const [selectedLockerIds, setSelectedLockerIds] = useState<string[]>([])
  const [selectedCarrierIds, setSelectedCarrierIds] = useState<string[]>([])

  const ownedLockers = useMemo(
    () => lockerData.filter((l: Locker) => l.ownership === 'owned'),
    [lockerData],
  )

  const filteredLockers = useMemo(() => {
    const q = lockerQuery.trim().toLowerCase()
    if (!q) return ownedLockers
    return ownedLockers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.street.toLowerCase().includes(q) ||
        l.cityName.toLowerCase().includes(q) ||
        l.postalCode.toLowerCase().includes(q),
    )
  }, [ownedLockers, lockerQuery])

  const otherCarriers = useMemo(
    () => carriers.filter((c) => c.id !== activeCarrier.id),
    [activeCarrier.id],
  )

  const filteredCarriers = useMemo(() => {
    const q = carrierQuery.trim().toLowerCase()
    if (!q) return otherCarriers
    return otherCarriers.filter((c) => c.name.toLowerCase().includes(q))
  }, [otherCarriers, carrierQuery])

  const toggleLocker = (id: string) => {
    setSelectedLockerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }
  const toggleCarrier = (id: string) => {
    setSelectedCarrierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const allFilteredSelected =
    filteredLockers.length > 0 &&
    filteredLockers.every((l) => selectedLockerIds.includes(l.id))

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredLockers.map((l) => l.id)
    if (allFilteredSelected) {
      setSelectedLockerIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      setSelectedLockerIds((prev) => Array.from(new Set([...prev, ...filteredIds])))
    }
  }

  const handleNext = () => {
    if (selectedLockerIds.length === 0) return
    setStep('carriers')
  }

  const handleBack = () => setStep('lockers')

  const handleShare = () => {
    if (selectedLockerIds.length === 0 || selectedCarrierIds.length === 0) return
    shareLockers(selectedLockerIds, selectedCarrierIds)
    onShared(selectedLockerIds.length, selectedCarrierIds.length)
    onClose()
  }

  const isLockersStep = step === 'lockers'
  const title = isLockersStep ? 'Share lockers' : 'Choose carriers'
  const subtitle = isLockersStep
    ? 'Step 1 of 2 — Select one or more lockers you want to share with another carrier.'
    : `Step 2 of 2 — Choose the carriers to invite to ${selectedLockerIds.length} locker${selectedLockerIds.length === 1 ? '' : 's'}.`

  return (
    <Sidepanel open onClose={onClose}>
        <div className="flex flex-col gap-1 border-b border-border-default px-6 pt-8 pb-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
              {title}
            </h2>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
          </div>
          <p className="text-base text-text-light leading-6 tracking-[-0.16px] m-0">
            {subtitle}
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 px-6 pt-6 pb-6 overflow-auto">
          {isLockersStep ? (
            <>
              <SearchInput
                placeholder="Search for Locker Name, ID or Address"
                value={lockerQuery}
                onChange={setLockerQuery}
                className="w-full shrink-0"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-text-light tracking-[-0.14px]">
                  {filteredLockers.length} locker{filteredLockers.length === 1 ? '' : 's'}
                  {lockerQuery ? ' match your search' : ' available'}
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  disabled={filteredLockers.length === 0}
                  className="text-sm font-medium text-text-primary tracking-[-0.14px] leading-5 bg-transparent border-0 cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {allFilteredSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {filteredLockers.length === 0 ? (
                  <p className="text-sm text-text-light tracking-[-0.14px] py-6 text-center m-0">
                    No lockers match your search.
                  </p>
                ) : (
                  filteredLockers.map((l) => {
                    const isSelected = selectedLockerIds.includes(l.id)
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => toggleLocker(l.id)}
                        aria-pressed={isSelected}
                        className={`bg-surface-default border ${
                          isSelected
                            ? 'border-[1.5px] border-border-active'
                            : 'border-border-default'
                        } rounded-lg p-4 flex gap-4 items-start cursor-pointer shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)] text-left transition-colors hover:bg-surface-muted w-full`}
                      >
                        <span className="flex items-center justify-center size-6 shrink-0 mt-0.5">
                          <ProviderLogo provider={l.provider} />
                        </span>
                        <span className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="text-base text-text-foreground font-medium leading-6 tracking-[-0.16px] break-words">
                            {l.name}
                          </span>
                          <span className="text-sm text-text-light leading-5 tracking-[-0.14px] break-all">
                            ID {l.id}
                          </span>
                          <span className="text-sm text-text-light leading-5 tracking-[-0.14px] break-words">
                            {l.street}, {l.postalCode} {l.cityName}
                          </span>
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <SearchInput
                placeholder="Search for Carrier"
                value={carrierQuery}
                onChange={setCarrierQuery}
                className="w-full shrink-0"
              />
              <div className="flex flex-col gap-2">
                {filteredCarriers.length === 0 ? (
                  <p className="text-sm text-text-light tracking-[-0.14px] py-6 text-center m-0">
                    No carriers match your search.
                  </p>
                ) : (
                  filteredCarriers.map((c) => (
                    <SelectTile
                      key={c.id}
                      title={c.name}
                      subtitle={c.brand === 'dpd' ? 'DPD network' : 'GLS network'}
                      icon={<CarrierLogo brand={c.brand} shortName={c.shortName} size="sm" />}
                      selected={selectedCarrierIds.includes(c.id)}
                      onClick={() => toggleCarrier(c.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border-default p-4">
          {isLockersStep ? (
            <>
              <span className="text-sm text-text-light tracking-[-0.14px]">
                {selectedLockerIds.length} locker{selectedLockerIds.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={selectedLockerIds.length === 0}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="md"
                icon={<ArrowLeft size={16} aria-hidden="true" />}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleShare}
                disabled={selectedCarrierIds.length === 0}
              >
                Share with {selectedCarrierIds.length || ''} carrier
                {selectedCarrierIds.length === 1 ? '' : 's'}
              </Button>
            </>
          )}
        </div>
    </Sidepanel>
  )
}

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Truck, CircleUser, Copy, Check } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Button, Dialog, SegmentControl } from '../lib/unity'
import type { SegmentItem } from '../lib/unity'

type CodeTab = 'courier' | 'consignee'
type TabMode = 'both' | 'courier-only' | 'consignee-only'

interface CompartmentCodeDialogProps {
  open: boolean
  onClose: () => void
  parcelId: string
  tabMode: TabMode
}

function generateCode(parcelId: string, type: CodeTab): string {
  let hash = 0
  const seed = parcelId + type
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return String(Math.abs(hash) % 9000000 + 1000000)
}

export default function CompartmentCodeDialog({
  open,
  onClose,
  parcelId,
  tabMode,
}: CompartmentCodeDialogProps) {
  const defaultTab: CodeTab = tabMode === 'consignee-only' ? 'consignee' : 'courier'
  const [activeTab, setActiveTab] = useState<CodeTab>(defaultTab)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setActiveTab(tabMode === 'consignee-only' ? 'consignee' : 'courier')
  }, [tabMode])

  const code = generateCode(parcelId, activeTab)
  const label = activeTab === 'courier' ? 'Driver Collection Code' : 'Consignee Collection Code'

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  if (!open) return null

  const showTabs = tabMode === 'both'

  const segments: SegmentItem[] = [
    { key: 'courier', label: 'For Courier', icon: <Truck size={16} /> },
    { key: 'consignee', label: 'For Consignee', icon: <CircleUser size={16} /> },
  ]

  return createPortal(
    <div
      className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="w-[90vw] max-w-[421px]" onClick={(e) => e.stopPropagation()}>
        <Dialog
          title="Compartment Code"
          onClose={onClose}
          footer={
            <Button
              variant="primary"
              size="lg"
              icon={copied ? <Check size={20} /> : <Copy size={20} />}
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="m-0">
              Scan at the locker to open the compartment.
            </p>

            {showTabs && (
              <SegmentControl
                items={segments}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as CodeTab)}
              />
            )}

            {/* QR Code Area */}
            <div className="bg-surface-card border border-border-light rounded-lg flex flex-col items-center gap-6 px-4 py-6">
              <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
                {label}
              </span>
              <QRCode value={code} size={160} />
              <span className="text-2xl font-medium text-text-foreground tracking-[4.8px] leading-[22px] text-center">
                {code}
              </span>
            </div>
          </div>
        </Dialog>
      </div>
    </div>,
    document.body
  )
}

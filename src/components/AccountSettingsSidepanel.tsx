import { useState, useEffect } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Button, Input } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'

interface AccountSettingsSidepanelProps {
  open: boolean
  onClose: () => void
  userName: string
  userEmail: string
}

export default function AccountSettingsSidepanel({
  open,
  onClose,
  userName,
  userEmail,
}: AccountSettingsSidepanelProps) {
  const [fullName, setFullName] = useState(userName)

  useEffect(() => {
    if (open) setFullName(userName)
  }, [open, userName])

  const hasChanges = fullName !== userName

  return (
    <Sidepanel open={open} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-6 pt-8 pb-6">
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
            Account Settings
          </h2>
          <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-8 px-6 pt-8 overflow-auto">
          {/* Personal Information */}
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
              Personal Information
            </span>
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="E-Mail"
              value={userEmail}
              disabled
              className="opacity-60"
            />
          </div>

          {/* Other Actions */}
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
              Other Actions
            </span>
            <div>
              <Button variant="secondary" size="md" icon={<RotateCcw size={16} />}>
                Send E-Mail to reset Password
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-default p-4">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={!hasChanges}
            onClick={onClose}
            className={!hasChanges ? 'opacity-50 cursor-not-allowed bg-surface-muted text-text-muted' : ''}
          >
            Save Changes
          </Button>
        </div>
    </Sidepanel>
  )
}

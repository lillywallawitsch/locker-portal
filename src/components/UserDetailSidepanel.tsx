import { useState, useEffect } from 'react'
import { X, Ban } from 'lucide-react'
import { Button, Input } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'
import type { UserData } from '../data/users'

interface UserDetailSidepanelProps {
  user: UserData | null
  onClose: () => void
}

export default function UserDetailSidepanel({ user, onClose }: UserDetailSidepanelProps) {
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    if (user) setFullName(user.fullName)
  }, [user])

  const hasChanges = user ? fullName !== user.fullName : false

  return (
    <Sidepanel open={user !== null} onClose={onClose}>
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border-default px-6 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
              Edit User Information
            </h2>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
          </div>
          <span className="text-sm text-text-light tracking-[-0.14px] leading-[18px]">
            {user?.email}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-6 px-6 pt-8 overflow-auto">
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
          </div>

          {/* Divider */}
          <div className="border-t border-border-default" />

          {/* Other Actions */}
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
              Other Actions
            </span>
            <div>
              <Button variant="destructive" size="md" icon={<Ban size={16} />}>
                Block Users from accessing Portal
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

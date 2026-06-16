import { useEffect, useState } from 'react'
import { Plus, Send, X } from 'lucide-react'
import { Button, Input, SelectMenu } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'
import { useOrg } from '../context/OrgContext'

interface InviteRow {
  email: string
  role: string
}

interface InviteUserSidepanelProps {
  open: boolean
  onClose: () => void
}

const MAX_ROWS = 5

const roleOptions = [
  { value: 'Business', label: 'Business' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Staff', label: 'Staff' },
]

export default function InviteUserSidepanel({ open, onClose }: InviteUserSidepanelProps) {
  const { carrier } = useOrg()
  const [rows, setRows] = useState<InviteRow[]>([{ email: '', role: '' }])

  useEffect(() => {
    if (open) setRows([{ email: '', role: '' }])
  }, [open])

  const handleClose = () => {
    setRows([{ email: '', role: '' }])
    onClose()
  }

  const updateRow = (index: number, field: keyof InviteRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  const removeRow = (index: number) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return
    setRows((prev) => [...prev, { email: '', role: '' }])
  }

  const canSend = rows.some((r) => r.email.trim() && r.role)

  return (
    <Sidepanel open={open} onClose={handleClose}>
        <div className="flex flex-col gap-1 border-b border-border-default px-6 pt-8 pb-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
              Invite a new User to Locker Portal
            </h2>
            <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={handleClose} />
          </div>
          <p className="text-base text-text-light leading-6 tracking-[-0.16px] m-0">
            Add a new user to access Locker & Parcel Information for{' '}
            <span className="font-semibold text-text-foreground">{carrier.name}.</span>
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-6 px-6 pt-6 pb-6 overflow-auto">
          <div className="flex flex-col gap-6">
            {rows.map((row, i) => (
              <div key={i} className="flex flex-col gap-6">
                {i > 0 && <div className="h-px bg-border-default" />}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <Input
                      type="email"
                      placeholder="Add E-Mail"
                      value={row.email}
                      onChange={(e) => updateRow(i, 'email', e.target.value)}
                    />
                    <SelectMenu
                      placeholder="Select User Role"
                      options={roleOptions}
                      value={row.role}
                      onChange={(val) => updateRow(i, 'role', val)}
                    />
                  </div>
                  {rows.length > 1 && (
                    <Button
                      iconOnly
                      aria-label="Remove row"
                      icon={<X size={14} className="text-text-foreground" />}
                      onClick={() => removeRow(i)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              icon={<Plus size={16} />}
              onClick={addRow}
              disabled={rows.length >= MAX_ROWS}
            >
              Add more Users
            </Button>
            <span className="text-sm text-text-light tracking-[-0.14px] leading-[22px]">
              Invite up to {MAX_ROWS} Users
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border-default p-4">
          <Button variant="secondary" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Send size={16} />}
            disabled={!canSend}
            onClick={handleClose}
          >
            Send Invite
          </Button>
        </div>
    </Sidepanel>
  )
}

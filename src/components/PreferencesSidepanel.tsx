import { useState } from 'react'
import { X } from 'lucide-react'
import { Button, SelectMenu } from '../lib/unity'
import { Sidepanel } from '../lib/ooh-kit'

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

const timezoneOptions = [
  { value: 'utc+0', label: 'UTC+00:00', description: 'London, Dublin, Lisbon' },
  { value: 'utc+1', label: 'UTC+01:00', description: 'Berlin, Paris, Madrid, Rome' },
  { value: 'utc+2', label: 'UTC+02:00', description: 'Helsinki, Bucharest, Athens' },
  { value: 'utc+3', label: 'UTC+03:00', description: 'Moscow, Istanbul, Riyadh' },
]

interface PreferencesSidepanelProps {
  open: boolean
  onClose: () => void
}

export default function PreferencesSidepanel({ open, onClose }: PreferencesSidepanelProps) {
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('utc+1')

  return (
    <Sidepanel open={open} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-6 pt-8 pb-6">
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-text-foreground m-0">
            Settings
          </h2>
          <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-8 px-6 pt-8 overflow-auto">
          {/* Language */}
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
              Language
            </span>
            <SelectMenu
              label="Select Language"
              options={languageOptions}
              value={language}
              onChange={setLanguage}
            />
          </div>

          {/* Date & Time */}
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-text-light tracking-[-0.14px] leading-[18px]">
              Date & Time
            </span>
            <SelectMenu
              label="Select Time zone"
              options={timezoneOptions}
              value={timezone}
              onChange={setTimezone}
            />
          </div>
        </div>
    </Sidepanel>
  )
}

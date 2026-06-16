import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import OpeningHoursField, { OpeningStatusBadge } from '../OpeningHoursField'
import type { OpeningHours } from '../OpeningHoursField'

const businessHours: OpeningHours = {
  kind: 'business-hours',
  weekdays: { open: '09:00', close: '23:00' },
  saturday: { open: '09:00', close: '20:00' },
  sunday: null,
}

const alwaysOpen: OpeningHours = { kind: '24/7' }

const meta: Meta<typeof OpeningHoursField> = {
  title: 'OOH Kit/OpeningHoursField',
  component: OpeningHoursField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Foldable opening-hours field. Header shows a live status (`Open until …`, `Opens …`, `Closed today`, `Open 24/7`) on the right and a chevron to expand. The expanded view lists Monday through Sunday with each day\'s open / close window.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[253px] p-4 bg-surface-card border border-border-default rounded-[10px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof OpeningHoursField>

function Demo({ hours }: { hours: OpeningHours }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <OpeningHoursField hours={hours} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
  )
}

export const BusinessHoursExpanded: Story = {
  render: () => <Demo hours={businessHours} />,
}

export const Open24_7: Story = {
  render: () => <Demo hours={alwaysOpen} />,
}

export const Collapsed: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false)
    return (
      <OpeningHoursField
        hours={businessHours}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    )
  },
}

export const StatusBadge_Open: Story = {
  name: 'OpeningStatusBadge — Open',
  render: () => <OpeningStatusBadge hours={alwaysOpen} />,
}

export const StatusBadge_Closed: Story = {
  name: 'OpeningStatusBadge — Closed',
  render: () => (
    <OpeningStatusBadge
      hours={businessHours}
      // 03:00 on a Monday — outside the 09:00–23:00 window
      now={new Date('2026-04-27T03:00:00')}
    />
  ),
}

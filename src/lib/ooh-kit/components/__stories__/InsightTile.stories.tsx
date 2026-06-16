import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import InsightTile from '../InsightTile'

const meta: Meta<typeof InsightTile> = {
  title: 'OOH Kit/InsightTile',
  component: InsightTile,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof InsightTile>

export const Single: Story = {
  args: {
    title: 'Active',
    items: [{ count: 802, label: 'Lockers' }],
  },
}

export const TwoItems: Story = {
  args: {
    title: 'Ready to Pickup by Drivers',
    items: [
      { count: 802, label: 'First Mile' },
      { count: 802, label: 'Expired Last Mile' },
    ],
  },
}

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState(false)
    return (
      <InsightTile
        title="Bookings"
        filterActive={active}
        onFilterClick={() => setActive((v) => !v)}
        items={[
          { count: 802, label: 'Hard Reservations' },
          { count: 802, label: 'Soft Reservations' },
        ]}
      />
    )
  },
}

export const Row: Story = {
  render: () => (
    <div className="flex items-stretch gap-3">
      <InsightTile
        title="Ready to Pickup by Drivers"
        items={[
          { count: 802, label: 'First Mile' },
          { count: 802, label: 'Expired Last Mile' },
        ]}
      />
      <InsightTile
        title="Bookings"
        items={[
          { count: 802, label: 'Hard Reservations' },
          { count: 802, label: 'Soft Reservations' },
        ]}
      />
      <InsightTile
        title="Rejected Bookings"
        items={[
          { count: 802, label: 'Last 24 hours' },
          { count: 802, label: 'Last 7 days' },
        ]}
      />
    </div>
  ),
}

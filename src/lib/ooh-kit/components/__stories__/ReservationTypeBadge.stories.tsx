import type { Meta, StoryObj } from '@storybook/react'
import ReservationTypeBadge from '../ReservationTypeBadge'

const meta: Meta<typeof ReservationTypeBadge> = {
  title: 'OOH Kit/ReservationTypeBadge',
  component: ReservationTypeBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Colored badge for the parcel reservation type. The Hard Reservation variant uses the primary tone; Soft Reservation uses the neutral default.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ReservationTypeBadge>

export const Hard: Story = {
  args: { type: 'Hard Reservation' },
}

export const Soft: Story = {
  args: { type: 'Soft Reservation' },
}

export const SideBySide: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ReservationTypeBadge type="Hard Reservation" />
      <ReservationTypeBadge type="Soft Reservation" />
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import CompartmentAvailabilityBadge from '../CompartmentAvailabilityBadge'

const meta: Meta<typeof CompartmentAvailabilityBadge> = {
  title: 'OOH Kit/CompartmentAvailabilityBadge',
  component: CompartmentAvailabilityBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Outlined pill with a pie chart icon and an availability percentage. Used in the Locker Overview table to summarize compartment capacity per locker.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof CompartmentAvailabilityBadge>

export const Default: Story = {
  args: { percent: 43 },
}

export const Range: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <CompartmentAvailabilityBadge percent={0} />
      <CompartmentAvailabilityBadge percent={22} />
      <CompartmentAvailabilityBadge percent={50} />
      <CompartmentAvailabilityBadge percent={84} />
      <CompartmentAvailabilityBadge percent={100} />
    </div>
  ),
}

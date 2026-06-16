import type { Meta, StoryObj } from '@storybook/react'
import CompartmentBadge from '../CompartmentBadge'

const meta: Meta<typeof CompartmentBadge> = {
  title: 'OOH Kit/CompartmentBadge',
  component: CompartmentBadge,
  tags: ['autodocs'],
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Percentage of compartments available',
    },
  },
}

export default meta
type Story = StoryObj<typeof CompartmentBadge>

export const Default: Story = {
  args: { percentage: 43 },
}

export const Empty: Story = {
  args: { percentage: 0 },
}

export const Full: Story = {
  args: { percentage: 100 },
}

export const AllVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[0, 4, 20, 43, 84, 100].map((p) => (
        <CompartmentBadge key={p} percentage={p} />
      ))}
    </div>
  ),
}

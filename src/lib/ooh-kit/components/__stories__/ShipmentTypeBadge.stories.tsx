import type { Meta, StoryObj } from '@storybook/react'
import ShipmentTypeBadge from '../ShipmentTypeBadge'

const meta: Meta<typeof ShipmentTypeBadge> = {
  title: 'OOH Kit/ShipmentTypeBadge',
  component: ShipmentTypeBadge,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['First Mile', 'Last Mile', 'Alternative Delivery', 'Return'],
      description: 'Shipment type determining the badge icon and label',
    },
  },
}

export default meta
type Story = StoryObj<typeof ShipmentTypeBadge>

export const FirstMile: Story = {
  args: { type: 'First Mile' },
}

export const LastMile: Story = {
  args: { type: 'Last Mile' },
}

export const AlternativeDelivery: Story = {
  args: { type: 'Alternative Delivery' },
}

export const Return: Story = {
  args: { type: 'Return' },
}

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ShipmentTypeBadge type="First Mile" />
      <ShipmentTypeBadge type="Last Mile" />
      <ShipmentTypeBadge type="Alternative Delivery" />
      <ShipmentTypeBadge type="Return" />
    </div>
  ),
}

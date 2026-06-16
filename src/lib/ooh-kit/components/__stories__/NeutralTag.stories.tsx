import type { Meta, StoryObj } from '@storybook/react'
import NeutralTag from '../NeutralTag'

const meta: Meta<typeof NeutralTag> = {
  title: 'OOH Kit/NeutralTag',
  component: NeutralTag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Outlined neutral pill that mirrors the ShipmentTypeBadge style without the icon. Used in the Parcel Overview table for Reservation, Compartment, and Size cells.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof NeutralTag>

export const Default: Story = {
  args: { label: 'M' },
}

export const CompartmentSize: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <NeutralTag label="S" />
      <NeutralTag label="M" />
      <NeutralTag label="L" />
      <NeutralTag label="XL" />
    </div>
  ),
}

export const Reservation: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <NeutralTag label="Hard Reservation" />
      <NeutralTag label="Soft Reservation" />
    </div>
  ),
}

export const Compartment: Story = {
  args: { label: 'C-007' },
}

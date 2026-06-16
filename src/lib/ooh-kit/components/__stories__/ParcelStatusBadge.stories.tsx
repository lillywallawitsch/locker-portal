import type { Meta, StoryObj } from '@storybook/react'
import ParcelStatusBadge from '../ParcelStatusBadge'

const meta: Meta<typeof ParcelStatusBadge> = {
  title: 'OOH Kit/ParcelStatusBadge',
  component: ParcelStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'Ready for Pickup',
        'Expected',
        'Expired',
        'Consignee Collected',
        'Courier Collected',
        'Booking Cancelled',
        'Booking Rejected',
      ],
      description: 'Parcel status determining the badge color and icon',
    },
    since: {
      control: 'text',
      description:
        'Optional timestamp (ISO or pre-formatted). Shown in a hover tooltip as `<status> since <date>`.',
    },
  },
}

export default meta
type Story = StoryObj<typeof ParcelStatusBadge>

export const ReadyForPickup: Story = {
  args: { status: 'Ready for Pickup' },
}

export const WithSinceTooltip: Story = {
  args: { status: 'Ready for Pickup', since: 'Today, 08:00' },
}

export const Expected: Story = {
  args: { status: 'Expected' },
}

export const Expired: Story = {
  args: { status: 'Expired' },
}

export const ConsigneeCollected: Story = {
  args: { status: 'Consignee Collected' },
}

export const CourierCollected: Story = {
  args: { status: 'Courier Collected' },
}

export const BookingCancelled: Story = {
  args: { status: 'Booking Cancelled' },
}

export const BookingRejected: Story = {
  args: { status: 'Booking Rejected' },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ParcelStatusBadge status="Ready for Pickup" />
      <ParcelStatusBadge status="Expected" />
      <ParcelStatusBadge status="Expired" />
      <ParcelStatusBadge status="Consignee Collected" />
      <ParcelStatusBadge status="Courier Collected" />
      <ParcelStatusBadge status="Booking Cancelled" />
      <ParcelStatusBadge status="Booking Rejected" />
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import StatusBadge from '../StatusBadge'

const meta: Meta<typeof StatusBadge> = {
  title: 'OOH Kit/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'active',
        'inactive',
        'maintenance',
        'decommissioned',
        'available',
        'occupied',
        'reserved',
        'defective',
      ],
      description: 'Visual status variant',
    },
    label: {
      control: 'text',
      description: 'Override the default label text',
    },
    since: {
      control: 'text',
      description:
        'Optional ISO timestamp (or pre-formatted string). Shown in a hover tooltip as `<label> since <date>`.',
    },
  },
}

export default meta
type Story = StoryObj<typeof StatusBadge>

export const Active: Story = {
  args: { status: 'active' },
}

export const Inactive: Story = {
  args: { status: 'inactive' },
}

export const Maintenance: Story = {
  args: { status: 'maintenance' },
}

export const Decommissioned: Story = {
  args: { status: 'decommissioned' },
}

export const CustomLabel: Story = {
  args: { status: 'active', label: 'Online' },
}

export const WithSinceTooltip: Story = {
  args: { status: 'inactive', since: '2026-04-22T14:35:00Z' },
}

export const LockerStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
      <StatusBadge status="maintenance" />
      <StatusBadge status="decommissioned" />
    </div>
  ),
}

export const CompartmentStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <StatusBadge status="available" />
      <StatusBadge status="occupied" />
      <StatusBadge status="reserved" />
      <StatusBadge status="defective" />
    </div>
  ),
}

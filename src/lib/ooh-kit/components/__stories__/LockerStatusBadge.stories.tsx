import type { Meta, StoryObj } from '@storybook/react'
import LockerStatusBadge from '../LockerStatusBadge'

const meta: Meta<typeof LockerStatusBadge> = {
  title: 'OOH Kit/LockerStatusBadge',
  component: LockerStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'maintenance', 'decommissioned'],
    },
    since: { control: 'text' },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof LockerStatusBadge>

export const Active: Story = {
  args: { status: 'active', since: '2024-08-15' },
}

export const Inactive: Story = {
  args: { status: 'inactive', since: '2026-04-22' },
}

export const Maintenance: Story = {
  args: { status: 'maintenance', since: '2026-04-12' },
}

export const Decommissioned: Story = {
  args: { status: 'decommissioned', since: '2025-11-03' },
}

export const NoSinceDate: Story = {
  args: { status: 'inactive' },
}

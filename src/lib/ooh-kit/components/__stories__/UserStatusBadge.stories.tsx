import type { Meta, StoryObj } from '@storybook/react'
import UserStatusBadge from '../UserStatusBadge'

const meta: Meta<typeof UserStatusBadge> = {
  title: 'OOH Kit/UserStatusBadge',
  component: UserStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['Active', 'Blocked', 'Invitation Pending', 'Invitation Expired'],
      description: 'User status determining the badge color and icon',
    },
    since: {
      control: 'text',
      description:
        'Optional ISO timestamp. Shown in a hover tooltip as `<status> since <date>`.',
    },
  },
}

export default meta
type Story = StoryObj<typeof UserStatusBadge>

export const Active: Story = {
  args: { status: 'Active' },
}

export const Blocked: Story = {
  args: { status: 'Blocked' },
}

export const InvitationPending: Story = {
  args: { status: 'Invitation Pending' },
}

export const InvitationExpired: Story = {
  args: { status: 'Invitation Expired' },
}

export const WithSinceTooltip: Story = {
  args: { status: 'Invitation Pending', since: '2026-04-22T09:00:00Z' },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <UserStatusBadge status="Active" />
      <UserStatusBadge status="Blocked" />
      <UserStatusBadge status="Invitation Pending" />
      <UserStatusBadge status="Invitation Expired" />
    </div>
  ),
}

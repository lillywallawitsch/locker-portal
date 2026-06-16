import type { Meta, StoryObj } from '@storybook/react'
import Avatar from '../Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'OOH Kit/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['locker', 'parcel', 'user-initials', 'user-profile'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    status: {
      control: 'select',
      options: ['active', 'maintenance', 'inactive', 'decommissioned'],
    },
    initials: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const LockerActive: Story = {
  args: { type: 'locker', status: 'active' },
}

export const LockerMaintenance: Story = {
  args: { type: 'locker', status: 'maintenance' },
}

export const LockerInactive: Story = {
  args: { type: 'locker', status: 'inactive' },
}

export const LockerDecommissioned: Story = {
  args: { type: 'locker', status: 'decommissioned' },
}

export const LockerSmall: Story = {
  args: { type: 'locker', size: 'sm', status: 'active' },
}

export const Parcel: Story = {
  args: { type: 'parcel' },
}

export const UserInitials: Story = {
  args: { type: 'user-initials', initials: 'MH' },
}

export const UserProfile: Story = {
  args: { type: 'user-profile' },
}

export const AllTypes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar type="locker" status="active" />
      <Avatar type="locker" status="maintenance" />
      <Avatar type="locker" status="inactive" />
      <Avatar type="parcel" />
      <Avatar type="user-initials" initials="MH" />
      <Avatar type="user-profile" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar type="locker" size="sm" status="active" />
      <Avatar type="locker" size="md" status="active" />
    </div>
  ),
}

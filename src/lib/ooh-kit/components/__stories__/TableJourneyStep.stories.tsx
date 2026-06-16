import type { Meta, StoryObj } from '@storybook/react'
import TableJourneyStep from '../TableJourneyStep'

const meta: Meta<typeof TableJourneyStep> = {
  title: 'OOH Kit/TableJourneyStep',
  component: TableJourneyStep,
  tags: ['autodocs'],
  argTypes: {
    step: {
      control: 'select',
      options: ['Success', 'Warning', 'Pending', 'Right Now', 'Delivered', 'Error', 'Expired'],
      description: 'Visual variant of the journey step indicator',
    },
    showConnectionLine: {
      control: 'boolean',
      description: 'Whether to show the vertical connection line above the dot (hidden for the first item in a list)',
    },
  },
  decorators: [
    (Story) => (
      <div className="pt-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TableJourneyStep>

export const Success: Story = {
  args: { step: 'Success', showConnectionLine: false },
}

export const Warning: Story = {
  args: { step: 'Warning', showConnectionLine: false },
}

export const Pending: Story = {
  args: { step: 'Pending', showConnectionLine: false },
}

export const RightNow: Story = {
  args: { step: 'Right Now', showConnectionLine: false },
}

export const Delivered: Story = {
  args: { step: 'Delivered', showConnectionLine: false },
}

export const Error: Story = {
  args: { step: 'Error', showConnectionLine: false },
}

export const Expired: Story = {
  args: { step: 'Expired', showConnectionLine: false },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6 pt-8">
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Success" showConnectionLine={false} />
        <span className="text-xs text-text-light">Success</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Warning" showConnectionLine={false} />
        <span className="text-xs text-text-light">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Pending" showConnectionLine={false} />
        <span className="text-xs text-text-light">Pending</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Right Now" showConnectionLine={false} />
        <span className="text-xs text-text-light">Right Now</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Delivered" showConnectionLine={false} />
        <span className="text-xs text-text-light">Delivered</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Error" showConnectionLine={false} />
        <span className="text-xs text-text-light">Error</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TableJourneyStep step="Expired" showConnectionLine={false} />
        <span className="text-xs text-text-light">Expired</span>
      </div>
    </div>
  ),
}

export const WithConnectionLine: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-0 pl-4">
      <div className="flex items-center gap-3 h-[54px]">
        <TableJourneyStep step="Delivered" showConnectionLine={false} />
        <span className="text-sm text-text-foreground">Parcel collected by Consignee</span>
      </div>
      <div className="flex items-center gap-3 h-[54px]">
        <TableJourneyStep step="Success" showConnectionLine={true} />
        <span className="text-sm text-text-foreground">Parcel Delivered to Locker by Courier</span>
      </div>
      <div className="flex items-center gap-3 h-[54px]">
        <TableJourneyStep step="Success" showConnectionLine={true} />
        <span className="text-sm text-text-foreground">Parcel Collected by Courier</span>
      </div>
      <div className="flex items-center gap-3 h-[54px]">
        <TableJourneyStep step="Pending" showConnectionLine={true} />
        <span className="text-sm text-text-foreground">Booking Created by Sender</span>
      </div>
    </div>
  ),
}

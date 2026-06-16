import type { Meta, StoryObj } from '@storybook/react'
import NavBreadcrumb from '../NavBreadcrumb'

const meta: Meta<typeof NavBreadcrumb> = {
  title: 'OOH Kit/NavBreadcrumb',
  component: NavBreadcrumb,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof NavBreadcrumb>

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Locker Overview' }],
  },
}

export const MultipleItems: Story = {
  args: {
    items: [
      { label: 'Locker Overview' },
      { label: 'PaketStation #98765' },
    ],
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import Dialog from '../Dialog'
import Button from '../Button'

const meta: Meta<typeof Dialog> = {
  title: 'Unity/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  args: {
    title: 'Do you have an Account?',
    children: (
      <div>
        <p className="mb-4">
          Ullamco commodo nulla minim commodo nostrud consequat mollit Lorem labore nostrud sunt.
        </p>
        <p>You can change your content later.</p>
      </div>
    ),
    onClose: () => {},
    footer: (
      <>
        <Button variant="secondary" className="flex-1">Cancel</Button>
        <Button variant="primary" className="flex-1">Sign up</Button>
      </>
    ),
  },
}

export const WithoutFooter: Story = {
  args: {
    title: 'Information',
    children: <p>This is a simple informational dialog without actions.</p>,
    onClose: () => {},
  },
}

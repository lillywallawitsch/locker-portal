import type { Meta, StoryObj } from '@storybook/react'
import Tooltip from '../Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Unity/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Top: Story = {
  args: {
    content: 'Erleichtert die Wiederverwendung von Adressen',
    position: 'top',
  },
}

export const Bottom: Story = {
  args: {
    content: 'This is a tooltip below',
    position: 'bottom',
  },
}

export const WithChild: Story = {
  render: () => (
    <div className="pt-16">
      <Tooltip content="Save your address for later" position="top">
        <button className="px-4 py-2 bg-surface-primary text-text-button rounded-lg">
          Hover me
        </button>
      </Tooltip>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import CopyButton from '../CopyButton'

const meta: Meta<typeof CopyButton> = {
  title: 'Unity/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Square icon button that copies a value to the clipboard. Briefly swaps to a check icon for ~1.5s after a successful copy. Click events are stopped from propagating, so the button can be embedded inside a clickable row without triggering the row handler.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof CopyButton>

export const Default: Story = {
  args: { value: 'L-001' },
}

export const WithCustomAriaLabel: Story = {
  args: { value: 'PKG-12345', ariaLabel: 'Copy parcel ID' },
}

export const RevealOnHover: Story = {
  render: () => (
    <div className="group flex items-center gap-2 px-3 py-2 border border-border-default rounded-md w-fit cursor-pointer">
      <span className="text-sm text-text-foreground font-medium">L-001 — Berlin Mitte</span>
      <CopyButton
        value="L-001"
        ariaLabel="Copy locker ID"
        className="opacity-0 group-hover:opacity-100"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Pattern used in the Locker and Parcel overview tables: the copy button is hidden until the parent (a row or inline container) is hovered.',
      },
    },
  },
}

export const InlineNextToText: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-text-foreground font-medium">Berlin Mitte Hbf</span>
        <CopyButton value="Berlin Mitte Hbf" ariaLabel="Copy locker name" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-light">ID: L-001</span>
        <CopyButton value="L-001" ariaLabel="Copy locker ID" />
      </div>
    </div>
  ),
}

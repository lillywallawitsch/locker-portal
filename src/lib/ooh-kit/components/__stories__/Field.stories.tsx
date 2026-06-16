import type { Meta, StoryObj } from '@storybook/react'
import { ChevronRight } from 'lucide-react'
import Field from '../Field'
import { CopyButton } from '../../../unity'

const meta: Meta<typeof Field> = {
  title: 'OOH Kit/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Stacked label-above-value display field used inside `Card`. The optional `trailing` slot is centred on the value row — typically a `CopyButton` (for IDs) or a chevron-right (for navigation).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[253px] p-4 bg-surface-card border border-border-default rounded-[10px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Field>

export const Basic: Story = {
  render: () => <Field label="Depot">DE 400</Field>,
}

export const TwoLineValue: Story = {
  render: () => (
    <Field label="Address">
      <div className="flex flex-col">
        <span>Lindenstraße 12</span>
        <span className="text-text-light font-normal">10115 Berlin</span>
      </div>
    </Field>
  ),
}

export const WithCopyTrailing: Story = {
  render: () => (
    <Field
      label="Carrier Locker ID"
      trailing={<CopyButton value="2760935404" ariaLabel="Copy locker ID" />}
    >
      2760935404
    </Field>
  ),
}

export const WithChevronTrailing: Story = {
  render: () => (
    <Field
      label="Compartment"
      trailing={
        <button
          type="button"
          aria-label="Open compartment"
          className="flex items-center justify-center w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer hover:bg-surface-secondary"
        >
          <ChevronRight size={16} className="text-text-foreground" />
        </button>
      }
    >
      C-12 (M)
    </Field>
  ),
}

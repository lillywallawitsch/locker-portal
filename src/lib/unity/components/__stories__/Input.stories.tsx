import type { Meta, StoryObj } from '@storybook/react'
import Input from '../Input'

const meta: Meta<typeof Input> = {
  title: 'Unity/Input',
  component: Input,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Credit Card Number',
    placeholder: '0000 0000 0000 0000',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    defaultValue: 'invalid-email',
    error: 'Please enter a valid email address',
  },
}

export const SizeDefault: Story = {
  name: 'Size / Default (54px)',
  args: {
    label: 'Label',
    defaultValue: 'Content',
    inputSize: 'lg',
  },
}

export const SizeSmall: Story = {
  name: 'Size / Small (48px)',
  args: {
    label: 'Label',
    defaultValue: 'Content',
    inputSize: 'md',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Default (54px)" defaultValue="Content" inputSize="lg" />
      <Input label="Small (48px)" defaultValue="Content" inputSize="md" />
    </div>
  ),
}

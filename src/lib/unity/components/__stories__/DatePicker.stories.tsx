import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DatePicker from '../DatePicker'

const meta: Meta<typeof DatePicker> = {
  title: 'Unity/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[460px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  args: {
    label: 'Activation Date',
    placeholder: 'Select date',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Activation Date',
    value: '2026-03-23',
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('2026-03-23')
    return (
      <DatePicker
        inputSize="md"
        label="Activation Date"
        value={value}
        onChange={setValue}
      />
    )
  },
}

export const SizeDefault: Story = {
  name: 'Size / Default (54px)',
  args: {
    label: 'Activation Date',
    value: '2026-03-23',
    inputSize: 'lg',
  },
}

export const SizeSmall: Story = {
  name: 'Size / Small (48px)',
  args: {
    label: 'Activation Date',
    value: '2026-03-23',
    inputSize: 'md',
  },
}

export const ReadOnly: Story = {
  args: {
    label: 'Activation Date',
    value: '2026-03-23',
    readOnly: true,
  },
}

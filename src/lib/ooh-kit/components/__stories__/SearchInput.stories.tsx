import type { Meta, StoryObj } from '@storybook/react'
import SearchInput from '../SearchInput'

const meta: Meta<typeof SearchInput> = {
  title: 'OOH Kit/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder text' },
  },
}

export default meta
type Story = StoryObj<typeof SearchInput>

export const Default: Story = {
  args: { placeholder: 'Search for Lockers' },
}

export const CustomPlaceholder: Story = {
  args: { placeholder: 'Search parcels...' },
}

export const WithInfoTooltip: Story = {
  args: {
    placeholder: 'Search for Lockers',
    infoTooltip: 'Search by locker name, ID, address, depot, region, or agency.',
  },
}

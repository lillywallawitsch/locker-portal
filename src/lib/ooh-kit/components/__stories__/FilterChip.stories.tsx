import type { Meta, StoryObj } from '@storybook/react'
import FilterChip from '../FilterChip'

const meta: Meta<typeof FilterChip> = {
  title: 'OOH Kit/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    active: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof FilterChip>

export const Default: Story = {
  args: { label: 'Expired parcels' },
}

export const Active: Story = {
  args: { label: 'Berlin depots', active: true },
}

export const Removable: Story = {
  args: { label: 'My saved filter', onRemove: () => {} },
}

export const ActiveRemovable: Story = {
  args: { label: 'Inactive lockers', active: true, onRemove: () => {} },
}

export const SavedFilterRow: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterChip label="Expired parcels" active onRemove={() => {}} />
      <FilterChip label="Berlin depots" onRemove={() => {}} />
      <FilterChip label="Maintenance + Inactive" onRemove={() => {}} />
    </div>
  ),
}

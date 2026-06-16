import type { Meta, StoryObj } from '@storybook/react'
import FilterButton from '../FilterButton'

const meta: Meta<typeof FilterButton> = {
  title: 'OOH Kit/FilterButton',
  component: FilterButton,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Button label' },
  },
}

export default meta
type Story = StoryObj<typeof FilterButton>

export const Default: Story = {
  args: { label: 'Depot & Partners' },
}

export const FilterBar: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <FilterButton label="Depot & Partners" />
      <FilterButton label="Carrier Status" />
      <FilterButton label="Provider Status" />
      <FilterButton label="Provider" />
    </div>
  ),
}

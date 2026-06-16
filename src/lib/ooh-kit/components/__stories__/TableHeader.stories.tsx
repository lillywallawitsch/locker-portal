import type { Meta, StoryObj } from '@storybook/react'
import TableHeader from '../TableHeader'

const meta: Meta<typeof TableHeader> = {
  title: 'OOH Kit/TableHeader',
  component: TableHeader,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    sortable: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <table className="border-collapse">
        <thead>
          <tr>
            <Story />
          </tr>
        </thead>
      </table>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TableHeader>

export const Default: Story = {
  args: { label: 'Locker Name', sortable: true },
}

export const NonSortable: Story = {
  args: { label: 'Actions', sortable: false },
}

export const MultipleHeaders: Story = {
  render: () => (
    <>
      <TableHeader label="Locker Name" width="w-[248px]" />
      <TableHeader label="Address" width="w-[235px]" />
      <TableHeader label="Depot & Partners" width="w-[159px]" />
      <TableHeader label="Carrier Status" width="w-[135px]" />
      <TableHeader label="Provider Status" width="w-[146px]" />
      <TableHeader label="Compartments" width="w-[164px]" />
      <TableHeader label="Provider" width="w-[102px]" />
    </>
  ),
}

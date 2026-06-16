import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import ColumnsPopover, { type ColumnDef, type ColumnState } from '../ColumnsPopover'

const meta: Meta<typeof ColumnsPopover> = {
  title: 'OOH Kit/ColumnsPopover',
  component: ColumnsPopover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dropdown for customising which columns are visible in a table and the order they appear in. Pinned columns (like Locker Name / Parcel ID) cannot be hidden or moved. Other columns can be drag-reordered and toggled.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 min-h-[480px] flex justify-end">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ColumnsPopover>

const COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Lockers', pinned: true },
  { key: 'address', label: 'Address' },
  { key: 'depotRegion', label: 'Depot & Regions' },
  { key: 'agency', label: 'Agency' },
  { key: 'status', label: 'Status' },
  { key: 'provider', label: 'Provider' },
  { key: 'venueType', label: 'Venue type' },
]

const DEFAULT_STATE: ColumnState[] = [
  { key: 'name', visible: true },
  { key: 'address', visible: true },
  { key: 'depotRegion', visible: true },
  { key: 'status', visible: true },
  { key: 'provider', visible: true },
  { key: 'agency', visible: false },
  { key: 'venueType', visible: false },
]

export const Default: Story = {
  render: () => {
    const [state, setState] = useState(DEFAULT_STATE)
    return (
      <ColumnsPopover
        columns={COLUMNS}
        state={state}
        onChange={setState}
        onReset={() => setState(DEFAULT_STATE)}
      />
    )
  },
}

export const AllVisible: Story = {
  render: () => {
    const allVisible = COLUMNS.map((c) => ({ key: c.key, visible: true }))
    const [state, setState] = useState<ColumnState[]>(allVisible)
    return (
      <ColumnsPopover
        columns={COLUMNS}
        state={state}
        onChange={setState}
        onReset={() => setState(allVisible)}
      />
    )
  },
}

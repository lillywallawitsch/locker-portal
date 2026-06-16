import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Activity, Building2, Home, MapPin, Package, UserCheck } from 'lucide-react'
import AdvancedFilterPopover, { type AdvancedFilterGroup } from '../AdvancedFilterPopover'

const meta: Meta<typeof AdvancedFilterPopover> = {
  title: 'OOH Kit/AdvancedFilterPopover',
  component: AdvancedFilterPopover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The "More filters" popover used on the Locker and Parcel overview pages. Hosts a sidebar of filter groups and a searchable checkbox list. Options can include an optional `subtitle` line for two-line entries (e.g. Assigned Locker shows name + ID).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 min-h-[600px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AdvancedFilterPopover>

type ParcelFilterState = {
  assignedLockers: string[]
  addresses: string[]
  shipmentTypes: string[]
  statuses: string[]
  readyToPickup: string[]
}

const EMPTY: ParcelFilterState = {
  assignedLockers: [],
  addresses: [],
  shipmentTypes: [],
  statuses: [],
  readyToPickup: [],
}

const ASSIGNED_LOCKER_OPTIONS = [
  { value: 'L-001', label: 'Berlin Mitte Hbf', subtitle: 'ID: L-001' },
  { value: 'L-002', label: 'Charlottenburg Nord', subtitle: 'ID: L-002' },
  { value: 'L-003', label: 'Friedrichshain Süd', subtitle: 'ID: L-003' },
  { value: 'L-004', label: 'Kreuzberg West', subtitle: 'ID: L-004' },
]

const ADDRESS_OPTIONS = [
  { value: 'Bahnhofstr. 1|Berlin', label: 'Bahnhofstr. 1', subtitle: 'Berlin' },
  { value: 'Hauptstr. 22|Berlin', label: 'Hauptstr. 22', subtitle: 'Berlin' },
  { value: 'Marktplatz 5|München', label: 'Marktplatz 5', subtitle: 'München' },
]

const SHIPMENT_TYPE_OPTIONS = [
  { value: 'First Mile', label: 'First Mile' },
  { value: 'Last Mile', label: 'Last Mile' },
  { value: 'Alternative Delivery', label: 'Alt. Delivery' },
  { value: 'Return', label: 'Return' },
]

const STATUS_OPTIONS = [
  { value: 'Ready for Pickup', label: 'In Locker' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Expected', label: 'Expected' },
  { value: 'Consignee Collected', label: 'Consignee Collected' },
]

const READY_OPTIONS = [
  { value: 'consignee', label: 'Ready for Consignee' },
  { value: 'driver', label: 'Ready for Driver' },
]

export const ParcelOverviewFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<ParcelFilterState>(EMPTY)

    const update = (patch: Partial<ParcelFilterState>) =>
      setFilters((prev) => ({ ...prev, ...patch }))

    const groups: AdvancedFilterGroup[] = [
      {
        key: 'assigned-locker',
        label: 'Assigned Locker',
        icon: <MapPin size={16} />,
        options: ASSIGNED_LOCKER_OPTIONS,
        selected: filters.assignedLockers,
        onChange: (next) => update({ assignedLockers: next }),
      },
      {
        key: 'address',
        label: 'Locker Address',
        icon: <Home size={16} />,
        options: ADDRESS_OPTIONS,
        selected: filters.addresses,
        onChange: (next) => update({ addresses: next }),
      },
      {
        key: 'shipment-type',
        label: 'Shipment Type',
        icon: <Package size={16} />,
        options: SHIPMENT_TYPE_OPTIONS,
        selected: filters.shipmentTypes,
        onChange: (next) => update({ shipmentTypes: next }),
      },
      {
        key: 'status',
        label: 'Status',
        icon: <Activity size={16} />,
        options: STATUS_OPTIONS,
        selected: filters.statuses,
        onChange: (next) => update({ statuses: next }),
      },
      {
        key: 'ready-to-pickup',
        label: 'Ready to pick up',
        icon: <UserCheck size={16} />,
        options: READY_OPTIONS,
        selected: filters.readyToPickup,
        onChange: (next) => update({ readyToPickup: next }),
      },
    ]

    const activeCount =
      filters.assignedLockers.length +
      filters.addresses.length +
      filters.shipmentTypes.length +
      filters.statuses.length +
      filters.readyToPickup.length

    return (
      <AdvancedFilterPopover
        groups={groups}
        activeCount={activeCount}
        onResetAll={() => setFilters(EMPTY)}
        onSave={() => console.log('Saved')}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mirrors the parcel overview configuration. Assigned Locker and Locker Address use the optional `subtitle` field to render two-line options.',
      },
    },
  },
}

export const SimpleSingleGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return (
      <AdvancedFilterPopover
        groups={[
          {
            key: 'depot',
            label: 'Depot',
            icon: <Building2 size={16} />,
            options: [
              { value: 'berlin', label: 'Berlin' },
              { value: 'munich', label: 'Munich' },
              { value: 'hamburg', label: 'Hamburg' },
            ],
            selected,
            onChange: setSelected,
          },
        ]}
        activeCount={selected.length}
        onResetAll={() => setSelected([])}
        onSave={() => {}}
      />
    )
  },
}

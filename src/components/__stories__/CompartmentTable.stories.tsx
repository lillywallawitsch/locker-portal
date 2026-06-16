import type { Meta, StoryObj } from '@storybook/react'
import CompartmentTable from '../CompartmentTable'
import type { Compartment, CompartmentSize, CompartmentStatus } from '../../data/lockers'

const sizes: CompartmentSize[] = ['S', 'M', 'L', 'XL']

function makeCompartments(
  count: number,
  statuses: CompartmentStatus[],
): Compartment[] {
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length]
    return {
      id: `C-${String(i + 1).padStart(3, '0')}`,
      size: sizes[i % sizes.length],
      status,
      parcelId:
        status === 'occupied' || status === 'reserved'
          ? `PKG90010${i}`
          : undefined,
    }
  })
}

const meta: Meta<typeof CompartmentTable> = {
  title: 'OOH Kit/CompartmentTable',
  component: CompartmentTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Paginated list of compartments in a locker. The "Assigned parcel" column is rendered only when the filtered set contains at least one occupied or reserved compartment, so the column does not flicker as the user paginates.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof CompartmentTable>

export const MixedStatuses: Story = {
  args: {
    compartments: makeCompartments(15, ['available', 'occupied', 'reserved', 'defective']),
    onCompartmentClick: () => {},
  },
}

export const AvailableOnly: Story = {
  args: {
    compartments: makeCompartments(8, ['available']),
    onCompartmentClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'When no compartment in the set has an assigned parcel, the "Assigned parcel" column is hidden entirely.',
      },
    },
  },
}

export const Paginated: Story = {
  args: {
    compartments: makeCompartments(45, ['available', 'occupied', 'reserved', 'defective']),
    onCompartmentClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'With more than 10 compartments the pagination control renders below the table.',
      },
    },
  },
}

export const Empty: Story = {
  args: {
    compartments: [],
    onCompartmentClick: () => {},
  },
}

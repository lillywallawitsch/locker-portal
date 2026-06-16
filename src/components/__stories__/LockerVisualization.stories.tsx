import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import LockerVisualization from '../LockerVisualization'
import type { Compartment, CompartmentSize, CompartmentStatus } from '../../data/lockers'

const sizes: CompartmentSize[] = ['S', 'M', 'L', 'XL']

function makeCompartments(count: number): Compartment[] {
  const statusOrder: CompartmentStatus[] = ['available', 'occupied', 'reserved', 'defective']
  return Array.from({ length: count }, (_, i) => ({
    id: `C-${String(i + 1).padStart(3, '0')}`,
    size: sizes[i % sizes.length],
    status: statusOrder[Math.floor(i / Math.max(1, Math.ceil(count / statusOrder.length))) % statusOrder.length],
    parcelId: i % 3 === 0 ? `PKG90010${i}` : undefined,
  }))
}

const meta: Meta<typeof LockerVisualization> = {
  title: 'OOH Kit/LockerVisualization',
  component: LockerVisualization,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Physical-layout view of a locker. Compartments are split into 5 columns, sized proportionally by `S/M/L/XL`, with a screen overlay in the middle column. Click a compartment to drill into its history. Pass `matchedIds` to dim compartments that fall outside the active filter while keeping the layout intact.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LockerVisualization>

export const Default: Story = {
  args: {
    compartments: makeCompartments(25),
  },
}

export const Large: Story = {
  args: {
    compartments: makeCompartments(40),
  },
}

export const Interactive: Story = {
  render: () => {
    const compartments = makeCompartments(30)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    return (
      <div className="flex flex-col gap-3">
        <LockerVisualization
          compartments={compartments}
          onCompartmentClick={(c) => setSelectedId(c.id)}
        />
        <span className="text-sm text-text-light">
          {selectedId ? `Selected: ${selectedId}` : 'Click a compartment to select it'}
        </span>
      </div>
    )
  },
}

export const WithFilterDimming: Story = {
  render: () => {
    const compartments = makeCompartments(30)
    const matchedIds = new Set(
      compartments.filter((c) => c.status === 'available').map((c) => c.id),
    )
    return (
      <LockerVisualization
        compartments={compartments}
        matchedIds={matchedIds}
        onCompartmentClick={() => {}}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `matchedIds` is provided, compartments not in the set render at 25% opacity. The full physical layout still renders so the user can see where the matches sit within the locker.',
      },
    },
  },
}

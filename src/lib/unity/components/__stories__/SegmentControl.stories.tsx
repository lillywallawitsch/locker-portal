import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import SegmentControl from '../SegmentControl'

const meta: Meta<typeof SegmentControl> = {
  title: 'Unity/SegmentControl',
  component: SegmentControl,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SegmentControl>

export const Default: Story = {
  args: {
    items: [
      { key: 'in-locker', label: 'Ready for Pickup', value: '70' },
      { key: 'expected', label: 'Expected', value: '5' },
      { key: 'collected', label: 'Collected', value: '200' },
      { key: 'rejected', label: 'Rejected', value: '80' },
      { key: 'cancelled', label: 'Cancelled', value: '90' },
    ],
    activeKey: 'in-locker',
  },
}

export const WithoutCounts: Story = {
  args: {
    items: [
      { key: 'a', label: 'Option A' },
      { key: 'b', label: 'Option B' },
      { key: 'c', label: 'Option C' },
    ],
    activeKey: 'a',
  },
}

export const Controlled: Story = {
  render: () => {
    const [active, setActive] = useState('in-locker')
    return (
      <SegmentControl
        items={[
          { key: 'in-locker', label: 'Ready for Pickup', value: '70' },
          { key: 'expected', label: 'Expected', value: '5' },
          { key: 'collected', label: 'Collected', value: '200' },
        ]}
        activeKey={active}
        onChange={setActive}
      />
    )
  },
}

// Icon-only segments (no `label`) used for view toggles. Each item must supply
// `ariaLabel` so the button still has an accessible name and a tooltip.
export const IconOnly: Story = {
  render: () => {
    const [active, setActive] = useState('grid')
    return (
      <div className="w-[120px]">
        <SegmentControl
          items={[
            { key: 'grid', icon: <LayoutGrid size={16} />, ariaLabel: 'Grid view' },
            { key: 'list', icon: <List size={16} />, ariaLabel: 'List view' },
          ]}
          activeKey={active}
          onChange={setActive}
        />
      </div>
    )
  },
}

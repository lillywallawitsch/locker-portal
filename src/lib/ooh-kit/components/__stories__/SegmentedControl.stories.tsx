import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { LayoutGrid, List, Map } from 'lucide-react'
import SegmentedControl from '../SegmentedControl'

const meta: Meta<typeof SegmentedControl> = {
  title: 'OOH Kit/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SegmentedControl>

export const GridList: Story = {
  render: () => {
    const [active, setActive] = useState('list')
    return (
      <SegmentedControl
        items={[
          { key: 'grid', label: 'Grid view', icon: <LayoutGrid size={20} /> },
          { key: 'list', label: 'List view', icon: <List size={20} /> },
        ]}
        activeKey={active}
        onChange={setActive}
      />
    )
  },
}

export const ThreeOptions: Story = {
  render: () => {
    const [active, setActive] = useState('list')
    return (
      <SegmentedControl
        items={[
          { key: 'grid', label: 'Grid view', icon: <LayoutGrid size={20} /> },
          { key: 'list', label: 'List view', icon: <List size={20} /> },
          { key: 'map', label: 'Map view', icon: <Map size={20} /> },
        ]}
        activeKey={active}
        onChange={setActive}
      />
    )
  },
}

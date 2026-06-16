import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CreditCard, Truck } from 'lucide-react'
import SelectTile from '../SelectTile'

const meta: Meta<typeof SelectTile> = {
  title: 'Unity/SelectTile',
  component: SelectTile,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SelectTile>

export const Default: Story = {
  args: {
    title: 'Mastercard •••• 6083',
    subtitle: 'Andrea Heuser',
    selected: true,
  },
}

export const Unselected: Story = {
  args: {
    title: 'Visa •••• 4242',
    subtitle: 'Max Hoffmann',
    selected: false,
  },
}

export const WithIcon: Story = {
  args: {
    title: 'Express Delivery',
    subtitle: '1-2 business days',
    icon: <Truck size={20} />,
    selected: true,
  },
}

export const SelectionGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('mc')
    return (
      <div className="flex flex-col gap-2">
        <SelectTile
          title="Mastercard •••• 6083"
          subtitle="Andrea Heuser"
          icon={<CreditCard size={20} />}
          selected={selected === 'mc'}
          onClick={() => setSelected('mc')}
        />
        <SelectTile
          title="Visa •••• 4242"
          subtitle="Max Hoffmann"
          icon={<CreditCard size={20} />}
          selected={selected === 'visa'}
          onClick={() => setSelected('visa')}
        />
        <SelectTile
          title="PayPal"
          subtitle="m.hoffmann@gls.com"
          selected={selected === 'pp'}
          onClick={() => setSelected('pp')}
        />
      </div>
    )
  },
}

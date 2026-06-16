import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import Toggle from '../Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Unity/Toggle',
  component: Toggle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Off: Story = {
  args: { checked: false },
}

export const On: Story = {
  args: { checked: true },
}

export const WithLabel: Story = {
  args: { checked: true, label: 'Enable notifications' },
}

export const Disabled: Story = {
  args: { checked: false, disabled: true, label: 'Disabled toggle' },
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <div className="flex flex-col gap-4">
        <Toggle checked={checked} onChange={setChecked} label="Dark Mode" />
        <p className="text-sm text-text-light">State: {checked ? 'On' : 'Off'}</p>
      </div>
    )
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import Slider from '../Slider'

const meta: Meta<typeof Slider> = {
  title: 'Unity/Slider',
  component: Slider,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  render: () => {
    const [v, setV] = useState(24)
    return (
      <div className="w-[420px] p-4">
        <Slider min={0} max={24 * 30} value={v} onChange={setV} unit="auto" />
      </div>
    )
  },
}

export const Plain: Story = {
  render: () => {
    const [v, setV] = useState(50)
    return (
      <div className="w-[420px] p-4">
        <Slider min={0} max={100} value={v} onChange={setV} unit="plain" />
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[420px] p-4">
      <Slider min={0} max={24 * 30} value={48} onChange={() => {}} unit="auto" disabled />
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import Radio from '../Radio'

const meta: Meta<typeof Radio> = {
  title: 'Unity/Radio',
  component: Radio,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Radio>

export const Default: Story = {
  args: {
    label: 'This is a radiobutton',
    checked: false,
  },
}

export const Checked: Story = {
  args: {
    label: 'This is a radiobutton',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
  },
}

export const RadioGroup: Story = {
  render: () => {
    const [value, setValue] = useState('option1')
    return (
      <div className="flex flex-col gap-4">
        <Radio
          label="Standard Delivery"
          name="delivery"
          value="option1"
          checked={value === 'option1'}
          onChange={() => setValue('option1')}
        />
        <Radio
          label="Express Delivery"
          name="delivery"
          value="option2"
          checked={value === 'option2'}
          onChange={() => setValue('option2')}
        />
        <Radio
          label="Same Day Delivery"
          name="delivery"
          value="option3"
          checked={value === 'option3'}
          onChange={() => setValue('option3')}
        />
      </div>
    )
  },
}

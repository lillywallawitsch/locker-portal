import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import SelectMenu from '../SelectMenu'
import type { SelectOption } from '../SelectMenu'

const options: SelectOption[] = [
  { value: '1', label: 'Max-Urich-Straße', description: '13355, Berlin' },
  { value: '2', label: 'Max-und-Moritz-Straße', description: '27239, Twistringen' },
  { value: '3', label: 'Max-Uhmann-Straße', description: '94133, Röhrnbach' },
  { value: '4', label: 'Max-und-Moritz-Weg', description: '28329, Bremen' },
]

const meta: Meta<typeof SelectMenu> = {
  title: 'Unity/SelectMenu',
  component: SelectMenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[430px] h-[350px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SelectMenu>

export const Default: Story = {
  args: {
    label: 'Adresse',
    placeholder: 'Select an address...',
    options,
    actionLabel: 'Alle Adressfelder anzeigen',
  },
}

export const WithSelection: Story = {
  args: {
    label: 'Adresse',
    options,
    value: '1',
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('')
    return (
      <SelectMenu
        label="Adresse"
        options={options}
        value={value}
        onChange={setValue}
        actionLabel="Alle Adressfelder anzeigen"
      />
    )
  },
}

export const SizeDefault: Story = {
  name: 'Size / Default (54px)',
  args: {
    label: 'Adresse',
    options,
    value: '1',
    selectSize: 'lg',
  },
}

export const SizeSmall: Story = {
  name: 'Size / Small (48px)',
  args: {
    label: 'Adresse',
    options,
    value: '1',
    selectSize: 'md',
  },
}

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState<string>('')
    return (
      <SelectMenu
        label="Adresse"
        placeholder="Select an address..."
        options={options}
        value={value}
        onChange={setValue}
        searchable
        searchPlaceholder="Search address"
      />
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <SelectMenu label="Default (54px)" options={options} value="1" selectSize="lg" />
      <SelectMenu label="Small (48px)" options={options} value="1" selectSize="md" />
    </div>
  ),
}

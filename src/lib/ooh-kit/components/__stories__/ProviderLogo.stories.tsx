import type { Meta, StoryObj } from '@storybook/react'
import ProviderLogo from '../ProviderLogo'
import type { Provider } from '../../../../data/lockers'

const allProviders: Provider[] = [
  'bloqit', 'myflexbox', 'swipbox', 'keba', 'tamburi',
  'quadient', 'locky', 'amazon', 'cainiao',
]

const meta: Meta<typeof ProviderLogo> = {
  title: 'OOH Kit/ProviderLogo',
  component: ProviderLogo,
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: allProviders,
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ProviderLogo>

export const Bloqit: Story = { args: { provider: 'bloqit' } }
export const Myflexbox: Story = { args: { provider: 'myflexbox' } }
export const SwipBox: Story = { args: { provider: 'swipbox' } }
export const Keba: Story = { args: { provider: 'keba' } }
export const Tamburi: Story = { args: { provider: 'tamburi' } }
export const Quadient: Story = { args: { provider: 'quadient' } }
export const Locky: Story = { args: { provider: 'locky' } }
export const Amazon: Story = { args: { provider: 'amazon' } }
export const Cainiao: Story = { args: { provider: 'cainiao' } }

export const AllProviders: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {allProviders.map((p) => (
        <ProviderLogo key={p} provider={p} />
      ))}
    </div>
  ),
}

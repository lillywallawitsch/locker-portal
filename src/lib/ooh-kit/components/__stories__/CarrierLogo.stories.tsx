import type { Meta, StoryObj } from '@storybook/react'
import CarrierLogo from '../CarrierLogo'

const meta: Meta<typeof CarrierLogo> = {
  title: 'OOH Kit/CarrierLogo',
  component: CarrierLogo,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CarrierLogo>

export const GLS: Story = {
  args: { brand: 'gls', shortName: 'GLS' },
}

export const DPD: Story = {
  args: { brand: 'dpd', shortName: 'DPD' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-text-light">Small</span>
        <div className="flex gap-2">
          <CarrierLogo brand="gls" shortName="GLS" size="sm" />
          <CarrierLogo brand="dpd" shortName="DPD" size="sm" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-text-light">Medium (32px)</span>
        <div className="flex gap-2">
          <CarrierLogo brand="gls" shortName="GLS" size="md" />
          <CarrierLogo brand="dpd" shortName="DPD" size="md" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-text-light">Large (40px)</span>
        <div className="flex gap-2">
          <CarrierLogo brand="gls" shortName="GLS" size="lg" />
          <CarrierLogo brand="dpd" shortName="DPD" size="lg" />
        </div>
      </div>
    </div>
  ),
}

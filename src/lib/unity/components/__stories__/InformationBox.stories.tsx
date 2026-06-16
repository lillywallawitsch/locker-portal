import type { Meta, StoryObj } from '@storybook/react'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import InformationBox from '../InformationBox'

const meta: Meta<typeof InformationBox> = {
  title: 'Unity/InformationBox',
  component: InformationBox,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InformationBox>

export const Info: Story = {
  args: {
    children: 'Rabattcode SAVE10* angewandt',
    variant: 'info',
  },
}

export const Success: Story = {
  args: {
    children: 'Your order has been placed successfully',
    variant: 'success',
    icon: <CheckCircle size={20} />,
  },
}

export const Warning: Story = {
  args: {
    children: 'Your session will expire in 5 minutes',
    variant: 'warning',
    icon: <AlertTriangle size={20} />,
  },
}

export const Error: Story = {
  args: {
    children: 'Payment could not be processed',
    variant: 'error',
    icon: <XCircle size={20} />,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <InformationBox variant="info">Information message</InformationBox>
      <InformationBox variant="success" icon={<CheckCircle size={20} />}>Success message</InformationBox>
      <InformationBox variant="warning" icon={<AlertTriangle size={20} />}>Warning message</InformationBox>
      <InformationBox variant="error" icon={<XCircle size={20} />}>Error message</InformationBox>
    </div>
  ),
}

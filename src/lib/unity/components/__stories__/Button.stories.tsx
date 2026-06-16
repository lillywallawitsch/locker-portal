import type { Meta, StoryObj } from '@storybook/react'
import { Plus, ArrowRight, X, Ban } from 'lucide-react'
import Button from '../Button'

const meta: Meta<typeof Button> = {
  title: 'Unity/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { children: 'Hinzufügen und zur Kasse', variant: 'primary' },
}

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
}

export const WithIcon: Story = {
  args: { children: 'Add Item', variant: 'primary', icon: <Plus size={20} /> },
}

export const Large: Story = {
  args: { children: 'Sign up', variant: 'primary', size: 'lg' },
}

export const Ghost: Story = {
  args: { children: 'Ghost Button', variant: 'ghost' },
}

export const Destructive: Story = {
  args: { children: 'Delete Item', variant: 'destructive' },
}

export const DestructiveWithIcon: Story = {
  args: { children: 'Block User', variant: 'destructive', icon: <Ban size={16} /> },
}

export const Small: Story = {
  args: { children: 'Cancel Booking', variant: 'destructive', size: 'sm' },
}

export const IconOnly: Story = {
  args: { iconOnly: true, 'aria-label': 'Close', icon: <X size={15} className="text-text-foreground" /> },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex gap-3 items-center">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-3 items-center">
        <Button variant="primary" icon={<Plus size={20} />}>With Icon</Button>
        <Button variant="secondary" icon={<ArrowRight size={20} />}>With Icon</Button>
        <Button variant="destructive" icon={<Ban size={16} />}>With Icon</Button>
      </div>
      <div className="flex gap-3 items-center">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </div>
      <div className="flex gap-3 items-center">
        <Button iconOnly aria-label="Close" icon={<X size={15} className="text-text-foreground" />} />
      </div>
    </div>
  ),
}

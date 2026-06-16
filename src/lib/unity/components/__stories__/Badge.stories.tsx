import type { Meta, StoryObj } from '@storybook/react'
import Badge from '../Badge'

const meta: Meta<typeof Badge> = {
  title: 'Unity/Badge',
  component: Badge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const Primary: Story = {
  args: { label: 'Badge', variant: 'primary' },
}

export const Success: Story = {
  args: { label: 'Active', variant: 'success' },
}

export const Error: Story = {
  args: { label: 'Error', variant: 'error' },
}

export const Warning: Story = {
  args: { label: 'Warning', variant: 'warning' },
}

export const Neutral: Story = {
  args: { label: 'Default', variant: 'neutral' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-3 items-center">
      <Badge label="Small" size="sm" />
      <Badge label="Medium" size="md" />
      <Badge label="Large" size="lg" />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge label="Primary" variant="primary" />
      <Badge label="Success" variant="success" />
      <Badge label="Error" variant="error" />
      <Badge label="Warning" variant="warning" />
      <Badge label="Neutral" variant="neutral" />
    </div>
  ),
}

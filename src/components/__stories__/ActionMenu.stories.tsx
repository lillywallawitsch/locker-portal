import type { Meta, StoryObj } from '@storybook/react'
import {
  PackageCheck,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  XCircle,
  Trash2,
  Copy,
  Pencil,
} from 'lucide-react'
import ActionMenu from '../ActionMenu'

const meta: Meta<typeof ActionMenu> = {
  title: 'OOH Kit/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Overflow menu with two trigger styles: the default `icon` (⋯ "More") button, and `edit-button` — a labelled secondary button (pen icon + "Edit") used when the action context warrants a more discoverable trigger (e.g. the latest event row in the parcel journey). Click outside or press Escape to close. Items can be marked `destructive` to render in the error color, and the menu can be aligned to the left or right of its trigger.',
      },
    },
  },
  argTypes: {
    trigger: {
      control: 'inline-radio',
      options: ['icon', 'edit-button'],
      description: 'Visual style of the trigger button',
    },
    triggerLabel: {
      control: 'text',
      description: 'Label used when `trigger="edit-button"` (defaults to "Edit")',
    },
  },
}

export default meta
type Story = StoryObj<typeof ActionMenu>

export const Default: Story = {
  args: {
    items: [
      { key: 'edit', label: 'Edit', icon: <Pencil size={14} />, onClick: () => {} },
      { key: 'copy', label: 'Duplicate', icon: <Copy size={14} />, onClick: () => {} },
      { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, destructive: true, onClick: () => {} },
    ],
  },
}

export const ParcelTransitions: Story = {
  render: () => (
    <ActionMenu
      ariaLabel="Edit last event"
      items={[
        { key: 'in_locker', label: 'Mark as Ready for Pickup', icon: <PackageCheck size={14} />, onClick: () => {} },
        { key: 'collected', label: 'Mark as Collected', icon: <CheckCircle size={14} />, onClick: () => {} },
        { key: 'expired', label: 'Mark as Expired', icon: <AlertCircle size={14} />, onClick: () => {} },
        { key: 'expected', label: 'Mark as Expected', icon: <RotateCcw size={14} />, onClick: () => {} },
        { key: 'cancelled', label: 'Cancel Booking', icon: <XCircle size={14} />, destructive: true, onClick: () => {} },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The menu used on the parcel detail journey to manually transition a parcel between lifecycle states.',
      },
    },
  },
}

export const AlignLeft: Story = {
  args: {
    align: 'left',
    items: [
      { key: 'edit', label: 'Edit', icon: <Pencil size={14} />, onClick: () => {} },
      { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, destructive: true, onClick: () => {} },
    ],
  },
}

export const SingleItem: Story = {
  args: {
    items: [
      { key: 'edit', label: 'Edit only', icon: <Pencil size={14} />, onClick: () => {} },
    ],
  },
}

export const EditButtonTrigger: Story = {
  args: {
    trigger: 'edit-button',
    triggerLabel: 'Edit',
    items: [
      { key: 'in_locker', label: 'Mark as Ready for Pickup', icon: <PackageCheck size={14} />, onClick: () => {} },
      { key: 'collected', label: 'Mark as Collected', icon: <CheckCircle size={14} />, onClick: () => {} },
      { key: 'expired', label: 'Mark as Expired', icon: <AlertCircle size={14} />, onClick: () => {} },
      { key: 'cancelled', label: 'Cancel Booking', icon: <XCircle size={14} />, destructive: true, onClick: () => {} },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `trigger="edit-button"` when the action affordance needs to be obvious — e.g. on the latest parcel-journey event where users can manually transition a parcel.',
      },
    },
  },
}

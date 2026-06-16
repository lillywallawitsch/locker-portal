import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import SavedViewsPopover, { type SavedView } from '../SavedViewsPopover'

const meta: Meta<typeof SavedViewsPopover> = {
  title: 'OOH Kit/SavedViewsPopover',
  component: SavedViewsPopover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The "My Saved Filters" popover lists saved filter combinations on the Locker and Parcel overview pages. Users can activate, deactivate, and delete saved entries. Saving happens from the More Filters panel.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 min-h-[400px] flex justify-end">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SavedViewsPopover>

const initialViews: SavedView[] = [
  { id: '1', name: 'Berlin · Active' },
  { id: '2', name: 'DE202 · Maintenance' },
  { id: '3', name: 'Inactive' },
]

export const WithActiveFilter: Story = {
  render: () => {
    const [views, setViews] = useState(initialViews)
    const [activeViewId, setActiveViewId] = useState<string | null>('1')
    return (
      <SavedViewsPopover
        views={views}
        activeViewId={activeViewId}
        onApply={setActiveViewId}
        onClear={() => setActiveViewId(null)}
        onRemove={(id) => {
          setViews((prev) => prev.filter((v) => v.id !== id))
          if (activeViewId === id) setActiveViewId(null)
        }}
        onRename={(id, name) => {
          setViews((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)))
        }}
      />
    )
  },
}

export const Idle: Story = {
  render: () => (
    <SavedViewsPopover
      views={initialViews}
      activeViewId={null}
      onApply={() => {}}
      onClear={() => {}}
      onRemove={() => {}}
      onRename={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'No saved filter is active. Rows are unchecked; the trash icon is hidden until a row becomes active.',
      },
    },
  },
}

export const Empty: Story = {
  render: () => (
    <SavedViewsPopover
      views={[]}
      activeViewId={null}
      onApply={() => {}}
      onClear={() => {}}
      onRemove={() => {}}
      onRename={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Empty state with a "Learn More" link. The user has not yet saved any filter combinations.',
      },
    },
  },
}

export const FirstTimeTooltip: Story = {
  render: () => (
    <SavedViewsPopover
      views={initialViews}
      activeViewId={null}
      onApply={() => {}}
      onClear={() => {}}
      onRemove={() => {}}
      onRename={() => {}}
      firstTimeTooltip={'Your saved "My Filters" appear here and can be activated during any session.'}
      onDismissFirstTimeTooltip={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'After the user saves their first filter, a one-time dark tooltip points at the My Filters trigger.',
      },
    },
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import LastUpdatedButton from '../LastUpdatedButton'

const meta: Meta<typeof LastUpdatedButton> = {
  title: 'OOH Kit/LastUpdatedButton',
  component: LastUpdatedButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inline button that shows how long ago the data on the page was last refreshed and refreshes it on click. The label updates every 10 seconds and the refresh icon spins briefly when clicked. Pass `onRefresh` to hook into the page-level refresh handler.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LastUpdatedButton>

export const Default: Story = {
  args: {},
}

export const WithRefreshHandler: Story = {
  args: {
    onRefresh: () => console.log('refresh triggered'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When the user clicks the button, the timestamp resets to "just now" and the optional `onRefresh` callback is invoked so the page can re-fetch its data.',
      },
    },
  },
}

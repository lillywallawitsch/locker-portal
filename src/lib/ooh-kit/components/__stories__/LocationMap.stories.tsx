import type { Meta, StoryObj } from '@storybook/react'
import LocationMap from '../LocationMap'

const meta: Meta<typeof LocationMap> = {
  title: 'OOH Kit/LocationMap',
  component: LocationMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact, non-interactive map preview using Carto Positron tiles via Leaflet. Designed for the Location card on the Locker Detail page. The map is locked (no drag, zoom, or scroll-wheel) so the custom pin always represents the precise locker location. Pass `href` to make the whole map a clickable link to an external mapping service (e.g. Google Maps).',
      },
    },
  },
  argTypes: {
    latitude: { control: 'number' },
    longitude: { control: 'number' },
    zoom: { control: { type: 'range', min: 13, max: 20, step: 1 } },
    href: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="w-[253px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LocationMap>

export const Berlin: Story = {
  args: {
    latitude: 52.532,
    longitude: 13.388,
    zoom: 16,
  },
}

export const Madrid: Story = {
  args: {
    latitude: 40.418,
    longitude: -3.703,
    zoom: 16,
  },
}

export const ClickToOpenGoogleMaps: Story = {
  args: {
    latitude: 52.532,
    longitude: 13.388,
    zoom: 16,
    href: 'https://www.google.com/maps?q=52.532,13.388',
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import Card from '../Card'
import StatusBadge from '../StatusBadge'
import Field from '../Field'

const meta: Meta<typeof Card> = {
  title: 'OOH Kit/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Sidebar info card. Renders a header (title + optional trailing element such as a status badge) and a vertical content stack (typically `Field` rows).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Basic: Story = {
  render: () => (
    <div className="w-[301px]">
      <Card title="Carrier" headerRight={<StatusBadge status="active" />}>
        <Field label="Carrier Locker ID">2760935404</Field>
        <Field label="Depot">DE 400</Field>
        <Field label="Region">DE-WEST</Field>
        <Field label="Activation Date">29.04.2026</Field>
      </Card>
    </div>
  ),
}

export const NoHeaderRight: Story = {
  render: () => (
    <div className="w-[301px]">
      <Card title="Provider">
        <Field label="Provider Name">Bloq.it</Field>
        <Field label="Locker Model">NXT</Field>
        <Field label="Locker Version">v. 1.2.4</Field>
      </Card>
    </div>
  ),
}

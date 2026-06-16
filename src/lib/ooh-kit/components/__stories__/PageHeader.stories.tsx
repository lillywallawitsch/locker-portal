import type { Meta, StoryObj } from '@storybook/react'
import { BarChart3, ExternalLink, RefreshCw } from 'lucide-react'
import PageHeader from '../PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'OOH Kit/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const TitleOnly: Story = {
  args: { title: 'Lockers' },
}

export const WithSubtitle: Story = {
  args: {
    title: 'Lockers',
    subtitle: (
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-text-primary tracking-[-0.14px] font-medium leading-[22px]">
          Last updated 2 min ago
        </span>
        <RefreshCw size={16} className="text-text-primary" />
      </div>
    ),
  },
}

export const WithActions: Story = {
  args: {
    title: 'Lockers',
    subtitle: (
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-text-primary tracking-[-0.14px] font-medium leading-[22px]">
          Last updated 2 min ago
        </span>
        <RefreshCw size={16} className="text-text-primary" />
      </div>
    ),
    actions: (
      <button className="flex items-center gap-1.5 px-5 h-[38px] border border-border-default rounded-lg bg-transparent cursor-pointer">
        <BarChart3 size={16} className="text-text-foreground" />
        <span className="text-sm text-text-foreground tracking-[-0.14px] font-medium">
          Deep Dive into Network Performance
        </span>
        <ExternalLink size={16} className="text-text-foreground" />
      </button>
    ),
  },
}

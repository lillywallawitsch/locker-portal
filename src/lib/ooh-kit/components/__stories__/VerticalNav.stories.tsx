import type { Meta, StoryObj } from '@storybook/react'
import { Package, Users } from 'lucide-react'
import VerticalNav from '../VerticalNav'
import type { NavSection, UserProfile, OrgSwitcher } from '../VerticalNav'

const LockerIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 1.5C2.44772 1.5 2 1.94772 2 2.5V13.5C2 14.0523 2.44772 14.5 3 14.5H13C13.5523 14.5 14 14.0523 14 13.5V2.5C14 1.94772 13.5523 1.5 13 1.5H3ZM4 3.5C3.72386 3.5 3.5 3.72386 3.5 4V7C3.5 7.27614 3.72386 7.5 4 7.5H7V3.5H4ZM9 3.5V7.5H12C12.2761 7.5 12.5 7.27614 12.5 7V4C12.5 3.72386 12.2761 3.5 12 3.5H9ZM12.5 9C12.5 8.72386 12.2761 8.5 12 8.5H9V12.5H12C12.2761 12.5 12.5 12.2761 12.5 12V9ZM7 12.5V8.5H4C3.72386 8.5 3.5 8.72386 3.5 9V12C3.5 12.2761 3.72386 12.5 4 12.5H7Z"
      fill="currentColor"
    />
  </svg>
)

const org: OrgSwitcher = {
  logo: (
    <div className="w-8 h-8 rounded-lg bg-surface-primary flex items-center justify-center">
      <span className="text-white text-[10px] font-bold">GLS</span>
    </div>
  ),
  name: 'GLS Germany',
}

const sections: NavSection[] = [
  {
    title: 'Network Management',
    items: [
      { key: 'locker', label: 'Locker Overview', icon: <LockerIcon />, active: true },
      { key: 'parcel', label: 'Parcel Overview', icon: <Package size={16} /> },
    ],
  },
  {
    title: 'Setting',
    items: [
      { key: 'users', label: 'User Management', icon: <Users size={16} /> },
    ],
  },
]

const user: UserProfile = {
  initials: 'MH',
  name: 'Max Hoffmann',
  email: 'm.hoffmann@gls-itservices.com',
}

const meta: Meta<typeof VerticalNav> = {
  title: 'OOH Kit/VerticalNav',
  component: VerticalNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-[600px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof VerticalNav>

export const Default: Story = {
  args: { org, sections, user },
}

import { useState, useRef, useEffect } from 'react'
import { ChevronsUpDown, Book, MessageSquare, User, Settings, LogOut, Component } from 'lucide-react'
import type { ReactNode } from 'react'

/* ── Types ── */
export interface NavItem {
  key: string
  label: string
  icon: ReactNode
  active?: boolean
  badge?: number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface UserProfile {
  initials: string
  name: string
  email: string
}

export interface OrgSwitcher {
  logo: ReactNode
  name: string
}

export interface OrgSwitcherItem {
  id: string
  logo: ReactNode
  name: string
}

interface VerticalNavProps {
  org: OrgSwitcher
  orgItems?: OrgSwitcherItem[]
  sections: NavSection[]
  user: UserProfile
  collapsed?: boolean
  onNavClick?: (key: string) => void
  onUserMenuClick?: (key: string) => void
  onOrgSwitch?: (id: string) => void
}

/* ── Component ── */
export default function VerticalNav({
  org,
  orgItems,
  sections,
  user,
  collapsed = false,
  onNavClick,
  onUserMenuClick,
  onOrgSwitch,
}: VerticalNavProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const orgMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setOrgMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <>
    {/* Mobile backdrop */}
    {!collapsed && (
      <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => onNavClick?.('')} />
    )}
    <nav
      aria-label="Main navigation"
      className={`${collapsed ? 'w-[60px] max-md:-translate-x-full' : 'w-[255px]'} shrink-0 bg-surface-card border-r border-border-default flex flex-col p-2 gap-1 transition-all duration-200 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40`}
    >
      <div className="flex-1 flex flex-col gap-6">
        {/* Organization Switcher */}
        <div ref={orgMenuRef} className="relative">
          <button
            type="button"
            onClick={() => orgItems && orgItems.length > 0 && setOrgMenuOpen(!orgMenuOpen)}
            aria-label={`Switch organization, current: ${org.name}`}
            aria-haspopup={orgItems && orgItems.length > 0 ? 'true' : undefined}
            aria-expanded={orgItems && orgItems.length > 0 ? orgMenuOpen : undefined}
            className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface-card-hover border-0 bg-transparent w-full ${collapsed ? 'justify-center' : ''} ${orgItems && orgItems.length > 0 ? 'cursor-pointer' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {org.logo}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 overflow-hidden text-left">
                  <span className="text-sm text-text-muted tracking-[-0.14px] font-medium">
                    {org.name}
                  </span>
                </div>
                <ChevronsUpDown size={16} aria-hidden="true" className="text-text-muted shrink-0" />
              </>
            )}
          </button>
          {orgMenuOpen && orgItems && orgItems.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-[220px] bg-surface-card border border-border-default rounded-lg shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)] overflow-hidden z-20">
              {orgItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setOrgMenuOpen(false); onOrgSwitch?.(item.id) }}
                  className="flex items-center gap-2 w-full h-[42px] px-4 py-3 bg-surface-surface hover:bg-surface-secondary border-0 cursor-pointer text-left"
                >
                  <div className="w-[21px] h-4 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                    {item.logo}
                  </div>
                  <span className="text-base text-text-foreground tracking-[-0.16px] leading-5">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 flex flex-col gap-6 pb-6">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              {!collapsed && (
                <div className="px-2">
                  <span className="text-xs text-text-muted tracking-[-0.12px] font-medium leading-4">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-px">
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onNavClick?.(item.key)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md border-0 w-full cursor-pointer ${
                      collapsed ? 'justify-center' : 'text-left'
                    } ${
                      item.active
                        ? 'bg-surface-card-hover'
                        : 'bg-transparent'
                    }`}
                  >
                    <span
                      className={
                        item.active
                          ? 'text-text-foreground'
                          : 'text-text-light'
                      }
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span
                          className={`flex-1 text-sm tracking-[-0.14px] font-medium leading-[18px] ${
                            item.active
                              ? 'text-text-foreground'
                              : 'text-text-light'
                          }`}
                        >
                          {item.label}
                        </span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span
                            aria-label={`${item.badge} pending`}
                            className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-surface-primary text-[11px] font-semibold leading-none tracking-[-0.11px] text-text-inverted"
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div ref={userMenuRef} className="relative">
        {userMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-surface-surface border border-border-default rounded-md shadow-[0px_10px_6px_0px_rgba(0,0,0,0.01),0px_4px_4px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.02)] overflow-hidden z-20">
            {([
              { key: 'documentation', label: 'Documentation', icon: <Book size={16} /> },
              { key: 'support', label: 'Create Support Ticket', icon: <MessageSquare size={16} /> },
              { key: 'profile', label: 'Profile', icon: <User size={16} /> },
              { key: 'preferences', label: 'Preferences', icon: <Settings size={16} /> },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => { setUserMenuOpen(false); onUserMenuClick?.(item.key) }}
                className="flex items-center gap-1 w-full h-[42px] px-4 py-2 bg-surface-surface hover:bg-surface-secondary border-0 cursor-pointer text-left"
              >
                <span className="text-text-foreground shrink-0">{item.icon}</span>
                <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[18px]">
                  {item.label}
                </span>
              </button>
            ))}
            <div className="border-t border-border-default">
              <button
                onClick={() => { setUserMenuOpen(false); onUserMenuClick?.('logout') }}
                className="flex items-center gap-1 w-full h-[42px] px-4 py-2 bg-surface-surface hover:bg-surface-secondary border-0 cursor-pointer text-left"
              >
                <LogOut size={16} className="text-text-foreground shrink-0" />
                <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[18px]">
                  Logout
                </span>
              </button>
            </div>
            <div className="border-t border-border-default px-3 py-2 flex flex-col gap-1">
              <span className="text-xs text-text-light tracking-[-0.12px] leading-4">
                Version 1.2.0
              </span>
              <a
                href="http://localhost:6006"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-text-light tracking-[-0.12px] leading-4 no-underline hover:text-text-foreground"
                onClick={() => setUserMenuOpen(false)}
              >
                <Component size={12} />
                Storybook
              </a>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          aria-label={`User menu, ${user.name}`}
          aria-haspopup="true"
          aria-expanded={userMenuOpen}
          className={`flex items-center gap-2 cursor-pointer rounded-md hover:bg-surface-card-hover p-1 border-0 bg-transparent w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-lg bg-text-muted flex items-center justify-center shrink-0">
            <span className="text-xs text-surface-bg font-semibold">
              {user.initials}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 flex flex-col min-w-0 text-left">
                <span className="text-sm text-text-muted tracking-[-0.14px] font-medium leading-[22px]">
                  {user.name}
                </span>
                <span className="text-xs text-text-muted tracking-[-0.12px] leading-[20px] truncate">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown size={16} aria-hidden="true" className="text-text-muted shrink-0" />
            </>
          )}
        </button>
      </div>
    </nav>
    </>
  )
}

import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import Button from '../../unity/components/Button'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface NavBreadcrumbProps {
  items: BreadcrumbItem[]
  collapsed?: boolean
  onToggle?: () => void
}

export default function NavBreadcrumb({ items, collapsed = false, onToggle }: NavBreadcrumbProps) {
  return (
    <div className="flex items-center gap-4 h-[22px]">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        iconOnly
        onClick={onToggle}
        aria-label="Open navigation menu"
        className="md:hidden"
        icon={<Menu size={16} className="text-text-foreground" />}
      />
      {/* Desktop collapse toggle */}
      <Button
        variant="ghost"
        iconOnly
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden md:flex"
        icon={
          collapsed ? (
            <PanelLeftOpen size={16} className="text-text-foreground" />
          ) : (
            <PanelLeftClose size={16} className="text-text-foreground" />
          )
        }
      />
      <div className="w-px h-4 bg-border-default" />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRight size={14} aria-hidden="true" className="text-text-light" />
            )}
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className="p-0 border-0 bg-transparent cursor-pointer text-sm text-text-light tracking-[-0.14px] leading-[22px] hover:text-text-foreground"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`text-sm tracking-[-0.14px] leading-[22px] ${
                  i < items.length - 1
                    ? 'text-text-light'
                    : 'text-text-foreground'
                }`}
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}

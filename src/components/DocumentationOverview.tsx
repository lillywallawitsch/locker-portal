import { Book, Box, Package, MapPin, Users, Settings, ChevronRight, Clock, FileText, Zap, Shield, HelpCircle, ExternalLink } from 'lucide-react'
import { SearchInput } from '../lib/ooh-kit'
import Button from '../lib/unity/components/Button'
import { useState } from 'react'

interface DocCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  articles: number
  lastUpdated: string
}

const categories: DocCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of the GLS Locker Portal, account setup, and initial configuration.',
    icon: <Zap size={20} className="text-surface-primary" />,
    articles: 8,
    lastUpdated: '2 days ago',
  },
  {
    id: 'locker-management',
    title: 'Locker Management',
    description: 'Manage your locker network including installation, maintenance, and monitoring.',
    icon: <Box size={20} className="text-surface-primary" />,
    articles: 14,
    lastUpdated: '1 day ago',
  },
  {
    id: 'parcel-operations',
    title: 'Parcel Operations',
    description: 'Handle parcel deliveries, collections, returns, and alternative delivery flows.',
    icon: <Package size={20} className="text-surface-primary" />,
    articles: 12,
    lastUpdated: '3 days ago',
  },
  {
    id: 'network-analytics',
    title: 'Network Analytics',
    description: 'Understand performance metrics, utilization reports, and network health dashboards.',
    icon: <MapPin size={20} className="text-surface-primary" />,
    articles: 6,
    lastUpdated: '5 days ago',
  },
  {
    id: 'user-management',
    title: 'User & Access Management',
    description: 'Configure user roles, permissions, and organizational access controls.',
    icon: <Users size={20} className="text-surface-primary" />,
    articles: 5,
    lastUpdated: '1 week ago',
  },
  {
    id: 'api-integration',
    title: 'API & Integration',
    description: 'Technical reference for API endpoints, webhooks, and third-party integrations.',
    icon: <Settings size={20} className="text-surface-primary" />,
    articles: 10,
    lastUpdated: '4 days ago',
  },
]

interface QuickLink {
  title: string
  category: string
  id: string
}

const quickLinks: QuickLink[] = [
  { title: 'How to add a new locker to the network', category: 'locker-management', id: 'add-locker' },
  { title: 'Understanding parcel status lifecycle', category: 'parcel-operations', id: 'parcel-lifecycle' },
  { title: 'Setting up compartment code access', category: 'locker-management', id: 'compartment-codes' },
  { title: 'Configuring alert notifications', category: 'network-analytics', id: 'alerts' },
  { title: 'Managing expired parcels', category: 'parcel-operations', id: 'expired-parcels' },
]

interface DocumentationOverviewProps {
  onArticleClick: (categoryId: string, articleId?: string) => void
}

export default function DocumentationOverview({ onArticleClick }: DocumentationOverviewProps) {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col gap-6">
      {/* Hero / Search */}
      <div className="bg-surface-card border border-border-light rounded-xl p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-primary/10 flex items-center justify-center">
          <Book size={24} className="text-surface-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-foreground tracking-[-0.2px]">
          How can we help you?
        </h2>
        <p className="text-sm text-text-light tracking-[-0.14px] text-center max-w-md">
          Browse documentation, guides, and FAQs for the GLS Locker Portal.
        </p>
        <div className="mt-2">
          <SearchInput
            placeholder="Search documentation..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-surface-card border border-border-light rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-text-light" />
          <span className="text-xs font-medium text-text-light tracking-[-0.12px] uppercase">Popular Articles</span>
        </div>
        <div className="flex flex-col">
          {quickLinks.map((link, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onArticleClick(link.category, link.id)}
              className="flex items-center gap-2 px-2 py-2.5 border-0 bg-transparent cursor-pointer text-left rounded-md hover:bg-surface-secondary group"
            >
              <FileText size={14} className="text-text-light shrink-0" />
              <span className="flex-1 text-sm text-text-foreground tracking-[-0.14px] group-hover:text-surface-primary">
                {link.title}
              </span>
              <ChevronRight size={14} className="text-text-light opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onArticleClick(cat.id)}
            className="bg-surface-card border border-border-light rounded-xl p-5 text-left cursor-pointer hover:border-border-default hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface-primary/5 flex items-center justify-center shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-foreground tracking-[-0.14px] mb-1 group-hover:text-surface-primary">
                  {cat.title}
                </h3>
                <p className="text-xs text-text-light tracking-[-0.12px] leading-[18px]">
                  {cat.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border-light">
              <span className="text-xs text-text-light tracking-[-0.12px]">
                {cat.articles} articles
              </span>
              <span className="flex items-center gap-1 text-xs text-text-light tracking-[-0.12px]">
                <Clock size={10} />
                Updated {cat.lastUpdated}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Help Banner */}
      <div className="bg-surface-card border border-border-light rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface-warning flex items-center justify-center shrink-0">
          <HelpCircle size={20} className="text-text-warning" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-text-foreground tracking-[-0.14px]">
            Can't find what you're looking for?
          </h4>
          <p className="text-xs text-text-light tracking-[-0.12px] mt-0.5">
            Contact our support team for personalized assistance with the Locker Portal.
          </p>
        </div>
        <Button variant="secondary" size="md" icon={<ExternalLink size={16} />}>
          Contact Support
        </Button>
      </div>

      {/* Security & Compliance */}
      <div className="bg-surface-card border border-border-light rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface-success flex items-center justify-center shrink-0">
          <Shield size={20} className="text-text-success" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-text-foreground tracking-[-0.14px]">
            Security & Compliance
          </h4>
          <p className="text-xs text-text-light tracking-[-0.12px] mt-0.5">
            Learn about data protection, GDPR compliance, and security best practices for locker operations.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={<ChevronRight size={16} />}
          onClick={() => onArticleClick('security')}
        >
          Learn More
        </Button>
      </div>
    </div>
  )
}

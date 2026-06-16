import { Book, ChevronRight, Clock, FileText, Box, Package, MapPin, Users, Settings, Zap, Shield, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'
import Button from '../lib/unity/components/Button'

interface Article {
  id: string
  title: string
  readTime: string
  lastUpdated: string
  content: React.ReactNode
}

interface CategoryData {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  articles: Article[]
}

const categoryData: Record<string, CategoryData> = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of the GLS Locker Portal, account setup, and initial configuration.',
    icon: <Zap size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to the GLS Locker Portal',
        readTime: '3 min',
        lastUpdated: 'Mar 28, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>The GLS Locker Portal is your central hub for managing the entire out-of-home (OOH) delivery network. From here, you can monitor locker health, track parcels, manage compartments, and gain insights into network performance.</p>
            <h3>Key Features</h3>
            <ul>
              <li><strong>Locker Overview</strong> — Monitor all lockers in your network with real-time status updates, compartment availability, and carrier/provider information.</li>
              <li><strong>Parcel Overview</strong> — Track every parcel across all shipment types (Last Mile, First Mile, Return, Alt. Delivery) with full journey visibility.</li>
              <li><strong>Compartment Management</strong> — View detailed breakdowns of compartment sizes, availability, and occupancy rates.</li>
              <li><strong>Network Analytics</strong> — Access performance dashboards, utilization metrics, and trend analysis.</li>
            </ul>
            <h3>Navigation</h3>
            <p>Use the sidebar on the left to navigate between different sections. The sidebar can be collapsed by clicking the panel icon in the breadcrumb bar. Each page features a breadcrumb trail for easy navigation back to parent views.</p>
          </div>
        ),
      },
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        readTime: '5 min',
        lastUpdated: 'Mar 25, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Your account is provisioned by your organization admin. Once you receive your credentials, follow these steps to get started.</p>
            <h3>Step 1: Log In</h3>
            <p>Navigate to the Locker Portal URL provided by your admin. Enter your email and password to access the dashboard.</p>
            <h3>Step 2: Configure Your Organization</h3>
            <p>If you're an organization admin, you can configure your organization settings including name, branding, and default preferences from the Settings page.</p>
            <h3>Step 3: Explore the Dashboard</h3>
            <p>Start by visiting the Locker Overview to see all lockers in your network. Click on any locker to view its details, compartment breakdown, and recent activity.</p>
          </div>
        ),
      },
      {
        id: 'quick-tour',
        title: 'Quick Tour of the Dashboard',
        readTime: '4 min',
        lastUpdated: 'Mar 26, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>This quick tour walks you through the main areas of the Locker Portal dashboard.</p>
            <h3>Locker Overview</h3>
            <p>The default landing page shows all lockers in a searchable, filterable table. Each row displays the locker name, address, carrier status, provider status, compartment count, and provider logo. Click a row to drill into locker details.</p>
            <h3>Locker Detail</h3>
            <p>The detail page shows the locker's parcel list (segmented tabs: Ready for Pickup, Expected, Collected, Rejected, Cancelled), a compartment visualisation, and a timeline of recent activities. The right sidebar groups information into four cards — <strong>Carrier</strong> (locker ID, depot, region, owner, activation date), <strong>Provider</strong> (provider locker ID with copy, model, version), <strong>Location</strong> (map preview, address, host, placement, foldable opening hours with a live "Open / Closed" indicator), and <strong>Compartments</strong> (size breakdown with total count). Each card carries a status badge in its header.</p>
            <h3>Compartment Drill-down</h3>
            <p>Clicking any compartment opens a side panel with the compartment's "Last Activities" timeline. Carriers can <strong>Open</strong> the compartment remotely, <strong>Send a maintenance code</strong>, or <strong>Reset</strong> the compartment when it appears stuck (e.g. a phantom booking with no parcel inside). Reset is only offered when the compartment is occupied / reserved / defective; it clears the booking and returns the compartment to "Ready for storage", logging an event in the timeline.</p>
            <h3>Parcel Overview</h3>
            <p>Switch to Parcel Overview from the sidebar to see all parcels across your network. Filter by status or shipment type. Click any parcel to view its full journey timeline and assigned locker details.</p>
          </div>
        ),
      },
    ],
  },
  'locker-management': {
    id: 'locker-management',
    title: 'Locker Management',
    description: 'Manage your locker network including installation, maintenance, and monitoring.',
    icon: <Box size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'add-locker',
        title: 'How to Add a New Locker to the Network',
        readTime: '6 min',
        lastUpdated: 'Mar 29, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Adding a new locker to your network involves registering the hardware, assigning it to a location, and configuring its compartments.</p>
            <h3>Prerequisites</h3>
            <ul>
              <li>Physical locker installed at the target location</li>
              <li>Network connectivity confirmed (4G/LTE or WiFi)</li>
              <li>Provider integration active (e.g., Keba, Quadient, SwipBox)</li>
            </ul>
            <h3>Registration Process</h3>
            <p>1. Navigate to the Locker Overview page</p>
            <p>2. Click "Add Locker" in the top-right actions area</p>
            <p>3. Fill in the locker details: name, address, provider, carrier assignment</p>
            <p>4. Configure compartment layout (XS, S, M, L, XL sizes)</p>
            <p>5. Verify connectivity and activate the locker</p>
            <h3>Carrier Status</h3>
            <p>New lockers start in <strong>Pending</strong> status. Once the carrier confirms the location, it transitions to <strong>Active</strong>. A locker can also be set to <strong>Maintenance</strong> or <strong>Inactive</strong> as needed.</p>
          </div>
        ),
      },
      {
        id: 'compartment-codes',
        title: 'Setting Up Compartment Code Access',
        readTime: '4 min',
        lastUpdated: 'Mar 27, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Compartment codes are used by couriers and consignees to open specific compartments at a locker. Each parcel reservation generates unique access codes.</p>
            <h3>Code Types</h3>
            <ul>
              <li><strong>Courier Code</strong> — Used by the delivery driver to deposit or retrieve parcels. Available for Last Mile, Return, and Alt. Delivery shipments.</li>
              <li><strong>Consignee Code</strong> — Used by the recipient to collect their parcel. Available for First Mile shipments and expired parcels.</li>
            </ul>
            <h3>Viewing Codes</h3>
            <p>On the Parcel Detail page, click "Show Compartment Code" to open the code dialog. Use the segmented tabs to switch between Courier and Consignee codes. Each code includes a QR code and a numeric PIN that can be copied to clipboard.</p>
            <h3>Code Expiration</h3>
            <p>Codes remain valid until the parcel is collected or the reservation expires. Expired parcels retain their codes for administrative retrieval purposes.</p>
          </div>
        ),
      },
      {
        id: 'compartment-availability',
        title: 'Understanding Compartment Availability',
        readTime: '3 min',
        lastUpdated: 'Mar 28, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>The compartment availability view provides a real-time breakdown of each locker's capacity by compartment size.</p>
            <h3>Accessing the Breakdown</h3>
            <p>From the Locker Detail page, click the "Detailed Breakdown" button next to the compartment bar chart. This opens a side panel showing availability by size (XS, S, M, L, XL), occupied count, reserved count, rejected bookings, collected parcels, and cancelled bookings.</p>
            <h3>Warning Indicators</h3>
            <p>Orange warning indicators appear when:</p>
            <ul>
              <li>A size category has zero available compartments</li>
              <li>Parcels have been in a compartment for more than 24 hours</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  'parcel-operations': {
    id: 'parcel-operations',
    title: 'Parcel Operations',
    description: 'Handle parcel deliveries, collections, returns, and alternative delivery flows.',
    icon: <Package size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'parcel-lifecycle',
        title: 'Understanding Parcel Status Lifecycle',
        readTime: '5 min',
        lastUpdated: 'Mar 28, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Each parcel in the system goes through a series of status transitions that reflect its journey from reservation to collection.</p>
            <h3>Parcel Statuses</h3>
            <ul>
              <li><strong>Expected</strong> — A hard reservation has been created and the parcel is on its way to the locker.</li>
              <li><strong>Ready for Pickup</strong> — The parcel has been delivered and is waiting for pickup.</li>
              <li><strong>Consignee Collected</strong> — The recipient has successfully collected the parcel.</li>
              <li><strong>Expired</strong> — The pickup window has passed without collection.</li>
              <li><strong>Booking Cancelled</strong> — The reservation was cancelled before delivery.</li>
              <li><strong>Booking Rejected</strong> — The reservation was rejected (e.g., parcel dimensions exceed compartment size).</li>
              <li><strong>Courier Collected</strong> — The courier has retrieved the parcel (used in return flows).</li>
            </ul>
            <h3>Shipment Types</h3>
            <p>Parcels are categorized by shipment type which affects the journey flow:</p>
            <ul>
              <li><strong>Last Mile</strong> — Standard delivery to locker for consignee pickup</li>
              <li><strong>First Mile</strong> — Consignee drops off parcel for courier collection</li>
              <li><strong>Return</strong> — Return flow where parcel awaits driver pickup</li>
              <li><strong>Alt. Delivery</strong> — Alternative delivery flow where parcel awaits driver pickup</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'expired-parcels',
        title: 'Managing Expired Parcels',
        readTime: '3 min',
        lastUpdated: 'Mar 26, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>When a parcel exceeds its pickup window, it transitions to the "Expired" status. This requires intervention to clear the compartment.</p>
            <h3>Identifying Expired Parcels</h3>
            <p>Expired parcels are highlighted with a red badge in both the Parcel Overview and Locker Detail views. On the locker detail's "Ready for Pickup" tab, an inline "Expired" tag appears next to the expiry date so the row stays visible alongside still-valid pickups. Selecting "Ready for Pickup" in the parcel overview filter is asymmetric — it returns Ready for Pickup <em>and</em> Expired parcels; the "Expired" filter alone returns just expired ones.</p>
            <h3>Expiry Visibility</h3>
            <p>The expiry date is rendered as a description on the live "Right Now" event in the parcel journey, but only for First Mile (consignee-drop-off) parcels. Other shipment types do not surface an expiry date on the parcel detail page.</p>
            <h3>Retrieving Expired Parcels</h3>
            <p>Both the courier (driver) code and consignee code remain available for expired parcels. Use the "Show Compartment Code" button on the Parcel Detail page to access both codes.</p>
            <h3>Preventing Expiration</h3>
            <p>Monitor the "Ready for Pickup" tab on the Locker Detail page and look for parcels approaching their expiration date. The compartment availability side panel also flags compartments occupied for more than 24 hours.</p>
          </div>
        ),
      },
      {
        id: 'journey-timeline',
        title: 'Reading the Parcel Journey Timeline',
        readTime: '4 min',
        lastUpdated: 'Mar 29, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Each parcel has a journey timeline that shows every event from reservation to final status.</p>
            <h3>Journey Step Indicators</h3>
            <ul>
              <li><strong>Blue dot (Right Now)</strong> — The current/active step in the journey</li>
              <li><strong>Green dot with check (Delivered)</strong> — Successfully completed delivery step</li>
              <li><strong>Green dot (Success)</strong> — A completed step</li>
              <li><strong>Grey dot (Pending)</strong> — A future/pending step</li>
              <li><strong>Red dot (Error)</strong> — A failed or rejected step</li>
              <li><strong>Orange dot (Expired)</strong> — An expired step</li>
              <li><strong>Yellow dot (Warning)</strong> — A step requiring attention</li>
            </ul>
            <h3>Status-Specific Journeys</h3>
            <p>The journey timeline varies based on parcel status. For example, "Booking Rejected" shows a single Error step, while "Consignee Collected" shows a complete Success journey with all steps marked green.</p>
          </div>
        ),
      },
    ],
  },
  'network-analytics': {
    id: 'network-analytics',
    title: 'Network Analytics',
    description: 'Understand performance metrics, utilization reports, and network health dashboards.',
    icon: <MapPin size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'alerts',
        title: 'Configuring Alert Notifications',
        readTime: '4 min',
        lastUpdated: 'Mar 24, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Alert notifications help you stay informed about critical events in your locker network.</p>
            <h3>Alert Types</h3>
            <ul>
              <li><strong>Locker Offline</strong> — Triggered when a locker loses connectivity</li>
              <li><strong>High Occupancy</strong> — When a locker reaches 90%+ capacity</li>
              <li><strong>Expired Parcels</strong> — When parcels exceed their pickup window</li>
              <li><strong>Maintenance Required</strong> — When a locker flags a hardware issue</li>
            </ul>
            <h3>Notification Channels</h3>
            <p>Alerts can be delivered via email, SMS, or webhook integration. Configure your preferred channels in the Settings page under Notifications.</p>
          </div>
        ),
      },
      {
        id: 'performance-metrics',
        title: 'Understanding Performance Metrics',
        readTime: '6 min',
        lastUpdated: 'Mar 22, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>The "Deep Dive into Network Performance" feature (accessible from the Locker Overview page) provides comprehensive analytics on your network.</p>
            <h3>Key Metrics</h3>
            <ul>
              <li><strong>Utilization Rate</strong> — Percentage of compartments in use vs. available</li>
              <li><strong>Average Dwell Time</strong> — Mean time parcels spend in locker before pickup</li>
              <li><strong>Collection Rate</strong> — Percentage of parcels collected before expiration</li>
              <li><strong>Rejection Rate</strong> — Percentage of booking attempts that fail</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  'user-management': {
    id: 'user-management',
    title: 'User & Access Management',
    description: 'Configure user roles, permissions, and organizational access controls.',
    icon: <Users size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'roles',
        title: 'Understanding User Roles',
        readTime: '3 min',
        lastUpdated: 'Mar 20, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>The Locker Portal supports role-based access control (RBAC) to ensure users only access the features they need.</p>
            <h3>Available Roles</h3>
            <ul>
              <li><strong>Admin</strong> — Full access to all features including user management and settings</li>
              <li><strong>Operator</strong> — Access to locker and parcel management, no settings access</li>
              <li><strong>Viewer</strong> — Read-only access to dashboards and reports</li>
              <li><strong>Support</strong> — Access to parcel operations and compartment codes for customer support</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  'api-integration': {
    id: 'api-integration',
    title: 'API & Integration',
    description: 'Technical reference for API endpoints, webhooks, and third-party integrations.',
    icon: <Settings size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'api-overview',
        title: 'API Overview',
        readTime: '5 min',
        lastUpdated: 'Mar 25, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>The GLS Locker Portal provides a RESTful API for programmatic access to locker and parcel management features.</p>
            <h3>Authentication</h3>
            <p>All API requests require a Bearer token obtained through OAuth 2.0 client credentials flow. Contact your admin to generate API credentials.</p>
            <h3>Base URL</h3>
            <p><code className="bg-surface-secondary px-2 py-0.5 rounded text-xs">https://api.gls-locker.com/v1</code></p>
            <h3>Rate Limits</h3>
            <p>API requests are rate-limited to 1000 requests per minute per API key. Bulk operations have separate limits.</p>
          </div>
        ),
      },
      {
        id: 'webhooks',
        title: 'Webhook Configuration',
        readTime: '4 min',
        lastUpdated: 'Mar 23, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>Webhooks allow your systems to receive real-time notifications when events occur in the Locker Portal.</p>
            <h3>Supported Events</h3>
            <ul>
              <li><code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">parcel.delivered</code> — Parcel deposited in locker</li>
              <li><code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">parcel.collected</code> — Parcel picked up</li>
              <li><code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">parcel.expired</code> — Parcel exceeded pickup window</li>
              <li><code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">locker.status_changed</code> — Locker status updated</li>
              <li><code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">booking.rejected</code> — Reservation rejected</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  'security': {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Data protection, GDPR compliance, and security best practices for locker operations.',
    icon: <Shield size={20} className="text-surface-primary" />,
    articles: [
      {
        id: 'gdpr',
        title: 'GDPR Compliance',
        readTime: '5 min',
        lastUpdated: 'Mar 18, 2026',
        content: (
          <div className="flex flex-col gap-4">
            <p>The GLS Locker Portal is designed to comply with GDPR requirements for personal data processing.</p>
            <h3>Data Retention</h3>
            <p>Parcel data is retained for 90 days after collection or expiration. Personal identifiers are anonymized after 30 days. Locker operational data is retained for 1 year.</p>
            <h3>Data Subject Rights</h3>
            <p>End users can request data access, rectification, or deletion through the GLS customer portal. Portal operators can process these requests via the API.</p>
          </div>
        ),
      },
    ],
  },
}

interface DocumentationDetailProps {
  categoryId: string
  articleId?: string
  onBack: () => void
  onArticleClick: (categoryId: string, articleId: string) => void
}

export default function DocumentationDetail({ categoryId, articleId, onBack, onArticleClick }: DocumentationDetailProps) {
  const category = categoryData[categoryId]
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Book size={40} className="text-text-light" />
        <p className="text-sm text-text-light">Category not found.</p>
        <Button variant="secondary" size="md" onClick={onBack}>
          Back to Documentation
        </Button>
      </div>
    )
  }

  const selectedArticle = articleId ? category.articles.find(a => a.id === articleId) : null

  if (selectedArticle) {
    return (
      <div className="flex gap-6">
        {/* Main Article */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface-card border border-border-light rounded-xl p-6">
            <div className="flex items-center gap-2 text-xs text-text-light tracking-[-0.12px] mb-4">
              <Clock size={12} />
              <span>{selectedArticle.readTime} read</span>
              <span className="text-text-light">|</span>
              <span>Updated {selectedArticle.lastUpdated}</span>
            </div>
            <h2 className="text-xl font-semibold text-text-foreground tracking-[-0.2px] mb-6">
              {selectedArticle.title}
            </h2>
            <div className="prose-sm text-sm text-text-foreground tracking-[-0.14px] leading-[22px] [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:tracking-[-0.16px] [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:pl-5 [&_li]:mb-1.5 [&_li]:text-text-foreground [&_code]:text-xs [&_code]:bg-surface-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_strong]:font-semibold">
              {selectedArticle.content}
            </div>

            {/* Feedback */}
            <div className="mt-8 pt-5 border-t border-border-light flex items-center gap-3">
              <span className="text-sm text-text-light tracking-[-0.14px]">Was this article helpful?</span>
              <button
                type="button"
                onClick={() => setFeedback(prev => ({ ...prev, [selectedArticle.id]: 'up' }))}
                className={`flex items-center gap-1 px-3 h-8 border rounded-md cursor-pointer text-xs font-medium ${
                  feedback[selectedArticle.id] === 'up'
                    ? 'border-surface-primary bg-surface-primary/5 text-surface-primary'
                    : 'border-border-default bg-transparent text-text-light hover:bg-surface-secondary'
                }`}
              >
                <ThumbsUp size={12} />
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFeedback(prev => ({ ...prev, [selectedArticle.id]: 'down' }))}
                className={`flex items-center gap-1 px-3 h-8 border rounded-md cursor-pointer text-xs font-medium ${
                  feedback[selectedArticle.id] === 'down'
                    ? 'border-text-error bg-text-error/5 text-text-error'
                    : 'border-border-default bg-transparent text-text-light hover:bg-surface-secondary'
                }`}
              >
                <ThumbsDown size={12} />
                No
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Other articles */}
        <div className="w-[260px] shrink-0">
          <div className="bg-surface-card border border-border-light rounded-xl p-4 sticky top-6">
            <span className="text-xs font-medium text-text-light tracking-[-0.12px] uppercase mb-3 block">
              In this section
            </span>
            <div className="flex flex-col gap-0.5">
              {category.articles.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onArticleClick(categoryId, a.id)}
                  className={`text-left px-2 py-2 border-0 rounded-md cursor-pointer text-sm tracking-[-0.14px] ${
                    a.id === articleId
                      ? 'bg-surface-secondary text-surface-primary font-medium'
                      : 'bg-transparent text-text-light hover:bg-surface-secondary hover:text-text-foreground'
                  }`}
                >
                  {a.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Category overview - list all articles
  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <div className="bg-surface-card border border-border-light rounded-xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-primary/5 flex items-center justify-center shrink-0">
          {category.icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-foreground tracking-[-0.2px] mb-1">
            {category.title}
          </h2>
          <p className="text-sm text-text-light tracking-[-0.14px]">
            {category.description}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-surface-card border border-border-light rounded-xl overflow-hidden">
        {category.articles.map((article, i) => (
          <button
            key={article.id}
            type="button"
            onClick={() => onArticleClick(categoryId, article.id)}
            className={`flex items-center gap-3 w-full px-5 py-4 border-0 bg-transparent cursor-pointer text-left hover:bg-surface-secondary group ${
              i > 0 ? 'border-t border-border-light' : ''
            }`}
          >
            <FileText size={16} className="text-text-light shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-foreground tracking-[-0.14px] group-hover:text-surface-primary block">
                {article.title}
              </span>
              <span className="text-xs text-text-light tracking-[-0.12px] mt-0.5 flex items-center gap-2">
                <Clock size={10} />
                {article.readTime} read
                <span>|</span>
                Updated {article.lastUpdated}
              </span>
            </div>
            <ChevronRight size={16} className="text-text-light opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

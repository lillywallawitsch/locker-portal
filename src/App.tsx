import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Package, Users, Send, X } from 'lucide-react'
import HelpFab from './components/HelpFab'
import {
  VerticalNav,
  NavBreadcrumb,
  PageHeader,
  CarrierLogo,
} from './lib/ooh-kit'
import type { NavSection, UserProfile, OrgSwitcherItem } from './lib/ooh-kit'
import LockerIcon from './components/icons/LockerIcon'
import LockerTable from './components/LockerTable'
import LockerGrid from './components/LockerGrid'
import ParcelTable from './components/ParcelTable'
import UserManagement from './components/UserManagement'
import CarrierSettings from './components/CarrierSettings'
import LockerDetailRoute from './routes/LockerDetailRoute'
import ParcelDetailRoute from './routes/ParcelDetailRoute'
import DocumentationRoute from './routes/DocumentationRoute'
import AccountSettingsSidepanel from './components/AccountSettingsSidepanel'
import PreferencesSidepanel from './components/PreferencesSidepanel'
import AddLockerSidepanel from './components/AddLockerSidepanel'
import type { AddLockerFormValues } from './components/AddLockerSidepanel'
import { Plus, RefreshCw } from 'lucide-react'
import { Button, Toast } from './lib/unity'
import type { Locker } from './data/lockers'
import { getLockerDataForCarrier } from './data/lockers'
import { getParcelDataForCarrier } from './data/parcels'
import { getUserDataForCarrier } from './data/users'
import { carriers, defaultCarrierId } from './data/carriers'
import { OrgProvider } from './context/OrgContext'
import type { AcceptInviteFormValues } from './context/OrgContext'
import type { SharedNetworkInvite } from './data/sharedNetwork'
import { generateSharedNetworkInvites } from './data/sharedNetwork'
import type { OutgoingShareInvite } from './data/sharedLockers'
import { generateOutgoingShares } from './data/sharedLockers'
import { carrierSearch, pathWithCarrier } from './lib/url'

const user: UserProfile = {
  initials: 'SG',
  name: 'Simon Goat',
  email: 's.goat@gls-itservices.com',
}

const NAV_ROUTES: Record<string, string> = {
  'locker-overview': '/lockers',
  'parcel-overview': '/parcels',
  documentation: '/documentation',
  'user-management': '/users',
  'carrier-settings': '/carrier-settings',
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // The active carrier is sourced from `?carrier=`, so every link opens the
  // correct org's data. Invalid/missing falls back to the default and the URL
  // is normalized once (below) so it is always copy-shareable.
  const carrierParam = searchParams.get('carrier')
  const activeCarrierId = carriers.some((c) => c.id === carrierParam)
    ? (carrierParam as string)
    : defaultCarrierId

  // Only normalize on real content routes. On the "/" redirect (and any
  // unknown path) the matching <Navigate> already targets a carrier-bearing
  // "/lockers?carrier=…" URL, so writing the carrier here too would race that
  // redirect — the search-only write keeps the current path, stranding the app
  // on "/?carrier=…" (blank content area) instead of reaching "/lockers".
  const isContentRoute = Object.values(NAV_ROUTES).some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  )

  useEffect(() => {
    if (!isContentRoute) return
    if (carrierParam !== activeCarrierId) {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          sp.set('carrier', activeCarrierId)
          return sp
        },
        { replace: true },
      )
    }
  }, [isContentRoute, carrierParam, activeCarrierId, setSearchParams])

  const [navCollapsed, setNavCollapsed] = useState(() => window.innerWidth < 768)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [profileOpen, setProfileOpen] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [sharedNetworkByCarrier, setSharedNetworkByCarrier] = useState<Record<string, SharedNetworkInvite[]>>({})
  const [outgoingSharesByCarrier, setOutgoingSharesByCarrier] = useState<Record<string, OutgoingShareInvite[]>>({})
  const [lockerDataByCarrier, setLockerDataByCarrier] = useState<Record<string, Locker[]>>({})
  const [addLockerOpen, setAddLockerOpen] = useState(false)
  const [addLockerToast, setAddLockerToast] = useState<Locker | null>(null)

  // Help chat state (shared across overview pages)
  type HelpMessage = { role: 'bot' | 'user'; text: string }
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>([
    { role: 'bot', text: 'Hi! I\'m here to help with locker and parcel issues. I can guide you, answer questions, or create a support ticket for you. What\'s going on?' },
  ])
  const [helpInput, setHelpInput] = useState('')
  const [helpSuggestionsDismissed, setHelpSuggestionsDismissed] = useState(false)
  const helpEndRef = useRef<HTMLDivElement>(null)
  const helpTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleHelpInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHelpInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  useEffect(() => {
    helpEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [helpMessages])

  const sendHelpMessage = (text: string) => {
    if (!text.trim()) return
    setHelpSuggestionsDismissed(true)
    setHelpMessages(prev => [...prev, { role: 'user', text }])
    setHelpInput('')
    if (helpTextareaRef.current) {
      helpTextareaRef.current.style.height = 'auto'
    }
    const replies: Record<string, string> = {
      'A parcel is stuck or a compartment won\'t open': 'I\'ll create a carrier issue ticket for this. Please share the parcel ID and locker ID so I can include them in the report.',
      'Cancel a booking': 'Sure. Share the parcel ID and I\'ll raise a cancellation request right away.',
      'Locker data is wrong on the platform': 'This could be a wrong address, duplicate ID, or incorrect availability. Tell me what\'s wrong and which locker is affected.',
      'Pickup code not working': 'I\'ll look into this. Please share the parcel ID and the locker ID where the code was rejected.',
      'Request a change or new feature': 'Happy to pass that on. Describe what you\'d like and I\'ll put together a change or product request for you.',
    }
    const reply = replies[text] ?? "Thanks — I'll help you with that. Can you give me the locker ID or parcel ID so I can look into it?"
    setTimeout(() => {
      setHelpMessages(prev => [...prev, { role: 'bot', text: reply }])
    }, 600)
  }

  const activeCarrier = carriers.find(c => c.id === activeCarrierId) ?? carriers[0]

  const lockerData = useMemo(() => {
    return lockerDataByCarrier[activeCarrierId] ?? getLockerDataForCarrier(activeCarrierId)
  }, [activeCarrierId, lockerDataByCarrier])

  useEffect(() => {
    if (!lockerDataByCarrier[activeCarrierId]) {
      setLockerDataByCarrier((prev) => ({
        ...prev,
        [activeCarrierId]: getLockerDataForCarrier(activeCarrierId),
      }))
    }
  }, [activeCarrierId, lockerDataByCarrier])

  const updateLocker = (id: string, updates: Partial<Locker>) => {
    setLockerDataByCarrier((prev) => {
      const current = prev[activeCarrierId] ?? getLockerDataForCarrier(activeCarrierId)
      return {
        ...prev,
        [activeCarrierId]: current.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      }
    })
  }

  const addLocker = (locker: Locker) => {
    setLockerDataByCarrier((prev) => {
      const current = prev[activeCarrierId] ?? getLockerDataForCarrier(activeCarrierId)
      return {
        ...prev,
        [activeCarrierId]: [locker, ...current],
      }
    })
  }

  useEffect(() => {
    if (!addLockerToast) return
    const timer = setTimeout(() => setAddLockerToast(null), 5000)
    return () => clearTimeout(timer)
  }, [addLockerToast])

  const handleAddLocker = (values: AddLockerFormValues) => {
    const newLocker: Locker = {
      name: values.lockerName,
      id: values.carrierLockerId,
      street: `${values.street} ${values.houseNumber}`,
      houseNumber: values.houseNumber,
      postalCode: values.postalCode,
      cityName: values.city,
      city: `${values.postalCode} ${values.city}`,
      latitude: values.latitude,
      longitude: values.longitude,
      depot: values.depot ?? '',
      region: values.region ?? '',
      agency: values.agency ?? '',
      carrierStatus: 'inactive',
      providerStatus: 'active',
      compartments: 0,
      provider: values.provider,
      expiredParcelCount: 0,
      venueType: values.venueType ?? 'shopping_center',
      host: values.host ?? '',
      placement: values.placement ?? 'outdoor',
      ownership: 'owned',
      ownedBy: activeCarrier.name,
      sharingEnabled: false,
      sharedWith: undefined,
      activationDate: values.activationDate,
      statusSince: values.activationDate,
      openingHours: { kind: '24/7' },
      providerLockerId: '',
      providerLockerModel: '',
      providerLockerVersion: '',
    }
    addLocker(newLocker)
    setAddLockerOpen(false)
    setAddLockerToast(newLocker)
  }

  const handleViewLockerFromToast = (locker: Locker) => {
    setAddLockerToast(null)
    navigate(`/lockers/${encodeURIComponent(locker.id)}${carrierSearch(activeCarrierId)}`)
  }

  const sharedNetworkData = useMemo(() => {
    return sharedNetworkByCarrier[activeCarrierId] ?? generateSharedNetworkInvites(activeCarrierId)
  }, [activeCarrierId, sharedNetworkByCarrier])

  useEffect(() => {
    if (!sharedNetworkByCarrier[activeCarrierId]) {
      setSharedNetworkByCarrier((prev) => ({
        ...prev,
        [activeCarrierId]: generateSharedNetworkInvites(activeCarrierId),
      }))
    }
  }, [activeCarrierId, sharedNetworkByCarrier])

  const acceptInvite = (id: string, details: AcceptInviteFormValues): Locker | null => {
    const invite = (sharedNetworkByCarrier[activeCarrierId] ?? sharedNetworkData).find((i) => i.id === id)
    setSharedNetworkByCarrier((prev) => ({
      ...prev,
      [activeCarrierId]: (prev[activeCarrierId] ?? sharedNetworkData).filter((i) => i.id !== id),
    }))
    if (!invite) return null
    const newLocker: Locker = {
      name: details.lockerName,
      id: details.carrierLockerId,
      street: `${invite.address.street} ${invite.address.houseNumber}`,
      houseNumber: invite.address.houseNumber,
      postalCode: invite.address.postalCode,
      cityName: invite.address.city,
      city: `${invite.address.postalCode} ${invite.address.city}`,
      latitude: invite.geolocation.lat,
      longitude: invite.geolocation.lng,
      depot: details.depot ?? '',
      region: '',
      agency: '',
      carrierStatus: 'inactive',
      providerStatus: 'active',
      compartments: 0,
      provider: invite.provider,
      expiredParcelCount: 0,
      venueType: 'shopping_center',
      host: '',
      placement: 'outdoor',
      ownership: 'shared-carrier',
      ownedBy: invite.ownedBy.name,
      sharingEnabled: false,
      sharedWith: undefined,
      activationDate: details.activationDate,
      statusSince: details.activationDate,
      openingHours: { kind: '24/7' },
      providerLockerId: '',
      providerLockerModel: '',
      providerLockerVersion: '',
    }
    setLockerDataByCarrier((prev) => {
      const current = prev[activeCarrierId] ?? getLockerDataForCarrier(activeCarrierId)
      return {
        ...prev,
        [activeCarrierId]: [newLocker, ...current],
      }
    })
    return newLocker
  }

  const declineInvite = (id: string) => {
    const today = new Date().toISOString().slice(0, 10)
    setSharedNetworkByCarrier((prev) => ({
      ...prev,
      [activeCarrierId]: (prev[activeCarrierId] ?? sharedNetworkData).map((i) =>
        i.id === id ? { ...i, status: 'declined', statusChangedAt: today } : i,
      ),
    }))
  }

  const outgoingShares = useMemo(() => {
    return outgoingSharesByCarrier[activeCarrierId] ?? generateOutgoingShares(activeCarrierId, lockerData)
  }, [activeCarrierId, outgoingSharesByCarrier, lockerData])

  useEffect(() => {
    if (!outgoingSharesByCarrier[activeCarrierId]) {
      setOutgoingSharesByCarrier((prev) => ({
        ...prev,
        [activeCarrierId]: generateOutgoingShares(activeCarrierId, lockerData),
      }))
    }
  }, [activeCarrierId, outgoingSharesByCarrier, lockerData])

  const shareLockers = (lockerIds: string[], carrierIds: string[]): OutgoingShareInvite[] => {
    const baseLockers = lockerDataByCarrier[activeCarrierId] ?? getLockerDataForCarrier(activeCarrierId)
    const lockerById = new Map(baseLockers.map((l) => [l.id, l]))
    const targetCarriers = carriers.filter((c) => carrierIds.includes(c.id))
    const now = new Date().toISOString()
    let counter = Date.now()
    const newInvites: OutgoingShareInvite[] = []
    for (const lockerId of lockerIds) {
      const locker = lockerById.get(lockerId)
      if (!locker) continue
      for (const target of targetCarriers) {
        newInvites.push({
          id: `${activeCarrierId}-out-${counter++}`,
          lockerId: locker.id,
          lockerName: locker.name,
          address: {
            street: locker.street,
            houseNumber: locker.houseNumber,
            postalCode: locker.postalCode,
            city: locker.cityName,
          },
          provider: locker.provider,
          invitedCarrier: {
            carrierId: target.id,
            name: target.name,
            shortName: target.shortName,
            brand: target.brand,
          },
          invitedAt: now,
          statusChangedAt: now,
          status: 'pending',
        })
      }
    }
    setOutgoingSharesByCarrier((prev) => {
      const current = prev[activeCarrierId] ?? generateOutgoingShares(activeCarrierId, baseLockers)
      return {
        ...prev,
        [activeCarrierId]: [...newInvites, ...current],
      }
    })
    return newInvites
  }

  const orgContextValue = useMemo(() => ({
    carrier: activeCarrier,
    lockerData,
    parcelData: getParcelDataForCarrier(activeCarrierId),
    userData: getUserDataForCarrier(activeCarrierId),
    sharedNetworkData,
    outgoingShares,
    acceptInvite,
    declineInvite,
    shareLockers,
    updateLocker,
    addLocker,
  }), [activeCarrierId, activeCarrier, sharedNetworkData, outgoingShares, lockerData])

  const org = {
    logo: <CarrierLogo brand={activeCarrier.brand} shortName={activeCarrier.shortName} />,
    name: activeCarrier.name,
  }

  const orgItems: OrgSwitcherItem[] = carriers
    .filter(c => c.id !== activeCarrierId)
    .map(c => ({
      id: c.id,
      logo: <CarrierLogo brand={c.brand} shortName={c.shortName} size="sm" />,
      name: c.name,
    }))

  // Switching org starts a clean query for the new carrier — filters/sort/page
  // belong to the previous carrier's data and must not carry over.
  const handleOrgSwitch = (id: string) => {
    navigate(pathWithCarrier('/lockers', id))
  }

  function getTimeSinceRefresh() {
    const diff = Math.floor((Date.now() - lastRefresh) / 1000)
    if (diff < 5) return 'Last updated just now'
    if (diff < 60) return `Last updated ${diff}s ago`
    const mins = Math.floor(diff / 60)
    return `Last updated ${mins} min ago`
  }

  const [refreshLabel, setRefreshLabel] = useState(getTimeSinceRefresh())

  useEffect(() => {
    const interval = setInterval(() => setRefreshLabel(getTimeSinceRefresh()), 10000)
    return () => clearInterval(interval)
  }, [lastRefresh])

  function handleRefresh() {
    setLastRefresh(Date.now())
    setRefreshLabel('Last updated just now')
  }

  const pathname = location.pathname
  const sections: NavSection[] = [
    {
      title: 'Network Management',
      items: [
        {
          key: 'locker-overview',
          label: 'Locker Overview',
          icon: <LockerIcon className="w-4 h-4" />,
          active: pathname === '/' || pathname.startsWith('/lockers'),
        },
        {
          key: 'parcel-overview',
          label: 'Parcel Overview',
          icon: <Package size={16} />,
          active: pathname.startsWith('/parcels'),
        },
      ],
    },
    {
      title: 'Setting',
      items: [
        {
          key: 'user-management',
          label: 'User Management',
          icon: <Users size={16} />,
          active: pathname.startsWith('/users'),
        },
      ],
    },
  ]

  const handleNavClick = (key: string) => {
    const route = NAV_ROUTES[key]
    if (route) navigate(pathWithCarrier(route, activeCarrierId))
  }

  const handleUserMenuClick = (key: string) => {
    if (key === 'documentation') {
      navigate(pathWithCarrier('/documentation', activeCarrierId))
    } else if (key === 'profile') {
      setProfileOpen(true)
    } else if (key === 'preferences') {
      setPreferencesOpen(true)
    }
  }

  const onNavToggle = () => setNavCollapsed((v) => !v)

  // Opening a detail preserves the current list query in history state so the
  // detail's "back" restores the exact filtered/sorted view.
  const openLocker = useCallback(
    (locker: Locker) =>
      navigate(`/lockers/${encodeURIComponent(locker.id)}${carrierSearch(activeCarrierId)}`, {
        state: { listSearch: searchParams.toString() },
      }),
    [navigate, activeCarrierId, searchParams],
  )

  const lockerView = searchParams.get('view') === 'grid' ? 'grid' : 'list'
  const setLockerView = (view: 'grid' | 'list') => {
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev)
        if (view === 'grid') sp.set('view', 'grid')
        else sp.delete('view')
        return sp
      },
      { replace: true },
    )
  }

  const refreshSubtitle = (
    <a
      className="inline-flex items-center gap-1.5 text-sm text-text-primary font-medium tracking-[-0.14px] leading-[22px] no-underline cursor-pointer"
      onClick={handleRefresh}
    >
      {refreshLabel}
      <RefreshCw size={16} className="text-text-primary" />
    </a>
  )

  return (
    <OrgProvider value={orgContextValue}>
    <div className="flex h-screen bg-surface-surface">
      <PreferencesSidepanel
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
      <AccountSettingsSidepanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        userName={user.name}
        userEmail={user.email}
      />
      <VerticalNav
        org={org}
        orgItems={orgItems}
        sections={sections}
        user={user}
        collapsed={navCollapsed}
        onNavClick={handleNavClick}
        onUserMenuClick={handleUserMenuClick}
        onOrgSwitch={handleOrgSwitch}
      />

      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/lockers${location.search || carrierSearch(activeCarrierId)}`} replace />}
        />

        <Route
          path="/lockers"
          element={
            <div className="flex flex-1 overflow-hidden h-full">
              <main className="flex-1 overflow-auto relative min-w-0">
                <div className="px-[18px] pt-[21px]">
                  <NavBreadcrumb items={[{ label: 'Locker Overview' }]} collapsed={navCollapsed} onToggle={onNavToggle} />
                </div>
                <div className="px-[18px] pt-[12px] pb-24">
                  <PageHeader
                    title="Lockers"
                    subtitle={refreshSubtitle}
                    actions={
                      <Button
                        variant="primary"
                        size="md"
                        icon={<Plus size={16} />}
                        onClick={() => setAddLockerOpen(true)}
                      >
                        Add new Locker
                      </Button>
                    }
                  />
                  <div className="mt-6">
                    {lockerView === 'grid' ? (
                      <LockerGrid
                        onLockerClick={openLocker}
                        view="grid"
                        onViewChange={setLockerView}
                      />
                    ) : (
                      <LockerTable onLockerClick={openLocker} />
                    )}
                  </div>
                </div>
                {/* Help FAB — hidden when panel is open */}
                {!helpOpen && (
                  <HelpFab onClick={() => setHelpOpen(true)} tooltip="Ask about your lockers" />
                )}
              </main>
              {helpOpen && (
                <div className="w-[320px] shrink-0 border-l border-border-default flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex flex-col gap-1 border-b border-border-default px-5 pt-6 pb-5 shrink-0">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold leading-7 tracking-[-0.3px] text-text-foreground m-0">
                        Help
                      </h2>
                      <Button iconOnly aria-label="Close help panel" icon={<X size={15} className="text-text-foreground" />} onClick={() => setHelpOpen(false)} />
                    </div>
                    <p className="text-sm text-text-light leading-[22px] tracking-[-0.14px] m-0">
                      Ask a question, report an issue or request a new feature
                    </p>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                    {helpMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`text-sm leading-[1.6] px-3.5 py-2.5 rounded-xl max-w-[92%] ${
                          msg.role === 'bot'
                            ? 'bg-surface-secondary text-text-foreground self-start rounded-tl-sm'
                            : 'bg-surface-primary text-white self-end rounded-tr-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {/* Suggestions */}
                    {!helpSuggestionsDismissed && (
                      <div className="flex flex-col gap-2 mt-1">
                        {["A parcel is stuck or a compartment won't open", 'Cancel a booking', 'Locker data is wrong on the platform', 'Pickup code not working', 'Request a change or new feature'].map((s) => (
                          <button
                            key={s}
                            onClick={() => sendHelpMessage(s)}
                            className="text-left text-sm text-text-foreground border border-border-default rounded-lg px-3.5 py-2.5 bg-surface-card hover:bg-surface-secondary transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <div ref={helpEndRef} />
                  </div>
                  {/* Input footer */}
                  {/* AI-style chat input */}
                  <div className="shrink-0 p-3">
                    <div className="relative rounded-2xl border border-border-default bg-surface-card">
                      <textarea
                        ref={helpTextareaRef}
                        rows={3}
                        value={helpInput}
                        onChange={handleHelpInputChange}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendHelpMessage(helpInput) } }}
                        placeholder="Type your question…"
                        className="w-full resize-none bg-transparent border-0 focus:outline-none text-sm text-text-foreground placeholder:text-text-light px-4 pt-4 pb-14 leading-[1.6] rounded-2xl"
                        style={{ minHeight: '80px', maxHeight: '160px' }}
                      />
                      <button
                        onClick={() => sendHelpMessage(helpInput)}
                        disabled={!helpInput.trim()}
                        aria-label="Send"
                        className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-xl bg-surface-primary disabled:opacity-30 hover:opacity-90 transition-opacity"
                      >
                        <Send size={16} className="text-text-button" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />

        <Route
          path="/lockers/:lockerId"
          element={
            <LockerDetailRoute carrierId={activeCarrierId} navCollapsed={navCollapsed} onNavToggle={onNavToggle} initialHelpOpen={helpOpen} />
          }
        />

        <Route
          path="/parcels"
          element={
            <div className="flex flex-1 overflow-hidden h-full">
              <main className="flex-1 overflow-auto relative min-w-0">
                <div className="px-[18px] pt-[21px]">
                  <NavBreadcrumb items={[{ label: 'Parcel Overview' }]} collapsed={navCollapsed} onToggle={onNavToggle} />
                </div>
                <div className="px-[18px] pt-[12px] pb-24">
                  <PageHeader title="Parcels" subtitle={refreshSubtitle} />
                  <div className="mt-6">
                    <ParcelTable
                      onParcelClick={(parcel) =>
                        navigate(`/parcels/${encodeURIComponent(parcel.parcelId)}${carrierSearch(activeCarrierId)}`, {
                          state: { from: 'parcel-overview', listSearch: searchParams.toString() },
                        })
                      }
                    />
                  </div>
                </div>
                {/* Help FAB — hidden when panel is open */}
                {!helpOpen && (
                  <HelpFab onClick={() => setHelpOpen(true)} tooltip="Ask about your parcels" />
                )}
              </main>
              {helpOpen && (
                <div className="w-[320px] shrink-0 border-l border-border-default flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex flex-col gap-1 border-b border-border-default px-5 pt-6 pb-5 shrink-0">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold leading-7 tracking-[-0.3px] text-text-foreground m-0">
                        Help
                      </h2>
                      <Button iconOnly aria-label="Close help panel" icon={<X size={15} className="text-text-foreground" />} onClick={() => setHelpOpen(false)} />
                    </div>
                    <p className="text-sm text-text-light leading-[22px] tracking-[-0.14px] m-0">
                      Ask a question, report an issue or request a new feature
                    </p>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                    {helpMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`text-sm leading-[1.6] px-3.5 py-2.5 rounded-xl max-w-[92%] ${
                          msg.role === 'bot'
                            ? 'bg-surface-secondary text-text-foreground self-start rounded-tl-sm'
                            : 'bg-surface-primary text-white self-end rounded-tr-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {/* Suggestions */}
                    {!helpSuggestionsDismissed && (
                      <div className="flex flex-col gap-2 mt-1">
                        {["A parcel is stuck or a compartment won't open", 'Cancel a booking', 'Locker data is wrong on the platform', 'Pickup code not working', 'Request a change or new feature'].map((s) => (
                          <button
                            key={s}
                            onClick={() => sendHelpMessage(s)}
                            className="text-left text-sm text-text-foreground border border-border-default rounded-lg px-3.5 py-2.5 bg-surface-card hover:bg-surface-secondary transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <div ref={helpEndRef} />
                  </div>
                  {/* Input footer */}
                  {/* AI-style chat input */}
                  <div className="shrink-0 p-3">
                    <div className="relative rounded-2xl border border-border-default bg-surface-card">
                      <textarea
                        ref={helpTextareaRef}
                        rows={3}
                        value={helpInput}
                        onChange={handleHelpInputChange}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendHelpMessage(helpInput) } }}
                        placeholder="Type your question…"
                        className="w-full resize-none bg-transparent border-0 focus:outline-none text-sm text-text-foreground placeholder:text-text-light px-4 pt-4 pb-14 leading-[1.6] rounded-2xl"
                        style={{ minHeight: '80px', maxHeight: '160px' }}
                      />
                      <button
                        onClick={() => sendHelpMessage(helpInput)}
                        disabled={!helpInput.trim()}
                        aria-label="Send"
                        className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-xl bg-surface-primary disabled:opacity-30 hover:opacity-90 transition-opacity"
                      >
                        <Send size={16} className="text-text-button" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />

        <Route
          path="/parcels/:parcelId"
          element={
            <ParcelDetailRoute carrierId={activeCarrierId} navCollapsed={navCollapsed} onNavToggle={onNavToggle} initialHelpOpen={helpOpen} />
          }
        />

        <Route
          path="/users"
          element={<UserManagement navCollapsed={navCollapsed} onNavToggle={onNavToggle} />}
        />

        <Route
          path="/carrier-settings"
          element={
            <CarrierSettings
              navCollapsed={navCollapsed}
              onNavToggle={onNavToggle}
              carrierId={activeCarrierId}
              onViewLocker={handleViewLockerFromToast}
            />
          }
        />

        <Route
          path="/documentation"
          element={<DocumentationRoute carrierId={activeCarrierId} navCollapsed={navCollapsed} onNavToggle={onNavToggle} />}
        />
        <Route
          path="/documentation/:category"
          element={<DocumentationRoute carrierId={activeCarrierId} navCollapsed={navCollapsed} onNavToggle={onNavToggle} />}
        />
        <Route
          path="/documentation/:category/:article"
          element={<DocumentationRoute carrierId={activeCarrierId} navCollapsed={navCollapsed} onNavToggle={onNavToggle} />}
        />

        <Route path="*" element={<Navigate to={pathWithCarrier('/lockers', activeCarrierId)} replace />} />
      </Routes>

      <AddLockerSidepanel
        open={addLockerOpen}
        onClose={() => setAddLockerOpen(false)}
        onAdd={handleAddLocker}
      />

      {addLockerToast && (
        <Toast position="bottom-right" title="Locker was added to your Network">
          <button
            type="button"
            onClick={() => handleViewLockerFromToast(addLockerToast)}
            className="font-medium text-text-success hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            {addLockerToast.name}
          </button>
          {' is now listed in the Locker Overview and will be activated on '}
          {(() => {
            const [y, m, d] = addLockerToast.activationDate.split('-').map(Number)
            return new Date(y, m - 1, d).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })
          })()}
          .
        </Toast>
      )}
    </div>
    </OrgProvider>
  )
}

export default App

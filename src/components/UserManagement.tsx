import { useState, useMemo } from 'react'
import { ChevronRight, Plus, RefreshCw } from 'lucide-react'
import {
  TableHeader,
  Pagination,
  SearchInput,
  PageHeader,
  NavBreadcrumb,
  UserStatusBadge,
} from '../lib/ooh-kit'
import { Button } from '../lib/unity'
import type { UserData } from '../data/users'
import { useOrg } from '../context/OrgContext'
import InviteUserSidepanel from './InviteUserSidepanel'
import UserDetailSidepanel from './UserDetailSidepanel'

interface UserManagementProps {
  navCollapsed: boolean
  onNavToggle: () => void
}

export default function UserManagement({ navCollapsed, onNavToggle }: UserManagementProps) {
  const { userData } = useOrg()
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  const filteredUsers = useMemo(() => {
    if (!search) return userData
    const q = search.toLowerCase()
    return userData.filter((user) => user.email.toLowerCase().includes(q))
  }, [search, userData])

  const totalItems = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const page = Math.min(currentPage, totalPages)
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <main className="flex-1 overflow-auto">
      <InviteUserSidepanel open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <UserDetailSidepanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      <div className="px-[18px] pt-[21px]">
        <NavBreadcrumb
          items={[{ label: 'User Management' }]}
          collapsed={navCollapsed}
          onToggle={onNavToggle}
        />
      </div>
      <div className="px-[18px] pt-[12px]">
        <PageHeader
          title="Users"
          subtitle={
            <a className="inline-flex items-center gap-1.5 text-sm text-text-primary font-medium tracking-[-0.14px] leading-[22px] no-underline cursor-pointer">
              Last updated 2 min ago
              <RefreshCw size={16} className="text-text-primary" />
            </a>
          }
          actions={
            <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={() => setInviteOpen(true)}>
              Invite User
            </Button>
          }
        />

        <div className="mt-6">
          <div className="flex flex-col gap-12">
            {/* Search */}
            <div className="flex items-center gap-3 h-[38px]">
              <SearchInput
                placeholder="Search by email"
                value={search}
                onChange={setSearch}
              />
            </div>

            {/* Table */}
            <div className="flex flex-col -mt-8">
              <div className="border border-border-default rounded-[10px] overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TableHeader label="Email" width="w-[280px]" />
                      <TableHeader label="Role" width="w-[160px]" />
                      <TableHeader label="Status" width="w-[220px]" />
                      <TableHeader label="Last Login" width="w-[280px]" />
                      <th className="bg-surface-card border-b border-border-default h-9 w-[59px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, i) => (
                      <tr key={i} className="group cursor-pointer" onClick={() => setSelectedUser(user)}>
                        {/* Email */}
                        <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[10px] bg-text-muted flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-white">
                                {user.initials}
                              </span>
                            </div>
                            <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[22px] truncate">
                              {user.email}
                            </span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                          <span className="inline-flex items-center justify-center h-6 px-2 py-1 rounded-[10px] border border-border-default bg-surface-bg text-text-foreground font-medium whitespace-nowrap text-xs tracking-[-0.14px] leading-[18px] uppercase">
                            {user.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                          <UserStatusBadge status={user.status} since={user.statusSince} />
                        </td>

                        {/* Last Login */}
                        <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                          <span className="text-sm text-text-foreground tracking-[-0.14px] leading-[22px]">
                            {user.lastLogin}
                          </span>
                        </td>

                        {/* Chevron */}
                        <td className="bg-surface-card group-hover:bg-surface-card-hover transition-colors border-b border-border-light h-[54px] px-4 py-2">
                          <div className="flex items-center justify-center">
                            <ChevronRight
                              size={20}
                              className="text-text-light group-hover:text-text-foreground transition-colors"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="bg-surface-card border-b border-border-light h-[54px] px-4 py-2 text-center"
                        >
                          <span className="text-sm text-text-light tracking-[-0.14px]">
                            No users match your search
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

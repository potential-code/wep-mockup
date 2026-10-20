import { ROLE_SHORT } from '@shared/reference'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, CircleHelp, LogOut, Search, Sparkles, Trophy, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DemoControls } from '@/components/layout/DemoControls'
import { useRouteTitle } from '@/components/layout/PageHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useCurrentUser } from '@/hooks/use-session'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useMyPoints } from '@/queries/learning.queries'
import {
  type SearchResult,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useSearch,
} from '@/queries/notifications.queries'
import { useSignOut } from '@/queries/session.queries'

export function AppTopBar() {
  const { user, company } = useCurrentUser()
  const title = useRouteTitle()
  const isCompanyUser =
    user?.role === 'ceo' || user?.role === 'company_admin' || user?.role === 'employee'
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-white/85 px-3 backdrop-blur-md sm:gap-3 sm:px-6">
      <SidebarTrigger className="-ms-1 text-navy" aria-label="Toggle navigation" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading font-medium text-navy">{title}</p>
        <p className="hidden truncate text-muted-foreground text-xs sm:block">
          {company?.name ??
            (user?.role === 'global_admin' ? 'UN Women · WEPs Secretariat' : 'WEPs expert network')}
        </p>
      </div>
      <GlobalSearch />
      {isCompanyUser && company?.signatoryStatus === 'approved' ? <PointsChip /> : null}
      <div className="hidden md:block">
        <DemoControls />
      </div>
      <HelpMenu />
      <NotificationsMenu />
      <UserMenu />
    </header>
  )
}

function PointsChip() {
  const { data } = useMyPoints()
  return (
    <Link
      to="/portal/points"
      className="hidden items-center gap-1.5 rounded-full bg-coral-50 px-3 py-1.5 font-semibold text-coral-700 text-sm ring-1 ring-coral/30 transition-colors hover:bg-coral/20 sm:inline-flex"
      aria-label={`${data?.balance.redeemable ?? 0} redeemable points. Open points and rewards`}
    >
      <Trophy className="size-4" aria-hidden />
      <span className="tabular-nums">{data?.balance.redeemable ?? '—'}</span>
      <span className="font-normal text-xs">pts</span>
    </Link>
  )
}

function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const { data, isFetching } = useSearch(q)
  const navigate = useNavigate()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const groups = (data ?? []).reduce<Record<string, SearchResult[]>>((acc, r) => {
    acc[r.type] = [...(acc[r.type] ?? []), r]
    return acc
  }, {})
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-56 justify-start gap-2 text-muted-foreground lg:inline-flex"
      >
        <Search aria-hidden /> Search
        <kbd className="ms-auto rounded border bg-muted px-1.5 font-mono text-[10px]">Ctrl K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="lg:hidden"
        aria-label="Search"
      >
        <Search />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search the portal"
        description="Search records you have access to"
      >
        <CommandInput
          placeholder="Search courses, resources, clinics, records…"
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          <CommandEmpty>
            {q.length < 2
              ? 'Type at least two characters.'
              : isFetching
                ? 'Searching…'
                : 'No results you have access to.'}
          </CommandEmpty>
          {Object.entries(groups).map(([type, items]) => (
            <CommandGroup key={type} heading={type}>
              {items.map((r) => (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  value={`${r.title} ${r.subtitle ?? ''} ${r.id}`}
                  onSelect={() => {
                    setOpen(false)
                    navigate({ to: r.to })
                  }}
                >
                  <div className="grid">
                    <span>{r.title}</span>
                    {r.subtitle ? (
                      <span className="text-muted-foreground text-xs">{r.subtitle}</span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

function NotificationsMenu() {
  const { data } = useNotifications()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const navigate = useNavigate()
  const unread = data?.filter((n) => !n.read).length ?? 0
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications, ${unread} unread`}
        >
          <Bell />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 font-bold text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,380px)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-heading font-medium text-navy">Notifications</p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => markAll.mutate()}
            disabled={unread === 0}
          >
            Mark all read
          </Button>
        </div>
        <ul className="max-h-[60vh] divide-y overflow-y-auto" data-lenis-prevent>
          {(data ?? []).slice(0, 8).map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  markRead.mutate(n.id)
                  if (n.link) navigate({ to: n.link })
                }}
                className={cn(
                  'grid w-full gap-0.5 px-4 py-3 text-start transition-colors hover:bg-surface',
                  !n.read && 'bg-blue-50/60',
                )}
              >
                <span className="flex items-center gap-2 font-medium text-navy text-sm">
                  {!n.read ? (
                    <span className="size-2 shrink-0 rounded-full bg-blue">
                      <span className="sr-only">Unread</span>
                    </span>
                  ) : null}
                  {n.title}
                  {n.critical ? (
                    <span className="ms-auto rounded bg-danger-soft px-1.5 font-semibold text-[10px] text-danger uppercase">
                      Important
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-2 text-muted-foreground text-xs">{n.body}</span>
                <span className="text-[11px] text-muted-foreground">
                  {relativeTime(n.createdAt)}
                </span>
              </button>
            </li>
          ))}
          {data && data.length === 0 ? (
            <li className="px-4 py-8 text-center text-muted-foreground text-sm">
              You’re all caught up.
            </li>
          ) : null}
        </ul>
        <div className="border-t p-2">
          <Button asChild variant="ghost" className="w-full">
            <Link to="/portal/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function HelpMenu() {
  const { user } = useCurrentUser()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Help" className="hidden sm:inline-flex">
          <CircleHelp />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="font-heading font-medium text-navy">Need a hand?</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Ask the AI Concierge about anything on this page, or contact the WEPs team.
        </p>
        <div className="mt-3 grid gap-2">
          {user?.role !== 'global_admin' ? (
            <Button asChild size="sm">
              <Link to="/portal/concierge">
                <Sparkles aria-hidden /> Ask the AI Concierge
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="outline">
            <a href="mailto:weps@unwomen.org">Email weps@unwomen.org</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function UserMenu() {
  const { user } = useCurrentUser()
  const signOut = useSignOut()
  const qc = useQueryClient()
  const navigate = useNavigate()
  if (!user) return null
  const name = `${user.firstName} ${user.lastName}`
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-0.5 focus-visible:outline-2"
          aria-label={`Account menu for ${name}`}
        >
          <UserAvatar name={name} src={user.avatar} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="grid">
          <span className="font-semibold">{name}</span>
          <span className="font-normal text-muted-foreground text-xs">{user.email}</span>
          <span className="mt-1 w-fit rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue text-xs">
            {ROLE_SHORT[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={user.role === 'mentor' ? '/expert/profile' : '/portal/profile'}>
            <UserIcon aria-hidden /> My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/portal/notifications">
            <Bell aria-hidden /> Notification settings
          </Link>
        </DropdownMenuItem>
        <div className="md:hidden">
          <DropdownMenuSeparator />
          <div className="p-1">
            <DemoControls />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut.mutateAsync()
            qc.clear()
            navigate({ to: '/sign-in' })
          }}
        >
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

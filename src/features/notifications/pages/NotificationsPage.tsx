import type { Notification } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Award,
  BellOff,
  BookOpen,
  CalendarDays,
  CheckCheck,
  FileText,
  Lock,
  Mail,
  MessagesSquare,
  Settings2,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { type ComponentType, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar, SectionCard } from '@/components/shared/Cards'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatDateTime, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  PREFERENCE_CATEGORIES,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  usePreferences,
  useSetPreference,
} from '@/queries/notifications.queries'

type Category = Notification['category']

const CATEGORY: Record<Category, { label: string; icon: ComponentType<{ className?: string }> }> = {
  application: { label: 'Account and application', icon: UserCheck },
  team: { label: 'Team', icon: UsersRound },
  learning: { label: 'Learning', icon: BookOpen },
  clinic: { label: 'Clinics', icon: CalendarDays },
  mentorship: { label: 'Mentoring', icon: UsersRound },
  report: { label: 'Reporting', icon: FileText },
  certification: { label: 'Certification', icon: Award },
  community: { label: 'Community', icon: MessagesSquare },
  system: { label: 'System', icon: Settings2 },
}

export function NotificationsPage() {
  const { data, isLoading, error, refetch } = useNotifications()
  const markAll = useMarkAllRead()
  const [scope, setScope] = useState<'all' | 'unread'>('all')
  const [category, setCategory] = useState('all')
  const [email, setEmail] = useState<Notification | null>(null)
  const [shown, setShown] = useState(5)

  const items = data ?? []
  const unread = items.filter((n) => !n.read).length
  const filtered = useMemo(
    () =>
      items.filter(
        (n) => (scope === 'all' || !n.read) && (category === 'all' || n.category === category),
      ),
    [items, scope, category],
  )
  const present = useMemo(() => [...new Set(items.map((n) => n.category))], [items])

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div>
      <PageHeader
        title="Notifications"
        actions={
          <Button
            variant="outline"
            disabled={unread === 0 || markAll.isPending}
            onClick={() =>
              markAll.mutate(undefined, {
                onSuccess: () => toast.success('All notifications marked as read'),
              })
            }
          >
            <CheckCheck aria-hidden /> Mark all read
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <FilterBar count={filtered.length}>
            <ToggleGroup
              type="single"
              value={scope}
              onValueChange={(v) => v && setScope(v as 'all' | 'unread')}
              variant="outline"
              aria-label="Show"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="unread">Unread ({unread})</ToggleGroupItem>
            </ToggleGroup>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Filter by category" className="w-full bg-card sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {present.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterBar>

          {isLoading ? (
            <div className="grid gap-3" role="status" aria-label="Loading notifications">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title={scope === 'unread' ? 'You’re all caught up' : 'No notifications yet'}
              description={
                scope === 'unread'
                  ? 'There is nothing unread. Switch to All to see earlier updates.'
                  : 'Updates about your account, learning, clinics and reports appear here.'
              }
            />
          ) : (
            <ul className="grid gap-3">
              {filtered.slice(0, shown).map((n) => (
                <Item key={n.id} n={n} onEmail={() => setEmail(n)} />
              ))}
            </ul>
          )}
          {filtered.length > shown ? (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setShown((n) => n + 5)}>
                Show more ({filtered.length - shown} more)
              </Button>
            </div>
          ) : null}
        </div>
        <Preferences />
      </div>
      <EmailDrawer n={email} onClose={() => setEmail(null)} />
    </div>
  )
}

function Item({ n, onEmail }: { n: Notification; onEmail: () => void }) {
  const markRead = useMarkRead()
  const meta = CATEGORY[n.category]
  const Icon = n.critical ? AlertTriangle : meta.icon
  return (
    <li
      className={cn(
        'relative grid gap-2 rounded-2xl border bg-card p-4 shadow-card sm:p-5',
        n.critical && !n.read && 'border-danger/40 bg-danger-soft/30',
        !n.read && !n.critical && 'border-blue/30',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl',
            n.critical ? 'bg-danger-soft text-danger' : 'bg-blue-50 text-blue',
          )}
        >
          <Icon className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className={cn('text-base text-navy', !n.read ? 'font-medium' : 'font-medium')}>
              {!n.read ? (
                <span
                  className="me-2 inline-block size-2 rounded-full bg-blue align-middle"
                  aria-hidden
                />
              ) : null}
              {n.title}
              {!n.read ? <span className="sr-only"> (unread)</span> : null}
            </h2>
            {n.critical ? <StatusBadge tone="danger">Important</StatusBadge> : null}
          </div>
          <p className="mt-0.5 text-muted-foreground text-sm">{n.body}</p>
          <p className="mt-1.5 text-muted-foreground text-xs">
            {meta.label} ·{' '}
            <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>
              {relativeTime(n.createdAt)}
            </time>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 ps-12">
        {n.link ? (
          <Button asChild size="sm" onClick={() => !n.read && markRead.mutate(n.id)}>
            <Link to={n.link as string}>Open</Link>
          </Button>
        ) : null}
        {n.emailPreview ? (
          <Button size="sm" variant="outline" onClick={onEmail}>
            <Mail aria-hidden /> View email
          </Button>
        ) : null}
        {!n.read ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={markRead.isPending}
            onClick={() => markRead.mutate(n.id)}
          >
            Mark read
          </Button>
        ) : null}
      </div>
    </li>
  )
}

function EmailDrawer({ n, onClose }: { n: Notification | null; onClose: () => void }) {
  return (
    <Sheet open={Boolean(n)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {n?.emailPreview ? (
          <>
            <SheetHeader>
              <SheetTitle>Email preview</SheetTitle>
              <SheetDescription>The email that goes with this notification.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-3 px-4 pb-6">
              <p className="text-muted-foreground text-xs justify-self-start">
                Simulated — no email sent
              </p>
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="grid gap-0.5 border-b bg-surface p-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">To:</span> {n.emailPreview.to}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Subject:</span>{' '}
                    <span className="font-medium text-navy">{n.emailPreview.subject}</span>
                  </p>
                </div>
                <div className="grid gap-3 p-5 text-sm">
                  {n.emailPreview.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {n.link ? (
                    <Button asChild className="justify-self-start">
                      <Link to={n.link as string} onClick={onClose}>
                        Open in the portal
                      </Link>
                    </Button>
                  ) : null}
                  <p className="border-t pt-3 text-muted-foreground text-xs">
                    UN Women · Women’s Empowerment Principles
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Preferences() {
  const { data } = usePreferences()
  const set = useSetPreference()
  return (
    <aside aria-label="Notification preferences" className="self-start">
      <SectionCard title="Email preferences">
        <ul className="grid gap-3">
          {PREFERENCE_CATEGORIES.map((c) => {
            const on = c.critical ? true : (data?.[c.id] ?? true)
            const id = `pref-${c.id}`
            return (
              <li key={c.id} className="flex items-center justify-between gap-3">
                <div className="grid">
                  <label htmlFor={id} className="font-medium text-navy text-sm">
                    {c.label}
                  </label>
                  {c.critical ? (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Lock className="size-3" aria-hidden /> Required notice, can’t be turned off
                    </span>
                  ) : null}
                </div>
                <Switch
                  id={id}
                  checked={on}
                  disabled={c.critical || set.isPending}
                  onCheckedChange={(v) =>
                    set.mutate(
                      { category: c.id, enabled: v },
                      { onSuccess: () => toast.success(`${c.label} ${v ? 'on' : 'off'}`) },
                    )
                  }
                />
              </li>
            )
          })}
        </ul>
      </SectionCard>
    </aside>
  )
}

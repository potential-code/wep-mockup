import { principleById } from '@shared/reference'
import type { MentorBooking } from '@shared/types'
import { AlertTriangle, Check, UsersRound, X } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { useUsersTable } from '@/queries/admin.queries'
import { useAllMentorData, useApproveExpertProfile } from '@/queries/mentorship.queries'

type Mentor = NonNullable<ReturnType<typeof useAllMentorData>['data']>['profiles'][number]

interface Availability {
  mentor: Mentor
  open: number
  booked: number
  blocked: number
  completed: number
}

export function ManageMentorshipPage() {
  const { data, isLoading, error, refetch } = useAllMentorData()
  const users = useUsersTable({})
  const approve = useApproveExpertProfile()

  const names = useMemo(
    () =>
      new Map((users.data ?? []).map((r) => [r.user.id, `${r.user.firstName} ${r.user.lastName}`])),
    [users.data],
  )

  const view = useMemo(() => {
    if (!data) return null
    const pending = data.profiles.filter((p) => p.profile.pendingApproval)
    const availability: Availability[] = data.profiles
      .filter((p) => !p.profile.pendingApproval)
      .map((m) => {
        const s = data.slots.filter((x) => x.mentorId === m.profile.userId)
        return {
          mentor: m,
          open: s.filter((x) => x.status === 'open').length,
          booked: s.filter((x) => x.status === 'booked').length,
          blocked: s.filter((x) => x.status === 'blocked').length,
          completed: data.bookings.filter(
            (b) => b.mentorId === m.profile.userId && b.status === 'completed',
          ).length,
        }
      })
    const exceptions = data.bookings.filter(
      (b) => b.status === 'cancellation_review' || b.status === 'no_show',
    )
    const topics = new Map<string, number>()
    for (const p of data.profiles.filter((x) => x.profile.published))
      for (const t of p.profile.expertise) topics.set(t, (topics.get(t) ?? 0) + 1)
    return {
      pending,
      availability,
      exceptions,
      topics: [...topics.entries()].sort((a, b) => b[1] - a[1]),
    }
  }, [data])

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isLoading || !view || !data) return <PageSkeleton />

  const decide = (userId: string, ok: boolean, name: string) =>
    approve.mutate(
      { userId, approve: ok },
      {
        onSuccess: () => toast.success(ok ? `${name} approved and published` : `${name} declined`),
      },
    )

  const avCols: Column<Availability>[] = [
    {
      key: 'name',
      header: 'Mentor / trainer',
      sortValue: (r) => r.mentor.name,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={r.mentor.name} src={r.mentor.avatar} />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{r.mentor.name}</p>
            <p className="truncate text-muted-foreground text-xs">{r.mentor.profile.headline}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'open',
      header: 'Open slots',
      align: 'end',
      sortValue: (r) => r.open,
      cell: (r) => r.open,
    },
    {
      key: 'booked',
      header: 'Booked',
      align: 'end',
      sortValue: (r) => r.booked,
      cell: (r) => r.booked,
    },
    {
      key: 'blocked',
      header: 'Blocked',
      align: 'end',
      sortValue: (r) => r.blocked,
      cell: (r) => r.blocked,
      hideOnMobile: true,
    },
    {
      key: 'completed',
      header: 'Completed',
      align: 'end',
      sortValue: (r) => r.completed,
      cell: (r) => r.completed,
    },
    {
      key: 'util',
      header: 'Utilisation',
      align: 'end',
      sortValue: (r) => (r.open + r.booked ? r.booked / (r.open + r.booked) : 0),
      cell: (r) =>
        r.open + r.booked ? `${Math.round((r.booked / (r.open + r.booked)) * 100)}%` : '—',
    },
  ]
  const exCols: Column<MentorBooking>[] = [
    { key: 'who', header: 'Participant', cell: (b) => names.get(b.userId) ?? b.userId },
    { key: 'mentor', header: 'Mentor', cell: (b) => names.get(b.mentorId) ?? b.mentorId },
    {
      key: 'when',
      header: 'Session',
      sortValue: (b) => data.slots.find((s) => s.id === b.slotId)?.startsAt ?? '',
      cell: (b) => formatDateTime(data.slots.find((s) => s.id === b.slotId)?.startsAt),
    },
    { key: 'status', header: 'Exception', cell: (b) => <WorkflowStatus status={b.status} /> },
    { key: 'points', header: 'Points at stake', align: 'end', cell: (b) => b.pointsCost },
  ]

  return (
    <div>
      <PageHeader
        title="Mentorship"
        description="Approve expert profiles, monitor availability and review exceptions."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Profiles awaiting approval"
          value={view.pending.length}
          tone="gold"
          icon={UsersRound}
        />
        <StatCard label="Open slots" value={data.slots.filter((s) => s.status === 'open').length} />
        <StatCard
          label="Exceptions to review"
          value={view.exceptions.length}
          tone="danger"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-6">
        <SectionCard
          title="Expert profiles awaiting approval"
          description="Profiles are published to learners only after approval."
        >
          {view.pending.length === 0 ? (
            <EmptyState
              title="Nothing waiting"
              description="New and edited expert profiles appear here for review."
            />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {view.pending.map((m) => (
                <li key={m.profile.userId} className="grid gap-3 rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={m.name} src={m.avatar} className="size-11" />
                    <div className="min-w-0">
                      <p className="font-medium text-navy">{m.name}</p>
                      <p className="truncate text-muted-foreground text-xs">{m.title}</p>
                    </div>
                  </div>
                  <p className="text-sm">{m.profile.headline}</p>
                  <p className="line-clamp-3 text-muted-foreground text-sm">{m.profile.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.profile.expertise.map((e) => (
                      <StatusBadge key={e} tone="info" icon={null}>
                        {e}
                      </StatusBadge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={approve.isPending}
                      onClick={() => decide(m.profile.userId, true, m.name)}
                    >
                      <Check aria-hidden /> Approve and publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approve.isPending}
                      onClick={() => decide(m.profile.userId, false, m.name)}
                    >
                      <X aria-hidden /> Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Support topics"
          description="Topics offered by published experts. Gaps help decide who to invite next."
        >
          <div className="flex flex-wrap gap-2">
            {view.topics.map(([t, n]) => (
              <StatusBadge key={t} tone="neutral" icon={null}>
                {t} · {n}
              </StatusBadge>
            ))}
          </div>
          <p className="mt-4 text-muted-foreground text-xs">
            Principle coverage:{' '}
            {[1, 2, 3, 4, 5, 6, 7]
              .map(
                (id) =>
                  `P${id} ${principleById(id as 1).short} (${data.profiles.filter((p) => p.profile.published && p.profile.principles.includes(id as 1)).length})`,
              )
              .join(' · ')}
          </p>
        </SectionCard>

        <section aria-labelledby="av">
          <h2 id="av" className="mb-3 font-heading font-semibold text-lg text-navy">
            Availability and bookings
          </h2>
          <DataTable
            caption="Availability"
            columns={avCols}
            rows={view.availability}
            getRowId={(r) => r.mentor.profile.userId}
          />
        </section>

        <section aria-labelledby="ex">
          <h2 id="ex" className="mb-1 font-heading font-semibold text-lg text-navy">
            Exceptions
          </h2>
          <p className="mb-3 text-muted-foreground text-sm">
            Late cancellations inside the cancellation window are held for review; no-shows are
            recorded for follow-up.
          </p>
          <DataTable
            caption="Exceptions"
            columns={exCols}
            rows={view.exceptions}
            getRowId={(b) => b.id}
            empty="No exceptions to review."
          />
        </section>
      </div>
    </div>
  )
}

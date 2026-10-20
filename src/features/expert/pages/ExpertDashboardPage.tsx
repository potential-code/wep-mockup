import { Link } from '@tanstack/react-router'
import { Building2, CalendarDays, ClipboardCheck, UsersRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { useCurrentUser } from '@/hooks/use-session'
import { useExpertDashboard, useExpertSchedule } from '@/queries/mentorship.queries'
import { ScheduleItemCard } from '../components/ScheduleItemCard'

export function ExpertDashboardPage() {
  const { user } = useCurrentUser()
  const dash = useExpertDashboard()
  const schedule = useExpertSchedule()

  if (dash.isLoading || schedule.isLoading) return <PageSkeleton />
  if (dash.isError || schedule.isError || !dash.data || !schedule.data)
    return (
      <ErrorState
        message={dash.error?.message ?? schedule.error?.message}
        onRetry={() => {
          dash.refetch()
          schedule.refetch()
        }}
      />
    )
  const d = dash.data
  const items = schedule.data.items
  const upcoming = items.filter((i) => i.status === 'booked' || i.status === 'scheduled')
  const next = upcoming[0]
  const oneToOne = upcoming.filter((i) => i.kind === 'booking')
  const clinics = upcoming.filter((i) => i.kind === 'clinic')
  const hasOne = d.formats.includes('one_to_one')
  const hasGroup = d.formats.includes('group')
  const viewAll = (
    <Link to="/expert/calendar" className="font-medium text-blue text-sm hover:underline">
      View all
    </Link>
  )
  const pending = d.profile?.pendingApproval

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.firstName ?? ''}`} />
      {pending ? (
        <p role="status" className="mb-6 rounded-xl border border-coral/40 bg-coral-50 p-4 text-sm">
          Your profile changes are awaiting UN Women approval.{' '}
          <Link to="/expert/profile" className="font-medium underline">
            View profile
          </Link>
        </p>
      ) : null}

      <Stagger className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Upcoming sessions"
            value={d.upcomingBookings + d.upcomingEvents}
            icon={CalendarDays}
            to="/expert/calendar"
            hint={`${d.upcomingBookings} one-to-one · ${d.upcomingEvents} group`}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Assigned companies" value={d.companies} icon={Building2} tone="navy" />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Participants supported"
            value={d.participants}
            icon={UsersRound}
            tone="success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Follow-up tasks"
            value={d.followUps}
            icon={ClipboardCheck}
            tone="coral"
            hint="Completed sessions to close out"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <SectionCard title="Next up">
          {next ? (
            <ScheduleItemCard item={next} />
          ) : (
            <EmptyState
              title="Nothing scheduled"
              description="Open more availability to receive bookings."
            />
          )}
        </SectionCard>
        <div className="grid gap-6">
          {hasOne ? (
            <SectionCard title="One-to-one bookings" action={viewAll}>
              {oneToOne.length ? (
                <div className="grid gap-3">
                  {oneToOne.slice(0, 3).map((i) => (
                    <ScheduleItemCard key={i.id} item={i} compact />
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming bookings" />
              )}
            </SectionCard>
          ) : null}
          {hasGroup ? (
            <SectionCard title="Scheduled clinics" action={viewAll}>
              {clinics.length ? (
                <div className="grid gap-3">
                  {clinics.slice(0, 3).map((i) => (
                    <ScheduleItemCard key={i.id} item={i} compact />
                  ))}
                </div>
              ) : (
                <EmptyState title="No scheduled clinics" />
              )}
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}

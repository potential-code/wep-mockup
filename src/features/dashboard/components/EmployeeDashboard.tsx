import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { ContinueHero } from '@/features/dashboard/components/employee/ContinueHero'
import { ContributionsCard } from '@/features/dashboard/components/employee/ContributionsCard'
import {
  CommunityThreads,
  ConciergeChips,
  CredentialSummary,
  RecommendedResources,
} from '@/features/dashboard/components/employee/DiscoverCards'
import { PathwayList } from '@/features/dashboard/components/employee/PathwayList'
import { PersonalCards } from '@/features/dashboard/components/employee/PersonalCards'
import { UnlockClinicPanel } from '@/features/dashboard/components/employee/UnlockClinicPanel'
import { useCurrentUser } from '@/hooks/use-session'
import { useEmployeeDashboard } from '@/queries/company.queries'
import { useMyLearning } from '@/queries/learning.queries'

export function EmployeeDashboard() {
  const { user, company } = useCurrentUser()
  const dash = useEmployeeDashboard()
  const learning = useMyLearning()

  if (dash.isLoading || learning.isLoading || !user) return <PageSkeleton />
  if (dash.isError || learning.isError || !dash.data || !learning.data)
    return (
      <ErrorState
        message={dash.error?.message ?? learning.error?.message}
        onRetry={() => {
          dash.refetch()
          learning.refetch()
        }}
      />
    )
  const d = dash.data
  const l = learning.data
  const lessonTotal = l.courses.reduce((n, c) => n + c.completion.total, 0)
  const lessonDone = l.courses.reduce((n, c) => n + c.completion.done, 0)
  const pathPercent = Math.round((lessonDone / Math.max(1, lessonTotal)) * 100)
  const registration = d.registrations.find((r) => r.event?.id === d.path.clinicId)
  const booking = d.bookings[0]
  const nextReg = d.registrations.find((r) => r.registration.status === 'registered')
  const next = booking
    ? {
        title: `Mentoring with ${booking.mentor?.firstName ?? 'your mentor'}`,
        at: booking.slot?.startsAt,
        to: '/portal/mentorship/bookings',
      }
    : nextReg?.event
      ? {
          title: nextReg.event.title,
          at: nextReg.event.startsAt,
          to: `/portal/clinics/${nextReg.event.id}`,
        }
      : undefined

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={`${company?.name ?? ''} · ${d.department}`}
        title={`Welcome back, ${user.firstName}`}
        description="Your personalised pathway is built from your department and your company’s priorities."
      />
      <ContinueHero current={l.current} firstName={user.firstName} />
      <PersonalCards
        pathPercent={pathPercent}
        lifetime={d.balance.lifetime}
        redeemable={d.balance.redeemable}
        clinicTitle={d.clinicEvent?.title}
        clinicId={d.clinicEvent?.id}
        clinic={d.clinic}
        clinicRegistered={registration?.registration.status === 'registered'}
        next={next}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <PathwayList courses={l.courses} title={l.path.title} departmentLabel={l.departmentLabel} />
        <UnlockClinicPanel
          eligibility={d.clinic}
          event={d.clinicEvent}
          registered={Boolean(registration)}
        />
      </div>
      <ContributionsCard actions={d.contributions} userId={user.id} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecommendedResources resources={d.recommendedResources} />
        <CommunityThreads threads={d.recentThreads} />
      </div>
      <ConciergeChips />
      <CredentialSummary items={d.credentials} />
    </div>
  )
}

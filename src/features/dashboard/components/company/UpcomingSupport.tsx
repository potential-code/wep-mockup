import { fullName } from '@shared/permissions'
import { Link } from '@tanstack/react-router'
import { BookOpen, CalendarDays, UserRound } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { formatDate, formatDateTime } from '@/lib/format'
import type { CompanyDashboardData } from '@/queries/company.queries'

/** Next clinics, booked mentoring and one recommended next step. */
export function UpcomingSupport({ data }: { data: CompanyDashboardData }) {
  const need = data.assessment?.needs.find((n) => n.courseId)
  return (
    <SectionCard
      title="Upcoming support"
      description="Clinics, mentoring and a suggested next step"
    >
      <ul className="grid gap-3 text-sm">
        {data.upcomingEvents.slice(0, 2).map((e) => (
          <li key={e.id}>
            <Link
              to="/portal/clinics/$eventId"
              params={{ eventId: e.id }}
              className="flex items-start gap-3 rounded-xl border p-3 hover:border-blue"
            >
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden />
              <span>
                <span className="block font-medium text-navy">{e.title}</span>
                <span className="text-muted-foreground text-xs">{formatDateTime(e.startsAt)}</span>
              </span>
            </Link>
          </li>
        ))}
        {data.bookings.slice(0, 2).map((b) => (
          <li key={b.booking.id}>
            <Link
              to="/portal/mentorship/bookings"
              className="flex items-start gap-3 rounded-xl border p-3 hover:border-blue"
            >
              <UserRound className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
              <span>
                <span className="block font-medium text-navy">
                  Mentoring{b.mentor ? ` with ${fullName(b.mentor)}` : ''}
                </span>
                <span className="text-muted-foreground text-xs">
                  {b.slot ? formatDate(b.slot.startsAt) : 'Booked'} · {b.booking.purpose}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {need?.courseId ? (
          <li>
            <Link
              to="/portal/learn/$courseId"
              params={{ courseId: need.courseId }}
              className="flex items-start gap-3 rounded-xl border border-dashed bg-surface p-3 hover:border-blue"
            >
              <BookOpen className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
              <span>
                <span className="block text-muted-foreground text-xs">
                  Recommended from your assessment
                </span>
                <span className="font-medium text-navy">{need.title}</span>
              </span>
            </Link>
          </li>
        ) : null}
      </ul>
    </SectionCard>
  )
}

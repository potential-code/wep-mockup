import { Link } from '@tanstack/react-router'
import { CalendarClock } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { AnimatedBar } from '@/features/company/components/AnimatedBar'
import { formatDate } from '@/lib/format'
import type { CompanyDashboardData } from '@/queries/company.queries'

/** The company's three approved priorities with owner, deadline and progress. */
export function PriorityList({ priorities }: { priorities: CompanyDashboardData['priorities'] }) {
  return (
    <SectionCard
      title="Company priorities"
      action={
        <Link to="/portal/action-plan" className="text-blue text-sm hover:underline">
          Open action plan
        </Link>
      }
    >
      <ul className="grid gap-4">
        {priorities.slice(0, 3).map((p) => (
          <li key={p.id} className="grid gap-2.5 rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium text-navy leading-snug">{p.title}</p>
              <PrincipleTag id={p.principle} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
              {p.owner ? (
                <span className="flex items-center gap-2">
                  <UserAvatar
                    name={`${p.owner.firstName} ${p.owner.lastName}`}
                    src={p.owner.avatar}
                    className="size-6"
                  />
                  {p.owner.firstName} {p.owner.lastName}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5" aria-hidden /> {formatDate(p.dueDate)}
              </span>
              <span className="ms-auto font-semibold text-navy tabular-nums">{p.progress}%</span>
            </div>
            <AnimatedBar value={p.progress} label={`${p.title} progress`} />
          </li>
        ))}
        {priorities.length === 0 ? (
          <li className="text-muted-foreground text-sm">No priorities have been approved yet.</li>
        ) : null}
      </ul>
    </SectionCard>
  )
}

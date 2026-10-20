import { PRINCIPLES } from '@shared/reference'
import type { PrincipleId } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { SectionCard } from '@/components/shared/Cards'
import { plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useActions } from '@/queries/assessment.queries'

/** Seven principles as a navigation aid into the action plan. Deliberately not a score. */
export function PrincipleSummary({ priorities }: { priorities: PrincipleId[] }) {
  const { data } = useActions()
  const count = (id: number) => data?.actions.filter((a) => a.action.principle === id).length ?? 0
  return (
    <SectionCard
      title="Seven principles"
      description="Open any principle to see its actions. This is for navigation, not a composite score."
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {PRINCIPLES.map((p) => (
          <li key={p.id}>
            <Link
              to="/portal/action-plan"
              search={{ principle: String(p.id) }}
              className={cn(
                'grid h-full gap-1.5 rounded-xl border p-3 text-center transition-colors hover:border-blue hover:bg-blue-50/50',
                priorities.includes(p.id) && 'border-coral/50 bg-coral-50/40',
              )}
            >
              <img src={p.icon} alt="" className="mx-auto size-10" />
              <span className="font-medium text-navy text-xs leading-tight">{p.short}</span>
              <span className="text-muted-foreground text-xs">{plural(count(p.id), 'action')}</span>
              {priorities.includes(p.id) ? (
                <span className="font-semibold text-[11px] text-coral-700 uppercase tracking-wide">
                  Priority
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

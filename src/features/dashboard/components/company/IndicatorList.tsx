import { Link } from '@tanstack/react-router'
import { FileCheck2, FileQuestion } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { CompanyDashboardData } from '@/queries/company.queries'

/** Company-reported indicators, always labelled with period and evidence status. */
export function IndicatorList({ data }: { data: CompanyDashboardData }) {
  return (
    <SectionCard
      title={<span className="flex flex-wrap items-center gap-2">Company-reported indicators</span>}
      description={`Self-reported, ${data.indicatorsYear} · not verified`}
      action={
        <Link to="/portal/reports" className="text-blue text-sm hover:underline">
          View all
        </Link>
      }
    >
      {data.indicators.length === 0 ? (
        <p className="text-muted-foreground text-sm">No indicators have been reported yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.indicators.slice(0, 4).map((i) => (
            <li key={i.id} className="grid gap-1.5 rounded-xl border p-3.5">
              <PrincipleTag id={i.principle} linked={false} />
              <p className="text-muted-foreground text-xs">{i.label}</p>
              <p className="font-semibold font-heading text-2xl text-navy tabular-nums">
                {i.value === null
                  ? 'Not reported'
                  : `${i.value}${i.unit === '%' ? '%' : ` ${i.unit}`}`}
              </p>
              <p className="text-muted-foreground text-xs">
                {i.period} · {i.coverage}
              </p>
              {i.evidence ? (
                <StatusBadge tone="success" icon={FileCheck2} className="w-fit">
                  Evidence attached
                </StatusBadge>
              ) : (
                <StatusBadge tone="warning" icon={FileQuestion} className="w-fit">
                  Evidence pending
                </StatusBadge>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

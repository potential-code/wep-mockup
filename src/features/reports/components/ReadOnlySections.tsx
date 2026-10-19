import type { AnnualReport, ReportIndicator, ReportSectionKey } from '@shared/types'
import { SectionCard } from '@/components/shared/Cards'
import { SECTION_META } from '@/queries/reports.queries'
import { EvidenceList } from './EvidencePanel'
import { IndicatorsReadOnly } from './IndicatorsReadOnly'

/** All eight sections, read-only. Used for locked reports, past versions and UN Women review. */
export function ReadOnlySections({
  sections,
  indicators,
  evidence,
  previous,
  people,
  flagged = [],
}: {
  sections: Record<ReportSectionKey, string>
  indicators: ReportIndicator[]
  evidence?: AnnualReport
  previous: AnnualReport | null
  people: Record<string, string>
  flagged?: ReportSectionKey[]
}) {
  return (
    <div className="grid gap-4">
      {SECTION_META.map((s, i) => (
        <SectionCard
          key={s.key}
          id={`section-${s.key}`}
          title={`${i + 1}. ${s.title}`}
          action={
            flagged.includes(s.key) ? (
              <span className="rounded-full bg-danger-soft px-2.5 py-0.5 font-medium text-danger text-xs">
                Change requested
              </span>
            ) : null
          }
        >
          {sections[s.key] ? (
            <p className="whitespace-pre-line text-navy text-sm leading-relaxed">
              {sections[s.key]}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Nothing entered for this section.</p>
          )}
          {s.key === 'indicators' ? (
            <div className="mt-4 grid gap-4">
              <IndicatorsReadOnly indicators={indicators} previous={previous?.indicators} />
              {evidence ? (
                <div className="grid gap-2">
                  <h3 className="font-heading font-semibold text-navy text-sm">Evidence files</h3>
                  <EvidenceList report={evidence} people={people} />
                </div>
              ) : null}
            </div>
          ) : null}
        </SectionCard>
      ))}
    </div>
  )
}

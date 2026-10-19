import type { AnnualReport, ReportSectionKey } from '@shared/types'
import { Flag, Info, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'
import { SECTION_META, useSaveSection } from '@/queries/reports.queries'
import { EvidencePanel } from './EvidencePanel'
import { IndicatorsEditor } from './IndicatorsEditor'
import { SaveIndicator } from './SaveIndicator'
import { useAutosave } from './useAutosave'

interface Props {
  report: AnnualReport
  sectionKey: ReportSectionKey
  prefill: string
  readOnly: boolean
  previous: AnnualReport | null
  people: Record<string, string>
}

/** Editor for one report section. Remount (key) when the section changes. */
export function SectionEditor({ report, sectionKey, prefill, readOnly, previous, people }: Props) {
  const meta = SECTION_META.find((s) => s.key === sectionKey)
  const [text, setText] = useState(report.sections[sectionKey])
  const [complete, setComplete] = useState(report.sectionComplete[sectionKey])
  const save = useSaveSection()
  const auto = useAutosave<{ text: string; complete: boolean }>((v) =>
    save.mutateAsync({ year: report.year, key: sectionKey, ...v }),
  )
  const requests = report.changeRequests.filter((c) => c.section === sectionKey && !c.resolved)
  const isDeclaration = sectionKey === 'declaration'

  const change = (value: string) => {
    setText(value)
    auto.schedule({ text: value, complete })
  }
  const toggle = (value: boolean) => {
    setComplete(value)
    auto.flush({ text, complete: value }).then(() => {
      if (value && requests.length) toast.success('Change request addressed for this section.')
    })
  }
  const insertPrefill = () => {
    const next = text.trim() ? `${text.trim()}\n\n${prefill}` : prefill
    change(next)
    toast.success('Prefill inserted. Review and edit before marking complete.')
  }

  return (
    <SectionCard
      title={meta?.title}
      description={meta?.help}
      action={readOnly ? null : <SaveIndicator state={auto.state} />}
    >
      <div className="grid gap-5">
        {requests.map((c) => (
          <div
            key={c.at + c.note}
            className="flex gap-3 rounded-xl border border-danger/30 bg-danger-soft/60 p-4 text-sm"
          >
            <Flag className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            <div>
              <p className="font-semibold text-navy">
                UN Women requested a change · {formatDate(c.at)}
              </p>
              <p className="text-muted-foreground">{c.note}</p>
            </div>
          </div>
        ))}

        {isDeclaration ? (
          <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
            <p className="text-navy">
              The declaration is confirmed by the CEO or a delegated administrator when the report
              is submitted. It is not counted when requesting approval.
              {report.sections.declaration
                ? ` Recorded declaration: “${report.sections.declaration}”`
                : ''}
            </p>
          </div>
        ) : (
          <>
            {sectionKey === 'support' ? (
              <div className="rounded-xl border border-dashed border-blue/40 bg-blue-50/60 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Wand2 className="size-4 text-blue" aria-hidden />
                  <p className="font-semibold text-navy text-sm">Prefill from portal records</p>
                </div>
                <p className="text-navy text-sm">{prefill}</p>
                {readOnly ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={insertPrefill}
                  >
                    Insert prefill
                  </Button>
                )}
              </div>
            ) : null}
            <div className="grid gap-1.5">
              <Label htmlFor={`sec-${sectionKey}`}>
                {sectionKey === 'indicators'
                  ? 'Method notes and context (optional)'
                  : 'Your response'}
              </Label>
              <Textarea
                id={`sec-${sectionKey}`}
                value={text}
                disabled={readOnly}
                rows={sectionKey === 'indicators' ? 3 : 9}
                placeholder="Write your response. Changes are saved automatically."
                onChange={(e) => change(e.target.value)}
              />
            </div>
          </>
        )}

        {sectionKey === 'indicators' ? (
          <>
            <IndicatorsEditor report={report} previous={previous} readOnly={readOnly} />
            <EvidencePanel report={report} readOnly={readOnly} people={people} />
          </>
        ) : null}

        {isDeclaration || readOnly ? null : (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface p-4">
            <Label htmlFor={`done-${sectionKey}`} className="grid gap-0.5">
              <span className="font-semibold text-navy">Mark section complete</span>
              <span className="font-normal text-muted-foreground text-xs">
                All sections except the declaration must be complete to request approval.
              </span>
            </Label>
            <Switch id={`done-${sectionKey}`} checked={complete} onCheckedChange={toggle} />
          </div>
        )}
      </div>
    </SectionCard>
  )
}

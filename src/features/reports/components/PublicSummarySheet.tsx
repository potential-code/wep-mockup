import type { AnnualReport } from '@shared/types'
import { Globe2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ACCEPTED_NOTE, formatValue } from '../lib'

/** Only the approved public summary fields: snapshot, narrative and indicators with evidence. */
export function PublicSummarySheet({
  open,
  onOpenChange,
  report,
  companyName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: AnnualReport
  companyName: string
}) {
  const shown = report.indicators.filter((i) => i.value !== null)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Globe2 className="size-5 text-blue" aria-hidden /> Public summary preview
          </SheetTitle>
          <SheetDescription>
            This is exactly what would appear publicly once you approve it. Challenges, declaration
            and evidence files stay private.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4 pb-6">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {report.year} progress summary
            </p>
            <h3 className="font-heading font-medium text-navy text-xl">{companyName}</h3>
          </div>
          <section>
            <h4 className="mb-1 font-medium text-navy text-sm">About the company</h4>
            <p className="text-navy text-sm leading-relaxed">
              {report.sections.snapshot || 'Not provided.'}
            </p>
          </section>
          <section>
            <h4 className="mb-1 font-medium text-navy text-sm">Leadership message</h4>
            <p className="text-navy text-sm leading-relaxed">
              {report.sections.narrative || 'Not provided.'}
            </p>
          </section>
          <section>
            <h4 className="mb-2 font-medium text-navy text-sm">Reported indicators</h4>
            {shown.length ? (
              <ul className="grid gap-2">
                {shown.map((i) => (
                  <li key={i.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium text-navy">{i.label}</p>
                    <p className="font-heading font-medium text-lg text-navy">
                      {formatValue(i.value, i.unit)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {i.coverage} · {i.period} ·{' '}
                      {i.evidence ? 'Evidence on file' : 'No evidence linked'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No indicator values to show.</p>
            )}
          </section>
          <p className="rounded-lg bg-surface p-3 text-muted-foreground text-xs">
            Values are company-reported and do not show that participation in the programme caused
            the change. {ACCEPTED_NOTE}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

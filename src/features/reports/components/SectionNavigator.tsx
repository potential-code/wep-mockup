import type { AnnualReport, ReportSectionKey } from '@shared/types'
import { CheckCircle2, ChevronDown, Circle, Flag } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SECTION_META } from '@/queries/reports.queries'

/** Section list with completion ticks and change-request flags. Sticky on desktop, collapsible on mobile. */
export function SectionNavigator({
  report,
  active,
  onSelect,
}: {
  report: Pick<AnnualReport, 'sectionComplete' | 'changeRequests'>
  active: ReportSectionKey
  onSelect: (key: ReportSectionKey) => void
}) {
  const [open, setOpen] = useState(false)
  const doneCount = SECTION_META.filter((s) => report.sectionComplete[s.key]).length
  const activeIndex = SECTION_META.findIndex((s) => s.key === active)
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Report sections">
      <div className="rounded-2xl border bg-card shadow-card">
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-start lg:hidden"
          aria-expanded={open}
          aria-controls="report-sections"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="grid">
            <span className="text-muted-foreground text-xs">
              Section {activeIndex + 1} of {SECTION_META.length} · {doneCount} complete
            </span>
            <span className="font-heading font-medium text-navy text-sm">
              {SECTION_META[activeIndex]?.title}
            </span>
          </span>
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
        <div className="hidden px-4 pt-4 pb-2 lg:block">
          <p className="font-heading font-medium text-navy text-sm">Report sections</p>
          <p className="text-muted-foreground text-xs">
            {doneCount} of {SECTION_META.length} complete
          </p>
        </div>
        <ol
          id="report-sections"
          className={cn('grid gap-0.5 p-2', open ? 'grid' : 'hidden lg:grid')}
        >
          {SECTION_META.map((s, i) => {
            const done = report.sectionComplete[s.key]
            const flagged = report.changeRequests.some((c) => c.section === s.key && !c.resolved)
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(s.key)
                    setOpen(false)
                  }}
                  aria-current={active === s.key ? 'step' : undefined}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-blue-50',
                    active === s.key && 'bg-blue-50 font-medium text-navy ring-1 ring-blue/30',
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Complete" />
                  ) : (
                    <Circle
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-label="Not complete"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="text-muted-foreground text-xs">{i + 1}. </span>
                    {s.title}
                  </span>
                  {flagged ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-danger text-xs">
                      <Flag className="size-3" aria-hidden />
                      Change
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </aside>
  )
}

import type { AnnualReport, ReportVersion } from '@shared/types'
import { Eye, GitCompare } from 'lucide-react'
import { useState } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDateTime } from '@/lib/format'
import { SECTION_META } from '@/queries/reports.queries'

/** Every submitted version, newest first. Viewing and comparing never alters history. */
export function VersionsPanel({
  report,
  people,
  viewing,
  onView,
}: {
  report: AnnualReport
  people: Record<string, string>
  viewing?: number | null
  onView?: (version: number | null) => void
}) {
  const [compare, setCompare] = useState<number | null>(null)
  const versions = [...report.versions].sort((a, b) => b.version - a.version)
  return (
    <SectionCard
      title="Submitted versions"
      description="Each submission is kept as a dated snapshot. Revisions never overwrite earlier versions."
    >
      {versions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No versions yet. Version 1 is created on submission.
        </p>
      ) : (
        <ul className="grid gap-2">
          {versions.map((v, idx) => (
            <li
              key={v.version}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <p className="flex items-center gap-2 font-semibold text-navy">
                  Version {v.version}
                  {idx === 0 ? (
                    <StatusBadge tone="info" icon={null}>
                      Latest
                    </StatusBadge>
                  ) : null}
                  {viewing === v.version ? (
                    <StatusBadge tone="gold" icon={null}>
                      Viewing
                    </StatusBadge>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(v.submittedAt)} ·{' '}
                  {people[v.submittedById] ?? 'Authorised submitter'}
                </p>
              </div>
              <div className="flex gap-2">
                {onView ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onView(viewing === v.version ? null : v.version)}
                  >
                    <Eye /> {viewing === v.version ? 'Back to current' : 'View'}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCompare(v.version)}
                >
                  <GitCompare /> Compare
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CompareDialog report={report} version={compare} onClose={() => setCompare(null)} />
    </SectionCard>
  )
}

function CompareDialog({
  report,
  version,
  onClose,
}: {
  report: AnnualReport
  version: number | null
  onClose: () => void
}) {
  const v: ReportVersion | undefined = report.versions.find((x) => x.version === version)
  const base = report.versions.find((x) => x.version === (version ?? 0) - 1)
  const baseLabel = base ? `Version ${base.version}` : 'Current working copy'
  const baseSections = base ? base.sections : report.sections
  return (
    <Dialog open={version !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Version {version} compared with {baseLabel.toLowerCase()}
          </DialogTitle>
          <DialogDescription>Sections whose text differs are marked as changed.</DialogDescription>
        </DialogHeader>
        {v ? (
          <ul className="grid gap-3">
            {SECTION_META.map((s) => {
              const a = baseSections[s.key]
              const b = v.sections[s.key]
              const changed = a !== b
              return (
                <li key={s.key} className="rounded-lg border p-3 text-sm">
                  <p className="mb-2 flex items-center justify-between gap-2 font-semibold text-navy">
                    {s.title}
                    <StatusBadge tone={changed ? 'warning' : 'neutral'} icon={null}>
                      {changed ? 'Changed' : 'Unchanged'}
                    </StatusBadge>
                  </p>
                  {changed ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="rounded bg-muted p-2">
                        <p className="mb-1 text-muted-foreground text-xs">{baseLabel}</p>
                        <p className="whitespace-pre-line">{a || 'Empty'}</p>
                      </div>
                      <div className="rounded bg-blue-50 p-2">
                        <p className="mb-1 text-muted-foreground text-xs">Version {v.version}</p>
                        <p className="whitespace-pre-line">{b || 'Empty'}</p>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

import type { ReportSectionKey } from '@shared/types'
import { getRouteApi } from '@tanstack/react-router'
import { CheckCircle2, Info, Lock } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { celebrate } from '@/components/motion/Celebrate'
import { DemoLabel } from '@/components/shared/Cards'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { useCurrentUser } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { SECTION_META, useReport, useSubmitReport } from '@/queries/reports.queries'
import { PublicDisclosureCard } from '../components/PublicDisclosureCard'
import { PublicSummarySheet } from '../components/PublicSummarySheet'
import { ReadOnlySections } from '../components/ReadOnlySections'
import { ReportActions } from '../components/ReportActions'
import { ReportStatusBar } from '../components/ReportStatusBar'
import { SectionEditor } from '../components/SectionEditor'
import { SectionNavigator } from '../components/SectionNavigator'
import { SubmitDialog } from '../components/SubmitDialog'
import { VersionsPanel } from '../components/VersionsPanel'
import { ACCEPTED_NOTE, LOCKED_STATUSES, sectionIsRequired } from '../lib'

const route = getRouteApi('/_app/portal/reports/$year')

export function ReportEditorPage() {
  const year = Number(route.useParams().year)
  const { can, company } = useCurrentUser()
  const { data, isLoading, isError, error, refetch } = useReport(year)
  const submit = useSubmitReport()
  const [active, setActive] = useState<ReportSectionKey>('snapshot')
  const [viewVersion, setViewVersion] = useState<number | null>(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState<number | null>(null)

  if (!can('reports.view'))
    return (
      <AccessNotice
        title="Annual reports are limited to authorised people"
        message="Ask your CEO or company administrator for access to prepare or submit the report."
      />
    )
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    )

  const { report, previous, people, supportPrefill, canSubmit } = data
  const canPrepare = can('reports.prepare')
  const locked = LOCKED_STATUSES.includes(report.status)
  const editable = data.canEdit && !locked
  const required = SECTION_META.filter((s) => sectionIsRequired(s.key))
  const remaining = required.filter((s) => !report.sectionComplete[s.key]).length
  const unresolved = report.changeRequests.filter((c) => !c.resolved)
  const version = report.versions.find((v) => v.version === viewVersion)
  const nextVersion = report.versions.length + 1

  const doSubmit = (declaration: string) =>
    submit.mutate(
      { year, declaration },
      {
        onSuccess: () => {
          setSubmitOpen(false)
          setJustSubmitted(nextVersion)
          celebrate()
        },
      },
    )

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHeader
        breadcrumbs={[{ label: 'Annual reports', to: '/portal/reports' }, { label: String(year) }]}
        title={`${year} annual report`}
        description={`${company?.name ?? 'Your company'} · due ${formatDate(report.dueDate)}${data.preparerName ? ` · prepared by ${data.preparerName}` : ''}`}
        actions={
          <ReportActions
            report={report}
            editable={editable && (canPrepare || canSubmit)}
            canPrepare={canPrepare}
            canSubmit={canSubmit}
            remaining={remaining}
            onSubmit={() => setSubmitOpen(true)}
          />
        }
        className="mb-0 sm:mb-0"
      />

      <div>
        <DemoLabel>Proposed feature</DemoLabel>
      </div>

      <ReportStatusBar status={report.status} />

      {justSubmitted ? (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-success/30 bg-success-soft p-5"
        >
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-heading font-semibold text-navy">
              Version {justSubmitted} submitted
            </p>
            <p className="text-muted-foreground text-sm">
              UN Women has been notified. The report is locked for review.
            </p>
          </div>
        </div>
      ) : null}

      {report.status === 'changes_requested' && unresolved.length > 0 ? (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft/60 p-5">
          <p className="font-heading font-semibold text-navy">
            UN Women requested changes to {unresolved.length} section
            {unresolved.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-2 grid gap-2 text-sm">
            {unresolved.map((c) => (
              <li key={c.section + c.at}>
                <button
                  type="button"
                  className="font-semibold text-blue underline-offset-2 hover:underline"
                  onClick={() => setActive(c.section)}
                >
                  {SECTION_META.find((s) => s.key === c.section)?.title}
                </button>
                <span className="text-muted-foreground"> · {c.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {locked && !justSubmitted ? (
        <div className="flex gap-3 rounded-xl border bg-card p-4 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-navy">
            This report is read-only while it is {report.status.replace('_', ' ')}.{' '}
            {report.status === 'accepted' ? ACCEPTED_NOTE : 'You will be notified of the outcome.'}
          </p>
        </div>
      ) : null}

      {viewVersion !== null && version ? (
        <>
          <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
            <p className="text-navy">
              Viewing version {version.version}, submitted {formatDate(version.submittedAt)}.
              Read-only.
            </p>
          </div>
          <ReadOnlySections
            sections={version.sections}
            indicators={version.indicators}
            previous={previous}
            evidence={report}
            people={people}
          />
        </>
      ) : editable ? (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <SectionNavigator report={report} active={active} onSelect={setActive} />
          <SectionEditor
            key={active}
            report={report}
            sectionKey={active}
            prefill={supportPrefill}
            readOnly={!canPrepare}
            previous={previous}
            people={people}
          />
        </div>
      ) : (
        <ReadOnlySections
          sections={report.sections}
          indicators={report.indicators}
          previous={previous}
          evidence={report}
          people={people}
        />
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
        <VersionsPanel
          report={report}
          people={people}
          viewing={viewVersion}
          onView={setViewVersion}
        />
        <PublicDisclosureCard
          report={report}
          canApprove={canSubmit}
          onPreview={() => setPreviewOpen(true)}
        />
      </div>

      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        year={year}
        nextVersion={nextVersion}
        completeCount={required.length - remaining}
        indicatorCount={report.indicators.length}
        evidenceCount={report.evidence.length}
        pending={submit.isPending}
        onSubmit={doSubmit}
      />
      <PublicSummarySheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        report={report}
        companyName={company?.name ?? 'Company'}
      />
    </div>
  )
}

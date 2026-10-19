import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowRight, PartyPopper, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DocumentList } from '@/features/join/components/DocumentList'
import { ApplicationTimeline } from '@/features/join/components/Timeline'
import { formatDate, formatDateTime } from '@/lib/format'
import { useAddReviewNote, useApplication, useStartReview } from '@/queries/applications.queries'
import { DecisionPanel } from '../components/applications/DecisionPanel'
import { DuplicatePanel } from '../components/applications/DuplicatePanel'
import { ReviewSections } from '../components/applications/ReviewSections'

const route = getRouteApi('/_app/admin/manage/applications/$applicationId')

export function ApplicationReviewPage() {
  const { applicationId } = route.useParams()
  const { data, isLoading, isError, refetch } = useApplication(applicationId)
  const start = useStartReview()
  const started = useRef<string | null>(null)
  const [approvedCompanyId, setApprovedCompanyId] = useState<string | null>(null)
  const status = data?.application.status

  // Opening a submitted or resubmitted application starts the review.
  useEffect(() => {
    if ((status === 'submitted' || status === 'resubmitted') && started.current !== applicationId) {
      started.current = applicationId
      start.mutate(applicationId)
    }
  }, [status, applicationId, start])

  const crumbs = [
    { label: 'Manage', to: '/admin/manage' },
    { label: 'Applications', to: '/admin/manage/applications' },
    { label: data?.application.data.company.name ?? 'Review' },
  ]
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return <ErrorState message="We could not load this application." onRetry={() => refetch()} />
  const { application: app, duplicate } = data
  const openRequest = app.infoRequests.find((r) => !r.resolvedAt)
  const companyId = approvedCompanyId ?? app.companyId

  return (
    <div>
      <PageHeader
        breadcrumbs={crumbs}
        eyebrow={`Reference ${app.reference}`}
        title={app.data.company.name}
        description={`${app.data.company.sector} · ${app.data.company.country} · submitted ${formatDate(app.submittedAt)}`}
        actions={<WorkflowStatus status={app.status} />}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          {approvedCompanyId ? (
            <section
              className="rounded-2xl border border-success/30 bg-success-soft p-6"
              aria-live="polite"
            >
              <PartyPopper className="mb-2 size-7 text-success" aria-hidden />
              <h2 className="font-heading font-semibold text-navy text-xl">
                {app.data.company.name} is now a WEPs signatory
              </h2>
              <p className="mt-1 mb-4 text-sm">
                The company workspace is activated and a CEO account has been created for{' '}
                {app.data.executive.firstName} {app.data.executive.lastName} (
                {app.data.executive.email}). They have been notified and can sign in now.
              </p>
              <Button asChild>
                <Link
                  to="/admin/reporting/companies/$companyId"
                  params={{ companyId: approvedCompanyId }}
                >
                  View company in reporting <ArrowRight aria-hidden />
                </Link>
              </Button>
            </section>
          ) : null}
          {openRequest ? (
            <SectionCard title="Open information request">
              <p className="font-medium text-navy text-sm">{openRequest.item}</p>
              <p className="mt-1 text-sm">{openRequest.message}</p>
              <p className="mt-2 text-muted-foreground text-xs">
                Requested {formatDateTime(openRequest.requestedAt)}
                {openRequest.dueDate ? ` · due ${formatDate(openRequest.dueDate)}` : ''}
              </p>
            </SectionCard>
          ) : null}
          {app.status === 'not_approved' ? (
            <SectionCard title="Decision: not approved">
              <p className="text-sm">{app.decisionReason}</p>
            </SectionCard>
          ) : null}
          {duplicate && app.duplicateOfCompanyId ? (
            <DuplicatePanel applicationId={app.id} company={duplicate} />
          ) : null}
          <SectionCard
            title="Application details"
            description="Mirrors the eight steps of the Join form."
          >
            <ReviewSections data={app.data} />
          </SectionCard>
          <SectionCard title="Documents">
            <DocumentList documents={app.documents} />
          </SectionCard>
        </div>
        <aside className="grid content-start gap-6 lg:sticky lg:top-20 lg:self-start">
          <SectionCard title="Decision">
            <DecisionPanel app={app} onApproved={setApprovedCompanyId} />
            {app.status === 'approved' && companyId && !approvedCompanyId ? (
              <Button asChild variant="outline" className="mt-3">
                <Link to="/admin/reporting/companies/$companyId" params={{ companyId }}>
                  View company in reporting
                </Link>
              </Button>
            ) : null}
          </SectionCard>
          <SectionCard title="Review notes" description="Internal. Never shown to the applicant.">
            <Notes id={app.id} notes={app.reviewNotes} />
          </SectionCard>
          <SectionCard title="Activity">
            <ApplicationTimeline events={app.timeline} />
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}

function Notes({ id, notes }: { id: string; notes: { at: string; by: string; note: string }[] }) {
  const add = useAddReviewNote()
  const [text, setText] = useState('')
  return (
    <div className="grid gap-3">
      {notes.length === 0 ? <p className="text-muted-foreground text-sm">No notes yet.</p> : null}
      <ul className="grid gap-2">
        {notes.map((n) => (
          <li key={`${n.at}-${n.note}`} className="rounded-lg bg-surface p-3 text-sm">
            <p>{n.note}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {n.by} · {formatDateTime(n.at)}
            </p>
          </li>
        ))}
      </ul>
      <Textarea
        aria-label="Add a review note"
        placeholder="Add an internal note…"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        className="justify-self-start"
        disabled={!text.trim() || add.isPending}
        onClick={async () => {
          await add.mutateAsync({ id, note: text.trim() })
          setText('')
          toast.success('Note added')
        }}
      >
        <Send aria-hidden /> Add note
      </Button>
    </div>
  )
}

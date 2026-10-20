import type { Application } from '@shared/types'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { AlertTriangle, ArrowRight, CalendarClock, Lock, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import { SectionCard } from '@/components/shared/Cards'
import { FileDrop, type UploadResult } from '@/components/shared/FileDrop'
import { ErrorState } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'
import {
  useApplicationByRef,
  useMyApplication,
  useResubmitApplication,
  validateUpload,
} from '@/queries/applications.queries'
import { DocumentList } from '../components/DocumentList'
import { ApplicationTimeline } from '../components/Timeline'

const route = getRouteApi('/_public/application-status')

const HEADLINE: Record<string, string> = {
  submitted: 'We have received your application',
  under_review: 'UN Women is reviewing your application',
  information_requested: 'We need one more thing from you',
  resubmitted: 'Thank you, we are looking at your update',
  approved: 'Welcome to the WEPs community',
  not_approved: 'Your application was not approved this time',
  draft: 'Your application is still a draft',
}

export function ApplicationStatusPage() {
  const { ref } = route.useSearch()
  // A visitor sees an application only after entering its reference. A signed-in applicant
  // sees their own.
  const mine = useMyApplication()
  const found = useApplicationByRef(ref)
  const notFound = !!ref && found.isError
  const { data: app, isLoading, isError, refetch } = ref && !notFound ? found : mine
  return (
    <div>
      <section className="bg-navy pt-28 pb-12 text-white">
        <div className="container-public grid gap-3">
          <p className="font-medium text-coral-300 text-sm">Application status</p>
          <h1 className="text-page-title max-w-3xl">
            {app ? (HEADLINE[app.status] ?? 'Your application') : 'Track your WEPs application'}
          </h1>
          {app ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
              <span>{app.data.company.name}</span>
              <span aria-hidden>·</span>
              <span>Ref. {app.reference}</span>
              <span aria-hidden>·</span>
              <span>Submitted {formatDate(app.submittedAt)}</span>
              <WorkflowStatus status={app.status} className="ms-1" />
            </div>
          ) : null}
        </div>
      </section>
      <section className="bg-surface py-10">
        <div className="container-public max-w-5xl">
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : isError ? (
            <ErrorState message="We could not load your application." onRetry={() => refetch()} />
          ) : app ? (
            <Details app={app} viaRef={!!ref && !notFound} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <FindForm initial={ref} error={notFound ? found.error.message : undefined} />
              <SectionCard title="No application yet?">
                <p className="mb-4 text-muted-foreground text-sm">
                  Applying takes about 15 minutes and costs nothing. Your progress is saved as you
                  go.
                </p>
                <Button asChild>
                  <Link to="/join">
                    Start an application <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </SectionCard>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function FindForm({ initial, error }: { initial?: string; error?: string }) {
  const [ref, setRef] = useState(initial ?? '')
  const navigate = useNavigate()
  return (
    <SectionCard
      title="Find my application"
      description="Enter the reference from your confirmation email."
    >
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ to: '/application-status', search: { ref: ref.trim().toUpperCase() } })
        }}
      >
        <label htmlFor="app-ref" className="font-medium text-navy text-sm">
          Application reference
        </label>
        <div className="flex gap-2">
          <Input
            id="app-ref"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="WEPS-2026-0000"
            className="h-10"
            aria-invalid={!!error}
            aria-describedby="app-ref-hint"
          />
          <Button type="submit" disabled={!ref.trim()}>
            <Search aria-hidden /> Find
          </Button>
        </div>
        <p id="app-ref-hint" className="text-muted-foreground text-xs">
          Demo hint: try{' '}
          <button
            type="button"
            className="font-medium text-blue hover:underline"
            onClick={() => setRef('WEPS-2026-0418')}
          >
            WEPS-2026-0418
          </button>{' '}
          (Cedar Works).
        </p>
        {error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : null}
      </form>
    </SectionCard>
  )
}

function Details({ app, viaRef }: { app: Application; viaRef: boolean }) {
  const open = app.infoRequests.find((r) => !r.resolvedAt)
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid content-start gap-6">
        {app.status === 'information_requested' && open ? (
          <RequestPanel app={app} item={open.item} message={open.message} dueDate={open.dueDate} />
        ) : null}
        {app.status === 'approved' ? (
          <SectionCard className="border-success/30 bg-success-soft/40">
            <p className="mb-1 font-heading font-medium text-navy text-lg">
              Your workspace is active
            </p>
            <p className="mb-4 text-sm">
              The CEO account has been created for {app.data.executive.email}. Sign in to appoint a
              focal point, invite your team and choose your priorities.
            </p>
            <Button asChild>
              <Link to="/sign-in">
                Sign in to your portal <ArrowRight aria-hidden />
              </Link>
            </Button>
          </SectionCard>
        ) : null}
        {app.status === 'not_approved' ? (
          <SectionCard title="Why this was not approved">
            <p className="mb-3 rounded-lg bg-surface p-3 text-sm">
              {app.decisionReason ?? 'No reason recorded.'}
            </p>
            <p className="mb-4 text-muted-foreground text-sm">
              You are welcome to apply again once the points above are addressed. Questions? Write
              to weps@unwomen.org.
            </p>
            <Button asChild variant="outline">
              <Link to="/join">Reapply</Link>
            </Button>
          </SectionCard>
        ) : null}
        <SectionCard title="Activity">
          <ApplicationTimeline events={app.timeline} />
        </SectionCard>
        <SectionCard title="Your documents">
          <DocumentList documents={app.documents} application={app} />
        </SectionCard>
      </div>
      <aside className="grid content-start gap-4">
        {app.status !== 'approved' ? (
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <Lock className="mb-2 size-5 text-navy" aria-hidden />
            <p className="font-heading font-medium text-navy">Portal locked until approval</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Learning, clinics, assessments and the company workspace open as soon as UN Women
              approves your application. Public resources stay available meanwhile.
            </p>
          </div>
        ) : null}
        {viaRef ? (
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="font-heading font-medium text-navy">Not your application?</p>
            <p className="mt-1 mb-3 text-muted-foreground text-sm">
              Look up another one with its reference.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/application-status" search={{}}>
                <RotateCcw aria-hidden /> Find another
              </Link>
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

function RequestPanel({
  app,
  item,
  message,
  dueDate,
}: {
  app: Application
  item: string
  message: string
  dueDate?: string
}) {
  const [file, setFile] = useState<UploadResult | null>(null)
  const [note, setNote] = useState('')
  const [missing, setMissing] = useState(false)
  const resubmit = useResubmitApplication()
  const kind = /registration/i.test(item)
    ? 'registration'
    : /portrait|photo/i.test(item)
      ? 'ceo_portrait'
      : /statement/i.test(item)
        ? 'ceo_statement'
        : 'registration'

  const send = async () => {
    if (!file) {
      setMissing(true)
      return
    }
    await resubmit.mutateAsync({
      id: app.id,
      replacement: { kind, fileName: file.fileName, sizeKb: file.sizeKb },
      note: note.trim() || undefined,
    })
    toast.success('Resubmitted. UN Women has been notified.')
    celebrate({ y: 0.3 })
  }

  return (
    <section
      aria-labelledby="req-title"
      className="rounded-2xl border border-warning/40 bg-warning-soft/60 p-5 shadow-card sm:p-6"
    >
      <div className="mb-3 flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div>
          <h2 id="req-title" className="font-heading font-medium text-lg text-navy">
            Action needed: {item}
          </h2>
          {dueDate ? (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm">
              <CalendarClock className="size-4" aria-hidden /> Please respond by{' '}
              {formatDate(dueDate)}
            </p>
          ) : null}
        </div>
      </div>
      <blockquote className="mb-5 rounded-xl bg-card p-4 text-sm">{message}</blockquote>
      <div className="grid gap-4">
        <FileDrop
          label={`Replacement: ${item}`}
          hint="PDF, JPG or PNG, up to 20 MB. The earlier version is kept on record."
          accept=".pdf,.jpg,.jpeg,.png"
          required
          showMissing={missing}
          sampleName="Commercial_Registration_2026_current.pdf"
          value={file}
          onChange={setFile}
          validate={(f) => validateUpload(kind, f.fileName, f.sizeKb)}
        />
        <div className="grid gap-1.5">
          <label htmlFor="resubmit-note" className="font-medium text-navy text-sm">
            Note to UN Women (optional)
          </label>
          <Textarea
            id="resubmit-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="bg-card"
          />
        </div>
        <div>
          <Button onClick={send} disabled={resubmit.isPending}>
            {resubmit.isPending ? 'Resubmitting…' : 'Replace document and resubmit'}
          </Button>
        </div>
      </div>
    </section>
  )
}

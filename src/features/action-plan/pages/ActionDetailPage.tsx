import { fullName } from '@shared/permissions'
import { departmentLabel } from '@shared/reference'
import { Link, useParams } from '@tanstack/react-router'
import { BookOpen, FileText, Paperclip, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { FileDrop, type UploadResult } from '@/components/shared/FileDrop'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentUser } from '@/hooks/use-session'
import { formatDate, formatDateTime } from '@/lib/format'
import { useAction, useUploadActionEvidence } from '@/queries/assessment.queries'
import { ActionWorkflow } from '../components/ActionWorkflow'

export function ActionDetailPage() {
  const { actionId } = useParams({ strict: false }) as { actionId: string }
  const { user } = useCurrentUser()
  const { data, isLoading, isError, error, refetch } = useAction(actionId)
  const upload = useUploadActionEvidence()
  const [file, setFile] = useState<UploadResult | null>(null)
  const [note, setNote] = useState('')

  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return error instanceof Error && /assigned/.test(error.message) ? (
      <AccessNotice
        title="This action isn’t assigned to you"
        message="You can only open actions you own or contribute to."
      />
    ) : (
      <ErrorState message="This action couldn’t load." onRetry={() => refetch()} />
    )
  const { action: a } = data
  const isAssignee = a.ownerId === user?.id || a.contributorIds.includes(user?.id ?? '')
  const canUpload =
    (data.canManage || isAssignee) &&
    a.status !== 'complete' &&
    a.status !== 'draft' &&
    a.status !== 'ceo_review'

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Action plan', to: '/portal/action-plan' }, { label: a.title }]}
        title={a.title}
        description={a.purpose}
        eyebrow={<PrincipleTag id={a.principle} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <SectionCard title="Details">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Info label="Baseline" value={a.baseline} />
              <Info label="Target" value={a.target} />
              <Info label="Evidence required" value={a.evidenceRequired} />
              <Info label="Department" value={departmentLabel(a.department)} />
            </dl>
          </SectionCard>
          <SectionCard
            title="Evidence"
            description={`${a.evidence.length} file${a.evidence.length === 1 ? '' : 's'} uploaded`}
          >
            {a.evidence.length === 0 ? (
              <p className="mb-4 flex items-center gap-2 text-sm">
                <StatusBadge tone="warning">No evidence yet</StatusBadge>
                <span className="text-muted-foreground">Required: {a.evidenceRequired}</span>
              </p>
            ) : (
              <ul className="mb-4 grid gap-2">
                {a.evidence.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                    <Paperclip className="size-4 text-blue" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-navy">{e.fileName}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(e.uploadedAt)}
                        {e.note ? ` · ${e.note}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {canUpload ? (
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!file) return
                  upload.mutate(
                    { id: a.id, fileName: file.fileName, note: note.trim() || undefined },
                    {
                      onSuccess: () => {
                        toast.success('Evidence uploaded')
                        setFile(null)
                        setNote('')
                      },
                    },
                  )
                }}
              >
                <FileDrop
                  label="Upload evidence"
                  hint="PDF, DOCX, XLSX or PPTX · demo only, nothing leaves your browser"
                  accept=".pdf,.docx,.xlsx,.pptx"
                  sampleName="Evidence_summary.pdf"
                  value={file}
                  onChange={setFile}
                />
                <Input
                  aria-label="Note about this file (optional)"
                  placeholder="Add a short note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button type="submit" className="w-fit" disabled={!file || upload.isPending}>
                  {upload.isPending ? 'Uploading…' : 'Add evidence'}
                </Button>
              </form>
            ) : null}
          </SectionCard>
          <SectionCard
            title="Support for this action"
            description="Helpful, but not proof of implementation."
          >
            <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm">
              Completing a course never marks an action done. Only accepted evidence does.
            </p>
            <ul className="grid gap-2">
              {data.courses.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/portal/learn/$courseId"
                    params={{ courseId: c.id }}
                    className="flex items-center gap-2 text-blue text-sm hover:underline"
                  >
                    <BookOpen className="size-4" aria-hidden /> Course: {c.title}
                  </Link>
                </li>
              ))}
              {data.resources.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/portal/resources/$resourceId"
                    params={{ resourceId: r.id }}
                    className="flex items-center gap-2 text-blue text-sm hover:underline"
                  >
                    <FileText className="size-4" aria-hidden /> Resource: {r.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/portal/mentorship"
                  className="flex items-center gap-2 text-blue text-sm hover:underline"
                >
                  <UserRound className="size-4" aria-hidden /> Find expert support
                </Link>
              </li>
            </ul>
          </SectionCard>
        </div>
        <div className="grid content-start gap-6">
          <ActionWorkflow
            action={a}
            isCeo={user?.role === 'ceo'}
            canManage={data.canManage}
            isAssignee={isAssignee}
          />
          <SectionCard title="Owner and timing">
            <div className="flex items-center gap-3">
              <UserAvatar name={data.ownerName} src={data.ownerAvatar} className="size-10" />
              <div className="text-sm">
                <p className="font-medium text-navy">{data.ownerName}</p>
                <p className="text-muted-foreground">Owner</p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm">
              Due {formatDate(a.dueDate)}
              {data.overdue ? <StatusBadge tone="danger">Overdue</StatusBadge> : null}
            </p>
          </SectionCard>
          <SectionCard title="History">
            <ol className="grid gap-4 border-s ps-4">
              {[...data.history].reverse().map((h) => (
                <li key={`${h.at}-${h.label}`} className="relative text-sm">
                  <span
                    className="absolute -start-[21px] top-1.5 size-2 rounded-full bg-blue"
                    aria-hidden
                  />
                  <p className="text-navy">{h.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {h.by ? fullName(h.by) : 'System'} · {formatDateTime(h.at)}
                  </p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-navy">{value}</dd>
    </div>
  )
}

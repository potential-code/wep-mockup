import type { CertificationOffering, OfferingStatus, QuizQuestion } from '@shared/types'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Archive,
  ArrowLeft,
  Award,
  CreditCard,
  Eye,
  ListChecks,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/shared/Cards'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { images } from '@/config/images'
import { OfferingCard } from '@/features/certification/components/cert-shared'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  offeringProblems,
  useAdminOffering,
  useDeleteOffering,
  useSaveOffering,
} from '@/queries/certification.queries'
import { Field } from '../components/common'
import { blankQuestion, isTrueFalse, QuestionDialog } from '../components/QuestionDialog'

const COVERS = Object.values(images.courses)

export const OFFERING_STATUS: Record<
  OfferingStatus,
  { label: string; tone: 'success' | 'neutral' | 'warning' }
> = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'success' },
  archived: { label: 'Archived', tone: 'warning' },
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

const blankOffering = (): CertificationOffering => ({
  id: '',
  slug: '',
  title: '',
  status: 'draft',
  price: 1200,
  currency: 'USD',
  focus: '',
  scope: [''],
  examQuestions: 0,
  passMark: 80,
  image: COVERS[0]?.src,
})

/** Create or edit a proposed certification: details, price, pass mark and exam questions. */
export function CertificationEditorPage() {
  const { offeringId } = useParams({ from: '/_app/admin/manage/certifications/$offeringId' })
  const isNew = offeringId === 'new'
  const { data, isLoading, error, refetch } = useAdminOffering(offeringId)

  if (isNew) return <Editor key="new" initial={blankOffering()} initialQuestions={[]} />
  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!data) return null
  return (
    <Editor
      key={offeringId}
      initial={data.offering}
      initialQuestions={data.questions}
      stats={data.stats}
    />
  )
}

type Confirm = { title: string; description: string; label: string; run: () => void }

function Editor({
  initial,
  initialQuestions,
  stats,
}: {
  initial: CertificationOffering
  initialQuestions: QuizQuestion[]
  stats?: { purchases: number; revenue: number; attempts: number; issued: number }
}) {
  const navigate = useNavigate()
  const save = useSaveOffering()
  const remove = useDeleteOffering()
  const [o, setO] = useState(initial)
  const [questions, setQuestions] = useState(initialQuestions)
  const [saved, setSaved] = useState(() => JSON.stringify([initial, initialQuestions]))
  const [errors, setErrors] = useState<string[]>([])
  const [editing, setEditing] = useState<QuizQuestion | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [preview, setPreview] = useState(false)
  const isNew = !initial.id
  const dirty = JSON.stringify([o, questions]) !== saved
  const patch = (p: Partial<CertificationOffering>) => setO((x) => ({ ...x, ...p }))

  const persist = (status: OfferingStatus, message: string) => {
    const id = o.id || `cert-${slugify(o.title) || 'new'}-${Date.now().toString(36).slice(-4)}`
    const next: CertificationOffering = {
      ...o,
      id,
      slug: o.slug || slugify(o.title),
      status,
      title: o.title.trim(),
      focus: o.focus.trim(),
    }
    const problems = offeringProblems(next, questions)
    setErrors(problems)
    if (problems.length) return
    save.mutate(
      { offering: next, questions },
      {
        onSuccess: (s) => {
          setO(s)
          setSaved(JSON.stringify([s, questions]))
          toast.success(message)
          if (isNew)
            navigate({
              to: '/admin/manage/certifications/$offeringId',
              params: { offeringId: s.id },
              replace: true,
            })
        },
      },
    )
  }

  const saveQuestion = (q: QuizQuestion) => {
    const exists = questions.some((x) => x.id === q.id)
    setQuestions(exists ? questions.map((x) => (x.id === q.id ? q : x)) : [...questions, q])
    setEditing(null)
  }

  const scope = o.scope.length ? o.scope : ['']
  const status = OFFERING_STATUS[o.status]

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      <Link
        to="/admin/manage/certifications"
        className="inline-flex w-fit items-center gap-1.5 font-medium text-blue text-sm hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> All certifications
      </Link>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
        <img
          src={o.image}
          alt=""
          className="aspect-video w-full shrink-0 rounded-xl object-cover sm:aspect-[4/3] sm:w-32"
        />
        <div className="grid min-w-0 flex-1 gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge tone={status.tone}>{isNew ? 'New draft' : status.label}</StatusBadge>
            <StatusBadge tone="coral" icon={null}>
              {formatCurrency(o.price || 0, o.currency)}
            </StatusBadge>
            <StatusBadge tone="info" icon={null}>
              {questions.length} questions · {o.passMark}% to pass
            </StatusBadge>
          </div>
          <h1 className="text-page-title text-navy">{o.title || 'New certification'}</h1>
          <p className="line-clamp-2 text-muted-foreground">
            {o.focus || 'Add a summary of what this certification covers.'}
          </p>
        </div>
        <div className="grid w-full justify-items-end gap-1.5 sm:w-auto">
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Button variant="outline" onClick={() => setPreview(true)}>
              <Eye aria-hidden /> Preview
            </Button>
            <Button
              variant="outline"
              disabled={save.isPending || (!dirty && !isNew)}
              onClick={() =>
                persist(o.status, o.status === 'draft' ? 'Draft saved' : 'Changes saved')
              }
            >
              <Save aria-hidden /> {o.status === 'draft' ? 'Save draft' : 'Save changes'}
            </Button>
            {o.status === 'published' ? (
              <Button
                variant="outline"
                disabled={save.isPending}
                onClick={() =>
                  setConfirm({
                    title: `Archive ${o.title}?`,
                    description:
                      'Companies can no longer buy it. Companies that already bought it keep their exam and certificate.',
                    label: 'Archive',
                    run: () => persist('archived', 'Certification archived'),
                  })
                }
              >
                <Archive aria-hidden /> Archive
              </Button>
            ) : (
              <Button
                disabled={save.isPending}
                onClick={() =>
                  persist(
                    'published',
                    o.status === 'archived'
                      ? 'Certification republished'
                      : 'Certification published',
                  )
                }
              >
                {o.status === 'archived' ? <RotateCcw aria-hidden /> : <Upload aria-hidden />}
                {o.status === 'archived' ? 'Republish' : 'Publish'}
              </Button>
            )}
            {!isNew && o.status !== 'published' ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-danger"
                aria-label={`Delete ${o.title}`}
                onClick={() =>
                  setConfirm({
                    title: `Delete ${o.title}?`,
                    description:
                      'The certification and its exam questions are removed. Certifications that companies have bought can only be archived.',
                    label: 'Delete certification',
                    run: () =>
                      remove.mutate(o.id, {
                        onSuccess: () => {
                          toast.success('Certification deleted')
                          navigate({ to: '/admin/manage/certifications' })
                        },
                      }),
                  })
                }
              >
                <Trash2 />
              </Button>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {save.isPending
              ? 'Saving…'
              : dirty
                ? 'Unsaved changes'
                : isNew
                  ? ''
                  : 'All changes saved'}
          </p>
        </div>
      </section>

      {errors.length ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger-soft/60 p-4 text-sm"
        >
          <p className="font-medium text-danger">Fix these first</p>
          <ul className="mt-1 list-disc ps-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <SectionCard
            title="Details"
            description="What companies see on the certification card and details page."
          >
            <div className="grid gap-4">
              <Field label="Title" required>
                <Input value={o.title} onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <Field label="Summary" hint="One sentence on what the certification covers.">
                <Textarea
                  value={o.focus}
                  onChange={(e) => patch({ focus: e.target.value })}
                  rows={2}
                />
              </Field>
              <fieldset className="grid gap-2">
                <legend className="mb-1 font-medium text-navy text-sm">Topics covered</legend>
                {scope.map((s, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: topics are positional
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={s}
                      aria-label={`Topic ${i + 1}`}
                      onChange={(e) =>
                        patch({ scope: scope.map((x, j) => (j === i ? e.target.value : x)) })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove topic ${i + 1}`}
                      disabled={scope.length <= 1}
                      onClick={() => patch({ scope: scope.filter((_, j) => j !== i) })}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
                {scope.length < 6 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => patch({ scope: [...scope, ''] })}
                  >
                    <Plus aria-hidden /> Add topic
                  </Button>
                ) : null}
              </fieldset>
            </div>
          </SectionCard>

          <SectionCard
            title="Exam questions"
            description={`Taken by an authorised company representative after payment. ${o.passMark}% to pass, retries allowed.`}
            action={
              <Button
                size="sm"
                onClick={() => setEditing(blankQuestion(o.id || `cert-${slugify(o.title)}`))}
              >
                <Plus aria-hidden /> Add question
              </Button>
            }
          >
            {questions.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
                No questions yet. Add at least 3 to publish. The demo exams use 10.
              </p>
            ) : (
              <ol className="grid grid-cols-[minmax(0,1fr)] gap-2">
                {questions.map((q, i) => (
                  <li
                    key={q.id}
                    className="flex items-center gap-3 rounded-xl border bg-surface/40 px-3 py-2"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-50 font-semibold text-blue text-xs">
                      {i + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm">{q.text}</p>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 font-semibold text-[0.65rem]',
                        isTrueFalse(q) ? 'bg-coral-50 text-coral-700' : 'bg-blue-50 text-blue-600',
                      )}
                    >
                      <span aria-hidden>{isTrueFalse(q) ? 'T/F' : 'MC'}</span>
                      <span className="sr-only">
                        {isTrueFalse(q) ? 'True or false' : 'Multiple choice'}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit question ${i + 1}`}
                      className="text-muted-foreground hover:text-navy"
                      onClick={() => setEditing(q)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete question ${i + 1}`}
                      className="text-muted-foreground hover:text-danger"
                      onClick={() =>
                        setConfirm({
                          title: `Delete question ${i + 1}?`,
                          description: 'It is removed from the exam when you save.',
                          label: 'Delete question',
                          run: () => setQuestions(questions.filter((x) => x.id !== q.id)),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </div>

        <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <SectionCard title="Price and pass rules">
            <div className="grid gap-4">
              <Field label="Price (USD)" required>
                <Input
                  type="number"
                  min={0}
                  value={o.price || ''}
                  onChange={(e) => patch({ price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Pass mark (%)" required hint="The brief proposes 80%.">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={o.passMark || ''}
                  onChange={(e) => patch({ passMark: Number(e.target.value) })}
                />
              </Field>
              <Field label="Cover image">
                <Select value={o.image} onValueChange={(v) => patch({ image: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERS.map((img) => (
                      <SelectItem key={img.src} value={img.src}>
                        {img.src.split('/').pop()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <p className="text-muted-foreground text-xs">
                A certificate is issued only after a confirmed demo payment and a passed exam. Price
                changes apply to new purchases.
              </p>
            </div>
          </SectionCard>

          {stats ? (
            <SectionCard title="Statistics">
              <dl className="grid grid-cols-2 gap-2">
                <Stat icon={<CreditCard />} label="Paid" value={stats.purchases} />
                <Stat icon={<Award />} label="Issued" value={stats.issued} />
                <Stat icon={<ListChecks />} label="Attempts" value={stats.attempts} />
                <Stat icon={<CreditCard />} label="Revenue" value={formatCurrency(stats.revenue)} />
              </dl>
            </SectionCard>
          ) : null}
        </aside>
      </div>

      <QuestionDialog question={editing} onClose={() => setEditing(null)} onSave={saveQuestion} />
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.label ?? 'Confirm'}
        destructive={confirm?.label.startsWith('Delete')}
        pending={remove.isPending}
        onConfirm={() => {
          confirm?.run()
          setConfirm(null)
        }}
      />
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Company preview</DialogTitle>
            <DialogDescription>How the card appears on the Certification page.</DialogDescription>
          </DialogHeader>
          <div className="pointer-events-none">
            <OfferingCard
              row={{
                offering: {
                  ...o,
                  title: o.title || 'New certification',
                  examQuestions: questions.length,
                },
                purchase: null,
              }}
              index={0}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-1 rounded-xl bg-surface/60 px-2 py-3 text-center [&_svg]:size-4 [&_svg]:text-blue">
      {icon}
      <dd className="font-semibold font-heading text-lg text-navy tabular-nums">{value}</dd>
      <dt className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
    </div>
  )
}

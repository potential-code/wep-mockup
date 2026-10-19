import { OFFICIAL_LINKS } from '@shared/reference'
import type { Application, ApplicationData, ApplicationDocument } from '@shared/types'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  FlaskConical,
  Save,
  Send,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import { DemoLabel } from '@/components/shared/Cards'
import type { UploadResult } from '@/components/shared/FileDrop'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { formatDateTime } from '@/lib/format'
import {
  emptyApplicationData,
  sampleApplicationData,
  useDiscardJoinDraft,
  useJoinDraft,
  useSaveJoinDraft,
  useSubmitApplication,
} from '@/queries/applications.queries'
import { ReviewStep } from '../components/ReviewStep'
import { Stepper } from '../components/Stepper'
import { SuccessScreen } from '../components/SuccessScreen'
import {
  CompanyStep,
  ContactsStep,
  ExecutiveStep,
  GenderStep,
  PlansStep,
  PresenceStep,
  ReferralStep,
  type StepProps,
} from '../components/steps'
import { JOIN_STEPS, joinIssues, setAt } from '../join-utils'

type Phase = 'intro' | 'form' | 'done'

const STEP_COMPONENTS = [
  CompanyStep,
  PresenceStep,
  ExecutiveStep,
  ContactsStep,
  GenderStep,
  PlansStep,
  ReferralStep,
]

const SAMPLE_DOCS = (): ApplicationDocument[] => {
  const at = new Date().toISOString()
  return [
    {
      id: 'doc-ceo_statement',
      kind: 'ceo_statement',
      fileName: 'WEPs_CEO_Statement_signed.pdf',
      sizeKb: 402,
      uploadedAt: at,
      version: 1,
    },
    {
      id: 'doc-registration',
      kind: 'registration',
      fileName: 'Commercial_Registration_2026.pdf',
      sizeKb: 780,
      uploadedAt: at,
      version: 1,
    },
    {
      id: 'doc-ceo_portrait',
      kind: 'ceo_portrait',
      fileName: 'CEO_portrait.jpg',
      sizeKb: 1850,
      uploadedAt: at,
      version: 1,
    },
  ]
}

export function JoinPage() {
  const reduced = usePrefersReducedMotion()
  const draftQuery = useJoinDraft()
  const save = useSaveJoinDraft()
  const discard = useDiscardJoinDraft()
  const submit = useSubmitApplication()

  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<ApplicationData>(() => emptyApplicationData())
  const [documents, setDocuments] = useState<ApplicationDocument[]>([])
  const [attempted, setAttempted] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState<Application | null>(null)

  const draft = draftQuery.data
  const hasDraft = !!draft?.savedAt

  const issues = useMemo(() => joinIssues(data, documents), [data, documents])
  const stepIssues = issues.filter((i) => i.step === step)
  const showErrors = attempted.has(step)
  const err = useCallback(
    (field: string) =>
      showErrors ? stepIssues.find((i) => i.field === field)?.message : undefined,
    [showErrors, stepIssues],
  )

  const set = useCallback(
    (path: string, value: unknown) => setData((d) => setAt(d, path, value)),
    [],
  )
  const setDoc = useCallback((kind: ApplicationDocument['kind'], file: UploadResult | null) => {
    setDocuments((docs) => {
      const rest = docs.filter((d) => d.kind !== kind)
      if (!file) return rest
      return [
        ...rest,
        {
          id: `doc-${kind}`,
          kind,
          fileName: file.fileName,
          sizeKb: file.sizeKb,
          uploadedAt: new Date().toISOString(),
          version: 1,
        },
      ]
    })
  }, [])

  const goTo = (n: number, d = data, docs = documents) => {
    setDir(n >= step ? 1 : -1)
    setStep(n)
    setMaxStep((m) => Math.max(m, n))
    save.mutate({ data: d, step: n, documents: docs })
    window.scrollTo({ top: 0 })
  }

  const next = () => {
    if (stepIssues.length > 0) {
      setAttempted((a) => new Set(a).add(step))
      toast.error('Please complete the highlighted fields to continue.')
      return
    }
    goTo(Math.min(8, step + 1))
  }

  const resume = () => {
    if (!draft) return
    setData(draft.data)
    setDocuments(draft.documents)
    setStep(draft.step)
    setMaxStep(draft.step)
    setPhase('form')
  }

  const startFresh = async () => {
    await discard.mutateAsync()
    setData(emptyApplicationData())
    setDocuments([])
    setStep(1)
    setMaxStep(1)
    setAttempted(new Set())
    setPhase('form')
  }

  const fillSample = () => {
    const d = sampleApplicationData()
    const docs = SAMPLE_DOCS()
    setData(d)
    setDocuments(docs)
    setStep(8)
    setMaxStep(8)
    setPhase('form')
    save.mutate({ data: d, step: 8, documents: docs })
    toast.success('Sample company loaded (demo data). Review it and submit.')
    window.scrollTo({ top: 0 })
  }

  const finishLater = async () => {
    await save.mutateAsync({ data, step, documents })
    toast.success('Draft saved. You can resume any time on this device.')
    setPhase('intro')
    window.scrollTo({ top: 0 })
  }

  const doSubmit = async () => {
    if (issues.length) {
      setAttempted(new Set(JOIN_STEPS.map((s) => s.n)))
      return
    }
    const app = await submit.mutateAsync()
    setSubmitted(app)
    setPhase('done')
    celebrate()
    window.scrollTo({ top: 0 })
  }

  const StepBody = STEP_COMPONENTS[step - 1]
  const stepProps: StepProps = { data, set, err, documents, setDoc, showMissing: showErrors }
  const meta = JOIN_STEPS[step - 1]

  return (
    <div>
      <section className="bg-navy pt-28 pb-12 text-white">
        <div className="container-public grid gap-3">
          <p className="font-medium text-gold text-sm">Join the WEPs</p>
          <h1 className="text-page-title max-w-3xl">
            Commit your company to the Women’s Empowerment Principles
          </h1>
          <p className="max-w-2xl text-white/80">
            Applying takes about 15 minutes. It is free, and a financial contribution is never a
            condition of joining.
          </p>
        </div>
      </section>

      <section className="bg-surface pt-8 pb-28 md:pb-16">
        <div className="container-public max-w-4xl">
          {phase === 'intro' && (
            <Intro
              loading={draftQuery.isLoading}
              hasDraft={hasDraft}
              savedAt={draft?.savedAt}
              resumeStep={draft?.step}
              company={draft?.data.company.name}
              onStart={startFresh}
              onResume={resume}
              onSample={fillSample}
              pending={discard.isPending}
            />
          )}

          {phase === 'form' && (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
              <div className="rounded-2xl border bg-card p-4 shadow-card sm:p-5">
                <Stepper step={step} maxStep={maxStep} onGo={(n) => goTo(n)} />
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      {meta?.label}
                    </p>
                    <h2 className="text-section text-navy">{meta?.blurb}</h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={fillSample}>
                    <FlaskConical aria-hidden /> Fill with sample company
                    <DemoLabel className="ms-1">Demo</DemoLabel>
                  </Button>
                </div>
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: reduced ? 0 : dir * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduced ? 0 : dir * -24 }}
                    transition={{ duration: 0.2 }}
                  >
                    {StepBody ? (
                      <StepBody {...stepProps} />
                    ) : (
                      <ReviewStep
                        data={data}
                        documents={documents}
                        issues={issues}
                        onEdit={(n) => goTo(n)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-2 border-t bg-card/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
                <Button variant="outline" disabled={step === 1} onClick={() => goTo(step - 1)}>
                  <ArrowLeft aria-hidden /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={finishLater} disabled={save.isPending}>
                    <Save aria-hidden />
                    <span className="hidden sm:inline">Save and finish later</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  {step < 8 ? (
                    <Button onClick={next}>
                      Continue <ArrowRight aria-hidden />
                    </Button>
                  ) : (
                    <Button onClick={doSubmit} disabled={submit.isPending}>
                      <Send aria-hidden /> {submit.isPending ? 'Submitting…' : 'Submit application'}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-center text-muted-foreground text-xs" aria-live="polite">
                {save.isPending
                  ? 'Saving draft…'
                  : save.data?.savedAt
                    ? `Draft saved ${formatDateTime(save.data.savedAt)}`
                    : 'Your progress is saved when you move between steps.'}
              </p>
            </div>
          )}

          {phase === 'done' && submitted && <SuccessScreen application={submitted} />}
        </div>
      </section>
    </div>
  )
}

function Intro({
  loading,
  hasDraft,
  savedAt,
  resumeStep,
  company,
  onStart,
  onResume,
  onSample,
  pending,
}: {
  loading: boolean
  hasDraft: boolean
  savedAt?: string
  resumeStep?: number
  company?: string
  onStart: () => void
  onResume: () => void
  onSample: () => void
  pending: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      {loading ? <Skeleton className="h-24 rounded-2xl" /> : null}
      {hasDraft ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue/30 bg-blue-50 p-5">
          <div>
            <p className="font-heading font-semibold text-navy">Welcome back</p>
            <p className="text-sm">
              Your draft{company ? ` for ${company}` : ''} was saved {formatDateTime(savedAt)}.
              Resume at step {resumeStep}.
            </p>
          </div>
          <Button onClick={onResume}>
            Resume application <ArrowRight aria-hidden />
          </Button>
        </div>
      ) : null}
      <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-card sm:p-8 lg:grid-cols-2">
        <div className="grid content-start gap-3">
          <h2 className="text-section text-navy">Who can join</h2>
          <ul className="grid gap-2.5 text-sm">
            {[
              'Any company, of any size or sector, in any country.',
              'A CEO or equivalent leader willing to sign the CEO Statement of Support.',
              'A legally registered business, with registration documents ready.',
              'A commitment to implement the seven Principles, at your own pace.',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-3">
          <h2 className="text-section text-navy">Have ready</h2>
          <ul className="grid gap-2.5 text-sm">
            {[
              ['Signed CEO statement', 'PDF, from the official unmodified template'],
              ['CEO portrait', 'JPG or PNG, up to 8 MB'],
              ['Legal registration document', 'PDF, JPG or PNG'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                <span>
                  <strong className="text-navy">{t}</strong>, {d}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={OFFICIAL_LINKS.join}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-blue text-sm hover:underline"
          >
            Official template and guidance on weps.org{' '}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t pt-6 lg:col-span-2">
          <Button size="lg" onClick={onStart} disabled={pending}>
            <Building2 aria-hidden /> {hasDraft ? 'Start a new application' : 'Start application'}
          </Button>
          <Button size="lg" variant="outline" onClick={onSample}>
            <FlaskConical aria-hidden /> Fill with sample company
          </Button>
          <DemoLabel>Demo shortcut</DemoLabel>
        </div>
      </div>
    </div>
  )
}

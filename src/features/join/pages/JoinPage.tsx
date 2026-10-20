import { OFFICIAL_LINKS } from '@shared/reference'
import type { Application, ApplicationData, ApplicationDocument } from '@shared/types'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  ExternalLink,
  FileText,
  FlaskConical,
  History,
  type LucideIcon,
  Save,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Unlock,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import type { UploadResult } from '@/components/shared/FileDrop'
import { Button } from '@/components/ui/button'
import { images } from '@/config/images'
import { AuthShell } from '@/features/public-site/components/AuthShell'
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
import { STEP_ICONS } from '../components/step-icons'
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

  // Step changes keep the reader where they are. The step body's height is held while the old
  // step animates out (mode="wait" would otherwise collapse it and yank the page), then the card
  // is brought into view only if its top has scrolled off screen (e.g. Continue at the bottom).
  const cardRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const holdHeight = () => {
    const b = bodyRef.current
    if (b) b.style.minHeight = `${b.offsetHeight}px`
  }
  const settle = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (bodyRef.current) bodyRef.current.style.minHeight = ''
        const top = cardRef.current?.getBoundingClientRect().top
        if (top !== undefined && top < 0)
          window.scrollTo({
            top: window.scrollY + top - 16,
            behavior: reduced ? 'auto' : 'smooth',
          })
      }),
    )
  const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })

  const goTo = (n: number, d = data, docs = documents) => {
    if (n === step) return
    holdHeight()
    setDir(n >= step ? 1 : -1)
    setStep(n)
    setMaxStep((m) => Math.max(m, n))
    save.mutate({ data: d, step: n, documents: docs })
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
    if (phase === 'form' && step !== 8) {
      holdHeight()
      setDir(1)
    }
    setData(d)
    setDocuments(docs)
    setStep(8)
    setMaxStep(8)
    setPhase('form')
    save.mutate({ data: d, step: 8, documents: docs })
    toast.success('Sample company loaded (demo data). Review it and submit.')
  }

  const finishLater = async () => {
    await save.mutateAsync({ data, step, documents })
    toast.success('Draft saved. You can resume any time on this device.')
    setPhase('intro')
    toTop()
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
    toTop()
  }

  const StepBody = STEP_COMPONENTS[step - 1]
  const stepProps: StepProps = { data, set, err, documents, setDoc, showMissing: showErrors }
  const meta = JOIN_STEPS[step - 1]
  const StepIcon = STEP_ICONS[step - 1] ?? Building2

  return (
    <AuthShell
      wide
      image={images.hero.join}
      eyebrow="Join the WEPs"
      headline="Make your commitment to gender equality official."
      text="Thousands of companies worldwide have signed the CEO Statement of Support. Yours can be next."
      bullets={[
        { icon: Clock, text: 'About 15 minutes, in eight short steps' },
        { icon: Save, text: 'Your draft saves as you go' },
        { icon: SearchCheck, text: 'Every application reviewed by UN Women' },
      ]}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 pb-24 md:pb-0">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-3"
        >
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-coral/40 bg-coral-50 px-3 py-1 font-medium text-coral-700 text-xs uppercase tracking-[0.14em]">
            <Sparkles className="size-3.5" aria-hidden /> Join the WEPs
          </p>
          <h1 className="text-balance font-medium font-heading text-3xl text-navy leading-tight sm:text-4xl">
            Commit your company to the Women’s Empowerment Principles
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Applying is free, and a financial contribution is never a condition of joining.
          </p>
          <ul className="flex flex-wrap gap-2 text-sm">
            {(
              [
                [Clock, 'About 15 minutes'],
                [BadgeCheck, 'Free to join'],
                [Save, 'Save and resume'],
              ] as [LucideIcon, string][]
            ).map(([Icon, label]) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-navy shadow-[var(--shadow-field)]"
              >
                <Icon className="size-3.5 text-blue" aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </motion.header>

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
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-white p-4 shadow-card sm:px-5 sm:pt-5 sm:pb-4"
            >
              <Stepper step={step} maxStep={maxStep} onGo={(n) => goTo(n)} />
            </motion.div>

            <motion.div
              ref={cardRef}
              data-join-card
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative scroll-mt-4 overflow-hidden rounded-2xl border bg-white shadow-lift"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--coral),var(--blue)_45%,var(--navy))]"
              />
              <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden border-b bg-[linear-gradient(100deg,var(--blue-50),#fff_55%,var(--coral-50))] px-5 pt-6 pb-5 sm:px-8">
                <span
                  aria-hidden
                  className="-right-10 -bottom-16 pointer-events-none absolute size-40 rounded-full border border-coral/25"
                />
                <span
                  aria-hidden
                  className="-right-2 -bottom-8 pointer-events-none absolute size-24 rounded-full border border-blue/15"
                />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex min-w-0 items-center gap-4"
                  >
                    <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--navy),var(--blue))] text-white shadow-[0_10px_22px_-10px_rgb(0_119_182/0.9)] ring-4 ring-white">
                      <StepIcon className="size-5" aria-hidden />
                      <span className="-top-1.5 -right-1.5 absolute grid size-5 place-items-center rounded-full bg-coral-600 font-bold text-[10px] text-white ring-2 ring-white">
                        {step}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-blue text-xs uppercase tracking-[0.14em]">
                        Step {step} of {JOIN_STEPS.length} · {meta?.label}
                      </p>
                      <h2 className="text-balance font-medium font-heading text-navy text-xl sm:text-2xl">
                        {meta?.blurb}
                      </h2>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative rounded-full bg-white shadow-[var(--shadow-field)] hover:border-coral/60"
                  onClick={fillSample}
                >
                  <FlaskConical aria-hidden /> Fill with sample company
                </Button>
              </div>
              <div ref={bodyRef} className="p-4 sm:p-8 [&>*>*]:grid-cols-[minmax(0,1fr)]">
                <AnimatePresence mode="wait" custom={dir} initial={false} onExitComplete={settle}>
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
            </motion.div>

            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-2 border-t bg-white/95 p-3 shadow-[0_-8px_24px_-12px_rgb(23_36_58/0.25)] backdrop-blur md:static md:rounded-2xl md:border md:p-3 md:shadow-card">
              <Button
                variant="outline"
                disabled={step === 1}
                onClick={() => goTo(step - 1)}
                className="group"
              >
                <ArrowLeft
                  className="transition-transform group-hover:-translate-x-0.5"
                  aria-hidden
                />{' '}
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={finishLater} disabled={save.isPending}>
                  <Save aria-hidden />
                  <span className="hidden sm:inline">Save and finish later</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                {step < 8 ? (
                  <Button variant="coral" onClick={next} className="group">
                    Continue{' '}
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Button>
                ) : (
                  <Button variant="coral" onClick={doSubmit} disabled={submit.isPending}>
                    <Send aria-hidden /> {submit.isPending ? 'Submitting…' : 'Submit application'}
                  </Button>
                )}
              </div>
            </div>
            <p
              className="flex items-center justify-center gap-1.5 text-center text-muted-foreground text-xs"
              aria-live="polite"
            >
              <span
                aria-hidden
                className={
                  save.isPending
                    ? 'size-1.5 animate-pulse rounded-full bg-coral'
                    : 'size-1.5 rounded-full bg-success'
                }
              />
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
    </AuthShell>
  )
}

const ease = [0.22, 1, 0.36, 1] as const
const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay: 0.1 + i * 0.08, ease },
})

const WHO_CAN_JOIN = [
  'Any company, of any size or sector, in any country.',
  'A CEO or equivalent leader willing to sign the CEO Statement of Support.',
  'A legally registered business, with registration documents ready.',
  'A commitment to implement the seven Principles, at your own pace.',
]
const HAVE_READY = [
  ['Signed CEO statement', 'PDF, from the official unmodified template'],
  ['CEO portrait', 'JPG or PNG, up to 8 MB'],
  ['Legal registration document', 'PDF, JPG or PNG'],
] as const
const AFTER = [
  { icon: Send, title: 'You apply', text: 'Eight short steps' },
  { icon: SearchCheck, title: 'UN Women reviews', text: 'Usually 10 working days' },
  { icon: Unlock, title: 'Portal unlocks', text: 'Your CEO account goes live' },
]

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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      {/* Actions first, so the way in is visible without scrolling */}
      <motion.div
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-2xl bg-[linear-gradient(120deg,var(--navy-900),var(--navy)_45%,var(--blue))] p-5 text-white shadow-lift sm:p-6"
      >
        <span
          aria-hidden
          className="-right-12 -top-12 pointer-events-none absolute size-44 rounded-full border border-white/15"
        />
        <span
          aria-hidden
          className="-right-4 -top-4 pointer-events-none absolute size-24 rounded-full border border-coral/40"
        />
        <div className="relative flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-coral-300 ring-1 ring-white/20">
            {hasDraft ? (
              <History className="size-5" aria-hidden />
            ) : (
              <Building2 className="size-5" aria-hidden />
            )}
          </span>
          <div>
            <p className="font-heading font-medium">
              {hasDraft ? 'Welcome back' : 'Ready when you are'}
            </p>
            <p className="text-sm text-white/90">
              {hasDraft
                ? `Your draft${company ? ` for ${company}` : ''} was saved ${formatDateTime(savedAt)}. Resume at step ${resumeStep}.`
                : 'Eight short steps. Your progress saves as you go, so you can finish later.'}
            </p>
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          {hasDraft ? (
            <Button variant="coral" size="lg" className="group rounded-full" onClick={onResume}>
              Resume application{' '}
              <ArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Button>
          ) : null}
          <Button
            variant={hasDraft ? 'outline-light' : 'coral'}
            size="lg"
            className="group rounded-full"
            onClick={onStart}
            disabled={pending || loading}
          >
            {hasDraft ? 'Start a new application' : 'Start application'}
            {hasDraft ? null : (
              <ArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            )}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full text-white/85 hover:bg-white/10 hover:text-white"
            onClick={onSample}
          >
            <FlaskConical aria-hidden /> Fill with sample company
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.section
          {...fadeUp(1)}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-card transition-shadow hover:shadow-lift"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-success/70" />
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success ring-1 ring-success/20">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <h2 className="font-medium font-heading text-navy text-xl">Who can join</h2>
          </div>
          <ul className="grid gap-3 text-sm">
            {WHO_CAN_JOIN.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          {...fadeUp(2)}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-card transition-shadow hover:shadow-lift"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-blue/70" />
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue ring-1 ring-blue/20">
              <FileText className="size-5" aria-hidden />
            </span>
            <h2 className="font-medium font-heading text-navy text-xl">Have ready</h2>
          </div>
          <ul className="grid gap-2.5 text-sm">
            {HAVE_READY.map(([t, d]) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-xl border border-blue-100/80 bg-surface/70 px-3 py-2.5"
              >
                <FileText className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                <span>
                  <strong className="block text-navy">{t}</strong>
                  <span className="text-muted-foreground text-xs">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <a
            href={OFFICIAL_LINKS.join}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 font-medium text-blue text-sm hover:underline"
          >
            Official template and guidance on weps.org{' '}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </motion.section>
      </div>

      <motion.section
        {...fadeUp(3)}
        className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-card"
      >
        <h2 className="mb-4 font-heading font-medium text-navy">What happens after you apply</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {AFTER.map((a, i) => (
            <li key={a.title} className="relative flex items-center gap-3 sm:block">
              {i < AFTER.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-5 left-12 hidden h-px w-[calc(100%-3.5rem)] bg-[repeating-linear-gradient(90deg,var(--coral)_0_6px,transparent_6px_12px)] sm:block"
                />
              ) : null}
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--navy),var(--blue))] text-white shadow-[0_8px_18px_-8px_rgb(0_119_182/0.9)]">
                <a.icon className="size-4" aria-hidden />
              </span>
              <span className="sm:mt-3 sm:block">
                <span className="block font-semibold text-navy text-sm">{a.title}</span>
                <span className="block text-muted-foreground text-xs">{a.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </motion.section>
    </div>
  )
}

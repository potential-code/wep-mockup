import {
  blocksOf,
  DIFFICULTY_LABEL,
  modulesOf,
  postTestOf,
  unitsOf,
  withModules,
} from '@shared/courses'
import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import { DEMO_RULES, POINTS_RULES } from '@shared/rules'
import type {
  Course,
  CourseDifficulty,
  CourseModule,
  DepartmentId,
  Lesson,
  PrincipleId,
  QuizQuestion,
} from '@shared/types'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Blocks,
  BookOpen,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Plus,
  Settings,
  Upload,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DemoLabel } from '@/components/shared/Cards'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAdminCourse, useUpsertCourse } from '@/queries/admin.queries'
import { AddTestCard, ModuleList, TestCard } from '../components/CourseCurriculum'
import { CheckRow, Field, SwitchRow } from '../components/common'
import { LessonEditor } from '../components/LessonEditor'
import { blankQuestion, QuestionDialog } from '../components/QuestionDialog'

const NONE = '__none'
const COVERS = Object.values(images.courses)

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

const uid = () => Date.now().toString(36)

/** What stops a course being saved (or kept published). */
function problemsOf(c: Course, publish: boolean) {
  const e: string[] = []
  if (!c.title.trim()) e.push('Title is required.')
  if (!publish) return e
  const post = postTestOf(c)
  if (!c.objective.trim()) e.push('Learning objective is required to publish.')
  if (c.departments.length === 0) e.push('Assign at least one department to publish.')
  if (unitsOf(c).length === 0) e.push('Add at least one unit to publish.')
  if (post && !post.quiz?.length) e.push('The post-test needs at least one question.')
  if (c.preTest && c.preTest.questions.length === 0)
    e.push('The pre-test needs at least one question, or delete it.')
  if (c.designated && !post)
    e.push('A designated course needs a post-test (it unlocks the clinic).')
  return e
}

export function CourseEditorPage() {
  const { courseId } = useParams({ from: '/_app/admin/manage/courses/$courseId' })
  const isNew = courseId === 'new'
  const { data, isLoading, error, refetch } = useAdminCourse(courseId)

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isNew) return <NewCourse />
  if (!data?.course)
    return (
      <ErrorState
        title="Course not found"
        message="This course may have been removed."
        onRetry={refetch}
      />
    )
  return (
    <Builder
      key={courseId}
      initial={data.course}
      others={data.courses.filter((c) => c.id !== courseId)}
      events={data.events}
    />
  )
}

/* ------------------------------------------------------------ New course -- */

function NewCourse() {
  const navigate = useNavigate()
  const save = useUpsertCourse()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('beginner')
  const [touched, setTouched] = useState(false)

  const create = () => {
    setTouched(true)
    if (!title.trim()) return
    const id = `crs-${slugify(title)}-${uid().slice(-3)}`
    const course: Course = {
      id,
      slug: slugify(title),
      title: title.trim(),
      objective: '',
      description: description.trim(),
      outcomes: [],
      image: COVERS[0]?.src ?? '',
      departments: [],
      principle: 1,
      topic: '',
      language: 'English',
      lessons: [],
      modules: [{ id: `${id}-m1`, title: 'Module 1', lessonIds: [] }],
      audience: 'employee',
      published: false,
      difficulty,
      certificate: true,
    }
    save.mutate(course, {
      onSuccess: () => {
        toast.success('Draft course created')
        navigate({ to: '/admin/manage/courses/$courseId', params: { courseId: id }, replace: true })
      },
    })
  }

  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <BackLink />
      <section className="grid gap-4 rounded-2xl border bg-card p-6 shadow-card">
        <div className="grid gap-1">
          <h1 className="text-page-title text-navy">New course</h1>
          <p className="text-muted-foreground">
            Name the course to create a draft. You add modules, units and tests next.
          </p>
        </div>
        <Field label="Title" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={touched && !title.trim()}
          />
          {touched && !title.trim() ? (
            <span role="alert" className="text-danger text-xs">
              A title is required.
            </span>
          ) : null}
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </Field>
        <Field label="Difficulty">
          <DifficultySelect value={difficulty} onChange={setDifficulty} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/manage/courses">Cancel</Link>
          </Button>
          <Button onClick={create} disabled={save.isPending}>
            {save.isPending ? 'Creating…' : 'Create draft'}
          </Button>
        </div>
      </section>
    </div>
  )
}

/* --------------------------------------------------------------- Builder -- */

type Confirm = { title: string; description: string; label: string; run: () => void }
type Rename = { title: string; label: string; value: string; save: (v: string) => void }

function Builder({
  initial,
  others,
  events,
}: {
  initial: Course
  others: { id: string; title: string }[]
  events: { id: string; title: string }[]
}) {
  const save = useUpsertCourse()
  const [c, setC] = useState<Course>(initial)
  const [status, setStatus] = useState<'saved' | 'saving' | 'pending' | 'blocked'>('saved')
  const [errors, setErrors] = useState<string[]>([])
  const [unit, setUnit] = useState<{ lesson: Lesson; moduleId: string } | null>(null)
  const [question, setQuestion] = useState<{ q: QuizQuestion; test: 'pre' | 'post' } | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [rename, setRename] = useState<Rename | null>(null)

  // Autosave: every change is saved shortly after the last edit, and flushed on leave.
  const lastSaved = useRef(JSON.stringify(initial))
  const latest = useRef(c)
  latest.current = c
  const persist = (course: Course) => {
    const json = JSON.stringify(course)
    if (json === lastSaved.current) return setStatus('saved')
    const problems = problemsOf(course, course.published)
    setErrors(problems)
    if (problems.length) return setStatus('blocked')
    setStatus('saving')
    lastSaved.current = json
    save.mutate(course, {
      onSuccess: () => setStatus((s) => (s === 'saving' ? 'saved' : s)),
      onError: () => {
        lastSaved.current = ''
        setStatus('pending')
      },
    })
  }
  const persistRef = useRef(persist)
  persistRef.current = persist
  useEffect(() => {
    if (JSON.stringify(c) === lastSaved.current) return
    setStatus('pending')
    const t = setTimeout(() => persistRef.current(c), 700)
    return () => clearTimeout(t)
  }, [c])
  useEffect(() => () => persistRef.current(latest.current), [])

  const patch = (p: Partial<Course>) => setC((x) => ({ ...x, ...p }))
  const modules = modulesOf(c)
  const setModules = (ms: CourseModule[]) => setC((x) => withModules(x, ms))
  const lessonMap = useMemo(() => new Map(c.lessons.map((l) => [l.id, l])), [c.lessons])
  const post = postTestOf(c)
  const units = unitsOf(c)
  const blocks = units.reduce((n, l) => n + blocksOf(l), 0)

  const setPublished = (published: boolean) => {
    const problems = problemsOf(c, published)
    setErrors(problems)
    if (problems.length) {
      toast.error('Fix the issues listed at the top before publishing.')
      return
    }
    const next = { ...c, published }
    setC(next)
    lastSaved.current = JSON.stringify(next)
    setStatus('saving')
    save.mutate(next, {
      onSuccess: () => {
        setStatus('saved')
        toast.success(published ? 'Course published' : 'Course unpublished')
      },
    })
  }

  const toggleDept = (id: DepartmentId, on: boolean) =>
    patch({ departments: on ? [...c.departments, id] : c.departments.filter((d) => d !== id) })

  /* Tests */
  const saveQuestion = (q: QuizQuestion, test: 'pre' | 'post') => {
    if (test === 'pre' && c.preTest) {
      const qs = c.preTest.questions
      const has = qs.some((x) => x.id === q.id)
      patch({
        preTest: {
          ...c.preTest,
          questions: has ? qs.map((x) => (x.id === q.id ? q : x)) : [...qs, q],
        },
      })
    }
    if (test === 'post' && post) {
      const qs = post.quiz ?? []
      const has = qs.some((x) => x.id === q.id)
      const quiz = has ? qs.map((x) => (x.id === q.id ? q : x)) : [...qs, q]
      patch({ lessons: c.lessons.map((l) => (l.id === post.id ? { ...l, quiz } : l)) })
    }
    setQuestion(null)
  }
  const deleteQuestion = (q: QuizQuestion, test: 'pre' | 'post') =>
    setConfirm({
      title: 'Delete this question?',
      description: q.text,
      label: 'Delete question',
      run: () =>
        test === 'pre' && c.preTest
          ? patch({
              preTest: {
                ...c.preTest,
                questions: c.preTest.questions.filter((x) => x.id !== q.id),
              },
            })
          : post &&
            patch({
              lessons: c.lessons.map((l) =>
                l.id === post.id ? { ...l, quiz: (l.quiz ?? []).filter((x) => x.id !== q.id) } : l,
              ),
            }),
    })
  const addPostTest = () =>
    patch({
      lessons: [
        ...c.lessons,
        {
          id: `${c.id}-quiz`,
          title: `${c.title} post-test`,
          type: 'quiz',
          minutes: 8,
          summary: 'A short knowledge check on the main ideas of the course.',
          body: [],
          quiz: [],
        },
      ],
    })

  /* Modules and units */
  const addModule = () =>
    setRename({
      title: 'Add module',
      label: 'Add module',
      value: `Module ${modules.length + 1}`,
      save: (title) => setModules([...modules, { id: `${c.id}-m${uid()}`, title, lessonIds: [] }]),
    })
  const saveUnit = (l: Lesson, moduleId: string) => {
    const exists = c.lessons.some((x) => x.id === l.id)
    if (exists) patch({ lessons: c.lessons.map((x) => (x.id === l.id ? l : x)) })
    else
      setC((x) =>
        withModules(
          { ...x, lessons: [...x.lessons, l] },
          modules.map((m) => (m.id === moduleId ? { ...m, lessonIds: [...m.lessonIds, l.id] } : m)),
        ),
      )
    setUnit(null)
    toast.success(exists ? 'Unit updated' : 'Unit added')
  }

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      <BackLink />

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
        <img
          src={c.image}
          alt=""
          className="aspect-video w-full shrink-0 rounded-xl object-cover sm:aspect-[4/3] sm:w-32"
        />
        <div className="grid min-w-0 flex-1 gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            {c.published ? (
              <StatusBadge tone="success">Published</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Draft</StatusBadge>
            )}
            <StatusBadge tone="info" icon={null}>
              {DIFFICULTY_LABEL[c.difficulty ?? 'beginner']}
            </StatusBadge>
            {c.designated ? (
              <StatusBadge tone="gold" icon={null}>
                Designated
              </StatusBadge>
            ) : null}
          </div>
          <h1 className="text-page-title text-navy">{c.title || 'Untitled course'}</h1>
          <p className="line-clamp-2 text-muted-foreground">
            {c.description || 'No description yet.'}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="outline" asChild>
            <a href={`/portal/learn/${c.id}`} target="_blank" rel="noreferrer">
              <Eye aria-hidden /> Preview
            </a>
          </Button>
          <PublishButton published={c.published} onClick={() => setPublished(!c.published)} />
        </div>
      </section>

      {errors.length ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger-soft/60 p-4 text-sm"
        >
          <p className="font-medium text-danger">
            {c.published ? 'Changes are not saved until these are fixed' : 'Before you publish'}
          </p>
          <ul className="mt-1 list-disc ps-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          {c.preTest ? (
            <TestCard
              kind="pre"
              title={c.preTest.title}
              rule="Not graded · starting point"
              questions={c.preTest.questions}
              onRename={() =>
                c.preTest &&
                setRename({
                  title: 'Rename pre-test',
                  label: 'Save',
                  value: c.preTest.title,
                  save: (title) => c.preTest && patch({ preTest: { ...c.preTest, title } }),
                })
              }
              onDelete={() =>
                setConfirm({
                  title: 'Delete the pre-test?',
                  description: 'Its questions are removed. Learners go straight into the modules.',
                  label: 'Delete pre-test',
                  run: () => patch({ preTest: undefined }),
                })
              }
              onAddQuestion={() => setQuestion({ q: blankQuestion(`${c.id}-pre`), test: 'pre' })}
              onEditQuestion={(q) => setQuestion({ q, test: 'pre' })}
              onDeleteQuestion={(q) => deleteQuestion(q, 'pre')}
            />
          ) : (
            <AddTestCard
              kind="pre"
              onAdd={() =>
                patch({ preTest: { title: `${c.title}: starting check`, questions: [] } })
              }
            />
          )}

          <section aria-labelledby="curriculum-heading" className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-semibold text-[0.7rem] text-gold-700 uppercase tracking-[0.16em]">
                  Curriculum
                </p>
                <h2
                  id="curriculum-heading"
                  className="font-heading font-semibold text-navy text-xl"
                >
                  Modules and content
                </h2>
              </div>
              <Button onClick={addModule}>
                <Plus aria-hidden /> Add module
              </Button>
            </div>
            {modules.length === 0 ? (
              <p className="rounded-2xl border border-dashed bg-card/60 p-6 text-center text-muted-foreground text-sm">
                No modules yet. Add a module, then add units to it.
              </p>
            ) : (
              <ModuleList
                modules={modules}
                lessons={lessonMap}
                onReorder={setModules}
                onRename={(m) =>
                  setRename({
                    title: 'Rename module',
                    label: 'Save',
                    value: m.title,
                    save: (title) =>
                      setModules(modules.map((x) => (x.id === m.id ? { ...x, title } : x))),
                  })
                }
                onDelete={(m) =>
                  setConfirm({
                    title: `Delete ${m.title}?`,
                    description: m.lessonIds.length
                      ? `Its ${m.lessonIds.length} units are deleted too.`
                      : 'This module has no units.',
                    label: 'Delete module',
                    run: () =>
                      setC((x) =>
                        withModules(
                          { ...x, lessons: x.lessons.filter((l) => !m.lessonIds.includes(l.id)) },
                          modules.filter((y) => y.id !== m.id),
                        ),
                      ),
                  })
                }
                onReorderUnits={(m, ids) =>
                  setModules(modules.map((x) => (x.id === m.id ? { ...x, lessonIds: ids } : x)))
                }
                onAddUnit={(m) =>
                  setUnit({
                    moduleId: m.id,
                    lesson: {
                      id: `${c.id}-l${uid()}`,
                      title: '',
                      type: 'reading',
                      minutes: 10,
                      summary: '',
                      body: [],
                    },
                  })
                }
                onEditUnit={(l) =>
                  setUnit({
                    lesson: l,
                    moduleId: modules.find((m) => m.lessonIds.includes(l.id))?.id ?? '',
                  })
                }
                onDeleteUnit={(m, l) =>
                  setConfirm({
                    title: `Delete ${l.title || 'this unit'}?`,
                    description: 'Learners who completed it keep the points they earned.',
                    label: 'Delete unit',
                    run: () =>
                      setC((x) =>
                        withModules(
                          { ...x, lessons: x.lessons.filter((y) => y.id !== l.id) },
                          modules.map((y) =>
                            y.id === m.id
                              ? { ...y, lessonIds: y.lessonIds.filter((id) => id !== l.id) }
                              : y,
                          ),
                        ),
                      ),
                  })
                }
              />
            )}
          </section>

          {post ? (
            <TestCard
              kind="post"
              title={post.title}
              rule={`Graded · ${DEMO_RULES.quizPassMark}% to pass`}
              questions={post.quiz ?? []}
              onRename={() =>
                setRename({
                  title: 'Rename post-test',
                  label: 'Save',
                  value: post.title,
                  save: (title) =>
                    patch({
                      lessons: c.lessons.map((l) => (l.id === post.id ? { ...l, title } : l)),
                    }),
                })
              }
              onDelete={() =>
                setConfirm({
                  title: 'Delete the post-test?',
                  description: c.designated
                    ? 'This is a designated course, so it cannot be published again without a post-test.'
                    : 'Its questions are removed.',
                  label: 'Delete post-test',
                  run: () => patch({ lessons: c.lessons.filter((l) => l.id !== post.id) }),
                })
              }
              onAddQuestion={() => setQuestion({ q: blankQuestion(c.id), test: 'post' })}
              onEditQuestion={(q) => setQuestion({ q, test: 'post' })}
              onDeleteQuestion={(q) => deleteQuestion(q, 'post')}
            />
          ) : (
            <AddTestCard kind="post" onAdd={addPostTest} />
          )}
        </div>

        <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <section
            aria-labelledby="settings-heading"
            className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-2xl border bg-card p-5 shadow-card"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue">
                <Settings className="size-5" aria-hidden />
              </span>
              <div className="grid">
                <h2 id="settings-heading" className="font-heading font-semibold text-navy">
                  Course settings
                </h2>
                <SaveStatus status={status} />
              </div>
            </div>
            <Field label="Title" required>
              <Input value={c.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea
                value={c.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={3}
              />
            </Field>
            <Field
              label="Learning objective"
              hint="One sentence on what a learner can do afterwards."
            >
              <Textarea
                value={c.objective}
                onChange={(e) => patch({ objective: e.target.value })}
                rows={2}
              />
            </Field>
            <Field label="Cover image">
              <Select value={c.image} onValueChange={(v) => patch({ image: v })}>
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
              <img src={c.image} alt="" className="aspect-[16/7] w-full rounded-lg object-cover" />
            </Field>
            <Field label="Difficulty">
              <DifficultySelect
                value={c.difficulty ?? 'beginner'}
                onChange={(v) => patch({ difficulty: v })}
              />
            </Field>
            <div className="grid gap-1 text-sm">
              <span className="font-medium text-navy">Points awarded per unit</span>
              <p className="rounded-lg border bg-surface/50 px-3 py-2 tabular-nums">
                {POINTS_RULES.lesson_complete.amount}
              </p>
              <span className="text-muted-foreground text-xs">
                Awarded once when a learner completes a unit. Passing a designated post-test adds{' '}
                {POINTS_RULES.quiz_pass.amount}.{' '}
                <Link to="/admin/manage/gamification" className="text-blue hover:underline">
                  Edit in Gamification
                </Link>
              </span>
            </div>
            <CheckRow
              label="Enable certificate on completion"
              checked={c.certificate ?? false}
              onCheckedChange={(v) => patch({ certificate: v })}
            />

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 border-t pt-4">
              <h3 className="font-semibold text-[0.7rem] text-muted-foreground uppercase tracking-[0.16em]">
                Assignment
              </h3>
              <fieldset className="grid gap-2">
                <legend className="mb-1 font-medium text-navy text-sm">
                  Departments <span className="text-danger">*</span>
                </legend>
                {DEPARTMENTS.map((d) => (
                  <CheckRow
                    key={d.id}
                    label={d.label}
                    checked={c.departments.includes(d.id)}
                    onCheckedChange={(v) => toggleDept(d.id, v)}
                  />
                ))}
              </fieldset>
              <Field label="WEPs principle">
                <Select
                  value={String(c.principle)}
                  onValueChange={(v) => patch({ principle: Number(v) as PrincipleId })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRINCIPLES.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.id}. {p.short}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Topic">
                <Input value={c.topic} onChange={(e) => patch({ topic: e.target.value })} />
              </Field>
              <Field label="Audience">
                <Select
                  value={c.audience}
                  onValueChange={(v) => patch({ audience: v as Course['audience'] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All signatory users</SelectItem>
                    <SelectItem value="employee">Employees</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Language">
                <Input value={c.language} onChange={(e) => patch({ language: e.target.value })} />
              </Field>
              <Field label="Prerequisite course">
                <Select
                  value={c.prerequisiteCourseId ?? NONE}
                  onValueChange={(v) => patch({ prerequisiteCourseId: v === NONE ? undefined : v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {others.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Related clinic">
                <Select
                  value={c.relatedEventId ?? NONE}
                  onValueChange={(v) => patch({ relatedEventId: v === NONE ? undefined : v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {events.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <SwitchRow
                label="Designated pathway course"
                description="Passing its post-test counts towards unlocking the related clinic."
                checked={Boolean(c.designated)}
                onCheckedChange={(v) => patch({ designated: v })}
              />
            </div>
            <PublishButton
              published={c.published}
              onClick={() => setPublished(!c.published)}
              className="w-full"
            />
          </section>

          <section
            aria-labelledby="stats-heading"
            className="grid gap-3 rounded-2xl border bg-card p-5 shadow-card"
          >
            <h2
              id="stats-heading"
              className="font-semibold text-[0.7rem] text-muted-foreground uppercase tracking-[0.16em]"
            >
              Statistics
            </h2>
            <dl className="grid grid-cols-3 gap-2">
              <Stat icon={<Layers aria-hidden />} label="Modules" value={modules.length} />
              <Stat icon={<BookOpen aria-hidden />} label="Units" value={units.length} />
              <Stat icon={<Blocks aria-hidden />} label="Blocks" value={blocks} />
            </dl>
            <DemoLabel>Proposed learning content</DemoLabel>
          </section>
        </aside>
      </div>

      <LessonEditor
        lesson={unit?.lesson ?? null}
        onClose={() => setUnit(null)}
        onSave={(l) => unit && saveUnit(l, unit.moduleId)}
      />
      <QuestionDialog
        key={question?.q.id ?? 'none'}
        question={question?.q ?? null}
        onClose={() => setQuestion(null)}
        onSave={(q) => question && saveQuestion(q, question.test)}
      />
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.label ?? 'Delete'}
        destructive
        onConfirm={() => {
          confirm?.run()
          setConfirm(null)
        }}
      />
      <RenameDialog value={rename} onClose={() => setRename(null)} />
    </div>
  )
}

/* ---------------------------------------------------------------- Pieces -- */

function BackLink() {
  return (
    <Link
      to="/admin/manage/courses"
      className="inline-flex w-fit items-center gap-1.5 font-medium text-blue text-sm hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden /> All courses
    </Link>
  )
}

function PublishButton({
  published,
  onClick,
  className,
}: {
  published: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <Button variant={published ? 'outline' : 'default'} onClick={onClick} className={className}>
      {published ? <EyeOff aria-hidden /> : <Upload aria-hidden />}
      {published ? 'Unpublish' : 'Publish'}
    </Button>
  )
}

function DifficultySelect({
  value,
  onChange,
}: {
  value: CourseDifficulty
  onChange: (v: CourseDifficulty) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CourseDifficulty)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(DIFFICULTY_LABEL) as CourseDifficulty[]).map((d) => (
          <SelectItem key={d} value={d}>
            {DIFFICULTY_LABEL[d]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SaveStatus({ status }: { status: 'saved' | 'saving' | 'pending' | 'blocked' }) {
  const text = {
    saved: 'Changes save automatically.',
    pending: 'Unsaved changes…',
    saving: 'Saving…',
    blocked: 'Not saved: fix the issues at the top.',
  }[status]
  return (
    <p
      aria-live="polite"
      className={`flex items-center gap-1 text-xs ${status === 'blocked' ? 'text-danger' : 'text-muted-foreground'}`}
    >
      {status === 'saving' ? <Loader2 className="size-3 animate-spin" aria-hidden /> : null}
      {text}
    </p>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="grid justify-items-center gap-1 rounded-xl bg-surface/60 px-2 py-3 text-center [&_svg]:size-4 [&_svg]:text-blue">
      {icon}
      <dd className="font-bold font-heading text-navy text-xl tabular-nums">{value}</dd>
      <dt className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
    </div>
  )
}

function RenameDialog({ value, onClose }: { value: Rename | null; onClose: () => void }) {
  const [text, setText] = useState('')
  useEffect(() => setText(value?.value ?? ''), [value])
  return (
    <Dialog open={value !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{value?.title}</DialogTitle>
          <DialogDescription>The course saves automatically.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim() || !value) return
            value.save(text.trim())
            onClose()
          }}
        >
          <Field label="Name" required>
            <Input value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!text.trim()}>
              {value?.label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

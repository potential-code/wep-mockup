import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import { POINTS_RULES } from '@shared/rules'
import type { Course, DepartmentId, Lesson, PrincipleId } from '@shared/types'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileText,
  HelpCircle,
  MessageSquare,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAdminCourse, useUpsertCourse } from '@/queries/admin.queries'
import { ActionBar, CheckRow, Field, SwitchRow } from '../components/common'
import { LessonEditor } from '../components/LessonEditor'

const NONE = '__none'
const LESSON_ICON: Record<Lesson['type'], ReactNode> = {
  video: <PlayCircle className="size-4" aria-hidden />,
  reading: <FileText className="size-4" aria-hidden />,
  quiz: <HelpCircle className="size-4" aria-hidden />,
  reflection: <MessageSquare className="size-4" aria-hidden />,
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

const blankCourse = (): Course => ({
  id: '',
  slug: '',
  title: '',
  objective: '',
  description: '',
  outcomes: [],
  image: '/images/courses/inclusive-recruitment.webp',
  departments: [],
  principle: 1,
  topic: '',
  language: 'English',
  lessons: [],
  audience: 'employee',
  published: false,
})

export function CourseEditorPage() {
  const { courseId } = useParams({ from: '/_app/admin/manage/courses/$courseId' })
  const isNew = courseId === 'new'
  const { data, isLoading, error, refetch } = useAdminCourse(courseId)

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!isNew && !data?.course)
    return (
      <ErrorState
        title="Course not found"
        message="This course may have been removed."
        onRetry={refetch}
      />
    )
  return (
    <Editor
      key={courseId}
      initial={data?.course ?? blankCourse()}
      isNew={isNew}
      others={(data?.courses ?? []).filter((c) => c.id !== courseId)}
      events={data?.events ?? []}
    />
  )
}

function Editor({
  initial,
  isNew,
  others,
  events,
}: {
  initial: Course
  isNew: boolean
  others: { id: string; title: string }[]
  events: { id: string; title: string }[]
}) {
  const navigate = useNavigate()
  const save = useUpsertCourse()
  const [c, setC] = useState<Course>(initial)
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [editing, setEditing] = useState<Lesson | null>(null)

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const patch = (p: Partial<Course>) => {
    setC((x) => ({ ...x, ...p }))
    setDirty(true)
  }
  const move = (i: number, d: -1 | 1) => {
    const next = [...c.lessons]
    const [it] = next.splice(i, 1)
    if (it) next.splice(i + d, 0, it)
    patch({ lessons: next })
  }
  const toggleDept = (id: DepartmentId, on: boolean) =>
    patch({ departments: on ? [...c.departments, id] : c.departments.filter((d) => d !== id) })

  const validate = (publish: boolean) => {
    const e: string[] = []
    if (!c.title.trim()) e.push('Title is required.')
    if (publish) {
      if (!c.objective.trim()) e.push('Learning objective is required to publish.')
      if (c.departments.length === 0) e.push('Assign at least one department to publish.')
      if (c.lessons.length === 0) e.push('Add at least one lesson to publish.')
      if (c.designated && !c.lessons.some((l) => l.type === 'quiz'))
        e.push('A designated course needs a quiz lesson (it unlocks the clinic).')
    }
    setErrors(e)
    return e.length === 0
  }

  const submit = (publish: boolean) => {
    if (!validate(publish)) return
    const id = c.id || `crs-${slugify(c.title)}-${Date.now().toString(36).slice(-3)}`
    const course: Course = { ...c, id, slug: c.slug || slugify(c.title), published: publish }
    save.mutate(course, {
      onSuccess: () => {
        setDirty(false)
        setC(course)
        toast.success(publish ? 'Course published' : 'Draft saved')
        if (isNew)
          navigate({
            to: '/admin/manage/courses/$courseId',
            params: { courseId: id },
            replace: true,
          })
      },
    })
  }

  const minutes = c.lessons.reduce((n, l) => n + l.minutes, 0)
  const quizLessons = c.lessons.filter((l) => l.type === 'quiz').length

  return (
    <div>
      <PageHeader
        title={isNew ? 'New course' : c.title || 'Course editor'}
        eyebrow={c.published ? 'Published' : 'Draft'}
        breadcrumbs={[
          { label: 'Courses and Learning Paths', to: '/admin/manage/courses' },
          { label: isNew ? 'New course' : 'Edit' },
        ]}
        actions={
          !isNew ? (
            <Button variant="outline" asChild>
              <a href={`/portal/learn/${c.id}`} target="_blank" rel="noreferrer">
                <Eye aria-hidden /> Preview learner view
              </a>
            </Button>
          ) : null
        }
      />
      {!isNew ? (
        <p className="-mt-4 mb-6 text-muted-foreground text-sm">
          Preview opens the learner view in a new tab and shows the last saved version.
        </p>
      ) : null}

      {errors.length ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-danger/30 bg-danger-soft/60 p-4 text-sm"
        >
          <p className="font-medium text-danger">Please fix the following</p>
          <ul className="mt-1 list-disc ps-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
          <SectionCard title="Course record">
            <div className="grid gap-4">
              <Field label="Title" required>
                <Input value={c.title} onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <Field
                label="Learning objective"
                required
                hint="One sentence on what a learner can do afterwards."
              >
                <Textarea
                  value={c.objective}
                  onChange={(e) => patch({ objective: e.target.value })}
                  rows={2}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={c.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  rows={4}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Field label="Audience (visibility)">
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
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-1 font-medium text-navy text-sm">
                  Department assignment <span className="text-danger">*</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEPARTMENTS.map((d) => (
                    <CheckRow
                      key={d.id}
                      label={d.label}
                      checked={c.departments.includes(d.id)}
                      onCheckedChange={(v) => toggleDept(d.id, v)}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prerequisite course">
                  <Select
                    value={c.prerequisiteCourseId ?? NONE}
                    onValueChange={(v) =>
                      patch({ prerequisiteCourseId: v === NONE ? undefined : v })
                    }
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
              </div>
              <SwitchRow
                label="Designated pathway course"
                description="Completing it and passing its quiz counts towards unlocking the related clinic."
                checked={Boolean(c.designated)}
                onCheckedChange={(v) => patch({ designated: v })}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Lessons"
            description="Learners complete lessons in this order."
            action={
              <Button
                size="sm"
                onClick={() =>
                  setEditing({
                    id: `${c.id || 'new'}-l${Date.now().toString(36)}`,
                    title: '',
                    type: 'reading',
                    minutes: 10,
                    summary: '',
                    body: [],
                  })
                }
              >
                <Plus aria-hidden /> Add lesson
              </Button>
            }
          >
            {c.lessons.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
                No lessons yet. Add a reading, video, quiz or reflection to build the course.
              </p>
            ) : (
              <ol className="grid gap-2">
                {c.lessons.map((l, i) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 font-semibold text-blue text-xs">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-navy text-sm">
                        {l.title || 'Untitled lesson'}
                      </p>
                      <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        {LESSON_ICON[l.type]} {l.type} · {l.minutes} min
                        {l.quiz ? ` · ${l.quiz.length} questions` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move ${l.title} up`}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move ${l.title} down`}
                        disabled={i === c.lessons.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${l.title}`}
                        onClick={() => setEditing(l)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-danger"
                        aria-label={`Delete ${l.title}`}
                        onClick={() => patch({ lessons: c.lessons.filter((x) => x.id !== l.id) })}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </div>

        <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <SectionCard title="Summary">
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  {c.published ? (
                    <StatusBadge tone="success">Published</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Draft</StatusBadge>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lessons</dt>
                <dd>{c.lessons.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Quizzes</dt>
                <dd>{quizLessons}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd>{minutes} min</dd>
              </div>
            </dl>
          </SectionCard>
          <SectionCard title="Points" description="Set in Gamification rules.">
            <DemoLabel className="mb-3">Proposed rules</DemoLabel>
            <ul className="grid gap-1.5 text-sm">
              <li>{POINTS_RULES.lesson_complete.amount} points per completed lesson</li>
              <li>{POINTS_RULES.quiz_pass.amount} points for passing the designated quiz</li>
            </ul>
            <Button asChild variant="link" className="mt-2 h-auto p-0">
              <Link to="/admin/manage/gamification">Edit rules</Link>
            </Button>
          </SectionCard>
        </aside>
      </div>

      <ActionBar>
        {dirty ? (
          <span className="me-auto text-muted-foreground text-xs">Unsaved changes</span>
        ) : null}
        <Button variant="outline" asChild>
          <Link to="/admin/manage/courses">Back to list</Link>
        </Button>
        <Button variant="outline" disabled={save.isPending} onClick={() => submit(false)}>
          {save.isPending ? 'Saving…' : 'Save draft'}
        </Button>
        <Button disabled={save.isPending} onClick={() => submit(true)}>
          {c.published ? 'Save and keep published' : 'Publish'}
        </Button>
      </ActionBar>

      <LessonEditor
        lesson={editing}
        onClose={() => setEditing(null)}
        onSave={(l) => {
          const exists = c.lessons.some((x) => x.id === l.id)
          patch({
            lessons: exists ? c.lessons.map((x) => (x.id === l.id ? l : x)) : [...c.lessons, l],
          })
          setEditing(null)
          toast.success('Lesson updated. Save the course to keep it.')
        }}
      />
    </div>
  )
}

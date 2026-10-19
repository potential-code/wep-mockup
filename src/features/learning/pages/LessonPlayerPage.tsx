import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ListTree,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { celebrate } from '@/components/motion/Celebrate'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CompletionDialog } from '@/features/learning/components/CompletionDialog'
import { LessonOutline } from '@/features/learning/components/LessonOutline'
import { showPointsToast } from '@/features/learning/components/PointsToast'
import { type QuizOutcome, QuizRunner } from '@/features/learning/components/QuizRunner'
import { ReadingBody } from '@/features/learning/components/ReadingLesson'
import { ReflectionLesson } from '@/features/learning/components/ReflectionLesson'
import { LESSON_TYPE_LABEL, lessonPoints } from '@/features/learning/components/shared'
import { VideoLesson } from '@/features/learning/components/VideoLesson'
import {
  useCompleteLesson,
  useCourse,
  useMyLearning,
  useSaveReflection,
} from '@/queries/learning.queries'

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams({ from: '/_app/portal/learn/$courseId/$lessonId' })
  const navigate = useNavigate()
  const q = useCourse(courseId)
  const mine = useMyLearning()
  const complete = useCompleteLesson()
  const saveReflection = useSaveReflection()
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [celebration, setCelebration] = useState<{ clinicId?: string } | null>(null)
  const [reflection, setReflection] = useState('')

  const d = q.data
  const lessonIndex = d ? d.course.lessons.findIndex((l) => l.id === lessonId) : -1
  const lesson = d && lessonIndex >= 0 ? d.course.lessons[lessonIndex] : undefined
  const savedReflection = d?.progress?.reflections[lessonId] ?? ''

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset draft when the lesson changes
  useEffect(() => setReflection(savedReflection), [lessonId, d?.progress === null])

  if (q.isLoading) return <PageSkeleton />
  if (q.isError || !d) return <ErrorState message={q.error?.message} onRetry={() => q.refetch()} />
  if (d.state === 'locked')
    return (
      <AccessNotice
        title="This course is locked"
        message="Complete the prerequisite course first, then come back."
        action={
          <Button asChild>
            <Link to="/portal/learn">Back to my path</Link>
          </Button>
        }
      />
    )
  if (!lesson)
    return <ErrorState title="Lesson not found" message="This lesson is no longer available." />

  const designated = mine.data?.designatedCourseId === d.course.id
  const isDone = d.progress?.completedLessonIds.includes(lesson.id) ?? false
  const prev = d.course.lessons[lessonIndex - 1]
  const next = d.course.lessons[lessonIndex + 1]
  const points = lessonPoints(lesson, designated)

  const finish = (r: { courseCompleted: boolean; clinicUnlocked?: string }) => {
    if (r.courseCompleted) {
      celebrate()
      setCelebration({ clinicId: r.clinicUnlocked })
    }
  }

  const markComplete = async () => {
    if (lesson.type === 'reflection' && reflection !== savedReflection)
      await saveReflection.mutateAsync({ courseId, lessonId, text: reflection })
    complete.mutate(
      { courseId, lessonId },
      {
        onSuccess: (r) => {
          showPointsToast(r.pointsAwarded, lesson.title)
          finish(r)
        },
      },
    )
  }

  const onQuiz = (r: QuizOutcome) => {
    if (r.passed) {
      showPointsToast(r.pointsAwarded, `${lesson.title} passed`)
      finish(r)
    }
  }

  const outline = (onNavigate?: () => void) => (
    <LessonOutline data={d} currentId={lesson.id} designated={designated} onNavigate={onNavigate} />
  )

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Learn', to: '/portal/learn' },
          { label: d.course.title, to: `/portal/learn/${d.course.id}` },
          { label: lesson.title },
        ]}
        eyebrow={`Lesson ${lessonIndex + 1} of ${d.course.lessons.length} · ${LESSON_TYPE_LABEL[lesson.type]} · ${lesson.minutes} min`}
        title={lesson.title}
        description={lesson.summary}
        actions={
          <>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <ListTree aria-hidden /> Lessons
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-5">
                <SheetHeader className="p-0 pb-3">
                  <SheetTitle>Course outline</SheetTitle>
                </SheetHeader>
                {outline(() => setSheetOpen(false))}
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              className="hidden lg:inline-flex"
              aria-expanded={outlineOpen}
              onClick={() => setOutlineOpen((o) => !o)}
            >
              {outlineOpen ? <PanelLeftClose aria-hidden /> : <PanelLeftOpen aria-hidden />}
              {outlineOpen ? 'Hide outline' : 'Show outline'}
            </Button>
          </>
        }
      />
      <div className={outlineOpen ? 'grid gap-6 lg:grid-cols-[19rem_1fr]' : 'grid gap-6'}>
        {outlineOpen ? (
          <aside className="hidden self-start rounded-2xl border bg-card p-4 shadow-card lg:sticky lg:top-20 lg:block">
            {outline()}
          </aside>
        ) : null}
        <div className="grid min-w-0 content-start gap-6">
          {isDone ? (
            <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-2.5 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              You completed this lesson. Reopening it never awards points twice.
            </p>
          ) : null}

          {lesson.type === 'video' ? (
            <>
              <VideoLesson lesson={lesson} poster={d.course.image} />
              <ReadingBody lesson={lesson} />
            </>
          ) : null}
          {lesson.type === 'reading' ? <ReadingBody lesson={lesson} /> : null}
          {lesson.type === 'reflection' ? (
            <>
              <ReadingBody lesson={lesson} />
              <ReflectionLesson
                courseId={courseId}
                lessonId={lessonId}
                prompt={lesson.reflectionPrompt ?? 'What will you do differently?'}
                initial={savedReflection}
                value={reflection}
                onChange={setReflection}
              />
            </>
          ) : null}
          {lesson.type === 'quiz' ? (
            <>
              <ReadingBody lesson={lesson} />
              <QuizRunner
                key={lesson.id}
                courseId={courseId}
                lesson={lesson}
                bestScore={d.progress?.quizScores[lesson.id]}
                onResult={onQuiz}
              />
            </>
          ) : null}

          <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t bg-surface/95 px-1 py-3 backdrop-blur">
            <Button
              variant="outline"
              disabled={!prev}
              onClick={() =>
                prev &&
                navigate({
                  to: '/portal/learn/$courseId/$lessonId',
                  params: { courseId, lessonId: prev.id },
                })
              }
            >
              <ArrowLeft aria-hidden /> Previous
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {lesson.type !== 'quiz' ? (
                <Button
                  variant={isDone ? 'outline' : 'default'}
                  size="lg"
                  disabled={isDone || complete.isPending}
                  onClick={markComplete}
                >
                  <CheckCircle2 aria-hidden />
                  {isDone
                    ? 'Completed'
                    : complete.isPending
                      ? 'Saving…'
                      : `Mark complete (+${points} pts)`}
                </Button>
              ) : null}
              {next ? (
                <Button
                  variant={isDone || lesson.type === 'quiz' ? 'default' : 'outline'}
                  onClick={() =>
                    navigate({
                      to: '/portal/learn/$courseId/$lessonId',
                      params: { courseId, lessonId: next.id },
                    })
                  }
                >
                  Next lesson <ArrowRight aria-hidden />
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/portal/learn/$courseId" params={{ courseId }}>
                    Course overview
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <CompletionDialog
        open={Boolean(celebration)}
        onOpenChange={(o) => !o && setCelebration(null)}
        courseTitle={d.course.title}
        clinicId={celebration?.clinicId}
      />
    </>
  )
}

import { courseSequence, postTestOf, unitsOf } from '@shared/courses'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, ListTree } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { EligibilityPanel } from '@/features/clinics/components/EligibilityPanel'
import { CompletionDialog } from '@/features/learning/components/CompletionDialog'
import { CourseMenu, OVERVIEW, PRE_TEST } from '@/features/learning/components/CourseMenu'
import {
  ContentPanel,
  CourseTopCard,
  OverviewBody,
  TestPanel,
} from '@/features/learning/components/CoursePanels'
import { showPointsToast } from '@/features/learning/components/PointsToast'
import type { QuizOutcome } from '@/features/learning/components/QuizRunner'
import { ReadingBody } from '@/features/learning/components/ReadingLesson'
import { ReflectionLesson } from '@/features/learning/components/ReflectionLesson'
import { LESSON_TYPE_LABEL, lessonPoints } from '@/features/learning/components/shared'
import { VideoLesson } from '@/features/learning/components/VideoLesson'
import { useRegister } from '@/queries/clinics.queries'
import {
  useCompleteLesson,
  useCourse,
  useMyLearning,
  useSaveReflection,
} from '@/queries/learning.queries'

/** `/portal/learn/$courseId`: opens the course on the learner's next unfinished item. */
export function CourseLandingPage() {
  const { courseId } = useParams({ from: '/_app/portal/learn/$courseId/' })
  return <CourseView courseId={courseId} />
}

/** `/portal/learn/$courseId/$lessonId`: the same view with one item selected. */
export function CourseItemPage() {
  const { courseId, lessonId } = useParams({ from: '/_app/portal/learn/$courseId/$lessonId' })
  return <CourseView courseId={courseId} itemId={lessonId} />
}

/**
 * One course view, as in the learning template: a top course card, the course menu on the left
 * and the selected item on the right.
 */
function CourseView({ courseId, itemId }: { courseId: string; itemId?: string }) {
  const navigate = useNavigate()
  const q = useCourse(courseId)
  const mine = useMyLearning()
  const complete = useCompleteLesson()
  const saveReflection = useSaveReflection()
  const register = useRegister()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [celebration, setCelebration] = useState<{ clinicId?: string } | null>(null)
  const [reflection, setReflection] = useState('')

  const d = q.data
  const progress = d?.progress ?? null
  const done = progress?.completedLessonIds ?? []
  const preScores = progress?.preTestScores ?? []
  const sequence = d ? courseSequence(d.course) : []
  const landing =
    sequence.find((id) => (id === PRE_TEST ? preScores.length === 0 : !done.includes(id))) ??
    OVERVIEW
  // A fresh learner who has already started units skips straight past an untaken pre-test.
  const firstOpen =
    landing === PRE_TEST && done.length > 0
      ? (sequence.find((id) => id !== PRE_TEST && !done.includes(id)) ?? OVERVIEW)
      : landing
  const current = itemId ?? firstOpen
  const lesson = d?.course.lessons.find((l) => l.id === current)
  const savedReflection = progress?.reflections[current] ?? ''

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the draft when the item changes
  useEffect(() => setReflection(savedReflection), [current, progress === null])

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

  const { course } = d
  const known = current === OVERVIEW || (current === PRE_TEST && course.preTest) || lesson
  if (!known)
    return <ErrorState title="Lesson not found" message="This lesson is no longer available." />

  const designated = mine.data?.designatedCourseId === course.id
  const post = postTestOf(course)
  const unitsLeft = unitsOf(course).filter((u) => !done.includes(u.id)).length
  const postLocked = Boolean(post && !done.includes(post.id) && unitsLeft > 0)
  const index = sequence.indexOf(current)
  const prev = index > 0 ? sequence[index - 1] : undefined
  const next = index >= 0 ? sequence[index + 1] : sequence[0]
  const titleOf = (id: string) =>
    id === OVERVIEW
      ? 'Course overview'
      : id === PRE_TEST
        ? (course.preTest?.title ?? 'Pre-test')
        : (course.lessons.find((l) => l.id === id)?.title ?? '')
  const go = (id: string) =>
    navigate({ to: '/portal/learn/$courseId/$lessonId', params: { courseId, lessonId: id } })

  const finish = (r: { courseCompleted: boolean; clinicUnlocked?: string }) => {
    if (r.courseCompleted) {
      celebrate()
      setCelebration({ clinicId: r.clinicUnlocked })
    }
  }

  const markComplete = async () => {
    if (!lesson) return
    if (lesson.type === 'reflection' && reflection !== savedReflection)
      await saveReflection.mutateAsync({ courseId, lessonId: lesson.id, text: reflection })
    complete.mutate(
      { courseId, lessonId: lesson.id },
      {
        onSuccess: (r) => {
          showPointsToast(r.pointsAwarded, lesson.title)
          finish(r)
        },
      },
    )
  }

  const onPostTest = (r: QuizOutcome) => {
    if (r.passed && lesson) {
      showPointsToast(r.pointsAwarded, `${lesson.title} passed`)
      finish(r)
    }
  }

  const menu = (onNavigate?: () => void) => (
    <CourseMenu
      course={course}
      progress={progress}
      currentId={current}
      designated={designated}
      postLocked={postLocked}
      onNavigate={onNavigate}
    />
  )

  const isDone = lesson ? done.includes(lesson.id) : false

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      <Link
        to="/portal/learn"
        className="inline-flex w-fit items-center gap-1.5 font-medium text-blue text-sm hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to Learn
      </Link>

      <CourseTopCard course={course} now={titleOf(current)} percent={d.completion.percent} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-20 lg:block">{menu()}</aside>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between lg:hidden">
                <span className="flex items-center gap-2">
                  <ListTree aria-hidden /> Course menu
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  {index >= 0 ? `${index + 1} of ${sequence.length}` : 'Overview'}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-4">
              <SheetHeader className="p-0 pb-3">
                <SheetTitle>Course menu</SheetTitle>
              </SheetHeader>
              {menu(() => setSheetOpen(false))}
            </SheetContent>
          </Sheet>

          {current === OVERVIEW ? (
            <ContentPanel
              chip="Overview"
              chipTone="navy"
              title="About this course"
              summary={course.objective}
            >
              <OverviewBody
                course={course}
                designated={designated}
                action={
                  firstOpen !== OVERVIEW ? (
                    <Button size="lg" onClick={() => go(firstOpen)}>
                      {d.state === 'available' ? 'Start course' : 'Continue course'}
                      <ArrowRight aria-hidden />
                    </Button>
                  ) : null
                }
              />
            </ContentPanel>
          ) : current === PRE_TEST && course.preTest ? (
            <ContentPanel
              chip="Pre-test"
              title={course.preTest.title}
              summary="A short, ungraded check of what you already know before the modules."
            >
              <TestPanel
                kind="pre"
                courseId={courseId}
                questions={course.preTest.questions}
                attempts={preScores.length}
                best={preScores.length ? Math.max(...preScores) : undefined}
                latest={preScores.at(-1)}
                passed
                locked={false}
                unitsLeft={0}
                onResult={() => toast.success('Starting point recorded')}
              />
            </ContentPanel>
          ) : lesson?.type === 'quiz' ? (
            <ContentPanel
              chip="Post-test"
              chipTone="gold"
              title={lesson.title}
              summary={lesson.summary}
            >
              <TestPanel
                kind="post"
                courseId={courseId}
                lessonId={lesson.id}
                questions={lesson.quiz ?? []}
                attempts={
                  progress?.quizAttempts?.[lesson.id] ??
                  (progress?.quizScores[lesson.id] !== undefined ? 1 : 0)
                }
                best={progress?.quizScores[lesson.id]}
                passed={isDone}
                locked={postLocked}
                unitsLeft={unitsLeft}
                onResult={onPostTest}
              />
            </ContentPanel>
          ) : lesson ? (
            <ContentPanel
              chip={`${LESSON_TYPE_LABEL[lesson.type]} · ${lesson.minutes} min`}
              title={lesson.title}
              summary={lesson.summary}
            >
              {isDone ? (
                <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-2.5 text-sm text-success">
                  <CheckCircle2 className="size-4" aria-hidden />
                  You completed this unit. Reopening it never awards points twice.
                </p>
              ) : null}
              {lesson.type === 'video' ? (
                <VideoLesson lesson={lesson} poster={course.image} />
              ) : null}
              <ReadingBody lesson={lesson} />
              {lesson.type === 'reflection' ? (
                <ReflectionLesson
                  courseId={courseId}
                  lessonId={lesson.id}
                  prompt={lesson.reflectionPrompt ?? 'What will you do differently?'}
                  initial={savedReflection}
                  value={reflection}
                  onChange={setReflection}
                />
              ) : null}
            </ContentPanel>
          ) : null}

          {current !== OVERVIEW ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" disabled={!prev} onClick={() => prev && go(prev)}>
                <ArrowLeft aria-hidden /> Previous
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                {lesson && lesson.type !== 'quiz' ? (
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
                        : `Mark complete (+${lessonPoints(lesson, designated)} pts)`}
                  </Button>
                ) : null}
                {next ? (
                  <Button
                    variant={isDone || !lesson ? 'default' : 'outline'}
                    onClick={() => go(next)}
                  >
                    Next <ArrowRight aria-hidden />
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => go(OVERVIEW)}>
                    Course overview
                  </Button>
                )}
              </div>
            </div>
          ) : null}

          {d.eligibility && d.relatedEvent ? (
            <div className="grid gap-2">
              <p className="font-medium text-navy text-sm">Related clinic</p>
              <EligibilityPanel
                eligibility={d.eligibility}
                eventTitle={d.relatedEvent.title}
                registering={register.isPending}
                onRegister={() =>
                  register.mutate(d.relatedEvent?.id as string, {
                    onSuccess: () => toast.success('You are registered for the clinic.'),
                  })
                }
                footer={
                  <Link
                    to="/portal/clinics/$eventId"
                    params={{ eventId: d.relatedEvent.id }}
                    className="text-blue text-sm underline-offset-4 hover:underline"
                  >
                    View clinic details
                  </Link>
                }
              />
            </div>
          ) : null}
        </div>
      </div>

      <CompletionDialog
        open={Boolean(celebration)}
        onOpenChange={(o) => !o && setCelebration(null)}
        courseTitle={course.title}
        clinicId={celebration?.clinicId}
      />
    </div>
  )
}

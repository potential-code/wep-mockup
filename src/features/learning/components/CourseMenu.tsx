import { modulesOf, postTestOf } from '@shared/courses'
import type { Course, CourseProgress, Lesson } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  ClipboardList,
  Info,
  Lock,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { LESSON_ICON, lessonPoints } from './shared'

/** Item ids for the two non-lesson entries in the menu. */
export const OVERVIEW = 'overview'
export const PRE_TEST = 'pre-test'

function MenuLink({
  courseId,
  itemId,
  active,
  disabled,
  onNavigate,
  className,
  children,
}: {
  courseId: string
  itemId: string
  active: boolean
  disabled?: boolean
  onNavigate?: () => void
  className?: string
  children: ReactNode
}) {
  const cls = cn(
    'relative flex w-full items-center gap-3 px-4 py-3 text-start text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    active
      ? 'bg-blue-50 before:absolute before:inset-y-0 before:start-0 before:w-1 before:bg-blue'
      : 'hover:bg-muted/60',
    disabled && 'cursor-not-allowed opacity-70 hover:bg-transparent',
    className,
  )
  if (disabled) return <div className={cls}>{children}</div>
  return (
    <Link
      to="/portal/learn/$courseId/$lessonId"
      params={{ courseId, lessonId: itemId }}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cls}
    >
      {children}
    </Link>
  )
}

function Status({ done, locked }: { done: boolean; locked?: boolean }) {
  if (locked) return <Lock className="size-4 shrink-0 text-muted-foreground" aria-label="Locked" />
  if (done) return <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completed" />
  return <Circle className="size-4 shrink-0 text-muted-foreground/60" aria-label="Not started" />
}

/** Course menu: overview, pre-test, modules with their units, and the post-test. */
export function CourseMenu({
  course,
  progress,
  currentId,
  designated,
  postLocked,
  onNavigate,
}: {
  course: Course
  progress: CourseProgress | null
  currentId: string
  designated: boolean
  postLocked: boolean
  onNavigate?: () => void
}) {
  const done = progress?.completedLessonIds ?? []
  const byId = new Map(course.lessons.map((l) => [l.id, l]))
  const modules = modulesOf(course)
  const post = postTestOf(course)
  const preDone = (progress?.preTestScores?.length ?? 0) > 0

  return (
    <nav
      aria-label="Course menu"
      className="overflow-hidden rounded-2xl border bg-card shadow-card"
    >
      <div className="border-b px-4 py-3.5">
        <p className="font-semibold text-[0.7rem] text-coral-700 uppercase tracking-[0.16em]">
          Course menu
        </p>
        <p className="font-heading font-medium text-navy leading-snug">{course.title}</p>
      </div>
      <ul className="divide-y">
        <li>
          <MenuLink
            courseId={course.id}
            itemId={OVERVIEW}
            active={currentId === OVERVIEW}
            onNavigate={onNavigate}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-navy">
              <Info className="size-3.5" aria-hidden />
            </span>
            <span className="flex-1 font-medium text-navy">Course overview</span>
          </MenuLink>
        </li>
        {course.preTest?.questions.length ? (
          <li>
            <MenuLink
              courseId={course.id}
              itemId={PRE_TEST}
              active={currentId === PRE_TEST}
              onNavigate={onNavigate}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 text-blue">
                <ClipboardList className="size-3.5" aria-hidden />
              </span>
              <span className="grid min-w-0 flex-1">
                <span className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.14em]">
                  Pre-test
                </span>
                <span
                  className={cn(
                    'truncate',
                    currentId === PRE_TEST ? 'font-semibold text-blue-600' : 'text-navy',
                  )}
                >
                  {course.preTest.title}
                </span>
              </span>
              <Status done={preDone} />
            </MenuLink>
          </li>
        ) : null}
        {modules.map((m, i) => {
          const units = m.lessonIds.map((id) => byId.get(id)).filter((l): l is Lesson => Boolean(l))
          const doneCount = units.filter((u) => done.includes(u.id)).length
          return (
            <li key={m.id}>
              <ModuleGroup
                index={i}
                title={m.title}
                summary={`${doneCount}/${units.length} units`}
                complete={units.length > 0 && doneCount === units.length}
                defaultOpen={units.some((u) => u.id === currentId) || doneCount < units.length}
              >
                {units.map((u) => {
                  const Icon = LESSON_ICON[u.type]
                  const active = u.id === currentId
                  return (
                    <li key={u.id}>
                      <MenuLink
                        courseId={course.id}
                        itemId={u.id}
                        active={active}
                        onNavigate={onNavigate}
                        className="ps-6"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="grid min-w-0 flex-1">
                          <span
                            className={cn(
                              'leading-snug',
                              active ? 'font-semibold text-blue-600' : 'text-navy',
                            )}
                          >
                            {u.title}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {u.minutes} min · +{lessonPoints(u, designated)} pts
                          </span>
                        </span>
                        <Status done={done.includes(u.id)} />
                      </MenuLink>
                    </li>
                  )
                })}
              </ModuleGroup>
            </li>
          )
        })}
        {post ? (
          <li>
            <MenuLink
              courseId={course.id}
              itemId={post.id}
              active={currentId === post.id}
              onNavigate={onNavigate}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-coral-50 text-coral-700">
                <ClipboardCheck className="size-3.5" aria-hidden />
              </span>
              <span className="grid min-w-0 flex-1">
                <span className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.14em]">
                  Post-test{postLocked ? ' · finish all units first' : ''}
                </span>
                <span
                  className={cn(
                    'truncate',
                    currentId === post.id ? 'font-semibold text-blue-600' : 'text-navy',
                  )}
                >
                  {post.title}
                </span>
              </span>
              <Status done={done.includes(post.id)} locked={postLocked} />
            </MenuLink>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}

function ModuleGroup({
  index,
  title,
  summary,
  complete,
  defaultOpen,
  children,
}: {
  index: number
  title: string
  summary: string
  complete: boolean
  defaultOpen: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3 text-start outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-full font-semibold text-xs',
            complete ? 'bg-success-soft text-success' : 'bg-navy/5 text-navy',
          )}
        >
          {index + 1}
        </span>
        <span className="grid min-w-0 flex-1">
          <span className="font-heading font-medium text-navy text-sm leading-snug">{title}</span>
          <span className="text-muted-foreground text-xs">{summary}</span>
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90"
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="border-t bg-surface/40">{children}</ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

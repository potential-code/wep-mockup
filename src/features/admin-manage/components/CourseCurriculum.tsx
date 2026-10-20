import { blocksOf } from '@shared/courses'
import type { CourseModule, Lesson, QuizQuestion } from '@shared/types'
import {
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GripVertical,
  HelpCircle,
  MessageSquare,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import { type KeyboardEvent, type PointerEvent, type ReactNode, useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { isTrueFalse } from './QuestionDialog'

const UNIT_ICON: Record<Lesson['type'], typeof PlayCircle> = {
  video: PlayCircle,
  reading: FileText,
  quiz: HelpCircle,
  reflection: MessageSquare,
}

const UNIT_LABEL: Record<Lesson['type'], string> = {
  video: 'Video',
  reading: 'Reading',
  quiz: 'Quiz',
  reflection: 'Reflection',
}

/** Moves an item one step with the arrow keys, so reordering works without a mouse. */
const moveByKey = <T,>(
  items: T[],
  index: number,
  e: KeyboardEvent,
  onReorder: (v: T[]) => void,
) => {
  const d = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
  const to = index + d
  if (!d || to < 0 || to >= items.length) return
  e.preventDefault()
  const next = [...items]
  const [it] = next.splice(index, 1)
  if (it !== undefined) next.splice(to, 0, it)
  onReorder(next)
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: ReactNode
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      onClick={onClick}
      className={cn('text-muted-foreground hover:text-navy', danger && 'hover:text-danger')}
    >
      {children}
    </Button>
  )
}

/* ------------------------------------------------------------------ Tests -- */

/** Pre-test or post-test: a tinted header, the test row with its rules, and its questions. */
export function TestCard({
  kind,
  title,
  rule,
  questions,
  onRename,
  onDelete,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: {
  kind: 'pre' | 'post'
  title: string
  rule: string
  questions: QuizQuestion[]
  onRename: () => void
  onDelete: () => void
  onAddQuestion: () => void
  onEditQuestion: (q: QuizQuestion) => void
  onDeleteQuestion: (q: QuizQuestion) => void
}) {
  const pre = kind === 'pre'
  const Icon = pre ? ClipboardList : ClipboardCheck
  return (
    <section
      aria-label={pre ? 'Pre-test' : 'Post-test'}
      className="overflow-hidden rounded-2xl border bg-card shadow-card"
    >
      <header
        className={cn(
          'flex items-center gap-3 border-b px-5 py-3.5',
          pre ? 'bg-blue-50/70' : 'bg-coral-50/70',
        )}
      >
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl',
            pre ? 'bg-blue/10 text-blue' : 'bg-coral/15 text-coral-700',
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="grid">
          <h3 className="font-heading font-medium text-navy">{pre ? 'Pre-test' : 'Post-test'}</h3>
          <p className="text-muted-foreground text-xs">
            {pre
              ? 'Shown before learners enter the course modules'
              : 'Shown after learners complete all modules'}
          </p>
        </div>
      </header>
      <Collapsible defaultOpen className="grid grid-cols-[minmax(0,1fr)] gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="me-auto font-semibold text-navy text-sm">{title}</p>
          <StatusBadge tone={pre ? 'info' : 'success'} icon={null}>
            {rule}
          </StatusBadge>
          <StatusBadge tone="neutral" icon={null}>
            Unlimited attempts
          </StatusBadge>
          <IconButton label={`Rename ${pre ? 'pre-test' : 'post-test'}`} onClick={onRename}>
            <Pencil />
          </IconButton>
          <IconButton label={`Delete ${pre ? 'pre-test' : 'post-test'}`} onClick={onDelete} danger>
            <Trash2 />
          </IconButton>
        </div>
        <CollapsibleTrigger className="group flex items-center justify-between rounded-md font-semibold text-[0.7rem] text-muted-foreground uppercase tracking-[0.14em] outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Questions ({questions.length})
          <ChevronDown
            className="size-4 transition-transform group-data-[state=closed]:-rotate-90"
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-[minmax(0,1fr)] gap-2">
          {questions.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-center text-muted-foreground text-sm">
              No questions yet.
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
                  <IconButton label={`Edit question ${i + 1}`} onClick={() => onEditQuestion(q)}>
                    <Pencil />
                  </IconButton>
                  <IconButton
                    label={`Delete question ${i + 1}`}
                    onClick={() => onDeleteQuestion(q)}
                    danger
                  >
                    <Trash2 />
                  </IconButton>
                </li>
              ))}
            </ol>
          )}
          <Button size="sm" className="w-fit" onClick={onAddQuestion}>
            <Plus aria-hidden /> Add question
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

/** Placeholder when a course has no pre-test or post-test yet. */
export function AddTestCard({ kind, onAdd }: { kind: 'pre' | 'post'; onAdd: () => void }) {
  const pre = kind === 'pre'
  return (
    <section
      aria-label={pre ? 'Pre-test' : 'Post-test'}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed bg-card/60 p-5"
    >
      <div className="me-auto grid">
        <h3 className="font-heading font-medium text-navy">{pre ? 'Pre-test' : 'Post-test'}</h3>
        <p className="text-muted-foreground text-sm">
          {pre
            ? 'Optional. Records what learners know before they start; it is not graded.'
            : 'Graded check after the modules. Designated courses need one to unlock the clinic.'}
        </p>
      </div>
      <Button variant="outline" onClick={onAdd}>
        <Plus aria-hidden /> Add {pre ? 'pre-test' : 'post-test'}
      </Button>
    </section>
  )
}

/* ---------------------------------------------------------------- Modules -- */

export function ModuleList({
  modules,
  lessons,
  onReorder,
  onRename,
  onDelete,
  onReorderUnits,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}: {
  modules: CourseModule[]
  lessons: Map<string, Lesson>
  onReorder: (modules: CourseModule[]) => void
  onRename: (m: CourseModule) => void
  onDelete: (m: CourseModule) => void
  onReorderUnits: (m: CourseModule, lessonIds: string[]) => void
  onAddUnit: (m: CourseModule) => void
  onEditUnit: (l: Lesson) => void
  onDeleteUnit: (m: CourseModule, l: Lesson) => void
}) {
  return (
    <Reorder.Group
      as="ol"
      axis="y"
      values={modules}
      onReorder={onReorder}
      className="grid grid-cols-[minmax(0,1fr)] gap-4"
    >
      {modules.map((m, i) => (
        <ModuleItem
          key={m.id}
          module={m}
          index={i}
          onKeyMove={(e) => moveByKey(modules, i, e, onReorder)}
        >
          <ModuleBody
            module={m}
            lessons={lessons}
            onRename={() => onRename(m)}
            onDelete={() => onDelete(m)}
            onReorderUnits={(ids) => onReorderUnits(m, ids)}
            onAddUnit={() => onAddUnit(m)}
            onEditUnit={onEditUnit}
            onDeleteUnit={(l) => onDeleteUnit(m, l)}
          />
        </ModuleItem>
      ))}
    </Reorder.Group>
  )
}

function DragHandle({
  label,
  onPointerDown,
  onKeyDown,
}: {
  label: string
  onPointerDown: (e: PointerEvent) => void
  onKeyDown: (e: KeyboardEvent) => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-roledescription="drag handle"
      title="Drag, or use the arrow keys, to reorder"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  )
}

function ModuleItem({
  module,
  index,
  onKeyMove,
  children,
}: {
  module: CourseModule
  index: number
  onKeyMove: (e: KeyboardEvent) => void
  children: ReactNode
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={module}
      dragListener={false}
      dragControls={controls}
      className="relative overflow-hidden rounded-2xl border bg-card shadow-card"
    >
      <div className="absolute start-3 top-4">
        <DragHandle
          label={`Reorder module ${index + 1}, ${module.title}`}
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={onKeyMove}
        />
      </div>
      {children}
    </Reorder.Item>
  )
}

function ModuleBody({
  module,
  lessons,
  onRename,
  onDelete,
  onReorderUnits,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}: {
  module: CourseModule
  lessons: Map<string, Lesson>
  onRename: () => void
  onDelete: () => void
  onReorderUnits: (ids: string[]) => void
  onAddUnit: () => void
  onEditUnit: (l: Lesson) => void
  onDeleteUnit: (l: Lesson) => void
}) {
  const [open, setOpen] = useState(true)
  const ids = module.lessonIds.filter((id) => lessons.has(id))
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2 py-3 ps-11 pe-4">
        <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-2 rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90"
            aria-hidden
          />
          <span className="grid min-w-0">
            <span className="truncate font-heading font-medium text-navy">{module.title}</span>
            <span className="text-muted-foreground text-xs">
              {ids.length} {ids.length === 1 ? 'unit' : 'units'}
            </span>
          </span>
        </CollapsibleTrigger>
        <IconButton label={`Rename ${module.title}`} onClick={onRename}>
          <Pencil />
        </IconButton>
        <IconButton label={`Delete ${module.title}`} onClick={onDelete} danger>
          <Trash2 />
        </IconButton>
      </div>
      <CollapsibleContent className="grid grid-cols-[minmax(0,1fr)] gap-2 border-t bg-surface/30 p-4">
        <button
          type="button"
          onClick={onAddUnit}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed bg-card py-2 font-medium text-blue text-sm outline-none hover:border-blue/40 hover:bg-blue-50/50 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden /> Add unit
        </button>
        {ids.length ? (
          <Reorder.Group
            as="ol"
            axis="y"
            values={ids}
            onReorder={onReorderUnits}
            className="grid grid-cols-[minmax(0,1fr)] gap-2"
          >
            {ids.map((id, i) => {
              const l = lessons.get(id) as Lesson
              return (
                <UnitItem
                  key={id}
                  lesson={l}
                  onKeyMove={(e) => moveByKey(ids, i, e, onReorderUnits)}
                  onEdit={() => onEditUnit(l)}
                  onDelete={() => onDeleteUnit(l)}
                />
              )
            })}
          </Reorder.Group>
        ) : (
          <p className="py-2 text-center text-muted-foreground text-sm">
            No units in this module yet.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

function UnitItem({
  lesson,
  onKeyMove,
  onEdit,
  onDelete,
}: {
  lesson: Lesson
  onKeyMove: (e: KeyboardEvent) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const controls = useDragControls()
  const Icon = UNIT_ICON[lesson.type]
  const blocks = blocksOf(lesson)
  return (
    <Reorder.Item
      value={lesson.id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 rounded-xl border bg-card px-2 py-2.5 sm:gap-3 sm:px-3"
    >
      <DragHandle
        label={`Reorder ${lesson.title}`}
        onPointerDown={(e) => controls.start(e)}
        onKeyDown={onKeyMove}
      />
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="grid min-w-0 flex-1">
        <p className="truncate font-medium text-navy text-sm">{lesson.title || 'Untitled unit'}</p>
        <p className="text-muted-foreground text-xs">
          {UNIT_LABEL[lesson.type]} · {blocks} {blocks === 1 ? 'block' : 'blocks'} ·{' '}
          {lesson.minutes} min
        </p>
      </div>
      <IconButton label={`Edit ${lesson.title}`} onClick={onEdit}>
        <Pencil />
      </IconButton>
      <IconButton label={`Delete ${lesson.title}`} onClick={onDelete} danger>
        <Trash2 />
      </IconButton>
    </Reorder.Item>
  )
}

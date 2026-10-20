import { Link } from '@tanstack/react-router'
import { Clock, Layers, Lock, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { Progress } from '@/components/ui/progress'
import { type CourseRow, CourseStateBadge, courseMinutes, coursePoints } from './shared'

/** Course tile used by the catalogue and the learning path. */
export function CourseCard({
  row,
  designated,
  prerequisiteTitle,
}: {
  row: CourseRow
  designated: boolean
  prerequisiteTitle?: string
}) {
  const { course, state, completion } = row
  const locked = state === 'locked'
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        <img
          src={course.image}
          alt=""
          loading="lazy"
          className={`size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${locked ? 'grayscale' : ''}`}
        />
        <div className="absolute start-3 top-3">
          <CourseStateBadge state={state} />
        </div>
        {designated ? (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy/90 px-2.5 py-0.5 font-medium text-white text-xs">
            <Sparkles className="size-3" aria-hidden /> Unlocks a clinic
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <PrincipleTag id={course.principle} />
        <h3 className="font-heading font-medium text-lg text-navy leading-snug">
          <Link
            to="/portal/learn/$courseId"
            params={{ courseId: course.id }}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-blue"
          >
            {course.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">{course.objective}</p>
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
          <li className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {courseMinutes(course)} min
          </li>
          <li className="flex items-center gap-1">
            <Layers className="size-3.5" aria-hidden /> {course.lessons.length} lessons
          </li>
          <li className="font-medium text-coral-700">+{coursePoints(course, designated)} points</li>
        </ul>
        {locked && prerequisiteTitle ? (
          <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Lock className="size-3.5" aria-hidden /> Complete “{prerequisiteTitle}” first
          </p>
        ) : null}
        {state !== 'available' && !locked ? (
          <div className="grid gap-1">
            <Progress
              value={completion.percent}
              aria-label={`${course.title} progress`}
              className="h-1.5"
            />
            <span className="text-muted-foreground text-xs">
              {completion.done} of {completion.total} lessons · {completion.percent}%
            </span>
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}

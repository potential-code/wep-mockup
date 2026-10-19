import { Check } from 'lucide-react'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { type CourseDetail, CourseStateBadge } from './shared'

export function CourseHero({ data }: { data: CourseDetail }) {
  const { course, state } = data
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border bg-secondary shadow-card">
        <img src={course.image} alt="" className="aspect-[21/9] w-full object-cover" />
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          <CourseStateBadge state={state} />
          <DemoLabel className="bg-white/90">Proposed course content</DemoLabel>
        </div>
      </div>
      <SectionCard title="About this course">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <PrincipleTag id={course.principle} />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground text-xs">
              {course.topic}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground text-xs">
              {course.language}
            </span>
          </div>
          <p className="max-w-prose text-pretty">{course.description}</p>
          <div>
            <h3 className="mb-2 font-heading font-semibold text-navy">
              What you will be able to do
            </h3>
            <ul className="grid gap-2">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>
    </>
  )
}

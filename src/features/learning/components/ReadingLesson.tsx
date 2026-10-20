import type { Lesson } from '@shared/types'
import { Lightbulb } from 'lucide-react'

export function ReadingBody({ lesson }: { lesson: Lesson }) {
  return (
    <div className="grid gap-6">
      <div className="grid max-w-prose gap-4 text-pretty leading-relaxed">
        {lesson.body.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      {lesson.keyPoints?.length ? (
        <aside className="rounded-2xl border border-coral/30 bg-coral-50/60 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-heading font-medium text-coral-700">
            <Lightbulb className="size-4" aria-hidden /> Key points
          </h3>
          <ul className="grid list-disc gap-1.5 ps-5 text-sm">
            {lesson.keyPoints.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  )
}

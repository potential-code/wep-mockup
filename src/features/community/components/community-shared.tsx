import type { AiSource } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Bot, ExternalLink } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { useThreads } from '@/queries/community.queries'

export type ThreadView = NonNullable<ReturnType<typeof useThreads>['data']>[number]

export function AiBadge() {
  return (
    <StatusBadge tone="info" icon={Bot}>
      WEPs Assistant · AI · approved WEPs knowledge
    </StatusBadge>
  )
}

export function AiSources({ sources }: { sources: AiSource[] }) {
  if (sources.length === 0) return null
  return (
    <div className="mt-3 grid gap-1.5">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Sources</p>
      <ul className="flex flex-wrap gap-2">
        {sources.map((s) => (
          <li key={s.to}>
            <Link
              to={s.to as never}
              className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-blue text-xs hover:bg-blue-50"
            >
              {s.label} <ExternalLink className="size-3" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const AUDIENCE = {
  discussions: 'Visible to all platform participants',
  signatory_circle: 'Signatory companies only',
} as const

/** Typing dots shown while the assistant prepares an answer. */
export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-blue"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

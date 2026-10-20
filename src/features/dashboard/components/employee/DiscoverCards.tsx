import type { Resource, Thread } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Award, BookMarked, MessagesSquare, Sparkles } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { ConciergeAvatar } from '@/components/shared/ConciergeAvatar'
import { relativeTime } from '@/lib/format'

export function RecommendedResources({ resources }: { resources: Resource[] }) {
  return (
    <SectionCard
      title="Recommended resources"
      action={
        <Link to="/portal/resources" className="font-medium text-blue text-sm hover:underline">
          View all
        </Link>
      }
    >
      <ul className="grid gap-3">
        {resources.slice(0, 3).map((r) => (
          <li key={r.id}>
            <Link
              to="/portal/resources/$resourceId"
              params={{ resourceId: r.id }}
              className="flex items-start gap-3 rounded-lg hover:bg-muted/50"
            >
              <BookMarked className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden />
              <span className="grid">
                <span className="font-medium text-navy text-sm">{r.title}</span>
                <span className="text-muted-foreground text-xs">
                  {r.format.toUpperCase()} · {r.publisher}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {resources.length === 0 ? (
          <li className="text-muted-foreground text-sm">No recommendations yet.</li>
        ) : null}
      </ul>
    </SectionCard>
  )
}

export function CommunityThreads({ threads }: { threads: Thread[] }) {
  return (
    <SectionCard
      title="Community discussions"
      action={
        <Link to="/portal/community" className="font-medium text-blue text-sm hover:underline">
          View all
        </Link>
      }
    >
      <ul className="grid gap-3">
        {threads.slice(0, 3).map((t) => (
          <li key={t.id}>
            <Link
              to="/portal/community/thread/$threadId"
              params={{ threadId: t.id }}
              className="flex items-start gap-3 rounded-lg hover:bg-muted/50"
            >
              <MessagesSquare className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden />
              <span className="grid">
                <span className="font-medium text-navy text-sm">{t.title}</span>
                <span className="text-muted-foreground text-xs">
                  {t.replies.length} replies · {relativeTime(t.createdAt)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

const PROMPTS = [
  'What should I do first as an HR lead?',
  'Explain Principle 2 in plain language',
  'Help me prepare for my clinic',
]

export function ConciergeChips() {
  return (
    <SectionCard
      title={
        <span className="flex items-center gap-3">
          <ConciergeAvatar size="md" online />
          <span className="grid">
            Ask the AI Concierge
            <span className="flex items-center gap-1.5 font-normal font-sans text-muted-foreground text-xs">
              <span className="size-1.5 rounded-full bg-success" aria-hidden /> Online
            </span>
          </span>
        </span>
      }
    >
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <Link
            key={p}
            to="/portal/concierge"
            search={{ prompt: p }}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-navy text-sm transition-colors hover:border-blue hover:bg-blue-50"
          >
            <Sparkles className="size-4 text-coral-700" aria-hidden />
            {p}
          </Link>
        ))}
      </div>
    </SectionCard>
  )
}

export function CredentialSummary({
  items,
}: {
  items: { purchase: { id: string; credentialRef?: string }; offering?: { title: string } }[]
}) {
  if (items.length === 0) return null
  return (
    <SectionCard title="Company credentials">
      <ul className="grid gap-2">
        {items.map((c) => (
          <li key={c.purchase.id} className="flex items-center gap-3 text-sm">
            <Award className="size-5 text-coral-700" aria-hidden />
            <span className="font-medium text-navy">{c.offering?.title}</span>
            {c.purchase.credentialRef ? (
              <span className="text-muted-foreground">Ref {c.purchase.credentialRef}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

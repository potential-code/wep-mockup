import { Link } from '@tanstack/react-router'
import { Bot, FileText, Info, PencilLine } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChatEntry } from '../hooks/useConciergeChat'
import { TypedParagraphs } from './TypedParagraphs'

export function MessageBubble({
  message,
  animate,
  onAnimationDone,
  compact = false,
}: {
  message: ChatEntry
  animate: boolean
  onAnimationDone: () => void
  compact?: boolean
}) {
  const [revealed, setRevealed] = useState(!animate)
  if (message.from === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-blue px-4 py-2.5 text-sm text-white">
          {message.text.join(' ')}
        </p>
      </div>
    )
  }
  const done = revealed || !animate
  return (
    <div className="flex gap-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-white"
        aria-hidden
      >
        <Bot className="size-4" />
      </span>
      <div
        className={cn(
          'grid min-w-0 flex-1 gap-3 rounded-2xl rounded-tl-md border bg-card p-4 text-sm',
          message.unavailable && 'border-dashed border-warning/50 bg-warning-soft/30',
          message.isDraft && 'border-gold/50 bg-gold-50/40',
        )}
      >
        {message.isDraft ? (
          <p className="flex items-center gap-1.5 font-semibold text-gold-700 text-xs uppercase tracking-wide">
            <PencilLine className="size-3.5" aria-hidden /> Draft for your review
          </p>
        ) : null}
        {message.unavailable ? (
          <p className="flex items-center gap-1.5 font-semibold text-warning text-xs uppercase tracking-wide">
            <Info className="size-3.5" aria-hidden /> No approved data for this question
          </p>
        ) : null}
        <TypedParagraphs
          paragraphs={message.text}
          animate={animate}
          onDone={() => {
            setRevealed(true)
            onAnimationDone()
          }}
        />
        {done && message.sources && message.sources.length > 0 ? (
          <div>
            <p className="mb-1.5 font-medium text-muted-foreground text-xs">Sources</p>
            <ul className="flex flex-wrap gap-1.5">
              {message.sources.map((s) => (
                <li key={s.to + s.label}>
                  <Link
                    to={s.to}
                    className="inline-flex items-center gap-1 rounded-full border bg-surface px-2.5 py-1 text-navy text-xs hover:border-blue hover:text-blue"
                  >
                    <FileText className="size-3" aria-hidden /> {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {done && message.actions && message.actions.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {message.actions.map((a) => (
              <li key={a.to + a.label}>
                <Button asChild size="sm" variant="outline">
                  <Link to={a.to}>{a.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {done && !compact ? (
          <p className="text-muted-foreground text-xs">
            You decide what happens next. The concierge never submits or changes anything for you.
          </p>
        ) : null}
      </div>
    </div>
  )
}

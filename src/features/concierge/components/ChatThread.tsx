import { Bot, Loader2, SendHorizonal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ChatEntry } from '../hooks/useConciergeChat'
import { MessageBubble } from './MessageBubble'

export function ChatThread({
  messages,
  animatingId,
  pending,
  onAnimationDone,
  compact = false,
  empty,
  className,
}: {
  messages: ChatEntry[]
  animatingId?: string
  pending: boolean
  onAnimationDone: () => void
  compact?: boolean
  empty: React.ReactNode
  className?: string
}) {
  const end = useRef<HTMLDivElement>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever content changes
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, pending, animatingId])
  return (
    <div className={cn('overflow-y-auto', className)} role="log" aria-label="Conversation">
      {messages.length === 0 && !pending ? (
        empty
      ) : (
        <div className="grid gap-4 p-4">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              animate={m.id === animatingId}
              onAnimationDone={onAnimationDone}
              compact={compact}
            />
          ))}
          {pending ? (
            <div className="flex items-center gap-3 text-muted-foreground text-sm" role="status">
              <span
                className="grid size-8 place-items-center rounded-full bg-navy text-white"
                aria-hidden
              >
                <Bot className="size-4" />
              </span>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Looking through approved
              sources…
            </div>
          ) : null}
          <div ref={end} />
        </div>
      )}
    </div>
  )
}

export function Composer({
  onSend,
  disabled,
  initial = '',
  rows = 1,
}: {
  onSend: (text: string) => void
  disabled: boolean
  initial?: string
  rows?: number
}) {
  const [text, setText] = useState(initial)
  const submit = () => {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Textarea
        aria-label="Message the AI Concierge"
        value={text}
        rows={rows}
        placeholder="Ask about your learning, clinics, points or reports…"
        className="min-h-10 resize-none"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Send message"
        disabled={disabled || !text.trim()}
      >
        <SendHorizonal aria-hidden />
      </Button>
    </form>
  )
}

export function SuggestedPrompts({
  prompts,
  onPick,
  disabled,
}: {
  prompts: { id: string; prompt: string }[]
  onPick: (p: string) => void
  disabled: boolean
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.prompt)}
            className="rounded-full border bg-card px-3.5 py-2 text-left text-navy text-sm transition-colors hover:border-blue hover:bg-blue-50 focus-visible:outline-2 disabled:opacity-50"
          >
            {p.prompt}
          </button>
        </li>
      ))}
    </ul>
  )
}

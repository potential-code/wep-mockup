import type { ThreadReply } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useRequestAiReply } from '@/queries/community.queries'
import { AiBadge, AiSources, TypingDots } from './community-shared'

/** Confirms a new post and shows the assistant’s reply arriving after a short typing state. */
export function AiReplyPreview({ threadId, title }: { threadId: string; title: string }) {
  const ask = useRequestAiReply()
  const [reply, setReply] = useState<ThreadReply | null>(null)
  const [done, setDone] = useState(false)
  const started = useRef(false)
  const { mutateAsync } = ask

  useEffect(() => {
    if (started.current) return
    started.current = true
    mutateAsync(threadId)
      .then((r) => setReply((r as ThreadReply | null) ?? null))
      .finally(() => setDone(true))
  }, [mutateAsync, threadId])

  return (
    <section
      className="grid gap-3 rounded-2xl border border-blue/30 bg-blue-50/60 p-4"
      aria-live="polite"
      aria-label="Your new post"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-medium text-navy text-sm">
          <CheckCircle2 className="size-4 text-success" aria-hidden /> Posted: {title}
        </p>
        <Link
          to="/portal/community/thread/$threadId"
          params={{ threadId }}
          className="text-blue text-sm hover:underline"
        >
          Open thread
        </Link>
      </div>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="typing"
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl bg-card p-3 text-muted-foreground text-sm"
          >
            <TypingDots /> WEPs Assistant is preparing a reply from approved WEPs knowledge…
          </motion.div>
        ) : reply ? (
          <motion.div
            key="reply"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-blue/30 bg-card p-4"
          >
            <AiBadge />
            <p className="mt-2 text-sm">{reply.body}</p>
            <AiSources sources={reply.sources ?? []} />
            <p className="mt-2 text-muted-foreground text-xs">
              Scripted demo reply. Other members may add their experience in the thread.
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-sm"
          >
            This reads as a discussion post, so the assistant didn’t reply. Members will respond in
            the thread.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}

import type { ChatMessage, Conversation } from '@shared/types'
import { useCallback, useRef, useState } from 'react'
import { type AiReply, useAsk } from '@/queries/concierge.queries'

export type ChatEntry = AiReply

/** Local chat state over the scripted `ask` mutation. Replies are revealed by the UI. */
export function useConciergeChat(context?: Conversation['context']) {
  const ask = useAsk()
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [conversationId, setConversationId] = useState<string>()
  const [animatingId, setAnimatingId] = useState<string>()
  const sending = useRef(false)

  const send = useCallback(
    async (prompt: string) => {
      const text = prompt.trim()
      if (!text || sending.current) return
      sending.current = true
      const userMsg: ChatMessage = {
        id: `local-${crypto.randomUUID()}`,
        from: 'user',
        text: [text],
        at: new Date().toISOString(),
      }
      setMessages((m) => [...m, userMsg])
      try {
        const res = await ask.mutateAsync({ prompt: text, conversationId, context })
        setConversationId(res.conversationId)
        setAnimatingId(res.reply.id)
        setMessages((m) => [...m, res.reply as ChatEntry])
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            id: `err-${crypto.randomUUID()}`,
            from: 'ai',
            text: [(e as Error).message || 'Something went wrong. Please try again.'],
            unavailable: true,
            at: new Date().toISOString(),
          },
        ])
      } finally {
        sending.current = false
      }
    },
    [ask, conversationId, context],
  )

  const load = useCallback((c: Conversation) => {
    setConversationId(c.id)
    setMessages(c.messages as ChatEntry[])
    setAnimatingId(undefined)
  }, [])

  const reset = useCallback(() => {
    setConversationId(undefined)
    setMessages([])
    setAnimatingId(undefined)
  }, [])

  return {
    messages,
    conversationId,
    animatingId,
    pending: ask.isPending,
    send,
    load,
    reset,
    finishAnimation: () => setAnimatingId(undefined),
  }
}

// AI Concierge (brief §16). Scripted responses in this demo — the UI says so. Answers use the
// signed-in role, cite records and offer actions. Drafts are labelled; nothing is submitted
// on the user's behalf.

import type { AiScript, ChatMessage, Conversation } from '@shared/types'
import { aiScripts } from '@/mocks/seed/ai-scripts'
import { commit, db, delay, findOr404, newId, now, out, requireCapability } from './api'

export async function getSuggestions() {
  await delay(120)
  const user = requireCapability('concierge.use')
  return out(
    aiScripts
      .filter((s) => s.roles.includes(user.role))
      .map((s) => ({ id: s.id, prompt: s.prompt })),
  )
}

export async function listConversations() {
  await delay()
  const user = requireCapability('concierge.use')
  return out(
    db.conversations
      .filter((c) => c.userId === user.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  )
}

export async function getConversation(id: string) {
  await delay(100)
  const user = requireCapability('concierge.use')
  return out(
    findOr404(db.conversations, (c) => c.id === id && c.userId === user.id, 'Conversation'),
  )
}

const words = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )

function match(prompt: string, scripts: AiScript[]): AiScript | undefined {
  const exact = scripts.find((s) => s.prompt.toLowerCase() === prompt.trim().toLowerCase())
  if (exact) return exact
  const q = words(prompt)
  let best: { s: AiScript; score: number } | undefined
  for (const s of scripts) {
    const score = [...words(s.prompt)].filter((w) => q.has(w)).length
    if (score > (best?.score ?? 0)) best = { s, score }
  }
  return best && best.score >= 2 ? best.s : undefined
}

export async function ask(input: {
  prompt: string
  conversationId?: string
  context?: Conversation['context']
}) {
  await delay(900)
  const user = requireCapability('concierge.use')
  let convo = input.conversationId
    ? db.conversations.find((c) => c.id === input.conversationId && c.userId === user.id)
    : undefined
  if (!convo) {
    convo = {
      id: newId('conv'),
      userId: user.id,
      title: input.prompt.slice(0, 60),
      messages: [],
      updatedAt: now(),
      context: input.context,
    }
    db.conversations.push(convo)
  }
  const userMsg: ChatMessage = { id: newId('m'), from: 'user', text: [input.prompt], at: now() }
  const script = match(
    input.prompt,
    aiScripts.filter((s) => s.roles.includes(user.role)),
  )
  const contextLead = convo.context ? [`Using “${convo.context.label}” as context.`] : []
  const reply: ChatMessage = script
    ? {
        id: newId('m'),
        from: 'ai',
        text: [...contextLead, ...script.answer],
        sources: script.sources,
        actions: script.actions,
        isDraft: script.isDraft,
        at: now(),
      }
    : {
        id: newId('m'),
        from: 'ai',
        text: [
          ...contextLead,
          'I can only answer from approved WEPs information and the records you’re allowed to see, and I don’t have a confident answer to that yet.',
          'Try one of the suggested questions, or ask about your learning path, clinics, points, action plan or annual report.',
        ],
        sources: [{ label: 'About the WEPs', to: '/about' }],
        actions: [{ label: 'Browse resources', to: '/portal/resources' }],
        at: now(),
      }
  convo.messages.push(userMsg, reply)
  convo.updatedAt = now()
  commit()
  return out({ conversationId: convo.id, reply })
}

export async function deleteConversation(id: string) {
  await delay(120)
  const user = requireCapability('concierge.use')
  db.conversations = db.conversations.filter((c) => !(c.id === id && c.userId === user.id))
  commit()
}

import type { Conversation } from '@shared/types'
import { getRouteApi } from '@tanstack/react-router'
import { History, PanelRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel } from '@/components/shared/Cards'
import { PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useAiSuggestions, useConversation } from '@/queries/concierge.queries'
import { useResource } from '@/queries/resources.queries'
import { ChatThread, Composer, SuggestedPrompts } from '../components/ChatThread'
import { ContextPanel } from '../components/ContextPanel'
import { ConversationList } from '../components/ConversationList'
import { useConciergeChat } from '../hooks/useConciergeChat'

const route = getRouteApi('/_app/portal/concierge')
const RESOURCE_PROMPT = 'Summarise this resource and suggest how my team could use it'

export function ConciergePage() {
  const { resource } = route.useSearch()
  return resource ? <ResourceGate id={resource} /> : <Workspace />
}

function ResourceGate({ id }: { id: string }) {
  const res = useResource(id)
  if (res.isLoading) return <PageSkeleton />
  const context: Conversation['context'] | undefined = res.data
    ? { kind: 'resource', id, label: res.data.resource.title }
    : undefined
  return <Workspace context={context} />
}

function Workspace({ context }: { context?: Conversation['context'] }) {
  const { prompt } = route.useSearch()
  const chat = useConciergeChat(context)
  const suggestions = useAiSuggestions()
  const [selectedId, setSelectedId] = useState<string>()
  const [historyOpen, setHistoryOpen] = useState(false)
  const convo = useConversation(selectedId)
  const sentInitial = useRef(false)

  // Auto-send a question passed from another page, once.
  const { send } = chat
  useEffect(() => {
    if (prompt && !sentInitial.current) {
      sentInitial.current = true
      send(prompt)
    }
  }, [prompt, send])

  const { load } = chat
  useEffect(() => {
    if (convo.data && convo.data.id === selectedId) load(convo.data)
  }, [convo.data, selectedId, load])

  const prompts = useMemo(() => {
    const list = suggestions.data ?? []
    return context && !list.some((p) => p.prompt === RESOURCE_PROMPT)
      ? [{ id: 'ctx', prompt: RESOURCE_PROMPT }, ...list]
      : list
  }, [suggestions.data, context])

  const startNew = () => {
    setSelectedId(undefined)
    chat.reset()
    setHistoryOpen(false)
  }
  const pick = (id: string) => {
    setSelectedId(id)
    setHistoryOpen(false)
  }

  const history = (
    <ConversationList activeId={chat.conversationId} onSelect={pick} onNew={startNew} />
  )
  const contextPanel = <ContextPanel messages={chat.messages} contextLabel={context?.label} />

  return (
    <div>
      <PageHeader
        title="AI Concierge"
        description="Ask about your learning path, clinics, points, action plan or reports. Answers cite the records they come from."
        eyebrow={<DemoLabel>Proposed feature</DemoLabel>}
      />
      <p
        role="note"
        className="mb-4 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold-50 px-4 py-2.5 text-sm"
      >
        <Sparkles className="size-4 shrink-0 text-gold-700" aria-hidden />
        <span>
          <strong>Scripted demo responses — no live AI.</strong> Replies are pre-written for this
          mockup and nothing you ask leaves your browser.
        </span>
      </p>
      <div className="grid h-[calc(100dvh-19rem)] min-h-[30rem] gap-4 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_17rem]">
        <div className="hidden overflow-y-auto rounded-2xl border bg-card p-3 lg:block">
          {history}
        </div>
        <section
          aria-label="Chat"
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-card"
        >
          <div className="flex items-center gap-2 border-b px-3 py-2 lg:hidden">
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History aria-hidden /> History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-4">
                <SheetHeader className="p-0 pb-3">
                  <SheetTitle>Conversations</SheetTitle>
                  <SheetDescription>Reopen or delete earlier chats.</SheetDescription>
                </SheetHeader>
                {history}
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="xl:hidden">
                  <PanelRight aria-hidden /> Context
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto p-4">
                <SheetHeader className="p-0 pb-3">
                  <SheetTitle>Context</SheetTitle>
                  <SheetDescription>Sources and next actions.</SheetDescription>
                </SheetHeader>
                {contextPanel}
              </SheetContent>
            </Sheet>
          </div>
          <ChatThread
            className="min-h-0 flex-1"
            messages={chat.messages}
            animatingId={chat.animatingId}
            pending={chat.pending}
            onAnimationDone={chat.finishAnimation}
            empty={
              <div className="grid gap-4 p-5 sm:p-8">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-navy">
                    How can I help today?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Pick a suggestion or type your own question.
                  </p>
                </div>
                {suggestions.isLoading ? (
                  <Skeleton className="h-24 rounded-xl" />
                ) : (
                  <SuggestedPrompts prompts={prompts} onPick={chat.send} disabled={chat.pending} />
                )}
              </div>
            }
          />
          <div className="grid gap-2 border-t p-3">
            {chat.messages.length > 0 && prompts.length > 0 ? (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground">
                  Suggested questions
                </summary>
                <div className="mt-2">
                  <SuggestedPrompts prompts={prompts} onPick={chat.send} disabled={chat.pending} />
                </div>
              </details>
            ) : null}
            <Composer onSend={chat.send} disabled={chat.pending} />
            <p className="text-muted-foreground text-xs">
              The concierge never submits anything for you. Check sources before you act.
            </p>
          </div>
        </section>
        <div className="hidden overflow-y-auto rounded-2xl border bg-card p-4 xl:block">
          {contextPanel}
        </div>
      </div>
    </div>
  )
}

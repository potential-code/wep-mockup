import { Link, useLocation } from '@tanstack/react-router'
import { Maximize2 } from 'lucide-react'
import { ConciergeAvatar } from '@/components/shared/ConciergeAvatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCurrentUser } from '@/hooks/use-session'
import { useAiSuggestions } from '@/queries/concierge.queries'
import { useConciergeChat } from '../hooks/useConciergeChat'
import { ChatThread, Composer, ConciergeWelcome, SuggestedPrompts } from './ChatThread'
import { ConciergeHeader } from './ConciergeHeader'

/** Floating launcher for the AI Concierge, shown on portal screens. */
export function ConciergeLauncher() {
  const { can, user } = useCurrentUser()
  const { pathname } = useLocation()
  if (!user || !can('concierge.use') || pathname.startsWith('/portal/concierge')) return null
  return <Launcher />
}

function Launcher() {
  const { user } = useCurrentUser()
  const chat = useConciergeChat()
  const suggestions = useAiSuggestions()
  const prompts = (suggestions.data ?? []).slice(0, 3)
  return (
    <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open AI Concierge"
            className="group grid size-14 place-items-center rounded-full bg-white shadow-lift ring-1 ring-navy/10 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-blue"
          >
            <ConciergeAvatar size="lg" online thinking={chat.pending} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="flex h-[min(36rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-lift"
        >
          <ConciergeHeader
            compact
            thinking={chat.pending}
            actions={
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/15 hover:text-white"
              >
                <Link to="/portal/concierge" aria-label="Open full concierge">
                  <Maximize2 aria-hidden />
                </Link>
              </Button>
            }
          />
          <ChatThread
            className="min-h-0 flex-1"
            compact
            messages={chat.messages}
            animatingId={chat.animatingId}
            pending={chat.pending}
            onAnimationDone={chat.finishAnimation}
            empty={
              <ConciergeWelcome name={user?.firstName} compact>
                <SuggestedPrompts prompts={prompts} onPick={chat.send} disabled={chat.pending} />
              </ConciergeWelcome>
            }
          />
          <div className="grid gap-1.5 border-t bg-surface/60 p-3">
            <Composer onSend={chat.send} disabled={chat.pending} />
            <p className="text-center text-[11px] text-muted-foreground">Scripted demo replies</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

import { Link, useLocation } from '@tanstack/react-router'
import { Bot, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCurrentUser } from '@/hooks/use-session'
import { useAiSuggestions } from '@/queries/concierge.queries'
import { useConciergeChat } from '../hooks/useConciergeChat'
import { ChatThread, Composer, SuggestedPrompts } from './ChatThread'

/** Floating launcher for the AI Concierge, shown on portal screens. */
export function ConciergeLauncher() {
  const { can, user } = useCurrentUser()
  const { pathname } = useLocation()
  if (!user || !can('concierge.use') || pathname.startsWith('/portal/concierge')) return null
  return <Launcher />
}

function Launcher() {
  const chat = useConciergeChat()
  const suggestions = useAiSuggestions()
  const prompts = (suggestions.data ?? []).slice(0, 3)
  return (
    <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            aria-label="Open AI Concierge"
            className="size-12 rounded-full bg-navy shadow-lift hover:bg-navy-700"
          >
            <Bot className="size-6" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col gap-0 p-0"
        >
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <div>
              <p className="font-heading font-semibold text-navy">AI Concierge</p>
              <p className="text-muted-foreground text-xs">Scripted demo responses — no live AI</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/portal/concierge">
                Open full concierge <ExternalLink aria-hidden />
              </Link>
            </Button>
          </div>
          <ChatThread
            className="min-h-0 flex-1"
            compact
            messages={chat.messages}
            animatingId={chat.animatingId}
            pending={chat.pending}
            onAnimationDone={chat.finishAnimation}
            empty={
              <div className="grid gap-3 p-4">
                <p className="text-muted-foreground text-sm">Try asking:</p>
                <SuggestedPrompts prompts={prompts} onPick={chat.send} disabled={chat.pending} />
              </div>
            }
          />
          <div className="border-t p-3">
            <Composer onSend={chat.send} disabled={chat.pending} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

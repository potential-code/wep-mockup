import { MessageSquarePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useConversations, useDeleteConversation } from '@/queries/concierge.queries'

export function ConversationList({
  activeId,
  onSelect,
  onNew,
}: {
  activeId?: string
  onSelect: (id: string) => void
  onNew: () => void
}) {
  const list = useConversations()
  const del = useDeleteConversation()
  return (
    <nav aria-label="Conversation history" className="grid content-start gap-3">
      <Button onClick={onNew} variant="outline" className="justify-start">
        <MessageSquarePlus aria-hidden /> New conversation
      </Button>
      {list.isLoading ? (
        <Skeleton className="h-20 rounded-xl" />
      ) : (list.data ?? []).length === 0 ? (
        <p className="px-1 text-muted-foreground text-sm">
          Past conversations will appear here. Nothing yet.
        </p>
      ) : (
        <ul className="grid gap-1">
          {(list.data ?? []).map((c) => (
            <li key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={c.id === activeId}
                className={cn(
                  'w-full rounded-lg px-3 py-2 pe-10 text-left hover:bg-blue-50 focus-visible:outline-2',
                  c.id === activeId && 'bg-blue-50',
                )}
              >
                <span className="line-clamp-2 font-medium text-navy text-sm">{c.title}</span>
                <span className="text-muted-foreground text-xs">{relativeTime(c.updatedAt)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete conversation: ${c.title}`}
                className="absolute top-1.5 right-1"
                disabled={del.isPending}
                onClick={async () => {
                  await del.mutateAsync(c.id)
                  if (c.id === activeId) onNew()
                }}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

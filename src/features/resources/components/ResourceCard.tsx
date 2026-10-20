import type { Resource } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Bookmark, BookmarkCheck, Lock } from 'lucide-react'
import { motion } from 'motion/react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FORMAT_META } from './resource-meta'

export function ResourceCard({
  resource: r,
  saved,
  onToggleSave,
  layout = 'grid',
}: {
  resource: Resource
  saved: boolean
  onToggleSave: (id: string) => void
  layout?: 'grid' | 'list'
}) {
  const meta = FORMAT_META[r.format]
  const Icon = meta.icon
  const list = layout === 'list'
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift',
        list ? 'flex flex-col sm:flex-row' : 'flex flex-col',
      )}
    >
      <div className={cn('relative shrink-0 overflow-hidden', list ? 'sm:w-48' : '')}>
        <img
          src={r.image}
          alt=""
          loading="lazy"
          className={cn('w-full object-cover', list ? 'aspect-[16/9] sm:h-full' : 'aspect-[16/9]')}
        />
        <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 font-medium text-navy text-xs shadow-sm">
          <Icon className="size-3.5" aria-hidden />
          {meta.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <PrincipleTag id={r.principle} />
          {r.official ? (
            <StatusBadge tone="coral" icon={null}>
              Official WEPs
            </StatusBadge>
          ) : null}
          {r.access === 'member' ? (
            <StatusBadge tone="locked" icon={Lock}>
              Members
            </StatusBadge>
          ) : null}
        </div>
        <h3 className="font-heading font-medium text-navy leading-snug">
          <Link
            to="/portal/resources/$resourceId"
            params={{ resourceId: r.id }}
            className="after:absolute after:inset-0 focus-visible:outline-2"
          >
            {r.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">{r.description}</p>
        <p className="mt-auto pt-1 text-muted-foreground text-xs">
          {r.topic} · {r.language} ·{' '}
          {formatDate(r.publishedAt, { month: 'short', year: 'numeric' })}
        </p>
      </div>
      <Button
        variant="secondary"
        size="icon-sm"
        className="absolute end-3 top-3 z-10 sm:end-3"
        aria-label={saved ? `Remove ${r.title} from saved` : `Save ${r.title}`}
        aria-pressed={saved}
        onClick={() => onToggleSave(r.id)}
      >
        {saved ? <BookmarkCheck className="text-blue" aria-hidden /> : <Bookmark aria-hidden />}
      </Button>
    </motion.article>
  )
}

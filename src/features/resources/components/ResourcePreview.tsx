import type { Resource } from '@shared/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FORMAT_META } from './resource-meta'

/** Mock document viewer: page thumbnails for PDFs/slides, text fallback for everything else. */
export function ResourcePreview({ resource: r }: { resource: Resource }) {
  const pageCount = Math.min(r.pages ?? 6, 12)
  const [page, setPage] = useState(1)
  const paged = r.format === 'pdf' || r.format === 'pptx' || r.format === 'docx'
  const Icon = FORMAT_META[r.format].icon

  if (!paged) {
    return (
      <div className="grid gap-3 rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-navy">Preview not available for this format</p>
            <p className="text-muted-foreground text-sm">
              {FORMAT_META[r.format].label} · text summary shown instead
            </p>
          </div>
        </div>
        <ul className="grid list-disc gap-1.5 ps-5 text-sm">
          {r.summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card" aria-label="Document preview">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2">
        <p className="truncate font-medium text-navy text-sm">{r.title}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={page === pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-[104px_1fr]">
        <ol className="flex gap-2 overflow-x-auto border-b p-3 md:block md:space-y-2 md:overflow-y-auto md:border-e md:border-b-0 md:max-h-[420px]">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <li key={n} className="shrink-0">
              <button
                type="button"
                onClick={() => setPage(n)}
                aria-label={`Go to page ${n}`}
                aria-current={n === page}
                className={cn(
                  'grid h-20 w-14 place-items-center rounded-md border bg-white text-muted-foreground text-xs md:h-24 md:w-full',
                  n === page && 'border-blue ring-2 ring-blue/30',
                )}
              >
                {n}
              </button>
            </li>
          ))}
        </ol>
        <div className="grid place-items-center bg-surface p-4 sm:p-6">
          <div className="grid aspect-[4/5] w-full max-w-sm gap-3 rounded-md border bg-white p-6 shadow-card sm:p-8">
            <p className="font-heading font-medium text-navy text-xs uppercase tracking-wide">
              {r.publisher}
            </p>
            {page === 1 ? (
              <>
                <h4 className="font-heading font-medium text-lg text-navy leading-tight">
                  {r.title}
                </h4>
                <p className="text-muted-foreground text-xs">{r.version}</p>
              </>
            ) : (
              <p className="text-navy text-sm">{r.summary[(page - 2) % r.summary.length]}</p>
            )}
            <div className="mt-auto grid gap-1.5" aria-hidden>
              {[90, 100, 75, 95, 60].map((w) => (
                <span key={w} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="border-t px-4 py-2 text-muted-foreground text-xs">
        Illustrative preview. The full document is available from the source.
      </p>
    </section>
  )
}

import type { Resource } from '@shared/types'
import { ArrowUpRight, Lock } from 'lucide-react'
import { motion } from 'motion/react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'

const FORMAT_LABEL: Record<string, string> = {
  pdf: 'PDF',
  pptx: 'Slides',
  docx: 'Document',
  xlsx: 'Spreadsheet',
  link: 'Web page',
  video: 'Video',
}

export function PublicResourceCard({ resource: r }: { resource: Resource }) {
  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <img
          src={r.image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-medium text-navy text-xs backdrop-blur">
          {FORMAT_LABEL[r.format] ?? r.format}
          {r.pages ? ` · ${r.pages} pp` : ''}
        </span>
        {r.official ? (
          <span className="absolute end-3 top-3 rounded-full bg-coral-600 px-2.5 py-1 font-semibold text-white text-xs">
            Official WEPs
          </span>
        ) : null}
      </div>
      <div className="grid flex-1 content-start gap-3 p-5">
        <PrincipleTag id={r.principle} linked={false} className="w-fit" />
        <h3 className="font-heading font-medium text-lg text-navy leading-snug">{r.title}</h3>
        <p className="line-clamp-3 text-muted-foreground text-sm">{r.description}</p>
        <p className="mt-auto flex items-center justify-between pt-2 text-muted-foreground text-xs">
          <span>{r.publisher}</span>
          {r.official && r.sourceUrl ? (
            <span className="inline-flex items-center gap-1 font-medium text-blue">
              View on weps.org <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Lock className="size-3.5" aria-hidden /> Members
            </span>
          )}
        </p>
      </div>
    </>
  )
  const cls =
    'group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift'
  return r.official && r.sourceUrl ? (
    <motion.a
      whileHover={{ y: -4 }}
      href={r.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className={cls}
      aria-label={`${r.title} (opens weps.org)`}
    >
      {body}
    </motion.a>
  ) : (
    <motion.article whileHover={{ y: -4 }} className={cls}>
      {body}
    </motion.article>
  )
}

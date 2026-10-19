import { PRINCIPLES } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, Minus, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

export function PrincipleCards() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
      {PRINCIPLES.map((p) => {
        const expanded = open === p.id
        return (
          <StaggerItem key={p.id} className="h-full">
            <motion.article
              whileHover={{ y: -4 }}
              className={cn(
                'group relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lift',
                expanded && 'border-blue/40 shadow-lift',
              )}
            >
              <span
                aria-hidden
                className="absolute end-4 top-3 font-bold font-heading text-5xl text-navy/[0.06] leading-none"
              >
                {p.id}
              </span>
              <img src={p.icon} alt="" className="size-14 rounded-xl" loading="lazy" />
              <p className="mt-4 font-medium text-blue text-xs uppercase tracking-wider">
                Principle {p.id}
              </p>
              <h3 className="mt-1 font-heading font-semibold text-lg text-navy leading-snug">
                {p.short}
              </h3>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    id={`principle-desc-${p.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {p.description}
                    </p>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 font-medium text-blue text-sm hover:underline"
                    >
                      Official principle page <ArrowUpRight className="size-3.5" aria-hidden />
                      <span className="sr-only">(opens weps.org)</span>
                    </a>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : p.id)}
                aria-expanded={expanded}
                aria-controls={`principle-desc-${p.id}`}
                className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-3 font-medium text-navy text-sm hover:text-blue"
              >
                {expanded ? (
                  <Minus className="size-4" aria-hidden />
                ) : (
                  <Plus className="size-4" aria-hidden />
                )}
                {expanded ? 'Show less' : 'What it means'}
                <span className="sr-only"> for principle {p.id}</span>
              </button>
            </motion.article>
          </StaggerItem>
        )
      })}
      <StaggerItem className="h-full">
        <Link
          to="/about"
          hash="principles"
          className="group flex h-full min-h-32 flex-col gap-6 justify-between rounded-2xl bg-navy p-6 text-white transition-colors hover:bg-navy-700"
        >
          <p className="font-heading font-semibold text-xl leading-snug">
            Read all seven Principles in full
          </p>
          <span className="inline-flex items-center gap-2 font-medium text-gold text-sm">
            About the Principles
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </Link>
      </StaggerItem>
    </Stagger>
  )
}

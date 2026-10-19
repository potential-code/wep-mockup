import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Navy page-intro band that sits under the fixed public header. */
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden bg-navy-900 pt-28 pb-14 text-white sm:pt-36 sm:pb-20',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(22,124,179,0.45),transparent_70%),radial-gradient(40%_60%_at_0%_100%,rgba(214,164,74,0.14),transparent_70%)]"
      />
      <div className="container-public grid gap-5">
        {eyebrow ? (
          <p className="font-medium text-gold text-sm uppercase tracking-[0.18em]">{eyebrow}</p>
        ) : null}
        <h1 className="max-w-3xl text-balance font-heading font-bold text-4xl leading-[1.08] sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-lg text-white/75 leading-relaxed">{description}</p>
        ) : null}
        {children}
      </div>
    </section>
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'left',
  className,
  action,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  className?: string
  action?: ReactNode
}) {
  const dark = tone === 'dark'
  return (
    <div
      className={cn(
        'mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14',
        align === 'center' && 'justify-center text-center',
        className,
      )}
    >
      <div className={cn('grid max-w-2xl gap-3', align === 'center' && 'mx-auto')}>
        {eyebrow ? (
          <p
            className={cn(
              'font-medium text-xs uppercase tracking-[0.18em]',
              dark ? 'text-gold' : 'text-blue',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            'text-balance font-bold font-heading text-3xl leading-tight sm:text-4xl',
            dark ? 'text-white' : 'text-navy',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'text-lg leading-relaxed',
              dark ? 'text-white/70' : 'text-muted-foreground',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

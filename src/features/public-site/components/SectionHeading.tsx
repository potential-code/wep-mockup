import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
}
const words: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const eyebrowV: Variants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}
const lineV: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
}
const wordV: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.75, ease: EASE } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/**
 * Section heading that reveals in sequence on scroll: eyebrow, then the title word by word
 * from a mask, then the description, then the action.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'left',
  className,
  action,
  id,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  className?: string
  action?: ReactNode
  id?: string
}) {
  const dark = tone === 'dark'
  const reduced = usePrefersReducedMotion()
  const titleWords = title.split(' ')
  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={container}
      className={cn(
        'mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14',
        align === 'center' && 'justify-center text-center',
        className,
      )}
    >
      <motion.div
        variants={container}
        className={cn('grid max-w-2xl gap-3', align === 'center' && 'mx-auto justify-items-center')}
      >
        {eyebrow ? (
          <motion.p
            variants={eyebrowV}
            className={cn(
              'flex items-center gap-3 font-semibold text-xs uppercase tracking-[0.2em]',
              dark ? 'text-white/90' : 'text-blue',
            )}
          >
            <motion.span aria-hidden variants={lineV} className="h-px w-8 origin-left bg-coral" />
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h2
          id={id}
          variants={words}
          className={cn(
            'text-balance font-heading font-medium text-3xl leading-[1.15] sm:text-[2.6rem]',
            dark ? 'text-white' : 'text-cyan-600',
          )}
          aria-label={title}
        >
          {titleWords.map((w, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: words can repeat
            <span key={i} aria-hidden>
              <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                <motion.span variants={wordV} className="inline-block">
                  {w}
                </motion.span>
              </span>{' '}
            </span>
          ))}
        </motion.h2>
        {description ? (
          <motion.p
            variants={fadeUp}
            className={cn('text-lg leading-relaxed', dark ? 'text-white/85' : 'text-navy/85')}
          >
            {description}
          </motion.p>
        ) : null}
      </motion.div>
      {action ? <motion.div variants={fadeUp}>{action}</motion.div> : null}
    </motion.div>
  )
}

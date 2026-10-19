import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { WepsLogo } from '@/components/shared/Logo'
import { images } from '@/config/images'

/** Split layout for sign-in, password reset and invitation. Image collapses to a band on mobile. */
export function AuthShell({
  children,
  headline = 'Your company’s WEPs work, in one place.',
  text = 'Learning, expert support and reporting connected around one company record.',
}: {
  children: ReactNode
  headline?: string
  text?: string
}) {
  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-navy-900 px-6 py-6 text-white sm:px-10 lg:sticky lg:top-0 lg:h-svh lg:self-start lg:py-10">
        <img
          src={images.hero.signin.src}
          alt=""
          className="-z-20 absolute inset-0 size-full object-cover object-top"
        />
        <div className="-z-10 absolute inset-0 bg-[linear-gradient(160deg,rgba(8,26,40,0.9)_0%,rgba(21,59,85,0.8)_55%,rgba(21,59,85,0.55)_100%)]" />
        <Link to="/" aria-label="WEPs portal home" className="w-fit rounded">
          <WepsLogo className="h-8 sm:h-10" />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 mb-2 grid max-w-md gap-3 lg:mb-10"
        >
          <p className="font-medium text-gold text-xs uppercase tracking-[0.2em]">
            Women’s Empowerment Principles
          </p>
          <h2 className="text-balance font-bold font-heading text-2xl leading-tight sm:text-3xl lg:text-4xl">
            {headline}
          </h2>
          <p className="hidden text-white/80 sm:block lg:text-lg">{text}</p>
        </motion.div>
      </aside>
      <main id="main" className="flex flex-col bg-background">
        <div className="px-6 pt-6 sm:px-10 lg:px-14 lg:pt-8">
          <Link
            to="/"
            className="inline-flex min-h-10 items-center gap-2 text-muted-foreground text-sm hover:text-navy"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to the public site
          </Link>
        </div>
        <div className="flex flex-1 items-start justify-center px-6 pt-6 pb-16 sm:px-10 lg:items-center lg:px-14">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  )
}

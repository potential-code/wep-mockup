import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { type ReactNode, useEffect } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null
/** Smooth-scroll to an element or offset on public pages (falls back to native). */
export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenisInstance) lenisInstance.scrollTo(target, { offset: -56 })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else
    (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({
      behavior: 'smooth',
    })
}

/**
 * Lenis smooth scrolling for public pages only, driven by the GSAP ticker so ScrollTrigger
 * stays in sync. Disabled when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenisInstance = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [reduced])
  // Content that loads later (the signatory map, images) shifts every section below it.
  // Re-measure scroll triggers whenever the page height settles on a new value.
  useEffect(() => {
    let last = document.body.scrollHeight
    let timer = 0
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight
      if (Math.abs(h - last) < 2) return
      last = h
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    })
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
    }
  }, [])
  return <>{children}</>
}

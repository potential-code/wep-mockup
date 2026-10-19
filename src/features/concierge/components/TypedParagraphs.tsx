import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

/** Streaming-style reveal of scripted text. Shows everything at once for reduced motion. */
export function TypedParagraphs({
  paragraphs,
  animate,
  onDone,
}: {
  paragraphs: string[]
  animate: boolean
  onDone?: () => void
}) {
  const reduced = usePrefersReducedMotion()
  const total = paragraphs.reduce((n, p) => n + p.length, 0)
  const [shown, setShown] = useState(animate && !reduced ? 0 : total)

  useEffect(() => {
    if (!animate || reduced) {
      setShown(total)
      return
    }
    setShown(0)
    const t = setInterval(() => {
      setShown((s) => {
        if (s + 4 >= total) {
          clearInterval(t)
          return total
        }
        return s + 4
      })
    }, 16)
    return () => clearInterval(t)
  }, [animate, reduced, total])

  useEffect(() => {
    if (shown >= total && animate) onDone?.()
  }, [shown, total, animate, onDone])

  let left = shown
  return (
    <div className="grid gap-2.5" aria-busy={shown < total}>
      {paragraphs.map((p) => {
        const part = p.slice(0, Math.max(0, left))
        left -= p.length
        return part ? (
          <p key={p} className="leading-relaxed">
            {part}
            {shown < total && left <= 0 ? (
              <span
                className="ms-0.5 inline-block h-4 w-1.5 animate-pulse bg-blue align-middle"
                aria-hidden
              />
            ) : null}
          </p>
        ) : null
      })}
    </div>
  )
}

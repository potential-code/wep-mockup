import { Sparkles } from 'lucide-react'
import { animate } from 'motion/react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

function PointsCounter({ amount, title }: { amount: number; title: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.textContent = `+${amount}`
      return
    }
    const c = animate(0, amount, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = `+${Math.round(v)}`
      },
    })
    return () => c.stop()
  }, [amount, reduced])
  return (
    <div
      role="status"
      className="flex w-80 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-gold/40 bg-card p-4 shadow-lift"
    >
      <span className="grid size-10 place-items-center rounded-full bg-gold-50 text-gold-700">
        <Sparkles className="size-5" aria-hidden />
      </span>
      <div className="grid">
        <p className="font-heading font-semibold text-navy text-lg tabular-nums">
          <span ref={ref}>+{amount}</span> points
        </p>
        <p className="text-muted-foreground text-xs">{title}</p>
      </div>
    </div>
  )
}

export function showPointsToast(amount: number, title: string) {
  if (amount <= 0) return
  toast.custom(() => <PointsCounter amount={amount} title={title} />, { duration: 4500 })
}

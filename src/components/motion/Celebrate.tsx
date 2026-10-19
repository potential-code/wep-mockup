import confetti from 'canvas-confetti'

/** Short brand-coloured celebration for milestones. Skipped when reduced motion is preferred. */
export function celebrate(origin: { x?: number; y?: number } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#167CB3', '#153B55', '#D6A44A', '#ffffff']
  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { x: origin.x ?? 0.5, y: origin.y ?? 0.6 },
    colors,
    scalar: 0.9,
    ticks: 160,
  })
  setTimeout(
    () =>
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: origin.x ?? 0.5, y: (origin.y ?? 0.6) - 0.1 },
        colors,
        scalar: 0.7,
      }),
    180,
  )
}

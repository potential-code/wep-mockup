import { cn } from '@/lib/utils'

/**
 * Official WEPs lockup (UN Women · For All Women and Girls · Women's Empowerment Principles),
 * supplied artwork in white. Only place it on navy or dark imagery. Never redraw or recolour.
 */
export function WepsLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/weps-logo-white.png"
      alt="UN Women — Women’s Empowerment Principles"
      className={cn('h-7 w-auto select-none sm:h-8', className)}
      draggable={false}
    />
  )
}

export function PartnerLogos({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-6', className)}>
      <div className="rounded-lg bg-white px-3 py-2">
        <img src="/brand/unwomen.png" alt="UN Women" className="h-8 w-auto" />
      </div>
      <div className="rounded-lg bg-white px-3 py-2">
        <img src="/brand/ungc.png" alt="United Nations Global Compact" className="h-8 w-auto" />
      </div>
    </div>
  )
}

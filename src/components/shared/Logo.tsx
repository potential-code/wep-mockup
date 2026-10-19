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

/**
 * Founding partner logos. The supplied UN Women file is white artwork and the UN Global Compact
 * file has its own black background, so both sit on dark tiles that work on light or dark pages.
 */
export function PartnerLogos({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="grid h-14 place-items-center rounded-xl bg-navy px-4 ring-1 ring-white/10">
        <img src="/brand/unwomen.png" alt="UN Women" className="h-8 w-auto" />
      </div>
      <div className="grid h-14 place-items-center rounded-xl bg-black px-3 ring-1 ring-white/10">
        <img src="/brand/ungc.png" alt="United Nations Global Compact" className="h-9 w-auto" />
      </div>
    </div>
  )
}

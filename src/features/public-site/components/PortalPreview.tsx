import { BookOpen, CalendarCheck, TrendingUp } from 'lucide-react'
import { images } from '@/config/images'

/** Glass preview cards of the (illustrative) portal, floated over the hero. */
export function PortalPreview() {
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[420px] lg:ms-auto" data-hero="preview">
      <div
        data-float
        className="absolute start-0 top-0 w-[78%] rounded-2xl border border-white/25 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <TrendingUp className="size-4 text-gold" aria-hidden /> Company progress
        </div>
        <div className="mt-3 flex items-center gap-4">
          <svg
            viewBox="0 0 48 48"
            className="size-16 -rotate-90"
            role="img"
            aria-label="75 percent"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,.2)"
              strokeWidth="5"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#D6A44A"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="94.2 125.7"
            />
          </svg>
          <div>
            <p className="font-bold font-heading text-3xl leading-none">75%</p>
            <p className="mt-1 text-white/70 text-xs">team activated · 18 of 24</p>
          </div>
        </div>
      </div>
      <div
        data-float
        className="absolute end-0 top-[34%] w-[74%] overflow-hidden rounded-2xl border border-white/25 bg-white/14 text-white shadow-2xl backdrop-blur-xl"
      >
        <img
          src={images.courses.inclusiveRecruitment.src}
          alt=""
          className="h-20 w-full object-cover"
        />
        <div className="p-4">
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <BookOpen className="size-4 text-gold" aria-hidden /> Learning · HR pathway
          </div>
          <p className="mt-1 font-semibold text-sm">Inclusive recruitment, module 3 of 5</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/20">
            <div className="h-full w-3/5 rounded-full bg-gold" />
          </div>
        </div>
      </div>
      <div
        data-float
        className="absolute start-[6%] bottom-0 w-[72%] rounded-2xl border border-white/25 bg-white/12 p-4 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <CalendarCheck className="size-4 text-gold" aria-hidden /> Clinic unlocked
        </div>
        <p className="mt-1 font-semibold text-sm">Gender-responsive procurement clinic</p>
        <p className="text-white/70 text-xs">Wed 4 Nov · 14:00 · 5 places left</p>
      </div>
      <p className="-bottom-7 absolute end-0 text-[11px] text-white/55 uppercase tracking-wider">
        Illustrative preview · proposed portal
      </p>
    </div>
  )
}

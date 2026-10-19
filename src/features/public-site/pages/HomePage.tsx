import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { scrollToTarget } from '@/components/motion/SmoothScroll'
import { CornerArcs, DotGrid, EdgeRule, ForAllBars } from '@/components/shared/BrandMotif'
import { DemoLabel } from '@/components/shared/Cards'
import { ExperiencePreview } from '../components/ExperiencePreview'
import { HomeHero } from '../components/HomeHero'
import {
  ClinicsAndExperts,
  CommunitySection,
  CtaBand,
  FeaturedResources,
} from '../components/HomeSections'
import { JourneyTimeline } from '../components/JourneyTimeline'
import { PrincipleCards } from '../components/PrincipleCards'
import { SectionHeading } from '../components/SectionHeading'
import { ValueOverview } from '../components/ValueOverview'

export function HomePage() {
  const { hash } = useLocation()
  // Header links from other pages land here with a hash: scroll once the page has laid out.
  useEffect(() => {
    if (!hash) return
    // A second pass corrects for images above the target that finish loading mid-scroll.
    const timers = [150, 1100].map((ms) => window.setTimeout(() => scrollToTarget(`#${hash}`), ms))
    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [hash])

  return (
    <>
      <HomeHero />

      <section id="about" className="relative isolate overflow-hidden py-20 sm:py-28">
        <CornerArcs corner="tr" tone="light" size={340} className="-z-10" />
        <DotGrid
          tone="light"
          className="-z-10 bottom-10 left-6 hidden md:block"
          cols={7}
          rows={4}
        />
        <div className="container-public">
          <SectionHeading
            eyebrow="Why the portal"
            title="One place to learn, act and report"
            description="Learning, expert support and reporting are usually separate touchpoints. Here they connect around your company."
          />
          <ValueOverview />
        </div>
      </section>

      <section
        id="principles"
        className="relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--surface),#eaf1f7)] py-20 sm:py-28"
        aria-labelledby="principles-h"
      >
        <EdgeRule tone="light" className="top-0" />
        <ForAllBars tone="light" className="-z-10 -left-16 top-10 hidden md:block" size={300} />
        <CornerArcs corner="br" tone="light" size={300} className="-z-10" />
        <div className="container-public">
          <SectionHeading
            id="principles-h"
            eyebrow="The Principles"
            title="Seven Principles for advancing equality in business"
            description="Established by UN Women and the UN Global Compact. Choose a Principle to see what it means for your company."
          />
          <PrincipleCards />
        </div>
      </section>

      <section
        id="journey"
        className="relative isolate overflow-hidden bg-navy-900 py-20 text-white sm:py-28"
      >
        <div
          aria-hidden
          className="-z-10 absolute inset-0 bg-[radial-gradient(50%_60%_at_100%_0%,rgba(22,124,179,0.35),transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgba(214,164,74,0.12),transparent_70%)]"
        />
        <CornerArcs corner="tl" size={380} className="-z-10" />
        <DotGrid className="-z-10 right-8 bottom-10" cols={8} rows={4} />
        <EdgeRule className="bottom-0" />
        <div className="container-public relative">
          <SectionHeading
            tone="dark"
            eyebrow="The official WEPs journey"
            title="Six stages from consideration to public reporting"
            description="This is the framework every signatory follows. It is separate from the portal’s own navigation, which supports you at each stage."
          />
          <JourneyTimeline tone="dark" />
        </div>
      </section>

      <section id="portal" className="relative isolate overflow-x-clip bg-surface py-20 sm:py-28">
        <CornerArcs corner="tr" tone="light" size={320} className="-z-10" />
        <div className="container-public">
          <SectionHeading
            eyebrow="Inside the portal"
            title="See what your team will work with"
            description={
              <>
                A preview of the proposed experience. <DemoLabel className="align-middle" />
              </>
            }
          />
          <ExperiencePreview />
        </div>
      </section>

      <FeaturedResources />
      <ClinicsAndExperts />
      <CommunitySection />
      <CtaBand />
    </>
  )
}

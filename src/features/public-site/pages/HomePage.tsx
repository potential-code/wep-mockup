import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { scrollToTarget } from '@/components/motion/SmoothScroll'
import { BrushRing, EdgeRule, ForAllBars, GearCluster } from '@/components/shared/BrandMotif'
import { ExperiencePreview } from '../components/ExperiencePreview'
import { GlobalNetwork } from '../components/GlobalNetwork'
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
        <BrushRing tone="light" size={420} className="-z-10 -top-24 -right-24" />
        <div className="container-public">
          <SectionHeading
            eyebrow="Why the portal"
            title="One place to learn, act and report"
            description="Learning, expert support and reporting are usually separate touchpoints. Here they connect around your company."
          />
          <ValueOverview />
        </div>
      </section>

      <GlobalNetwork />

      <section
        id="principles"
        className="relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--surface),var(--blue-50))] py-20 sm:py-28"
        aria-labelledby="principles-h"
      >
        <EdgeRule tone="light" className="top-0" />
        <ForAllBars tone="light" className="-z-10 -left-16 top-10 hidden md:block" size={300} />
        <GearCluster tone="light" size={300} className="-z-10 -right-16 -bottom-16" />
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
        className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#005487,var(--blue)_70%,#0080bd)] py-20 text-white sm:py-28"
      >
        <GearCluster size={400} className="-z-10 -top-16 -right-24 hidden md:block" />
        <ForAllBars
          variant="outline"
          size={260}
          className="-z-10 -bottom-10 -left-16 hidden md:block"
        />
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

      <section
        id="portal"
        className="relative isolate overflow-x-clip bg-[linear-gradient(180deg,#fff,var(--blue-50)_55%,#fff)] py-20 sm:py-28"
      >
        <BrushRing tone="light" size={380} className="-z-10 -top-20 -right-20" />
        <GearCluster tone="light" size={320} className="-z-10 bottom-10 -left-24 hidden lg:block" />
        <ForAllBars tone="light" size={240} className="-z-10 top-1/3 -left-20 hidden xl:block" />
        <div className="container-public">
          <SectionHeading
            eyebrow="Inside the portal"
            title="See what your team will work with"
            description={<>A preview of the proposed experience.</>}
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

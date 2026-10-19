import { Reveal } from '@/components/motion/Reveal'
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
  return (
    <>
      <HomeHero />

      <section id="value" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container-public">
          <SectionHeading
            eyebrow="Why the portal"
            title="One place to learn, act and report"
            description="Learning, expert support and reporting are usually separate touchpoints. Here they connect around your company."
          />
          <ValueOverview />
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-24" aria-labelledby="principles-h">
        <div className="container-public">
          <SectionHeading
            eyebrow="The Principles"
            title="Seven Principles for advancing equality in business"
            description="Established by UN Women and the UN Global Compact. Each card links to the official explanation."
          />
          <h3 id="principles-h" className="sr-only">
            The seven Women’s Empowerment Principles
          </h3>
          <PrincipleCards />
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-28">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(50%_60%_at_100%_0%,rgba(22,124,179,0.35),transparent_70%)]"
        />
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

      <section className="bg-surface py-16 sm:py-24">
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
      <Reveal>
        <CtaBand />
      </Reveal>
    </>
  )
}

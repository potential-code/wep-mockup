import { JOURNEY_STAGES, OFFICIAL_LINKS, PRINCIPLES } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, BookOpen, FileCheck2, Users } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel } from '@/components/shared/Cards'
import { PartnerLogos } from '@/components/shared/Logo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { images } from '@/config/images'
import { JourneyTimeline } from '../components/JourneyTimeline'
import { PageIntro } from '../components/PageIntro'
import { SectionHeading } from '../components/SectionHeading'

const CONNECTS = [
  {
    icon: BookOpen,
    title: 'Learn',
    text: 'Department-based courses and official resources prepare each person for their part in the plan.',
    to: '/resources',
  },
  {
    icon: Users,
    title: 'Get support',
    text: 'Points earned through learning unlock live clinics and one-to-one time with mentors and trainers.',
    to: '/clinics',
  },
  {
    icon: FileCheck2,
    title: 'Report',
    text: 'Actions and evidence collected along the way feed the annual WEPs report.',
    to: '/join',
  },
] as const

const FAQ = [
  {
    q: 'Who can join the WEPs?',
    a: 'Companies join as organisations. A company’s CEO signs the Statement of Support for the Principles, and people then take part through their company accounts. Official eligibility and the application form are on weps.org.',
  },
  {
    q: 'What is the difference between the WEPs journey and the portal?',
    a: 'The six-stage WEPs journey (Consider, Sign, Activate, Engage, Sustain, Report) is the official framework. The portal is a proposed set of tools that supports companies at each stage; it does not replace or rename the journey.',
  },
  {
    q: 'Does earning points or buying a certification make a company a signatory?',
    a: 'No. Signatory status, certification status and points are separate. Only UN Women approval of a company’s application grants signatory status.',
  },
  {
    q: 'Do I have to pay to apply?',
    a: 'No payment is required to submit an application. Any financial contribution interest is optional and separate from approval.',
  },
  {
    q: 'Is the data on this site real?',
    a: 'This is a mockup. Official principles, journey stages and the three featured resources come from weps.org. Company names, numbers and portal features are illustrative or proposed.',
  },
]

export function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About WEPs"
        title="A framework for advancing gender equality in business"
        description="The Women’s Empowerment Principles were established by UN Women and the UN Global Compact to guide companies across the workplace, marketplace and community."
      >
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="gold" size="lg">
            <Link to="/join">
              Join WEPs <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="lg">
            <a href={OFFICIAL_LINKS.about} target="_blank" rel="noreferrer">
              Official site <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens weps.org)</span>
            </a>
          </Button>
        </div>
      </PageIntro>

      <section className="py-16 sm:py-24">
        <div className="container-public grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="grid gap-5">
            <p className="font-medium text-blue text-xs uppercase tracking-[0.18em]">What it is</p>
            <h2 className="text-balance font-bold font-heading text-3xl text-navy sm:text-4xl">
              Commitment from the top, action across the company
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              UN Women works on gender equality and women’s empowerment. The WEPs help businesses
              turn that goal into practice across hiring, pay, safety, supply chains, community
              engagement and public reporting.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Companies join as organisations; people participate through their company accounts.
              The Principles are navigation themes for the work, not certification levels.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <img
              src={images.sections.community.src}
              alt={images.sections.community.alt}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />
          </Reveal>
        </div>
      </section>

      <section id="principles" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="container-public">
          <SectionHeading
            eyebrow="The seven Principles"
            title="What each Principle asks of business"
            description="Summaries follow the official WEPs wording. Each links to its full page on weps.org."
          />
          <Stagger className="grid gap-4" gap={0.05}>
            {PRINCIPLES.map((p) => (
              <StaggerItem key={p.id}>
                <article className="grid gap-4 rounded-2xl border bg-card p-6 shadow-card sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
                  <div className="flex items-center gap-4">
                    <img src={p.icon} alt="" className="size-16 rounded-2xl" loading="lazy" />
                    <span className="font-bold font-heading text-4xl text-navy/15 sm:hidden">
                      {p.id}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-blue text-xs uppercase tracking-wider">
                      Principle {p.id}
                    </p>
                    <h3 className="mt-0.5 font-heading font-semibold text-lg text-navy leading-snug sm:text-xl">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-muted-foreground">{p.description}</p>
                  </div>
                  <Button asChild variant="outline">
                    <a href={p.url} target="_blank" rel="noreferrer">
                      Official page <ArrowUpRight aria-hidden />
                      <span className="sr-only">for principle {p.id} (opens weps.org)</span>
                    </a>
                  </Button>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="journey-h">
        <div className="container-public">
          <SectionHeading
            eyebrow="The official WEPs journey"
            title="Six stages, from consideration to public reporting"
            description={`${JOURNEY_STAGES.length} stages define how a company moves from first interest to transparent reporting. They are separate from the portal’s own navigation.`}
          />
          <h3 id="journey-h" className="sr-only">
            The six journey stages
          </h3>
          <JourneyTimeline tone="light" />
        </div>
      </section>

      <section id="portal" className="scroll-mt-20 bg-navy-900 py-16 text-white sm:py-24">
        <div className="container-public">
          <SectionHeading
            tone="dark"
            eyebrow="How the portal connects the work"
            title="Learning, support and reporting around one company record"
            description={
              <>
                Today these are often separate touchpoints. The portal brings them together.{' '}
                <DemoLabel>Proposed feature</DemoLabel>
              </>
            }
          />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {CONNECTS.map((c, i) => (
              <StaggerItem key={c.title}>
                <Link
                  to={c.to}
                  className="group relative grid h-full gap-4 rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur transition-colors hover:bg-white/10"
                >
                  <span className="font-bold font-heading text-gold text-sm">0{i + 1}</span>
                  <c.icon className="size-8 text-gold" aria-hidden />
                  <h3 className="font-heading font-semibold text-2xl">{c.title}</h3>
                  <p className="text-white/70">{c.text}</p>
                  <ArrowRight
                    className="mt-auto size-5 text-gold transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-public grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="grid content-start gap-5">
            <SectionHeading
              className="mb-0 sm:mb-0"
              eyebrow="Founding partners"
              title="Established by UN Women and the UN Global Compact"
            />
            <div className="[&>div>div]:border [&>div>div]:shadow-card">
              <PartnerLogos />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mb-4 font-bold font-heading text-2xl text-navy">
              Frequently asked questions
            </h2>
            <Accordion
              type="single"
              collapsible
              className="rounded-2xl border bg-card px-6 shadow-card"
            >
              {FAQ.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-start font-heading font-semibold text-base text-navy">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </>
  )
}

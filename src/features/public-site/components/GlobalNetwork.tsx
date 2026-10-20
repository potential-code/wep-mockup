import { ArrowUpRight, Building2, Globe2, MapPin, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import { CountUp } from '@/components/motion/CountUp'
import { ForAllBars, GearCluster } from '@/components/shared/BrandMotif'
import { SignatoryMap } from '@/components/shared/SignatoryMap'
import { useGlobalNetwork } from '@/queries/network.queries'
import { SectionHeading } from './SectionHeading'

/** Home section: the known global signatory network with big numbers and a world map. */
export function GlobalNetwork() {
  const { data } = useGlobalNetwork()
  const top = data?.countries[0]
  const topFive = data?.countries.slice(0, 5).reduce((s, c) => s + c.count, 0) ?? 0
  const stats = data
    ? [
        { icon: Building2, value: data.total, label: 'Companies have signed the WEPs' },
        { icon: Globe2, value: data.countryCount, label: 'Countries and territories' },
        { icon: Trophy, value: top?.count ?? 0, label: `Signatories in ${top?.name ?? '—'}` },
        { icon: MapPin, value: topFive, label: 'In the five leading countries' },
      ]
    : []

  return (
    <section
      id="signatories"
      aria-labelledby="signatories-h"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-28"
    >
      <GearCluster tone="light" size={340} className="-z-10 -top-16 -right-20 hidden md:block" />
      <ForAllBars tone="light" size={260} className="-z-10 -bottom-20 -left-16" />
      <div className="container-public">
        <SectionHeading
          id="signatories-h"
          eyebrow="Signatories"
          title="A global movement of companies"
          description="Businesses of every size and sector have committed to the Principles. Pick a country to see how many have signed."
        />

        <div className="relative mb-12 overflow-hidden rounded-3xl bg-[linear-gradient(110deg,var(--blue-600),var(--blue)_45%,var(--cyan))] p-6 text-white shadow-lift sm:p-8">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-6"
            animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            <ForAllBars size={220} className="relative opacity-90" />
          </motion.div>
          {/* Light sweep across the band on a slow loop. */}
          <div
            aria-hidden
            className="-skew-x-12 pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 animate-[sweep_7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/12 to-transparent"
          />
          <dl className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group/stat grid cursor-default gap-1 border-white/25 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="order-2 flex items-center gap-2 text-sm text-white/90">
                  <s.icon
                    className="size-4 shrink-0 transition-transform duration-300 group-hover/stat:-rotate-12 group-hover/stat:scale-125"
                    aria-hidden
                  />
                  {s.label}
                </dt>
                <dd className="order-1 font-semibold font-heading text-4xl tabular-nums sm:text-5xl">
                  <CountUp value={s.value} duration={1.6} />
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        {data ? <SignatoryMap countries={data.countries} /> : null}

        <p className="mt-6 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
          Figures as published on weps.org.
          <a
            href="https://www.weps.org/companies"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-blue hover:underline"
          >
            Browse all signatories <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </p>
      </div>
    </section>
  )
}

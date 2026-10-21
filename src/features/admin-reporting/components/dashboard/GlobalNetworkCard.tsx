import { Globe2 } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { SignatoryMap } from '@/components/shared/SignatoryMap'
import { formatNumber } from '@/lib/format'
import { useGlobalNetwork } from '@/queries/network.queries'

/** The global WEPs network from weps.org, the same companies the figures above count. */
export function GlobalNetworkCard() {
  const { data } = useGlobalNetwork()
  if (!data) return null
  return (
    <SectionCard
      title={
        <span className="flex items-center gap-2">
          <Globe2 className="size-5 text-blue" aria-hidden /> Global signatory network
        </span>
      }
      description={`${formatNumber(data.total)} companies in ${data.countryCount} countries and territories. Source: ${data.source}.`}
    >
      <SignatoryMap countries={data.countries} compact />
    </SectionCard>
  )
}

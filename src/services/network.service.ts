// Known global signatory network from weps.org. Read-only reference figures, shown apart
// from the demo portfolio KPIs so those totals still reconcile with the seed records.

import { GLOBAL_SIGNATORIES, GLOBAL_SIGNATORIES_TOTAL } from '@/mocks/seed/global-network'
import { delay } from './api'

export interface CountrySignatories {
  /** ISO 3166 numeric id used by the world map, or null for places too small to draw. */
  mapId: string | null
  iso2: string
  name: string
  count: number
}

export async function getGlobalNetwork() {
  await delay(120)
  const countries: CountrySignatories[] = GLOBAL_SIGNATORIES.map(([mapId, iso2, name, count]) => ({
    mapId,
    iso2,
    name,
    count,
  }))
  return {
    total: GLOBAL_SIGNATORIES_TOTAL,
    countryCount: countries.length,
    countries,
    source: 'weps.org/companies, October 2026',
  }
}

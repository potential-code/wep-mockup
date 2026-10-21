// Known global signatory network from weps.org. The portal's own demo companies sit inside it;
// the rest of the network is a deterministic set of fictional companies sized to the real
// per-country counts, so reporting totals read at the real global scale.

import { DEPARTMENTS, SECTORS } from '@shared/reference'
import type { Company, CompanySize, ReportStatus } from '@shared/types'
import { GLOBAL_SIGNATORIES, GLOBAL_SIGNATORIES_TOTAL } from '@/mocks/seed/global-network'
import { db, delay } from './api'
import { pct } from './metrics'

export interface CountrySignatories {
  /** ISO 3166 numeric id used by the world map, or null for places too small to draw. */
  mapId: string | null
  iso2: string
  name: string
  count: number
}

/** weps.org long names mapped to the names the portal uses. */
const COUNTRY_ALIAS: Record<string, string> = {
  Turkiye: 'Türkiye',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'United States of America': 'United States',
}
const countryName = (name: string) => COUNTRY_ALIAS[name] ?? name

export async function getGlobalNetwork() {
  await delay(120)
  const countries: CountrySignatories[] = GLOBAL_SIGNATORIES.map(([mapId, iso2, name, count]) => ({
    mapId,
    iso2,
    name: countryName(name),
    count,
  }))
  return {
    total: GLOBAL_SIGNATORIES_TOTAL,
    countryCount: countries.length,
    countries,
    source: 'weps.org/companies, October 2026',
  }
}

/* ------------------------------------------------------------ fictional network -- */

const REGION_OF: Record<string, string> = {}
for (const [region, codes] of Object.entries({
  Africa:
    'NG KE ZA UG CD TZ ZW GH ET ZM ML SN MW MU BF MZ CI MG RW SO BJ BI SZ LR TG AO BW CM LS TD GN CF SL CV CG GQ NE GA GM NA ST GW SC',
  'Arab States': 'JO AE EG LB KW TN MA YE PS SA BH QA OM IQ LY MR SD SS SY DZ DJ',
  'Asia and the Pacific':
    'IN CN JP VN ID PH TH PK MY KR AF SG NP KH BD NZ AU HK LK LA MM MN TL FJ BN PG NC BT MV SB CK KI WS TO VU TW IR',
  'Europe and Central Asia':
    'TR GE GB ES DE FR IT NL CH RS MD AL UA PT GR DK BE KZ AZ AT AM SE BA XK CZ HR NO PL FI MK RO IS CY IE IL EE BG LU MT HU UZ LT ME RU SK BY LV SI KG TM AD MC IM TJ',
  'Latin America and the Caribbean':
    'BR MX AR CL CO EC UY CR VE BO PA PE GT SV JM DO HN GY TT PY BB BS HT AG SR CU GD NI PR VG BZ KY DM LC VC',
  'North America': 'US CA BM',
}))
  for (const code of codes.split(' ')) REGION_OF[code] = region

const FIRST =
  'Amber Atlas Aurora Azure Birch Bright Cedar Cobalt Coral Crest Delta Ember Fern Golden Granite Harbor Indigo Iris Jade Juniper Kite Lark Lotus Lumen Maple Meridian Mosaic Nimbus Oak Onyx Opal Orchid Pearl Pine Prism Quartz Raven Ridge River Saffron Sage Silver Solar Sterling Summit Tidal Union Vista Willow Zenith'.split(
    ' ',
  )
const SECOND =
  'Bay Bridge Brook Canyon Cove Field Gate Grove Hill Lane Leaf Line Mark Mill Moon North Peak Point Rock Shore Spring Star Stone Vale View Way Well Wind Wood Works'.split(
    ' ',
  )
const SECTOR_WORD: Record<string, string[]> = {
  'Financial services': ['Capital', 'Finance', 'Bank', 'Insurance'],
  Manufacturing: ['Industries', 'Manufacturing', 'Components', 'Engineering'],
  'Retail and consumer goods': ['Retail', 'Brands', 'Stores', 'Consumer'],
  'Technology and telecommunications': ['Technologies', 'Digital', 'Telecom', 'Systems'],
  'Energy and utilities': ['Energy', 'Power', 'Utilities', 'Renewables'],
  Healthcare: ['Health', 'Pharma', 'Care', 'Medical'],
  'Food and agriculture': ['Foods', 'Agro', 'Farms', 'Harvest'],
  'Logistics and transport': ['Logistics', 'Freight', 'Transport', 'Shipping'],
  'Professional services': ['Consulting', 'Partners', 'Advisory', 'Associates'],
  'Textiles and apparel': ['Textiles', 'Apparel', 'Fabrics', 'Garments'],
}
const LEGAL = ['', '', '', ' Group', ' Ltd', ' Co.', ' Holdings', ' S.A.', ' Inc.']
const GIVEN =
  'Amina Carlos Chen Daniela Fatima Hana Ines Jamal Kavya Lina Mariam Mateo Nadia Olu Priya Rania Samir Sofia Tariq Yuki Zara Elena Grace Ahmed'.split(
    ' ',
  )
const FAMILY =
  'Abdi Alvarez Bakr Costa Diallo Eze Farah Garcia Haddad Ivanova Kaya Lopez Mensah Nair Okafor Park Quispe Rossi Silva Tan Usman Wang Yilmaz Zulu'.split(
    ' ',
  )
const SIZES: [CompanySize, number, number, number][] = [
  ['1-49', 0.34, 5, 49],
  ['50-249', 0.28, 50, 249],
  ['250-999', 0.18, 250, 999],
  ['1000-4999', 0.13, 1000, 4999],
  ['5000+', 0.07, 5000, 40000],
]
const INVITES: Record<CompanySize, [number, number]> = {
  '1-49': [2, 6],
  '50-249': [4, 12],
  '250-999': [8, 22],
  '1000-4999': [12, 36],
  '5000+': [20, 60],
}
// Current-year report mix across the wider network.
const STATUS_MIX: [ReportStatus, number][] = [
  ['accepted', 0.41],
  ['under_review', 0.08],
  ['submitted', 0.07],
  ['changes_requested', 0.05],
  ['resubmitted', 0.02],
  ['draft', 0.17],
  ['not_started', 0.2],
]

/** Small seeded generator so the network is identical on every load. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface NetworkCompany {
  company: Company
  invited: number
  activated: number
  completed: number
  active: boolean
  activeTeams: number
  contacts: string
  /** Report status for the current reporting year; earlier years are mostly accepted. */
  report: ReportStatus
  assessed: boolean
  hasPlan: boolean
  actions: { total: number; complete: number; overdue: number }
  clinic: { registered: number; attended: number }
  bookings: number
}

let cache: NetworkCompany[] | undefined

/** Every fictional network company. Excludes the portal's own approved demo companies. */
export function networkCompanies(): NetworkCompany[] {
  if (cache) return cache
  const r = rng(13462)
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)] as T
  const between = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
  const weighted = <T extends [unknown, number, ...unknown[]]>(xs: T[]): T => {
    let x = r()
    for (const row of xs) {
      x -= row[1]
      if (x < 0) return row
    }
    return xs[xs.length - 1] as T
  }
  const demo = db.companies.filter((c) => c.signatoryStatus === 'approved')
  // The published total runs slightly ahead of the per-country table; the remainder sits with
  // the largest country.
  const listed = GLOBAL_SIGNATORIES.reduce((n, row) => n + row[3], 0)
  const rows: NetworkCompany[] = []
  GLOBAL_SIGNATORIES.forEach(([, iso2, rawName, count], ci) => {
    const country = countryName(rawName)
    const own = demo.filter((c) => c.country === country).length
    const n = count - own + (ci === 0 ? GLOBAL_SIGNATORIES_TOTAL - listed : 0)
    for (let i = 0; i < n; i++) {
      const sector = pick(SECTORS)
      const [size, , lo, hi] = weighted(SIZES)
      const [iLo, iHi] = INVITES[size]
      const invited = between(iLo, iHi)
      const dormant = r() < 0.14
      const activated = dormant ? between(0, 1) : Math.round(invited * (0.45 + r() * 0.5))
      const completed = Math.round(activated * (0.25 + r() * 0.55))
      const active = !dormant && r() < 0.55
      const joined = 2010 + Math.floor(Math.sqrt(r()) * 17)
      const day = String(between(1, 28)).padStart(2, '0')
      const report = dormant ? 'not_started' : weighted(STATUS_MIX)[0]
      const total = dormant ? 0 : between(3, 14)
      const ceo = `${pick(GIVEN)} ${pick(FAMILY)}`
      const registered = Math.round(activated * r() * 0.35)
      rows.push({
        company: {
          id: `n-${iso2.toLowerCase()}-${i + 1}`,
          name: `${pick(FIRST)} ${pick(SECOND)} ${pick(SECTOR_WORD[sector] ?? ['Group'])}${pick(LEGAL)}`,
          country,
          region: REGION_OF[iso2] ?? 'Asia and the Pacific',
          sector,
          size,
          employeeCount: between(lo, hi),
          ownership: r() < 0.85 ? 'private' : r() < 0.6 ? 'public' : 'state_owned',
          website: 'https://example.org',
          ungcMember: r() < 0.45,
          signatoryStatus: 'approved',
          memberSince: `${Math.min(joined, 2026)}-${String(between(1, joined >= 2026 ? 9 : 12)).padStart(2, '0')}-${day}T00:00:00.000Z`,
          summary: `${sector} company in ${country}, part of the global WEPs signatory network. Summary record: detailed actions and reports are kept for the portal's own demo companies.`,
          priorities: [],
          priorityPrinciples: [],
          publicProfileApproved: true,
          lastActivityAt: active
            ? `2026-10-${String(between(1, 20)).padStart(2, '0')}T09:00:00.000Z`
            : `2026-0${between(1, 9)}-${day}T09:00:00.000Z`,
        },
        invited,
        activated,
        completed,
        active,
        activeTeams: Math.min(DEPARTMENTS.length, Math.ceil(activated / 3)),
        contacts: ceo,
        report,
        assessed: !dormant && r() < 0.78,
        hasPlan: !dormant && r() < 0.66,
        actions: {
          total,
          complete: Math.round(total * r() * 0.7),
          overdue: total && r() < 0.22 ? between(1, 3) : 0,
        },
        clinic: { registered, attended: Math.round(registered * (0.7 + r() * 0.28)) },
        bookings: Math.round(activated * r() * 0.15),
      })
    }
  })
  // Most recently active first, so table pages open on engaged companies.
  rows.sort((a, b) =>
    (b.company.lastActivityAt ?? '').localeCompare(a.company.lastActivityAt ?? ''),
  )
  cache = rows
  return rows
}

/** Network companies inside the reporting country and sector filters. */
export const scopedNetwork = (f: { country?: string; sector?: string; companyId?: string }) =>
  f.companyId
    ? []
    : networkCompanies().filter(
        (n) =>
          (!f.country || n.company.country === f.country) &&
          (!f.sector || n.company.sector === f.sector),
      )

/** A network company's report status for a given year. */
export function networkReportStatus(n: NetworkCompany, year: number): ReportStatus {
  if (year >= 2026) return n.report
  const joined = Number(n.company.memberSince?.slice(0, 4))
  if (joined > year) return 'not_started'
  return n.report === 'not_started' ? 'not_started' : 'accepted'
}

/** Row shaped like the reporting companies table. */
export const networkRow = (n: NetworkCompany, year: number) => ({
  company: n.company,
  invited: n.invited,
  activated: n.activated,
  completed: n.completed,
  activationRate: pct(n.activated, n.invited),
  completionRate: pct(n.completed, n.activated),
  reportStatus: networkReportStatus(n, year),
  actions: {
    ...n.actions,
    missingEvidence: 0,
    onTrack: n.actions.total - n.actions.overdue,
    active: n.actions.total,
    dueInPeriod: n.actions.total,
    completionRate: pct(n.actions.complete, n.actions.total),
  },
  active: n.active,
  activeTeams: n.activeTeams,
  contacts: n.contacts,
  application: undefined,
})

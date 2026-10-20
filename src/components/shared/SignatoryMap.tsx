import { useQuery } from '@tanstack/react-query'
import { geoMercator, geoPath } from 'd3-geo'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldUrl from 'world-atlas/countries-110m.json?url'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CountrySignatories } from '@/services/network.service'

/** Legend bands match weps.org/companies. */
const BANDS = [
  { min: 1000, label: '1,000+', fill: '#0b4f7a' },
  { min: 800, label: '800–1,000', fill: '#1f6fa3' },
  { min: 300, label: '300–800', fill: '#5aaed9' },
  { min: 100, label: '100–300', fill: '#a3d4ee' },
  { min: 1, label: '1–100', fill: '#dcf0fa' },
  { min: 0, label: 'None yet', fill: '#eceff3' },
] as const
const NONE = { min: 0, label: 'None yet', fill: '#eceff3' }

const bandFor = (n: number) => BANDS.find((b) => n >= b.min) ?? NONE

const W = 960
const H = 520

type Shape = { id: string; d: string; centroid: [number, number] }

async function loadShapes(): Promise<Shape[]> {
  const topo = (await fetch(worldUrl).then((r) => r.json())) as Topology<{
    countries: GeometryCollection
  }>
  const fc = feature(topo, topo.objects.countries)
  // Antarctica has no signatories and would take a third of the map.
  const features = fc.features.filter((f) => f.id !== '010')
  const projection = geoMercator().fitExtent(
    [
      [0, 8],
      [W, H],
    ],
    { type: 'FeatureCollection', features },
  )
  const path = geoPath(projection)
  // A few disputed areas have no id in world-atlas; give them a stable placeholder.
  return features.map((f, i) => ({
    id: f.id === undefined ? `unassigned-${i}` : String(f.id),
    d: path(f) ?? '',
    centroid: path.centroid(f) as [number, number],
  }))
}

/**
 * Choropleth of known WEPs signatories by country, with a country picker for keyboard and
 * screen-reader users. Geometry loads on demand as a static asset.
 */
export function SignatoryMap({
  countries,
  className,
  compact = false,
}: {
  countries: CountrySignatories[]
  className?: string
  /** Smaller legend and no picker label, for dashboard cards. */
  compact?: boolean
}) {
  const { data: shapes } = useQuery({
    queryKey: ['world-shapes'],
    queryFn: loadShapes,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const byMapId = useMemo(
    () => new Map(countries.filter((c) => c.mapId).map((c) => [c.mapId as string, c])),
    [countries],
  )
  const sorted = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  )
  const [selected, setSelected] = useState<string>('')
  const [hover, setHover] = useState<string | null>(null)
  const active =
    countries.find((c) => c.iso2 === selected) ?? (hover ? byMapId.get(hover) : undefined)
  const activeShape = shapes?.find((s) => s.id === active?.mapId)

  return (
    <div className={cn('grid gap-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selected} onValueChange={(v) => setSelected(v === 'none' ? '' : v)}>
          <SelectTrigger
            aria-label="Find signatories by location"
            className={cn('w-full bg-white sm:w-72', compact && 'sm:w-64')}
          >
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="none">All countries</SelectItem>
            {sorted.map((c) => (
              <SelectItem key={c.iso2} value={c.iso2}>
                {c.name} · {formatNumber(c.count)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="min-h-6 text-navy text-sm" aria-live="polite">
          {active ? (
            <>
              <span className="font-semibold">{active.name}</span>: {formatNumber(active.count)}{' '}
              {active.count === 1 ? 'signatory' : 'signatories'}
            </>
          ) : (
            <span className="text-muted-foreground">Hover or pick a country to see its count.</span>
          )}
        </p>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`World map of WEPs signatories across ${countries.length} countries and territories`}
          className="h-auto w-full"
          onMouseLeave={() => setHover(null)}
        >
          {shapes
            ? shapes.map((s, i) => {
                const c = byMapId.get(s.id)
                const isActive = active?.mapId === s.id
                return (
                  <motion.path
                    key={s.id}
                    d={s.d}
                    fill={bandFor(c?.count ?? 0).fill}
                    stroke={isActive ? 'var(--coral)' : '#ffffff'}
                    strokeWidth={isActive ? 1.6 : 0.6}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.004, 0.6) }}
                    className={cn(
                      'transition-[fill] duration-200',
                      c && 'cursor-pointer hover:brightness-90',
                    )}
                    onMouseEnter={() => c && setHover(s.id)}
                    onClick={() => c && setSelected(c.iso2)}
                  />
                )
              })
            : null}
          {activeShape ? (
            <circle
              cx={activeShape.centroid[0]}
              cy={activeShape.centroid[1]}
              r="5"
              fill="var(--coral)"
              stroke="#fff"
              strokeWidth="2"
              className="pointer-events-none"
            />
          ) : null}
        </svg>
        {shapes ? null : (
          <div className="absolute inset-0 animate-pulse rounded-xl bg-blue-50" aria-hidden />
        )}

        <div
          className={cn(
            'mt-3 grid grid-cols-3 gap-x-4 gap-y-1.5 text-navy text-xs sm:absolute sm:bottom-2 sm:left-2 sm:mt-0 sm:grid-cols-1 sm:rounded-lg sm:bg-white/85 sm:p-3 sm:backdrop-blur',
            compact && 'sm:p-2',
          )}
        >
          <p className="col-span-full font-semibold text-muted-foreground">Signatories</p>
          {BANDS.map((b) => (
            <span key={b.label} className="flex items-center gap-2">
              <span
                className="size-3.5 shrink-0 rounded-sm ring-1 ring-navy/10"
                style={{ background: b.fill }}
                aria-hidden
              />
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

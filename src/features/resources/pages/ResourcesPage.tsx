import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import type { Resource } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  BookMarked,
  ChevronDown,
  History,
  LayoutGrid,
  List,
  Search,
  SearchX,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useResources, useToggleSavedResource } from '@/queries/resources.queries'
import { ResourceCard } from '../components/ResourceCard'
import { FORMAT_META } from '../components/resource-meta'

interface Filters {
  q: string
  principle: string
  topic: string
  department: string
  format: string
  language: string
  access: string
}
const EMPTY: Filters = {
  q: '',
  principle: 'all',
  topic: 'all',
  department: 'all',
  format: 'all',
  language: 'all',
  access: 'all',
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full min-w-0 bg-card sm:w-auto">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          All {label.toLowerCase()}
          {label.endsWith('s') ? '' : 's'}
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ResourcesPage() {
  const { data, isLoading, error, refetch } = useResources()
  const toggle = useToggleSavedResource()
  const [f, setF] = useState<Filters>(EMPTY)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [more, setMore] = useState(false)
  const [shown, setShown] = useState(6)
  const set = (k: keyof Filters) => (v: string) => {
    setShown(6)
    setF((p) => ({ ...p, [k]: v }))
  }

  const all = data?.resources ?? []
  const saved = useMemo(() => new Set(data?.saved ?? []), [data?.saved])
  const byId = useMemo(() => new Map(all.map((r) => [r.id, r])), [all])

  const topics = useMemo(() => [...new Set(all.map((r) => r.topic))].sort(), [all])
  const languages = useMemo(() => [...new Set(all.map((r) => r.language))].sort(), [all])
  const formats = useMemo(() => [...new Set(all.map((r) => r.format))], [all])

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return all.filter(
      (r) =>
        (!q || `${r.title} ${r.description} ${r.topic} ${r.publisher}`.toLowerCase().includes(q)) &&
        (f.principle === 'all' || String(r.principle) === f.principle) &&
        (f.topic === 'all' || r.topic === f.topic) &&
        (f.department === 'all' || r.departments.includes(f.department as never)) &&
        (f.format === 'all' || r.format === f.format) &&
        (f.language === 'all' || r.language === f.language) &&
        (f.access === 'all' || r.access === f.access),
    )
  }, [all, f])

  const filtering = JSON.stringify(f) !== JSON.stringify(EMPTY)
  const featured = all.filter((r) => r.featured).slice(0, 3)
  const savedList = (data?.saved ?? []).map((id) => byId.get(id)).filter((r): r is Resource => !!r)
  const recent = (data?.recent ?? []).map((id) => byId.get(id)).filter((r): r is Resource => !!r)
  const onToggle = (id: string) =>
    toggle.mutate(id, {
      onSuccess: (nowSaved) =>
        toast.success(nowSaved ? 'Saved to My Saved Resources' : 'Removed from saved'),
    })

  return (
    <div>
      <PageHeader title="Resources" description="Official WEPs guidance, toolkits and templates." />

      <div className="relative mb-4">
        <Search
          className="-translate-y-1/2 pointer-events-none absolute start-4 top-1/2 size-5 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Search resources"
          placeholder="Search by title, topic or publisher"
          value={f.q}
          onChange={(e) => set('q')(e.target.value)}
          className="h-12 bg-card ps-12 text-base"
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect
          label="Principle"
          value={f.principle}
          onChange={set('principle')}
          options={PRINCIPLES.map((p) => ({ value: String(p.id), label: `P${p.id} · ${p.short}` }))}
        />
        <FilterSelect
          label="Topic"
          value={f.topic}
          onChange={set('topic')}
          options={topics.map((t) => ({ value: t, label: t }))}
        />
        <FilterSelect
          label="File type"
          value={f.format}
          onChange={set('format')}
          options={formats.map((x) => ({ value: x, label: FORMAT_META[x].label }))}
        />
        <Button
          variant="outline"
          className="bg-card"
          aria-expanded={more}
          onClick={() => setMore((v) => !v)}
        >
          <SlidersHorizontal aria-hidden /> More filters
          <ChevronDown aria-hidden className={more ? 'rotate-180' : ''} />
        </Button>
        {filtering ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setF(EMPTY)
              setShown(6)
            }}
          >
            <X aria-hidden /> Clear filters
          </Button>
        ) : null}
        <ToggleGroup
          type="single"
          value={layout}
          onValueChange={(v) => v && setLayout(v as 'grid' | 'list')}
          variant="outline"
          aria-label="Layout"
          className="col-span-2 sm:ms-auto"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {more ? (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <FilterSelect
            label="Department"
            value={f.department}
            onChange={set('department')}
            options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.short }))}
          />
          <FilterSelect
            label="Language"
            value={f.language}
            onChange={set('language')}
            options={languages.map((x) => ({ value: x, label: x }))}
          />
          <FilterSelect
            label="Access levels"
            value={f.access}
            onChange={set('access')}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'member', label: 'Members only' },
            ]}
          />
        </div>
      ) : null}

      {isLoading ? <CardGridSkeleton /> : null}
      {error ? <ErrorState message={error.message} onRetry={() => refetch()} /> : null}

      {data ? (
        <div className="grid gap-8">
          {!filtering && featured.length > 0 ? (
            <Reveal>
              <section aria-labelledby="featured-h">
                <h2
                  id="featured-h"
                  className="mb-3 flex items-center gap-2 font-heading font-medium text-lg text-navy"
                >
                  <Star className="size-5 text-coral" aria-hidden /> Featured
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {featured.map((r) => (
                    <Link
                      key={r.id}
                      to="/portal/resources/$resourceId"
                      params={{ resourceId: r.id }}
                      className="group relative isolate flex min-h-52 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card"
                    >
                      <img
                        src={r.image}
                        alt=""
                        className="-z-20 absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="-z-10 absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/10" />
                      <span className="text-coral-300 text-xs uppercase tracking-wide">
                        {r.official ? 'Official WEPs' : r.topic} · {FORMAT_META[r.format].label}
                      </span>
                      <span className="font-heading font-medium text-lg leading-snug">
                        {r.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          ) : null}

          {!filtering && (savedList.length > 0 || recent.length > 0) ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <MiniList
                icon={BookMarked}
                title="My Saved Resources"
                items={savedList}
                empty="Nothing saved yet."
              />
              <MiniList
                icon={History}
                title="Recently viewed"
                items={recent}
                empty="No recent views."
              />
            </div>
          ) : null}

          <section aria-labelledby="all-h">
            <h2 id="all-h" className="mb-3 font-heading font-medium text-lg text-navy">
              {filtering ? 'Results' : 'All resources'}{' '}
              <span className="font-normal text-muted-foreground text-sm" aria-live="polite">
                ({filtered.length})
              </span>
            </h2>
            {filtered.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No resources match your filters"
                description="Try a different search term or remove a filter."
                action={<Button onClick={() => setF(EMPTY)}>Clear filters</Button>}
              />
            ) : (
              <div
                className={
                  layout === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-3'
                }
              >
                {filtered.slice(0, shown).map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    layout={layout}
                    saved={saved.has(r.id)}
                    onToggleSave={onToggle}
                  />
                ))}
              </div>
            )}
            {filtered.length > shown ? (
              <div className="mt-5 flex justify-center">
                <Button variant="outline" onClick={() => setShown((n) => n + 6)}>
                  Show more resources ({filtered.length - shown} more)
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  )
}

function MiniList({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: typeof BookMarked
  title: string
  items: Resource[]
  empty: string
}) {
  return (
    <SectionCard title={title} bodyClassName="p-0 sm:p-0 pt-2 sm:pt-2">
      {items.length === 0 ? (
        <p className="px-5 pb-5 text-muted-foreground text-sm">{empty}</p>
      ) : (
        <ul className="divide-y">
          {items.slice(0, 3).map((r) => (
            <li key={r.id}>
              <Link
                to="/portal/resources/$resourceId"
                params={{ resourceId: r.id }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50"
              >
                <Icon className="size-4 shrink-0 text-blue" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-navy text-sm">{r.title}</span>
                <span className="text-muted-foreground text-xs">{FORMAT_META[r.format].label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

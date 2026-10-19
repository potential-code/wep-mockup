import { PRINCIPLES } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Lock, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel, FilterBar } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { usePublicResources } from '@/queries/resources.queries'
import { PublicResourceCard } from '../components/cards'
import { FilterSelect } from '../components/FilterSelect'
import { PageIntro } from '../components/PageIntro'
import { SearchInput } from '../components/SearchInput'

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Spreadsheet' },
  { value: 'pptx', label: 'Slides' },
  { value: 'docx', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Web page' },
]

export function PublicResourcesPage() {
  const { data, isLoading, isError, refetch } = usePublicResources()
  const [q, setQ] = useState('')
  const [principle, setPrinciple] = useState('')
  const [format, setFormat] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter(
      (r) =>
        (!principle || String(r.principle) === principle) &&
        (!format || r.format === format) &&
        (!term || `${r.title} ${r.description} ${r.topic}`.toLowerCase().includes(term)),
    )
  }, [data, q, principle, format])
  const reset = () => {
    setQ('')
    setPrinciple('')
    setFormat('')
  }

  return (
    <>
      <PageIntro
        eyebrow="Explore resources"
        title="Practical tools for putting the Principles to work"
        description="A preview of the public library. Official WEPs materials open on weps.org; the full portal library is for members."
      />
      <section className="bg-surface py-12 sm:py-16">
        <div className="container-public">
          <FilterBar count={list.length}>
            <SearchInput value={q} onChange={setQ} label="Search resources" />
            <FilterSelect
              label="All principles"
              value={principle}
              onChange={setPrinciple}
              options={PRINCIPLES.map((p) => ({
                value: String(p.id),
                label: `P${p.id} · ${p.short}`,
              }))}
            />
            <FilterSelect
              label="All formats"
              value={format}
              onChange={setFormat}
              options={FORMATS}
            />
          </FilterBar>
          {isLoading ? (
            <CardGridSkeleton />
          ) : isError ? (
            <ErrorState
              message="We could not load the resource preview."
              onRetry={() => refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No resources match those filters"
              description="Try a different principle or format, or clear the search."
              action={
                <Button variant="outline" onClick={reset}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Stagger
              key={`${q}${principle}${format}`}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {list.map((r) => (
                <StaggerItem key={r.id} className="h-full">
                  <div className="h-full [&>*]:h-full">
                    <PublicResourceCard resource={r} />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}

          <div className="mt-14 grid items-center gap-6 rounded-3xl bg-navy p-8 text-white sm:p-10 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <p className="flex items-center gap-2 font-heading font-semibold text-xl">
                <Lock className="size-5 text-gold" aria-hidden /> The full library is for members
              </p>
              <p className="max-w-2xl text-white/75">
                Signed-in teams get department-matched recommendations, saved resources, related
                courses and clinics, and materials in more languages.{' '}
                <DemoLabel>Proposed feature</DemoLabel>
              </p>
            </div>
            <Button asChild variant="gold" size="lg">
              <Link to="/sign-in" search={{ redirect: '/portal/resources' }}>
                Sign in for the full library <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

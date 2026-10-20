import { principleById } from '@shared/reference'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Download,
  ExternalLink,
  GraduationCap,
  Link2,
  Lock,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { downloadText, formatDate } from '@/lib/format'
import { useResource, useToggleSavedResource } from '@/queries/resources.queries'
import { AttachActionDialog } from '../components/AttachActionDialog'
import { ResourcePreview } from '../components/ResourcePreview'
import { FORMAT_META } from '../components/resource-meta'

export function ResourceDetailPage() {
  const { resourceId } = useParams({ from: '/_app/portal/resources/$resourceId' })
  const { data, isLoading, error, refetch } = useResource(resourceId)
  const toggle = useToggleSavedResource()
  const navigate = useNavigate()

  const [attachOpen, setAttachOpen] = useState(false)

  if (isLoading) return <PageSkeleton />
  if (error || !data)
    return (
      <ErrorState title="Resource not found" message={error?.message} onRetry={() => refetch()} />
    )

  const { resource: r, saved, courses, events, related, actions } = data
  const meta = FORMAT_META[r.format]
  const memberOnlyOfficial = r.official && r.access === 'member'
  const external = r.official || r.format === 'link' || r.access === 'member'
  const canAttach = actions.length > 0

  const download = () => {
    downloadText(
      `${r.slug}.txt`,
      `${r.title}\n${r.publisher} · ${r.version}\n\n${r.description}\n\nDemo download: this is a placeholder file, not the real document.\n`,
    )
    toast.success('Demo file downloaded')
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Resources', to: '/portal/resources' }, { label: r.title }]}
        title={r.title}
        description={r.description}
        actions={
          <Button
            variant="outline"
            aria-pressed={saved}
            disabled={toggle.isPending}
            onClick={() =>
              toggle.mutate(r.id, {
                onSuccess: (s) =>
                  toast.success(s ? 'Saved to My Saved Resources' : 'Removed from saved'),
              })
            }
          >
            {saved ? <BookmarkCheck className="text-blue" aria-hidden /> : <Bookmark aria-hidden />}
            {saved ? 'Saved' : 'Save'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid min-w-0 gap-6">
          {memberOnlyOfficial ? (
            <div className="flex items-start gap-3 rounded-2xl border bg-secondary/60 p-5">
              <Lock className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
              <div className="text-sm">
                <p className="font-semibold text-navy">Member-only official material</p>
                <p className="text-muted-foreground">
                  This item is hosted on weps.org for signatories. Use the source link to open it
                  there; the portal does not copy restricted files.
                </p>
              </div>
            </div>
          ) : (
            <ResourcePreview resource={r} />
          )}

          <SectionCard title="Summary">
            <ul className="grid list-disc gap-2 ps-5">
              {r.summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </SectionCard>

          {courses.length + events.length + related.length > 0 ? (
            <SectionCard title="Related">
              <div className="grid gap-5">
                {courses.length > 0 ? (
                  <RelatedGroup icon={GraduationCap} title="Courses">
                    {courses.map((c) => (
                      <Link
                        key={c.id}
                        to="/portal/learn/$courseId"
                        params={{ courseId: c.id }}
                        className="text-blue hover:underline"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </RelatedGroup>
                ) : null}
                {events.length > 0 ? (
                  <RelatedGroup icon={CalendarDays} title="Clinics and webinars">
                    {events.map((e) => (
                      <Link
                        key={e.id}
                        to="/portal/clinics/$eventId"
                        params={{ eventId: e.id }}
                        className="text-blue hover:underline"
                      >
                        {e.title}
                      </Link>
                    ))}
                  </RelatedGroup>
                ) : null}
                {related.length > 0 ? (
                  <RelatedGroup icon={Link2} title="More materials">
                    {related.map((x) => (
                      <Link
                        key={x.id}
                        to="/portal/resources/$resourceId"
                        params={{ resourceId: x.id }}
                        className="text-blue hover:underline"
                      >
                        {x.title}
                      </Link>
                    ))}
                  </RelatedGroup>
                ) : null}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <aside className="grid content-start gap-4">
          <SectionCard title="Actions" bodyClassName="grid gap-2">
            {external && r.sourceUrl ? (
              <Button asChild>
                <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden />
                  {memberOnlyOfficial ? 'Open on weps.org' : 'View source on weps.org'}
                </a>
              </Button>
            ) : (
              <Button onClick={download}>
                <Download aria-hidden /> Download (demo)
              </Button>
            )}
            {r.official && !memberOnlyOfficial ? (
              <Button variant="outline" onClick={download}>
                <Download aria-hidden /> Download demo copy
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link to="/portal/concierge" search={{ resource: r.id }}>
                <Sparkles aria-hidden /> Ask AI about this resource
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.success('Shared to the community discussion', {
                  description: `“${r.title}” was added to the thread draft.`,
                })
                navigate({ to: '/portal/community' })
              }}
            >
              <Share2 aria-hidden /> Share to community
            </Button>
            {canAttach ? (
              <Button variant="outline" onClick={() => setAttachOpen(true)}>
                <Link2 aria-hidden /> Attach to a company action
              </Button>
            ) : null}
            {memberOnlyOfficial ? (
              <p className="text-muted-foreground text-xs">
                Access note: a weps.org member login may be required to open this item.
              </p>
            ) : null}
          </SectionCard>

          <SectionCard title="Details">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <Row k="Publisher" v={r.publisher} />
              <Row k="Format" v={meta.label + (r.pages ? ` · ${r.pages} pages` : '')} />
              <Row k="Version" v={r.version} />
              <Row k="Published" v={formatDate(r.publishedAt)} />
              <Row k="Language" v={r.language} />
              <Row k="Topic" v={r.topic} />
              <Row k="Principle" v={`P${r.principle} · ${principleById(r.principle).short}`} />
              <Row k="Access" v={r.access === 'public' ? 'Public' : 'Members only'} />
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <PrincipleTag id={r.principle} />
              {r.official ? (
                <StatusBadge tone="coral" icon={null}>
                  Official WEPs content
                </StatusBadge>
              ) : (
                <StatusBadge tone="neutral" icon={null}>
                  Proposed portal material
                </StatusBadge>
              )}
            </div>
            {r.official ? (
              <p className="mt-3 text-muted-foreground text-xs">
                Source: {r.publisher}, weps.org. Reproduced here as a reference link only.
              </p>
            ) : null}
          </SectionCard>
        </aside>
      </div>

      <AttachActionDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        resourceId={r.id}
        actions={actions}
      />
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-navy">{v}</dd>
    </>
  )
}

function RelatedGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Link2
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 font-medium text-navy text-sm">
        <Icon className="size-4" aria-hidden /> {title}
      </p>
      <div className="grid gap-1.5 text-sm">{children}</div>
    </div>
  )
}

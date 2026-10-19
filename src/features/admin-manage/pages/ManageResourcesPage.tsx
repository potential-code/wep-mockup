import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import type { DepartmentId, PrincipleId, Resource, ResourceFormat } from '@shared/types'
import { Archive, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { FileDrop, type UploadResult } from '@/components/shared/FileDrop'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'
import { useResources, useUpsertResource } from '@/queries/resources.queries'
import { CheckRow, Field } from '../components/common'

const FORMATS: ResourceFormat[] = ['pdf', 'pptx', 'docx', 'xlsx', 'link', 'video']
const formatFromName = (name: string): ResourceFormat => {
  const ext = name.split('.').pop()?.toLowerCase()
  return FORMATS.find((f) => f === ext) ?? 'pdf'
}
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

const blank = (): Resource => ({
  id: '',
  slug: '',
  title: '',
  description: '',
  summary: [],
  publisher: 'WEPs Portal (illustrative)',
  format: 'pdf',
  language: 'English',
  principle: 1,
  topic: '',
  departments: [],
  access: 'member',
  official: false,
  image: '/images/resources/gender-action-plan.webp',
  version: '1.0',
  publishedAt: '2026-10-19T00:00:00.000Z',
  relatedCourseIds: [],
  relatedEventIds: [],
  status: 'draft',
})

export function ManageResourcesPage() {
  const { data, isLoading, error, refetch } = useResources()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [language, setLanguage] = useState('English')
  const [editing, setEditing] = useState<Resource | null>(null)
  const rows = data?.resources ?? []

  const languages = useMemo(() => [...new Set(rows.map((r) => r.language))], [rows])
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === 'all' || r.status === status) &&
          (language === 'all' || r.language === language) &&
          (!q.trim() || `${r.title} ${r.topic}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q, status, language],
  )

  const columns: Column<Resource>[] = [
    {
      key: 'title',
      header: 'Resource',
      sortValue: (r) => r.title,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{r.title}</p>
          <p className="truncate text-muted-foreground text-xs">
            {r.publisher} · v{r.version}
          </p>
        </div>
      ),
    },
    {
      key: 'format',
      header: 'Format',
      sortValue: (r) => r.format,
      cell: (r) => r.format.toUpperCase(),
    },
    {
      key: 'principle',
      header: 'Principle',
      sortValue: (r) => r.principle,
      cell: (r) => `P${r.principle} · ${r.topic}`,
      hideOnMobile: true,
    },
    {
      key: 'access',
      header: 'Access',
      cell: (r) => (
        <StatusBadge tone={r.access === 'public' ? 'info' : 'neutral'} icon={null}>
          {r.access === 'public' ? 'Public' : 'Members'}
        </StatusBadge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      cell: (r) => <WorkflowStatus status={r.status} />,
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="[&_ul]:min-w-0 [&_ul>li]:min-w-0 [&_ul>li>div]:grid-cols-[minmax(0,1fr)]">
      <PageHeader
        title="Resources"
        description="Upload, tag, version and archive library material. Archived items are kept for report history."
        actions={
          <Button onClick={() => setEditing(blank())}>
            <Plus aria-hidden /> Upload resource
          </Button>
        }
      />
      <FilterBar count={filtered.length}>
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search resources"
            aria-label="Search resources"
            className="bg-card ps-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filter by status" className="w-full bg-card sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {['published', 'draft', 'scheduled', 'archived'].map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger aria-label="Filter by language" className="w-full bg-card sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        caption="Resources"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        onRowClick={setEditing}
      />
      <ResourceSheet resource={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function ResourceSheet({ resource, onClose }: { resource: Resource | null; onClose: () => void }) {
  return (
    <Sheet open={Boolean(resource)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {resource ? (
          <ResourceForm key={resource.id || 'new'} initial={resource} onClose={onClose} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function ResourceForm({ initial, onClose }: { initial: Resource; onClose: () => void }) {
  const save = useUpsertResource()
  const isNew = !initial.id
  const [r, setR] = useState<Resource>(initial)
  const [file, setFile] = useState<UploadResult | null>(
    isNew
      ? null
      : { fileName: `${initial.slug}.${initial.format}`, sizeKb: (initial.pages ?? 8) * 90 },
  )
  const [touched, setTouched] = useState(false)
  const patch = (p: Partial<Resource>) => setR((x) => ({ ...x, ...p }))
  const requiresFile = r.format !== 'link' && !file
  const titleOk = r.title.trim().length > 0
  const sourceOk = r.format !== 'link' || /^https?:\/\//.test(r.sourceUrl ?? '')

  const commit = (status: Resource['status'], message: string) => {
    setTouched(true)
    if (!titleOk || !r.topic.trim() || !sourceOk || (status !== 'draft' && requiresFile)) {
      toast.error('Complete the required fields first.')
      return
    }
    const next: Resource = {
      ...r,
      id: r.id || `res-${slugify(r.title)}`,
      slug: r.slug || slugify(r.title),
      status,
      description: r.description || r.title,
    }
    save.mutate(next, {
      onSuccess: () => {
        toast.success(message)
        onClose()
      },
    })
  }
  const scheduled = r.publishedAt.slice(0, 10)
  const future = scheduled > '2026-10-19'

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isNew ? 'Upload resource' : 'Edit resource'}</SheetTitle>
        <SheetDescription>
          {r.official
            ? 'Official WEPs material links back to its source page.'
            : 'Portal material is labelled as illustrative to learners.'}
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-4 pb-4">
        {r.format !== 'link' ? (
          <FileDrop
            label="File"
            required
            showMissing={touched}
            value={file}
            onChange={(f) => {
              setFile(f)
              if (f)
                patch({
                  format: formatFromName(f.fileName),
                  title: r.title || f.fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                })
            }}
            accept=".pdf,.pptx,.docx,.xlsx"
            hint="PDF, PPTX, DOCX or XLSX up to 25 MB. Not sent anywhere in the demo."
            sampleName="gender-pay-gap-checklist.pdf"
            validate={(f) =>
              /\.(pdf|pptx|docx|xlsx)$/i.test(f.fileName)
                ? f.sizeKb > 25000
                  ? 'too_large'
                  : 'valid'
                : 'wrong_type'
            }
          />
        ) : null}
        <Field label="Title" required>
          <Input
            value={r.title}
            onChange={(e) => patch({ title: e.target.value })}
            aria-invalid={touched && !titleOk}
          />
          {touched && !titleOk ? (
            <span role="alert" className="text-danger text-xs">
              A title is required.
            </span>
          ) : null}
        </Field>
        <Field label="Summary" hint="One or two sentences shown on the library card.">
          <Textarea
            value={r.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={3}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Principle tag">
            <Select
              value={String(r.principle)}
              onValueChange={(v) => patch({ principle: Number(v) as PrincipleId })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRINCIPLES.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.id}. {p.short}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Topic tag" required>
            <Input
              value={r.topic}
              onChange={(e) => patch({ topic: e.target.value })}
              aria-invalid={touched && !r.topic.trim()}
            />
          </Field>
          <Field label="Language">
            <Input value={r.language} onChange={(e) => patch({ language: e.target.value })} />
          </Field>
          <Field label="Version">
            <Input value={r.version} onChange={(e) => patch({ version: e.target.value })} />
          </Field>
          <Field label="Format">
            <Select value={r.format} onValueChange={(v) => patch({ format: v as ResourceFormat })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Access / audience"
            hint={
              r.access === 'public'
                ? 'Visible to anyone on the public site.'
                : 'Visible to signed-in signatory users only.'
            }
          >
            <Select
              value={r.access}
              onValueChange={(v) => patch({ access: v as Resource['access'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="member">Signatory members</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-1 font-medium text-navy text-sm">Department tags</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEPARTMENTS.map((d) => (
              <CheckRow
                key={d.id}
                label={d.short}
                checked={r.departments.includes(d.id)}
                onCheckedChange={(v) =>
                  patch({
                    departments: v
                      ? [...r.departments, d.id as DepartmentId]
                      : r.departments.filter((x) => x !== d.id),
                  })
                }
              />
            ))}
          </div>
        </fieldset>
        <Field
          label={r.format === 'link' ? 'Source URL' : 'Source URL (optional)'}
          required={r.format === 'link'}
          hint="Official WEPs items point to their source page."
        >
          <Input
            type="url"
            value={r.sourceUrl ?? ''}
            onChange={(e) => patch({ sourceUrl: e.target.value || undefined })}
            placeholder="https://www.weps.org/…"
            aria-invalid={touched && !sourceOk}
          />
        </Field>
        <Field
          label="Publication date"
          hint={
            future
              ? 'A future date schedules publication.'
              : 'Today or earlier publishes immediately.'
          }
        >
          <Input
            type="date"
            value={scheduled}
            onChange={(e) => patch({ publishedAt: `${e.target.value}T00:00:00.000Z` })}
          />
        </Field>
        <p className="text-muted-foreground text-xs">
          Status: <WorkflowStatus status={r.status} /> · Last published{' '}
          {formatDate(initial.publishedAt)}
        </p>
      </div>
      <SheetFooter className="flex-row flex-wrap justify-end gap-2">
        {!isNew && r.status !== 'archived' ? (
          <Button
            variant="ghost"
            className="me-auto text-danger"
            disabled={save.isPending}
            onClick={() => commit('archived', 'Resource archived')}
          >
            <Archive aria-hidden /> Archive
          </Button>
        ) : null}
        <Button
          variant="outline"
          disabled={save.isPending}
          onClick={() => commit('draft', 'Draft saved')}
        >
          Save draft
        </Button>
        <Button
          disabled={save.isPending}
          onClick={() =>
            future
              ? commit('scheduled', 'Publication scheduled')
              : commit('published', 'Resource published')
          }
        >
          {save.isPending ? 'Saving…' : future ? 'Schedule' : 'Publish'}
        </Button>
      </SheetFooter>
    </>
  )
}

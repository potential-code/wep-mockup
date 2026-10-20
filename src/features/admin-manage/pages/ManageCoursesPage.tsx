import { DIFFICULTY_LABEL, modulesOf, unitsOf } from '@shared/courses'
import { DEPARTMENTS, principleById } from '@shared/reference'
import type { Course } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  CalendarDays,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatDate } from '@/lib/format'
import { useAdminCourses, useDeleteCourse, useUpsertCourse } from '@/queries/admin.queries'

type Row = NonNullable<ReturnType<typeof useAdminCourses>['data']>[number]
type Sort = 'updated' | 'title' | 'enrolled'

const SORTS: Record<Sort, { label: string; compare: (a: Row, b: Row) => number }> = {
  updated: {
    label: 'Recently updated',
    compare: (a, b) => (b.course.updatedAt ?? '').localeCompare(a.course.updatedAt ?? ''),
  },
  title: { label: 'Title A to Z', compare: (a, b) => a.course.title.localeCompare(b.course.title) },
  enrolled: { label: 'Most enrolled', compare: (a, b) => b.enrolled - a.enrolled },
}

export function ManageCoursesPage() {
  const { data, isLoading, error, refetch } = useAdminCourses()
  const navigate = useNavigate()
  const save = useUpsertCourse()
  const remove = useDeleteCourse()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('updated')
  const [state, setState] = useState('all')
  const [dept, setDept] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deleting, setDeleting] = useState<Course | null>(null)
  const rows = data ?? []

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows
      .filter(
        (r) =>
          (!term ||
            r.course.title.toLowerCase().includes(term) ||
            r.course.topic.toLowerCase().includes(term)) &&
          (dept === 'all' ||
            r.course.departments.includes(dept as Course['departments'][number])) &&
          (state === 'all' || (state === 'published') === r.course.published),
      )
      .sort(SORTS[sort].compare)
  }, [rows, q, dept, state, sort])

  const togglePublish = (c: Course, published: boolean) =>
    save.mutate(
      { ...c, published },
      {
        onSuccess: () =>
          toast.success(published ? `${c.title} published` : `${c.title} unpublished`),
      },
    )

  const columns: Column<Row>[] = [
    {
      key: 'title',
      header: 'Course',
      sortValue: (r) => r.course.title,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.course.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{r.course.title}</p>
            <p className="truncate text-muted-foreground text-xs">
              Principle {r.course.principle} · {principleById(r.course.principle).short} ·{' '}
              {modulesOf(r.course).length} modules · {unitsOf(r.course).length} units
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => (r.course.published ? 'a' : 'b'),
      cell: (r) =>
        r.course.published ? (
          <StatusBadge tone="success">Published</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Draft</StatusBadge>
        ),
    },
    {
      key: 'depts',
      header: 'Departments',
      cell: (r) =>
        r.course.departments.map((d) => DEPARTMENTS.find((x) => x.id === d)?.short).join(', '),
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      align: 'end',
      sortValue: (r) => r.enrolled,
      cell: (r) => r.enrolled,
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Library"
        title="Courses and Learning Paths"
        description="Build, edit and publish courses with modules, units and pre and post tests. Assign each course to departments."
        actions={
          <Button asChild>
            <Link to="/admin/manage/courses/$courseId" params={{ courseId: 'new' }}>
              <Plus aria-hidden /> New course
            </Link>
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="-translate-y-1/2 pointer-events-none absolute start-3 top-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Search courses"
            placeholder="Search courses"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-card ps-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger aria-label="Sort courses" className="w-full bg-card sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORTS) as Sort[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SORTS[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger aria-label="Filter by department" className="w-full bg-card sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex w-full items-center gap-2 sm:ms-auto sm:w-auto">
          <ToggleGroup
            type="single"
            value={state}
            onValueChange={(v) => v && setState(v)}
            variant="outline"
            aria-label="Status"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="published">Published</ToggleGroupItem>
            <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as 'grid' | 'list')}
            variant="outline"
            aria-label="Layout"
            className="ms-auto sm:ms-0"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List aria-hidden />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
      </p>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={rows.length ? 'No courses match' : 'No courses yet'}
          description={
            rows.length ? 'Try another search or filter.' : 'Create the first course to start.'
          }
        />
      ) : view === 'grid' ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.course.id} className="min-w-0">
              <CourseTile
                row={r}
                busy={save.isPending}
                onPublish={(v) => togglePublish(r.course, v)}
                onDelete={() => setDeleting(r.course)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <DataTable
          caption="Courses"
          columns={columns}
          rows={filtered}
          getRowId={(r) => r.course.id}
          onRowClick={(r) =>
            navigate({ to: '/admin/manage/courses/$courseId', params: { courseId: r.course.id } })
          }
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.title ?? 'course'}?`}
        description="The course and its modules, units and tests are removed. Courses that learners have started or that sit in a department pathway can only be unpublished."
        confirmLabel="Delete course"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success('Course deleted'),
            // The shared mutation cache shows the error toast.
            onSettled: () => setDeleting(null),
          })
        }
      />
    </div>
  )
}

function CourseTile({
  row,
  busy,
  onPublish,
  onDelete,
}: {
  row: Row
  busy: boolean
  onPublish: (published: boolean) => void
  onDelete: () => void
}) {
  const c = row.course
  const switchId = `publish-${c.id}`
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={c.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute end-3 top-3 z-10 flex items-center gap-2 rounded-full bg-navy-900/75 py-1 ps-3 pe-1 text-white backdrop-blur-sm">
          <label htmlFor={switchId} className="font-semibold text-[0.7rem] uppercase tracking-wide">
            {c.published ? 'Published' : 'Draft'}
          </label>
          <Switch
            id={switchId}
            checked={c.published}
            disabled={busy}
            onCheckedChange={onPublish}
            aria-label={`${c.published ? 'Unpublish' : 'Publish'} ${c.title}`}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-heading font-medium text-navy leading-snug">
          <Link
            to="/admin/manage/courses/$courseId"
            params={{ courseId: c.id }}
            className="after:absolute after:inset-0 hover:underline focus-visible:outline-none"
          >
            {c.title}
          </Link>
        </h2>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden /> {row.enrolled} enrolled
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden /> {formatDate(c.updatedAt)}
          </span>
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <StatusBadge tone="info" icon={null}>
            {DIFFICULTY_LABEL[c.difficulty ?? 'beginner']}
          </StatusBadge>
          <StatusBadge tone="coral" icon={null}>
            P{c.principle}
          </StatusBadge>
          <div className="relative z-10 ms-auto flex items-center">
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${c.title}`}>
              <Link to="/admin/manage/courses/$courseId" params={{ courseId: c.id }}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-danger"
              aria-label={`Delete ${c.title}`}
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

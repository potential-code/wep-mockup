import { DEPARTMENTS, principleById } from '@shared/reference'
import type { Course } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, FilterBar } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { StatCard } from '@/components/shared/StatCard'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminCourses } from '@/queries/admin.queries'

type Row = NonNullable<ReturnType<typeof useAdminCourses>['data']>[number]

export function ManageCoursesPage() {
  const { data, isLoading, error, refetch } = useAdminCourses()
  const navigate = useNavigate()
  const [dept, setDept] = useState('all')
  const [state, setState] = useState('all')
  const rows = data ?? []

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (dept === 'all' ||
            r.course.departments.includes(dept as Course['departments'][number])) &&
          (state === 'all' || (state === 'published') === r.course.published),
      ),
    [rows, dept, state],
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
              Principle {r.course.principle} · {principleById(r.course.principle).short}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => (r.course.published ? 'a' : 'b'),
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.course.published ? (
            <StatusBadge tone="success">Published</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Draft</StatusBadge>
          )}
          {r.course.designated ? (
            <StatusBadge tone="gold" icon={null}>
              Designated
            </StatusBadge>
          ) : null}
        </div>
      ),
    },
    {
      key: 'depts',
      header: 'Departments',
      cell: (r) =>
        r.course.departments.map((d) => DEPARTMENTS.find((x) => x.id === d)?.short).join(', '),
    },
    {
      key: 'lessons',
      header: 'Lessons',
      align: 'end',
      sortValue: (r) => r.course.lessons.length,
      cell: (r) => r.course.lessons.length,
    },
    {
      key: 'completions',
      header: 'Completions',
      align: 'end',
      sortValue: (r) => r.completed,
      cell: (r) => `${r.completed} / ${r.enrolled}`,
    },
    {
      key: 'edit',
      header: '',
      cell: (r) => (
        <Button asChild variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
          <Link to="/admin/manage/courses/$courseId" params={{ courseId: r.course.id }}>
            <Pencil aria-hidden /> Edit
          </Link>
        </Button>
      ),
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div>
      <PageHeader
        title="Courses and Learning Paths"
        description="Create and maintain learning content. Designated courses unlock department clinics."
        actions={
          <>
            <DemoLabel>Proposed learning content</DemoLabel>
            <Button asChild>
              <Link to="/admin/manage/courses/$courseId" params={{ courseId: 'new' }}>
                <Plus aria-hidden /> New course
              </Link>
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Published courses"
          value={rows.filter((r) => r.course.published).length}
          icon={BookOpen}
        />
        <StatCard
          label="Drafts"
          value={rows.filter((r) => !r.course.published).length}
          tone="gold"
        />
        <StatCard
          label="Total completions"
          value={rows.reduce((n, r) => n + r.completed, 0)}
          tone="success"
        />
      </div>
      <FilterBar count={filtered.length}>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger aria-label="Filter by department" className="w-full bg-card sm:w-56">
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
        <Select value={state} onValueChange={setState}>
          <SelectTrigger aria-label="Filter by status" className="w-full bg-card sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        caption="Courses"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.course.id}
        isLoading={isLoading}
        onRowClick={(r) =>
          navigate({ to: '/admin/manage/courses/$courseId', params: { courseId: r.course.id } })
        }
      />
    </div>
  )
}

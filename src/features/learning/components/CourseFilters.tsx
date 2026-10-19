import { PRINCIPLES } from '@shared/reference'
import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CourseRow } from './shared'

export interface CourseFilterState {
  q: string
  principle: string
  topic: string
  status: string
  language: string
}

const EMPTY: CourseFilterState = {
  q: '',
  principle: 'all',
  topic: 'all',
  status: 'all',
  language: 'all',
}

export function useCourseFilters(rows: CourseRow[]) {
  const [f, setF] = useState<CourseFilterState>(EMPTY)
  const filtered = useMemo(
    () =>
      rows.filter(({ course, state }) => {
        const q = f.q.trim().toLowerCase()
        if (q && !`${course.title} ${course.objective} ${course.topic}`.toLowerCase().includes(q))
          return false
        if (f.principle !== 'all' && String(course.principle) !== f.principle) return false
        if (f.topic !== 'all' && course.topic !== f.topic) return false
        if (f.status !== 'all' && state !== f.status) return false
        if (f.language !== 'all' && course.language !== f.language) return false
        return true
      }),
    [rows, f],
  )
  const active = JSON.stringify(f) !== JSON.stringify(EMPTY)
  return { f, setF, filtered, active, clear: () => setF(EMPTY) }
}

function Pick({
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
      <SelectTrigger aria-label={label} className="h-10 w-full sm:w-auto sm:min-w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: all</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function CourseFilters({
  rows,
  state,
  onChange,
  onClear,
  active,
  count,
  showSearch = true,
}: {
  rows: CourseRow[]
  state: CourseFilterState
  onChange: (s: CourseFilterState) => void
  onClear: () => void
  active: boolean
  count: number
  showSearch?: boolean
}) {
  const topics = [...new Set(rows.map((r) => r.course.topic))].sort()
  const languages = [...new Set(rows.map((r) => r.course.language))]
  const set = (patch: Partial<CourseFilterState>) => onChange({ ...state, ...patch })
  return (
    <div className="mb-5 grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {showSearch ? (
          <div className="relative min-w-52 flex-1 sm:max-w-sm">
            <Search
              className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={state.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search courses"
              aria-label="Search courses"
              className="h-10 ps-9"
            />
          </div>
        ) : null}
        <Pick
          label="Principle"
          value={state.principle}
          onChange={(principle) => set({ principle })}
          options={PRINCIPLES.map((p) => ({ value: String(p.id), label: `P${p.id} · ${p.short}` }))}
        />
        <Pick
          label="Topic"
          value={state.topic}
          onChange={(topic) => set({ topic })}
          options={topics.map((t) => ({ value: t, label: t }))}
        />
        <Pick
          label="Status"
          value={state.status}
          onChange={(status) => set({ status })}
          options={[
            { value: 'available', label: 'Available' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'complete', label: 'Complete' },
            { value: 'locked', label: 'Locked' },
          ]}
        />
        <Pick
          label="Language"
          value={state.language}
          onChange={(language) => set({ language })}
          options={languages.map((l) => ({ value: l, label: l }))}
        />
        {active ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X aria-hidden /> Clear filters
          </Button>
        ) : null}
        <span className="ms-auto text-muted-foreground text-sm" aria-live="polite">
          {count} {count === 1 ? 'course' : 'courses'}
        </span>
      </div>
    </div>
  )
}

import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface MentorFilterState {
  topic: string
  language: string
  sector: string
  availability: string
}

export const EMPTY_FILTERS: MentorFilterState = {
  topic: 'all',
  language: 'all',
  sector: 'all',
  availability: 'all',
}

function Filter({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  allLabel: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-10 w-full bg-card sm:w-auto sm:min-w-44">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function MentorFilters({
  value,
  onChange,
  topics,
  languages,
  sectors,
}: {
  value: MentorFilterState
  onChange: (v: MentorFilterState) => void
  topics: string[]
  languages: string[]
  sectors: string[]
}) {
  const [more, setMore] = useState(false)
  const set = (patch: Partial<MentorFilterState>) => onChange({ ...value, ...patch })
  const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }))
  const dirty = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS)
  return (
    <>
      <Filter
        label="Topic"
        allLabel="All topics"
        value={value.topic}
        onChange={(topic) => set({ topic })}
        options={opts(topics)}
      />
      <Filter
        label="Availability"
        allLabel="Any availability"
        value={value.availability}
        onChange={(availability) => set({ availability })}
        options={[
          { value: '7', label: 'Next 7 days' },
          { value: '14', label: 'Next 14 days' },
        ]}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-10 bg-card"
        aria-expanded={more}
        onClick={() => setMore((v) => !v)}
      >
        <SlidersHorizontal aria-hidden /> More filters
        <ChevronDown aria-hidden className={more ? 'rotate-180' : ''} />
      </Button>
      {more ? (
        <>
          <Filter
            label="Language"
            allLabel="All languages"
            value={value.language}
            onChange={(language) => set({ language })}
            options={opts(languages)}
          />
          <Filter
            label="Sector"
            allLabel="All sectors"
            value={value.sector}
            onChange={(sector) => set({ sector })}
            options={opts(sectors)}
          />
        </>
      ) : null}
      {dirty ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear filters
        </Button>
      ) : null}
    </>
  )
}

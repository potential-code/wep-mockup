import { BookmarkPlus, Download, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilderDataset } from '@/queries/admin.queries'
import { BarsChart, DonutChart } from '../components/charts'
import { useReportingFilters } from '../components/filters'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { useCsvExport } from '../components/useExport'

type DatasetKey = 'companies' | 'users' | 'actions' | 'reports' | 'learning'
type ChartType = 'none' | 'bar' | 'donut'
type Cell = string | number | null | undefined

const DATASETS: Record<DatasetKey, { label: string; fields: [string, string][] }> = {
  companies: {
    label: 'Companies',
    fields: [
      ['name', 'Company'],
      ['country', 'Country'],
      ['region', 'Region'],
      ['sector', 'Sector'],
      ['size', 'Size'],
      ['status', 'Signatory status'],
      ['employees', 'Employees'],
      ['invited', 'Invited users'],
      ['activated', 'Activated users'],
      ['learningCompletion', 'Learning completion %'],
      ['reportStatus', 'Report status'],
      ['overdueActions', 'Overdue actions'],
    ],
  },
  users: {
    label: 'Users',
    fields: [
      ['name', 'Name'],
      ['company', 'Company'],
      ['country', 'Country'],
      ['department', 'Department'],
      ['role', 'Role'],
      ['invitation', 'Invitation'],
      ['pathCompleted', 'Path completed'],
      ['points', 'Points'],
      ['lastActive', 'Last active'],
    ],
  },
  actions: {
    label: 'Actions',
    fields: [
      ['company', 'Company'],
      ['action', 'Action'],
      ['principle', 'Principle'],
      ['department', 'Department'],
      ['status', 'Status'],
      ['dueDate', 'Due date'],
      ['overdue', 'Overdue'],
      ['evidenceFiles', 'Evidence files'],
    ],
  },
  reports: {
    label: 'Annual reports',
    fields: [
      ['company', 'Company'],
      ['year', 'Year'],
      ['status', 'Status'],
      ['versions', 'Versions'],
      ['dueDate', 'Due date'],
      ['openChangeRequests', 'Open change requests'],
      ['indicators', 'Indicators'],
    ],
  },
  learning: {
    label: 'Learning',
    fields: [
      ['learner', 'Learner'],
      ['company', 'Company'],
      ['department', 'Department'],
      ['course', 'Course'],
      ['lessonsDone', 'Lessons done'],
      ['completed', 'Completed'],
      ['completedOn', 'Completed on'],
    ],
  },
}

interface SavedView {
  id: string
  name: string
  dataset: DatasetKey
  fields: string[]
  filterField: string
  filterText: string
  chart: ChartType
  groupBy: string
}
const STORE = 'weps-report-builder-views'

function loadViews(): SavedView[] {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '[]') as SavedView[]
  } catch {
    return []
  }
}

export function ReportBuilderPage() {
  const { filters } = useReportingFilters()
  const q = useBuilderDataset(filters)
  const exportCsv = useCsvExport()
  const [dataset, setDataset] = useState<DatasetKey>('companies')
  const [fields, setFields] = useState<string[]>(['name', 'country', 'sector', 'reportStatus'])
  const [filterField, setFilterField] = useState('all')
  const [filterText, setFilterText] = useState('')
  const [chart, setChart] = useState<ChartType>('bar')
  const [groupBy, setGroupBy] = useState('country')
  const [name, setName] = useState('')
  const [views, setViews] = useState<SavedView[]>([])
  useEffect(() => setViews(loadViews()), [])

  const def = DATASETS[dataset]
  const labelOf = (k: string) => def.fields.find(([f]) => f === k)?.[1] ?? k
  const allRows = (q.data?.[dataset] ?? []) as Record<string, Cell>[]
  const rows = useMemo(() => {
    const t = filterText.trim().toLowerCase()
    if (!t) return allRows
    return allRows.filter((r) =>
      filterField === 'all'
        ? Object.values(r).some((v) =>
            String(v ?? '')
              .toLowerCase()
              .includes(t),
          )
        : String(r[filterField] ?? '')
            .toLowerCase()
            .includes(t),
    )
  }, [allRows, filterField, filterText])
  const cols = def.fields.filter(([k]) => fields.includes(k))

  const grouped = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rows) {
      const k = String(r[groupBy] ?? '—') || '—'
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return [...m.entries()]
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [rows, groupBy])

  const changeDataset = (k: DatasetKey) => {
    setDataset(k)
    const first = DATASETS[k].fields
    setFields(first.slice(0, 4).map(([f]) => f))
    setGroupBy(first[1]?.[0] ?? first[0]?.[0] ?? '')
    setFilterField('all')
    setFilterText('')
  }
  const apply = (v: SavedView) => {
    setDataset(v.dataset)
    setFields(v.fields)
    setFilterField(v.filterField)
    setFilterText(v.filterText)
    setChart(v.chart)
    setGroupBy(v.groupBy)
    toast.success(`Loaded “${v.name}”`)
  }
  const save = () => {
    if (!name.trim()) return toast.error('Name the view before saving')
    const v: SavedView = {
      id: `v-${Date.now()}`,
      name: name.trim(),
      dataset,
      fields,
      filterField,
      filterText,
      chart,
      groupBy,
    }
    const next = [v, ...views]
    setViews(next)
    try {
      localStorage.setItem(STORE, JSON.stringify(next))
    } catch {
      /* storage unavailable: keep in memory */
    }
    setName('')
    toast.success(`Saved view “${v.name}”`)
  }
  const remove = (id: string) => {
    const next = views.filter((v) => v.id !== id)
    setViews(next)
    try {
      localStorage.setItem(STORE, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  return (
    <ReportingShell
      showPrinciple
      title="Report builder"
      description="Pick a dataset, fields and a chart. The preview and the CSV export use the filters above."
      actions={
        <Button
          disabled={!cols.length || !rows.length}
          onClick={() =>
            exportCsv(
              `Report builder – ${def.label}`,
              cols.map(([, l]) => l),
              rows.map((r) => cols.map(([k]) => r[k])),
            )
          }
        >
          <Download aria-hidden /> Export CSV
        </Button>
      }
    >
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={q.refetch}
        hasData={!!q.data}
      >
        <div className="grid gap-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="grid content-start gap-4">
            <SectionCard title="1. Dataset">
              <RadioGroup
                value={dataset}
                onValueChange={(v) => changeDataset(v as DatasetKey)}
                className="grid gap-2"
              >
                {(Object.keys(DATASETS) as DatasetKey[]).map((k) => (
                  <Label
                    key={k}
                    htmlFor={`ds-${k}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 font-normal has-[:checked]:border-blue has-[:checked]:bg-blue-50"
                  >
                    <RadioGroupItem id={`ds-${k}`} value={k} /> {DATASETS[k].label}
                  </Label>
                ))}
              </RadioGroup>
            </SectionCard>
            <SectionCard title="2. Fields">
              <ul className="grid gap-2">
                {def.fields.map(([k, label]) => (
                  <li key={k} className="flex items-center gap-2">
                    <Checkbox
                      id={`f-${k}`}
                      checked={fields.includes(k)}
                      onCheckedChange={(on) =>
                        setFields((f) => (on ? [...f, k] : f.filter((x) => x !== k)))
                      }
                    />
                    <Label htmlFor={`f-${k}`} className="font-normal">
                      {label}
                    </Label>
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="3. Filter rows" description="Added to the scope filters above.">
              <div className="grid gap-2">
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger aria-label="Filter field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any field</SelectItem>
                    {def.fields.map(([k, l]) => (
                      <SelectItem key={k} value={k}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Contains…"
                  aria-label="Filter text"
                />
              </div>
            </SectionCard>
            <SectionCard title="4. Chart">
              <div className="grid gap-2">
                <Select value={chart} onValueChange={(v) => setChart(v as ChartType)}>
                  <SelectTrigger aria-label="Chart type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar chart</SelectItem>
                    <SelectItem value="donut">Donut chart</SelectItem>
                    <SelectItem value="none">Table only</SelectItem>
                  </SelectContent>
                </Select>
                {chart !== 'none' ? (
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger aria-label="Group by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {def.fields.map(([k, l]) => (
                        <SelectItem key={k} value={k}>
                          Count by {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </SectionCard>
          </div>

          <div className="grid min-w-0 content-start gap-4">
            <SectionCard
              title="Live preview"
              description={`${rows.length} rows · ${cols.length} fields · reporting year ${filters.year}`}
            >
              {cols.length === 0 ? (
                <EmptyState
                  title="Choose at least one field"
                  description="Tick fields on the left to build the table."
                />
              ) : rows.length === 0 ? (
                <EmptyState title="No rows match" description="Loosen the filters or row filter." />
              ) : (
                <div className="grid gap-5">
                  {chart !== 'none' ? (
                    <div
                      role="img"
                      aria-label={`Count of ${def.label.toLowerCase()} by ${labelOf(groupBy)}`}
                    >
                      {chart === 'bar' ? (
                        <BarsChart
                          horizontal
                          labelWidth={130}
                          data={grouped}
                          xKey="group"
                          series={[{ key: 'count', label: `Count by ${labelOf(groupBy)}` }]}
                        />
                      ) : (
                        <DonutChart
                          data={grouped.map((g) => ({ name: g.group, value: g.count }))}
                          centerValue={rows.length}
                          centerLabel="rows"
                        />
                      )}
                    </div>
                  ) : null}
                  <div className="max-h-96 overflow-auto rounded-xl border">
                    <table className="w-full text-sm">
                      <caption className="sr-only">Preview of {def.label}</caption>
                      <thead className="sticky top-0 bg-surface text-left">
                        <tr>
                          {cols.map(([k, l]) => (
                            <th
                              key={k}
                              scope="col"
                              className="whitespace-nowrap px-3 py-2 font-semibold text-navy text-xs"
                            >
                              {l}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 25).map((r, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: preview rows
                          <tr key={i} className="border-t">
                            {cols.map(([k]) => (
                              <td key={k} className="whitespace-nowrap px-3 py-2">
                                {r[k] ?? '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 25 ? (
                    <p className="text-muted-foreground text-xs">
                      Showing the first 25 of {rows.length} rows. The export contains all rows.
                    </p>
                  ) : null}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Saved views" description="Reusable layouts kept in this browser.">
              <div className="flex flex-wrap gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name this view, e.g. Overdue actions by company"
                  aria-label="View name"
                  className="max-w-sm flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && save()}
                />
                <Button variant="secondary" onClick={save}>
                  <BookmarkPlus aria-hidden /> Save view
                </Button>
              </div>
              {views.length === 0 ? (
                <p className="mt-3 text-muted-foreground text-sm">No saved views yet.</p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {views.map((v) => (
                    <li key={v.id} className="flex items-center gap-2 rounded-xl border p-2.5">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-start"
                        onClick={() => apply(v)}
                      >
                        <span className="block truncate font-medium text-navy text-sm">
                          {v.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {DATASETS[v.dataset].label} · {v.fields.length} fields ·{' '}
                          {v.chart === 'none' ? 'table' : v.chart}
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete view ${v.name}`}
                        onClick={() => remove(v.id)}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>
      </QueryState>
    </ReportingShell>
  )
}

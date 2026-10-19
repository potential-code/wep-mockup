import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import { useSearch } from '@tanstack/react-router'
import { AlertTriangle, ClipboardList, FileWarning, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/use-session'
import { useActions } from '@/queries/assessment.queries'
import { ActionBoard } from '../components/ActionBoard'
import { ActionCard } from '../components/ActionCard'
import { CreateActionDialog } from '../components/CreateActionDialog'

const ALL = 'all'

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-52" aria-label={`Filter by ${label.toLowerCase()}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}s</SelectItem>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ActionPlanPage() {
  const { data, isLoading, isError, refetch } = useActions()
  const { can } = useCurrentUser()
  const params = useSearch({ strict: false }) as { principle?: string; flag?: string }
  const [principle, setPrinciple] = useState(params.principle ?? ALL)
  const [department, setDepartment] = useState(ALL)
  const [owner, setOwner] = useState(ALL)
  const [flag, setFlag] = useState<'overdue' | 'evidence' | undefined>(
    params.flag === 'overdue' || params.flag === 'evidence' ? params.flag : undefined,
  )
  const [creating, setCreating] = useState(false)

  const items = data?.actions ?? []
  const owners = useMemo(
    () => [...new Map(items.map((i) => [i.action.ownerId, i.ownerName])).entries()],
    [items],
  )
  const filtered = items.filter(
    (i) =>
      (principle === ALL || String(i.action.principle) === principle) &&
      (department === ALL || i.action.department === department) &&
      (owner === ALL || i.action.ownerId === owner) &&
      (flag !== 'overdue' || i.overdue) &&
      (flag !== 'evidence' || i.missingEvidence),
  )
  const overdue = items.filter((i) => i.overdue).length
  const noEvidence = items.filter((i) => i.missingEvidence).length

  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return <ErrorState message="The action plan couldn’t load." onRetry={() => refetch()} />

  return (
    <div>
      <PageHeader
        title={data.canManage ? 'Action plan' : 'My contributions'}
        description={
          data.canManage
            ? 'Practical actions with owners, targets and evidence. Learning supports an action but never completes it.'
            : 'Actions assigned to you. Upload evidence to show your contribution.'
        }
        actions={
          can('actions.manage') ? (
            <Button onClick={() => setCreating(true)}>
              <Plus aria-hidden /> Create action
            </Button>
          ) : null
        }
      />
      {data.canManage ? (
        <FilterBar count={filtered.length}>
          <Filter
            label="Principle"
            value={principle}
            onChange={setPrinciple}
            options={PRINCIPLES.map((p) => [String(p.id), `P${p.id} · ${p.short}`])}
          />
          <Filter
            label="Department"
            value={department}
            onChange={setDepartment}
            options={DEPARTMENTS.map((d) => [d.id, d.label])}
          />
          <Filter
            label="Owner"
            value={owner}
            onChange={setOwner}
            options={owners.map(([id, n]) => [id, n])}
          />
          <Button
            variant={flag === 'overdue' ? 'default' : 'outline'}
            size="sm"
            aria-pressed={flag === 'overdue'}
            onClick={() => setFlag(flag === 'overdue' ? undefined : 'overdue')}
          >
            <AlertTriangle aria-hidden /> Overdue ({overdue})
          </Button>
          <Button
            variant={flag === 'evidence' ? 'default' : 'outline'}
            size="sm"
            aria-pressed={flag === 'evidence'}
            onClick={() => setFlag(flag === 'evidence' ? undefined : 'evidence')}
          >
            <FileWarning aria-hidden /> Missing evidence ({noEvidence})
          </Button>
        </FilterBar>
      ) : null}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={items.length === 0 ? 'No actions yet' : 'No actions match these filters'}
          description={
            items.length === 0
              ? data.canManage
                ? 'Create an action, or add a need from your assessment results.'
                : 'When a colleague assigns you a contribution it will appear here.'
              : 'Clear a filter to see more.'
          }
        />
      ) : (
        <>
          {data.canManage ? (
            <div className="hidden lg:block">
              <ActionBoard items={filtered} />
            </div>
          ) : null}
          <ul className={`grid gap-3 ${data.canManage ? 'lg:hidden' : 'md:grid-cols-2'}`}>
            {filtered.map((i) => (
              <li key={i.action.id}>
                <ActionCard item={i} showStatus />
              </li>
            ))}
          </ul>
        </>
      )}
      <CreateActionDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

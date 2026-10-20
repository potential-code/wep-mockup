import type { Company } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Ban, Building2, Check, ExternalLink, MailPlus, RotateCcw, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { StatCard } from '@/components/shared/StatCard'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
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
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatDate } from '@/lib/format'
import {
  useCompaniesTable,
  useReviewProfileRevision,
  useSetCompanyStatus,
} from '@/queries/admin.queries'
import { Detail, ReasonDialog } from '../components/common'

type Row = NonNullable<ReturnType<typeof useCompaniesTable>['data']>[number]

const REVISION_LABEL: Record<string, string> = {
  summary: 'Public summary',
  website: 'Website',
  name: 'Company name',
  ceoCommitment: 'CEO commitment statement',
}

export function ManageCompaniesPage() {
  const { data, isLoading, error, refetch } = useCompaniesTable({})
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = data ?? []
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === 'all' || r.company.signatoryStatus === status) &&
          (!q.trim() ||
            `${r.company.name} ${r.company.country}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q, status],
  )
  const open = rows.find((r) => r.company.id === openId)

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Company',
      sortValue: (r) => r.company.name,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <CompanyLogo name={r.company.name} src={r.company.logo} className="size-9" />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{r.company.name}</p>
            <p className="text-muted-foreground text-xs">
              {r.company.country} · {r.company.sector}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Access',
      sortValue: (r) => r.company.signatoryStatus,
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          <WorkflowStatus status={r.company.signatoryStatus} />
          {r.company.pendingProfileRevision ? (
            <StatusBadge tone="warning">Revision pending</StatusBadge>
          ) : null}
        </div>
      ),
    },
    { key: 'contacts', header: 'Contacts', cell: (r) => r.contacts || '—', hideOnMobile: true },
    {
      key: 'users',
      header: 'Activated',
      sortValue: (r) => r.activated,
      align: 'end',
      cell: (r) => `${r.activated} / ${r.invited}`,
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const pendingRev = rows.filter((r) => r.company.pendingProfileRevision).length
  return (
    <div>
      <PageHeader
        title="Companies and Access"
        description="Review signatory companies, approve profile changes and manage access."
        actions={
          <Button asChild>
            <Link to="/admin/manage/applications">
              <MailPlus aria-hidden /> Invite a company
            </Link>
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Approved signatories"
          value={rows.filter((r) => r.company.signatoryStatus === 'approved').length}
          icon={Building2}
        />
        <StatCard label="Profile changes to review" value={pendingRev} tone="coral" icon={Check} />
        <StatCard
          label="Access suspended"
          value={rows.filter((r) => r.company.signatoryStatus === 'suspended').length}
          tone="danger"
          icon={Ban}
        />
      </div>
      <FilterBar count={filtered.length}>
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies"
            aria-label="Search companies"
            className="bg-card ps-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filter by access" className="w-full bg-card sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All access states</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="applicant">Applicant</SelectItem>
            <SelectItem value="information_requested">Information requested</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        caption="Companies"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.company.id}
        isLoading={isLoading}
        onRowClick={(r) => setOpenId(r.company.id)}
      />
      <Sheet open={Boolean(open)} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open ? <CompanyPanel row={open} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CompanyPanel({ row }: { row: Row }) {
  const c: Company = row.company
  const revision = useReviewProfileRevision()
  const setStatus = useSetCompanyStatus()
  const [dialog, setDialog] = useState(false)
  const suspended = c.signatoryStatus === 'suspended'
  const rev = c.pendingProfileRevision

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <CompanyLogo name={c.name} src={c.logo} />
          <div className="min-w-0">
            <SheetTitle>{c.name}</SheetTitle>
            <SheetDescription>
              {c.country} · {c.sector}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="grid gap-6 px-4 pb-6">
        <dl className="grid grid-cols-2 gap-4">
          <Detail label="Access">
            <WorkflowStatus status={c.signatoryStatus} />
          </Detail>
          <Detail label="Member since">{formatDate(c.memberSince)}</Detail>
          <Detail label="Contacts">{row.contacts || '—'}</Detail>
          <Detail label="Employees">{c.employeeCount.toLocaleString()}</Detail>
          <Detail label="Users activated">
            {row.activated} of {row.invited}
          </Detail>
          <Detail label="Report status">
            <WorkflowStatus status={row.reportStatus} />
          </Detail>
        </dl>

        {rev ? (
          <section className="grid gap-3 rounded-xl border border-coral/40 bg-coral-50/60 p-4">
            <h3 className="font-heading font-medium text-navy text-sm">Pending profile revision</h3>
            <p className="text-sm">
              <span className="font-medium">{REVISION_LABEL[rev.field] ?? rev.field}</span> changed
              on {formatDate(rev.requestedAt)}:
            </p>
            <blockquote className="rounded-lg border bg-card p-3 text-sm">{rev.value}</blockquote>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={revision.isPending}
                onClick={() =>
                  revision.mutate(
                    { companyId: c.id, approve: true },
                    { onSuccess: () => toast.success('Revision approved and published') },
                  )
                }
              >
                <Check aria-hidden /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={revision.isPending}
                onClick={() =>
                  revision.mutate(
                    { companyId: c.id, approve: false },
                    { onSuccess: () => toast.success('Revision declined') },
                  )
                }
              >
                <X aria-hidden /> Decline
              </Button>
            </div>
          </section>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-muted-foreground text-sm">
            No profile changes waiting for review.
          </p>
        )}

        <section className="grid gap-3">
          <h3 className="font-heading font-medium text-navy text-sm">Access control</h3>
          <p className="text-muted-foreground text-sm">
            {suspended
              ? 'Users of this company cannot sign in to company workspaces until access is restored.'
              : 'Suspending access blocks company users from the portal. Records are kept.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={suspended ? 'default' : 'outline'}
              className={suspended ? '' : 'text-danger'}
              onClick={() => setDialog(true)}
              disabled={c.signatoryStatus !== 'approved' && !suspended}
            >
              {suspended ? <RotateCcw aria-hidden /> : <Ban aria-hidden />}
              {suspended ? 'Restore access' : 'Suspend access'}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/reporting/companies/$companyId" params={{ companyId: c.id }}>
                <ExternalLink aria-hidden /> Open reporting view
              </Link>
            </Button>
          </div>
        </section>
      </div>
      <ReasonDialog
        open={dialog}
        onOpenChange={setDialog}
        title={suspended ? `Restore access for ${c.name}` : `Suspend access for ${c.name}`}
        description={
          suspended
            ? 'Company users will be able to sign in again.'
            : 'Company users will lose access immediately.'
        }
        confirmLabel={suspended ? 'Restore access' : 'Suspend access'}
        destructive={!suspended}
        pending={setStatus.isPending}
        onConfirm={(reason) =>
          setStatus.mutate(
            { companyId: c.id, status: suspended ? 'approved' : 'suspended', reason },
            {
              onSuccess: () => {
                toast.success(suspended ? 'Access restored' : 'Access suspended')
                setDialog(false)
              },
            },
          )
        }
      />
    </>
  )
}

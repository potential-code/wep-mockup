import type { AnnualReport } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { downloadText, formatDate } from '@/lib/format'
import { SECTION_META } from '@/queries/reports.queries'

const latest = (r: AnnualReport) => r.versions[r.versions.length - 1]

function download(r: AnnualReport, company: string) {
  const body = SECTION_META.map(
    (s) => `## ${s.title}\n${r.sections[s.key] || 'Not provided.'}`,
  ).join('\n\n')
  downloadText(
    `${company.replace(/\s+/g, '-')}-WEPs-report-${r.year}.txt`,
    `${company} · ${r.year} annual report (demo export)\n\n${body}\n`,
  )
  toast.success(`Demo download of the ${r.year} report started`)
}

export function HistoryTable({ rows, company }: { rows: AnnualReport[]; company: string }) {
  const columns: Column<AnnualReport>[] = [
    {
      key: 'year',
      header: 'Year',
      sortValue: (r) => r.year,
      cell: (r) => <span className="font-semibold text-navy">{r.year}</span>,
    },
    {
      key: 'version',
      header: 'Submitted version',
      cell: (r) =>
        latest(r) ? (
          <span>
            Version {latest(r)?.version}
            <span className="block text-muted-foreground text-xs">
              {formatDate(latest(r)?.submittedAt)}
            </span>
          </span>
        ) : (
          '—'
        ),
    },
    { key: 'status', header: 'Status', cell: (r) => <WorkflowStatus status={r.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/portal/reports/$year" params={{ year: String(r.year) }}>
              <Eye /> View
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => download(r, company)}
            aria-label={`Download ${r.year} report (demo)`}
          >
            <Download /> Download
          </Button>
        </div>
      ),
    },
  ]
  return (
    <DataTable
      caption="Report history"
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      initialSort={{ key: 'year', dir: 'desc' }}
      empty={
        <p className="p-6 text-center text-muted-foreground text-sm">No earlier reports yet.</p>
      }
    />
  )
}

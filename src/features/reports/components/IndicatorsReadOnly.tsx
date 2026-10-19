import type { ReportIndicator } from '@shared/types'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { compareIndicator, formatDelta, formatValue } from '../lib'

/** Read-only indicator table with previous-year comparison where definitions match. */
export function IndicatorsReadOnly({
  indicators,
  previous,
}: {
  indicators: ReportIndicator[]
  previous?: ReportIndicator[]
}) {
  const columns: Column<ReportIndicator>[] = [
    {
      key: 'label',
      header: 'Indicator',
      cell: (i) => <span className="font-medium text-navy">{i.label}</span>,
    },
    {
      key: 'principle',
      header: 'Principle',
      cell: (i) => <PrincipleTag id={i.principle} />,
      hideOnMobile: true,
    },
    {
      key: 'value',
      header: 'Value',
      cell: (i) =>
        i.value === null ? (
          <span className="text-muted-foreground">Not provided</span>
        ) : (
          <span className="font-semibold">{formatValue(i.value, i.unit)}</span>
        ),
    },
    {
      key: 'coverage',
      header: 'Coverage and period',
      cell: (i) => `${i.coverage || '—'} · ${i.period || '—'}`,
    },
    {
      key: 'evidence',
      header: 'Evidence',
      cell: (i) =>
        i.evidence ? (
          <span className="break-words text-xs">{i.evidence}</span>
        ) : (
          <StatusBadge tone="neutral">No evidence linked</StatusBadge>
        ),
    },
    {
      key: 'previous',
      header: 'Previous year',
      cell: (i) => {
        const c = compareIndicator(i, previous)
        return (
          <span className="grid gap-0.5">
            <span>{formatValue(c.previous, i.unit)}</span>
            {c.delta !== null ? (
              <span className="text-muted-foreground text-xs">
                {formatDelta(c.delta, i.unit)} {c.comparable ? '' : '(coverage differs)'}
              </span>
            ) : null}
          </span>
        )
      },
    },
  ]
  return (
    <DataTable
      caption="Reported indicators"
      columns={columns}
      rows={indicators}
      getRowId={(i) => i.id}
      empty={
        <p className="p-6 text-center text-muted-foreground text-sm">No indicators reported.</p>
      }
    />
  )
}

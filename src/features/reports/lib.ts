import type { ReportIndicator, ReportSectionKey, ReportStatus } from '@shared/types'

export const WORKFLOW: { status: ReportStatus; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'ready_for_approval', label: 'Ready for company approval' },
  { status: 'submitted', label: 'Submitted' },
  { status: 'under_review', label: 'Under review' },
  { status: 'changes_requested', label: 'Changes requested' },
  { status: 'resubmitted', label: 'Resubmitted' },
  { status: 'accepted', label: 'Accepted' },
]

export const workflowIndex = (status: ReportStatus) =>
  Math.max(
    0,
    WORKFLOW.findIndex((w) => w.status === (status === 'not_started' ? 'draft' : status)),
  )

export const LOCKED_STATUSES: ReportStatus[] = [
  'submitted',
  'under_review',
  'resubmitted',
  'accepted',
]

export const ACCEPTED_NOTE =
  'Accepted is a UN Women review status for this submission. It is not independent verification of every reported outcome.'

export const DECLARATION_TEXT =
  'I confirm that, to the best of my knowledge, the information in this report is accurate and complete, that missing data has been left blank rather than estimated as zero, and that I am authorised to submit it on behalf of the company.'

export const sectionIsRequired = (key: ReportSectionKey) => key !== 'declaration'

/** Identity of an indicator across years: same label and unit. */
export const indicatorKey = (i: Pick<ReportIndicator, 'label' | 'unit'>) =>
  `${i.label.trim().toLowerCase()}|${i.unit}`

export interface IndicatorChange {
  previous: number | null
  delta: number | null
  /** Definitions match when label, unit and coverage are all the same. */
  comparable: boolean
  coverageNote?: string
}

export function compareIndicator(
  current: ReportIndicator,
  previous: ReportIndicator[] | undefined,
): IndicatorChange {
  const match = previous?.find((p) => indicatorKey(p) === indicatorKey(current))
  const prevValue = match ? match.value : (current.previousValue ?? null)
  const delta = current.value !== null && prevValue !== null ? current.value - prevValue : null
  const comparable = match ? match.coverage === current.coverage : false
  return {
    previous: prevValue,
    delta,
    comparable,
    coverageNote: match && !comparable ? `Previous coverage: ${match.coverage}` : undefined,
  }
}

export const formatValue = (v: number | null, unit: string) =>
  v === null
    ? 'Not provided'
    : `${Number.isInteger(v) ? v : v.toFixed(1)}${unit === '%' ? '%' : ` ${unit}`}`

export const formatDelta = (d: number | null, unit: string) =>
  d === null
    ? '—'
    : `${d > 0 ? '+' : ''}${Number.isInteger(d) ? d : d.toFixed(1)}${unit === '%' ? ' pts' : ` ${unit}`}`

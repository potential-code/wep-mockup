import type { ActionItem, Assessment, DepartmentId, PrincipleId } from '@shared/types'

// Lightweight assessment and action records for the other approved companies, so the UN Women
// portfolio funnel reconciles: 8 approved > 6 assessed > 6 with action plans > 5 reporting.

const ASSESSED: [string, string][] = [
  ['c-harbour', 'u-ceo-harbour'],
  ['c-nova', 'u-ceo-nova'],
  ['c-lumen', 'u-ceo-lumen'],
  ['c-meridian', 'u-ceo-meridian'],
  ['c-solace', 'u-ceo-solace'],
]

export const portfolioAssessments: Assessment[] = ASSESSED.map(([companyId, ownerId], i) => ({
  id: `asm-${companyId}-2026`,
  companyId,
  name: 'Demo Company Assessment',
  period: '2026',
  ownerId,
  status: 'submitted',
  answers: {},
  evidence: {},
  updatedAt: `2026-0${4 + i}-12T09:00:00.000Z`,
  submittedAt: `2026-0${4 + i}-12T09:00:00.000Z`,
  strengths: [],
  needs: [],
}))

const TEMPLATES: { title: string; principle: PrincipleId; department: DepartmentId }[] = [
  { title: 'Introduce structured interviews for technical roles', principle: 2, department: 'hr' },
  {
    title: 'Map supplier ownership for top 100 suppliers',
    principle: 5,
    department: 'procurement',
  },
  { title: 'Review parental leave and return-to-work support', principle: 3, department: 'hr' },
]

export const portfolioActions: ActionItem[] = ASSESSED.flatMap(([companyId, ownerId], ci) =>
  TEMPLATES.map((t, k) => {
    const overdue = companyId === 'c-harbour' && k === 0
    return {
      id: `act-${companyId}-${k + 1}`,
      companyId,
      title: t.title,
      purpose: 'Agreed priority from the 2026 assessment.',
      principle: t.principle,
      ownerId,
      department: t.department,
      baseline: 'See assessment',
      target: 'See action plan',
      dueDate: overdue
        ? '2026-09-01T00:00:00.000Z'
        : `2027-0${1 + ((ci + k) % 6)}-15T00:00:00.000Z`,
      status: k === 1 && ci % 2 === 0 ? 'complete' : 'in_progress',
      evidenceRequired: 'Supporting document',
      evidence:
        k === 1 && ci % 2 === 0
          ? [
              {
                id: `ev-${companyId}-${k}`,
                fileName: 'evidence.pdf',
                uploadedById: ownerId,
                uploadedAt: '2026-08-01T09:00:00.000Z',
              },
            ]
          : [],
      contributorIds: [],
      linkedCourseIds: [],
      linkedResourceIds: [],
      history: [],
    } satisfies ActionItem
  }),
)

import type { ReportIndicator, ReportSectionKey } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/reports.service'
import { qk } from './keys'

export const useCompanyReports = () =>
  useQuery({ queryKey: qk('reports'), queryFn: svc.listCompanyReports })
export const useReport = (year: number) =>
  useQuery({ queryKey: qk('report', year), queryFn: () => svc.getReport(year) })
export const useSaveSection = () =>
  useMutation({
    mutationFn: (v: { year: number; key: ReportSectionKey; text: string; complete: boolean }) =>
      svc.saveSection(v.year, v.key, v.text, v.complete),
  })
export const useSaveIndicators = () =>
  useMutation({
    mutationFn: (v: { year: number; indicators: ReportIndicator[] }) =>
      svc.saveIndicators(v.year, v.indicators),
    onError: () => {},
  })
export const useAttachReportEvidence = () =>
  useMutation({
    mutationFn: (v: { year: number; fileName: string; note?: string }) =>
      svc.attachReportEvidence(v.year, v.fileName, v.note),
  })
export const useFillSampleReport = () => useMutation({ mutationFn: svc.fillSampleReport })
export const useRequestApproval = () => useMutation({ mutationFn: svc.requestApproval })
export const useSubmitReport = () =>
  useMutation({
    mutationFn: (v: { year: number; declaration: string }) =>
      svc.submitReport(v.year, v.declaration),
  })
export const useTogglePublicSummary = () =>
  useMutation({
    mutationFn: (v: { year: number; approved: boolean }) =>
      svc.togglePublicSummary(v.year, v.approved),
  })

export const useReportForReview = (id: string) =>
  useQuery({ queryKey: qk('report-review', id), queryFn: () => svc.getReportForReview(id) })
export const useStartReportReview = () => useMutation({ mutationFn: svc.startReportReview })
export const useRequestReportChanges = () =>
  useMutation({
    mutationFn: (v: { id: string; requests: { section: ReportSectionKey; note: string }[] }) =>
      svc.requestReportChanges(v.id, v.requests),
  })
export const useAcceptReport = () => useMutation({ mutationFn: svc.acceptReport })
export { SECTION_META } from '@/services/reports.service'

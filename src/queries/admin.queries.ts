import type { CommsTemplate, Course, PlatformSettings } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/admin.service'
import * as rep from '@/services/admin-reporting.service'
import { qk } from './keys'

export const useExecutiveDashboard = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('exec', f), queryFn: () => rep.getExecutiveDashboard(f) })
export const useCompaniesTable = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('companies-table', f), queryFn: () => rep.getCompaniesTable(f) })
/** Portal companies followed by the wider signatory network (Companies and Signatories). */
export const useNetworkCompaniesTable = (f: rep.ReportingFilters) =>
  useQuery({
    queryKey: qk('companies-table', 'network', f),
    queryFn: () => rep.getCompaniesTable(f, true),
  })
export const useCompanyDetail = (id: string) =>
  useQuery({ queryKey: qk('company-detail', id), queryFn: () => rep.getCompanyDetail(id) })
export const useUsersTable = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('users-table', f), queryFn: () => rep.getUsersTable(f) })
export const useLearningReport = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('learning-report', f), queryFn: () => rep.getLearningReport(f) })
export const useAnalytics = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('analytics', f), queryFn: () => rep.getAnalytics(f) })
export const useMentorshipReport = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('mentorship-report', f), queryFn: () => rep.getMentorshipReport(f) })
export const useAssessmentsReport = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('assessments-report', f), queryFn: () => rep.getAssessmentsReport(f) })
export const useAnnualReportsMatrix = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('reports-matrix', f), queryFn: () => rep.getAnnualReportsMatrix(f) })
export const useCommunityReport = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('community-report', f), queryFn: () => rep.getCommunityReport(f) })
export const useCertificationReport = (f: rep.ReportingFilters) =>
  useQuery({
    queryKey: qk('certification-report', f),
    queryFn: () => rep.getCertificationReport(f),
  })
export const useBuilderDataset = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('builder-dataset', f), queryFn: () => rep.getBuilderDataset(f) })
export type { ReportingFilters } from '@/services/admin-reporting.service'
export { toCsv } from '@/services/admin-reporting.service'

export const useSettings = () => useQuery({ queryKey: qk('settings'), queryFn: svc.getSettings })
export const useUpdateSettings = () =>
  useMutation({ mutationFn: (p: Partial<PlatformSettings>) => svc.updateSettings(p) })
export const useAudit = () => useQuery({ queryKey: qk('audit'), queryFn: svc.listAudit })
export const useComms = () => useQuery({ queryKey: qk('comms'), queryFn: svc.listComms })
export const useUpsertComms = () =>
  useMutation({ mutationFn: (t: CommsTemplate) => svc.upsertComms(t) })
export const useInvitations = () =>
  useQuery({ queryKey: qk('invitations'), queryFn: svc.listInvitations })
export const useInviteMentor = () => useMutation({ mutationFn: svc.inviteMentor })
export const useSetInvitationStatus = () =>
  useMutation({
    mutationFn: (v: { id: string; status: 'pending' | 'revoked'; reason?: string }) =>
      svc.setInvitationStatus(v.id, v.status, v.reason),
  })
export const useSetUserSuspended = () =>
  useMutation({
    mutationFn: (v: { userId: string; suspended: boolean; reason: string }) =>
      svc.setUserSuspended(v.userId, v.suspended, v.reason),
  })
export const useSetCompanyStatus = () =>
  useMutation({
    mutationFn: (v: { companyId: string; status: 'approved' | 'suspended'; reason: string }) =>
      svc.setCompanyStatus(v.companyId, v.status, v.reason),
  })
export const useReviewProfileRevision = () =>
  useMutation({
    mutationFn: (v: { companyId: string; approve: boolean }) =>
      svc.reviewProfileRevision(v.companyId, v.approve),
  })
export const useUpsertCourse = () => useMutation({ mutationFn: (c: Course) => svc.upsertCourse(c) })
export const useDeleteCourse = () =>
  useMutation({ mutationFn: (id: string) => svc.deleteCourse(id) })
export const useOpenReportingYear = () =>
  useMutation({
    mutationFn: (v: { year: number; companyIds: string[]; dueDate: string }) =>
      svc.openReportingYear(v.year, v.companyIds, v.dueDate),
  })

export const useAdminCourses = () =>
  useQuery({ queryKey: qk('admin-courses'), queryFn: svc.listAdminCourses })
export const useAdminCourse = (id: string) =>
  useQuery({ queryKey: qk('admin-course', id), queryFn: () => svc.getAdminCourse(id) })
export const useAssessmentConfig = () =>
  useQuery({ queryKey: qk('assessment-config'), queryFn: svc.getAssessmentConfig })
export const useReportingConfig = () =>
  useQuery({ queryKey: qk('reporting-config'), queryFn: svc.getReportingConfig })
export const useNotificationHistory = () =>
  useQuery({ queryKey: qk('notification-history'), queryFn: svc.listNotificationHistory })
export const useChangeEvent = () =>
  useMutation({
    mutationFn: (v: { eventId: string; startsAt?: string; cancel?: boolean; message: string }) =>
      svc.changeEvent(v.eventId, v),
  })
export { REPORT_TEMPLATE_SECTIONS } from '@/services/admin.service'
export const useAiScripts = () =>
  useQuery({ queryKey: qk('ai-scripts'), queryFn: svc.listAiScripts })

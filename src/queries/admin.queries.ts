import type { CommsTemplate, Course, PlatformSettings } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/admin.service'
import * as rep from '@/services/admin-reporting.service'
import { qk } from './keys'

export const useExecutiveDashboard = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('exec', f), queryFn: () => rep.getExecutiveDashboard(f) })
export const useCompaniesTable = (f: rep.ReportingFilters) =>
  useQuery({ queryKey: qk('companies-table', f), queryFn: () => rep.getCompaniesTable(f) })
export const useCompanyDetail = (id: string) =>
  useQuery({ queryKey: qk('company-detail', id), queryFn: () => rep.getCompanyDetail(id) })
export const useUsersTable = () =>
  useQuery({ queryKey: qk('users-table'), queryFn: rep.getUsersTable })
export const useLearningReport = () =>
  useQuery({ queryKey: qk('learning-report'), queryFn: rep.getLearningReport })
export const useMentorshipReport = () =>
  useQuery({ queryKey: qk('mentorship-report'), queryFn: rep.getMentorshipReport })
export const useAssessmentsReport = () =>
  useQuery({ queryKey: qk('assessments-report'), queryFn: rep.getAssessmentsReport })
export const useAnnualReportsMatrix = () =>
  useQuery({ queryKey: qk('reports-matrix'), queryFn: rep.getAnnualReportsMatrix })
export const useCommunityReport = () =>
  useQuery({ queryKey: qk('community-report'), queryFn: rep.getCommunityReport })
export const useCertificationReport = () =>
  useQuery({ queryKey: qk('certification-report'), queryFn: rep.getCertificationReport })
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
export const useOpenReportingYear = () =>
  useMutation({
    mutationFn: (v: { year: number; companyIds: string[]; dueDate: string }) =>
      svc.openReportingYear(v.year, v.companyIds, v.dueDate),
  })

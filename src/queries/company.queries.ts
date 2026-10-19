import type { Company, CompanyPermission, DepartmentId } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/company.service'
import * as dash from '@/services/dashboard.service'
import { qk } from './keys'

export const useCompany = (companyId?: string) =>
  useQuery({
    queryKey: qk('company', companyId),
    queryFn: () => svc.getCompany(companyId as string),
    enabled: Boolean(companyId),
  })
export const useCompanies = () =>
  useQuery({ queryKey: qk('companies'), queryFn: svc.listCompanies })
export const usePublicDirectory = () =>
  useQuery({ queryKey: qk('directory'), queryFn: svc.listPublicDirectory })
export const useTeam = (companyId?: string) =>
  useQuery({
    queryKey: qk('team', companyId),
    queryFn: () => svc.getTeam(companyId as string),
    enabled: Boolean(companyId),
  })
export const useCompanyActivity = (companyId?: string) =>
  useQuery({
    queryKey: qk('company-activity', companyId),
    queryFn: () => svc.getCompanyActivity(companyId as string),
    enabled: Boolean(companyId),
  })

export const useUpdateCompany = (companyId: string) =>
  useMutation({ mutationFn: (patch: Partial<Company>) => svc.updateCompany(companyId, patch) })
export const useInviteUser = () => useMutation({ mutationFn: svc.inviteUser, onError: () => {} })
export const useResendInvitation = () => useMutation({ mutationFn: svc.resendInvitation })
export const useUpdateDepartment = () =>
  useMutation({
    mutationFn: (v: { userId: string; department: DepartmentId }) =>
      svc.updateDepartment(v.userId, v.department),
  })
export const useRequestDepartmentCorrection = () =>
  useMutation({
    mutationFn: (v: { department: DepartmentId; note: string }) =>
      svc.requestDepartmentCorrection(v.department, v.note),
  })
export const useAssignAdministrator = () =>
  useMutation({
    mutationFn: (v: { userId: string; permissions: CompanyPermission[] }) =>
      svc.assignAdministrator(v.userId, v.permissions),
  })
export const useUpdatePermissions = () =>
  useMutation({
    mutationFn: (v: { userId: string; permissions: CompanyPermission[] }) =>
      svc.updatePermissions(v.userId, v.permissions),
  })
export const useRemoveAccess = () => useMutation({ mutationFn: svc.removeAccess })

export const useCompanyDashboard = () =>
  useQuery({ queryKey: qk('dashboard', 'company'), queryFn: dash.getCompanyDashboard })
export const useEmployeeDashboard = () =>
  useQuery({ queryKey: qk('dashboard', 'employee'), queryFn: dash.getEmployeeDashboard })

export type CompanyDashboardData = NonNullable<ReturnType<typeof useCompanyDashboard>['data']>
export type TeamMember = NonNullable<ReturnType<typeof useTeam>['data']>[number]

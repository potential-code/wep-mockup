import type { ApplicationData, ApplicationDocument } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/applications.service'
import { qk } from './keys'

export const useJoinDraft = () =>
  useQuery({ queryKey: qk('join-draft'), queryFn: svc.getJoinDraft, staleTime: Infinity })
export const useSaveJoinDraft = () =>
  useMutation({
    mutationFn: (v: { data: ApplicationData; step: number; documents: ApplicationDocument[] }) =>
      svc.saveJoinDraft(v.data, v.step, v.documents),
  })
export const useDiscardJoinDraft = () => useMutation({ mutationFn: svc.discardJoinDraft })
export const useSubmitApplication = () => useMutation({ mutationFn: svc.submitApplication })
export const useMyApplication = () =>
  useQuery({ queryKey: qk('my-application'), queryFn: svc.getMyApplication })
export const useFindApplication = () =>
  useMutation({ mutationFn: svc.findApplicationByReference, onError: () => {} })
export const useResubmitApplication = () =>
  useMutation({
    mutationFn: (v: {
      id: string
      replacement?: Parameters<typeof svc.resubmitApplication>[1]
      note?: string
    }) => svc.resubmitApplication(v.id, v.replacement, v.note),
  })

export const useApplications = () =>
  useQuery({ queryKey: qk('applications'), queryFn: svc.listApplications })
export const useApplication = (id: string) =>
  useQuery({ queryKey: qk('application', id), queryFn: () => svc.getApplication(id) })
export const useStartReview = () => useMutation({ mutationFn: svc.startReview })
export const useRequestInformation = () =>
  useMutation({
    mutationFn: (v: { id: string; item: string; message: string; dueDate?: string }) =>
      svc.requestInformation(v.id, v),
  })
export const useApproveApplication = () => useMutation({ mutationFn: svc.approveApplication })
export const useRejectApplication = () =>
  useMutation({
    mutationFn: (v: { id: string; reason: string }) => svc.rejectApplication(v.id, v.reason),
  })
export const useResolveDuplicate = () =>
  useMutation({
    mutationFn: (v: { id: string; action: 'claim_existing' | 'treat_as_new' }) =>
      svc.resolveDuplicate(v.id, v.action),
  })
export const useAddReviewNote = () =>
  useMutation({ mutationFn: (v: { id: string; note: string }) => svc.addReviewNote(v.id, v.note) })
export const useInviteCompany = () => useMutation({ mutationFn: svc.inviteCompany })

export { checkApplication, validateUpload } from '@/services/applications.service'

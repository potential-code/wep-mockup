import type { ActionStatus } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/assessment.service'
import { qk } from './keys'

export const useAssessment = () =>
  useQuery({ queryKey: qk('assessment'), queryFn: svc.getAssessment })
export const useSaveAnswers = () => useMutation({ mutationFn: svc.saveAnswers })
export const useFillSampleAssessment = () => useMutation({ mutationFn: svc.fillSampleAssessment })
export const useAddAssessmentEvidence = () =>
  useMutation({
    mutationFn: (v: { questionId: string; fileName: string }) =>
      svc.addAssessmentEvidence(v.questionId, v.fileName),
  })
export const useSubmitAssessment = () => useMutation({ mutationFn: svc.submitAssessment })
export const useStartNewAssessment = () => useMutation({ mutationFn: svc.startNewAssessment })

export const useActions = () => useQuery({ queryKey: qk('actions'), queryFn: svc.listActions })
export const useAction = (id: string) =>
  useQuery({ queryKey: qk('action', id), queryFn: () => svc.getAction(id) })
export const useCreateAction = () => useMutation({ mutationFn: svc.createAction })
export const useUpdateAction = () =>
  useMutation({
    mutationFn: (v: { id: string; patch: Parameters<typeof svc.updateAction>[1] }) =>
      svc.updateAction(v.id, v.patch),
  })
export const useSetActionStatus = () =>
  useMutation({
    mutationFn: (v: { id: string; status: ActionStatus; note?: string }) =>
      svc.setActionStatus(v.id, v.status, v.note),
  })
export const useUploadActionEvidence = () =>
  useMutation({
    mutationFn: (v: { id: string; fileName: string; note?: string }) =>
      svc.uploadActionEvidence(v.id, v.fileName, v.note),
  })
export const useAddNeedToPlan = () => useMutation({ mutationFn: svc.addNeedToPlan })

import type { CertificationOffering, QuizQuestion } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/certification.service'
import { qk } from './keys'

export const useCertifications = () =>
  useQuery({ queryKey: qk('certifications'), queryFn: svc.getCertifications })
export const usePurchase = (id: string) =>
  useQuery({ queryKey: qk('purchase', id), queryFn: () => svc.getPurchase(id) })
export const useStartCheckout = () => useMutation({ mutationFn: svc.startCheckout })
export const useCompleteCheckout = () =>
  useMutation({
    mutationFn: (v: { id: string; outcome: 'success' | 'cancelled' | 'failed' }) =>
      svc.completeCheckout(v.id, v.outcome),
  })
export const useExam = (id: string) =>
  useQuery({ queryKey: qk('exam', id), queryFn: () => svc.getExam(id), staleTime: Infinity })
export const useSaveExamProgress = () =>
  useMutation({
    mutationFn: (v: { id: string; answers: Record<string, number> }) =>
      svc.saveExamProgress(v.id, v.answers),
  })
export const useSubmitExam = () =>
  useMutation({
    mutationFn: (v: { id: string; answers: Record<string, number> }) =>
      svc.submitExam(v.id, v.answers),
  })
export const useCredential = (id: string) =>
  useQuery({ queryKey: qk('credential', id), queryFn: () => svc.getCredential(id) })
export const useAllPurchases = () =>
  useQuery({ queryKey: qk('all-purchases'), queryFn: svc.listAllPurchases })
export const useAdminOfferings = () =>
  useQuery({ queryKey: qk('admin-offerings'), queryFn: svc.listAdminOfferings })
export const useAdminOffering = (id: string) =>
  useQuery({
    queryKey: qk('admin-offering', id),
    queryFn: () => svc.getAdminOffering(id),
    enabled: id !== 'new',
  })
export const useSaveOffering = () =>
  useMutation({
    mutationFn: (v: { offering: CertificationOffering; questions: QuizQuestion[] }) =>
      svc.saveOffering(v.offering, v.questions),
  })
export const useDeleteOffering = () => useMutation({ mutationFn: svc.deleteOffering })
export { offeringProblems } from '@/services/certification.service'

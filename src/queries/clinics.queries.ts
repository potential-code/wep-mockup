import type { ClinicEvent } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/clinics.service'
import { qk } from './keys'

export const usePublicEvents = () =>
  useQuery({ queryKey: qk('public-events'), queryFn: svc.listPublicEvents })
export const useEvents = () => useQuery({ queryKey: qk('events'), queryFn: svc.listEvents })
export const useEvent = (id: string) =>
  useQuery({ queryKey: qk('event', id), queryFn: () => svc.getEvent(id) })
export const useRegister = () => useMutation({ mutationFn: svc.register })
export const useCancelRegistration = () => useMutation({ mutationFn: svc.cancelRegistration })
export const useMarkAttendance = () =>
  useMutation({
    mutationFn: (v: { eventId: string; userId: string; attended: boolean }) =>
      svc.markAttendance(v.eventId, v.userId, v.attended),
  })
export const useSubmitFeedback = () =>
  useMutation({
    mutationFn: (v: { eventId: string; rating: number; comment: string }) =>
      svc.submitFeedback(v.eventId, v.rating, v.comment),
  })
export const useRoster = (eventId: string) =>
  useQuery({ queryKey: qk('roster', eventId), queryFn: () => svc.getRoster(eventId) })
export const useUpsertEvent = () =>
  useMutation({ mutationFn: (e: ClinicEvent) => svc.upsertEvent(e) })

export type { ClinicStatus, Eligibility } from '@/services/clinics.service'

import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/mentorship.service'

export type {
  AvailabilityPrefs,
  ExpertScheduleItem,
  UnavailablePeriod,
} from '@/services/mentorship.service'

import { qk } from './keys'

export const useMentors = () => useQuery({ queryKey: qk('mentors'), queryFn: svc.listMentors })
export const useMentor = (id: string) =>
  useQuery({ queryKey: qk('mentor', id), queryFn: () => svc.getMentor(id) })
export const useBookingContext = () =>
  useQuery({ queryKey: qk('booking-context'), queryFn: svc.getBookingContext })
export const useBookSession = () => useMutation({ mutationFn: svc.bookSession, onError: () => {} })
export const useCancelBooking = () => useMutation({ mutationFn: svc.cancelBooking })
export const useMyBookings = () =>
  useQuery({ queryKey: qk('bookings'), queryFn: svc.listMyBookings })

export const useExpertDashboard = () =>
  useQuery({ queryKey: qk('expert-dashboard'), queryFn: svc.getExpertDashboard })
export const useMyAvailability = () =>
  useQuery({ queryKey: qk('availability'), queryFn: svc.getMyAvailability })
export const useToggleSlot = () => useMutation({ mutationFn: svc.toggleSlot })
export const useUpdateExpertProfile = () => useMutation({ mutationFn: svc.updateExpertProfile })
export const useCompleteSession = () =>
  useMutation({
    mutationFn: (v: { id: string } & Parameters<typeof svc.completeSession>[1]) =>
      svc.completeSession(v.id, v),
  })
export const useApproveExpertProfile = () =>
  useMutation({
    mutationFn: (v: { userId: string; approve: boolean }) =>
      svc.approveExpertProfile(v.userId, v.approve),
  })
export const useAllMentorData = () =>
  useQuery({ queryKey: qk('all-mentors'), queryFn: svc.listAllMentorData })

export const useSubmitBookingFeedback = () =>
  useMutation({
    mutationFn: (v: { id: string; rating: number; comment: string }) =>
      svc.submitBookingFeedback(v.id, v.rating, v.comment),
  })
export const useExpertSchedule = () =>
  useQuery({ queryKey: qk('expert-schedule'), queryFn: svc.getExpertSchedule })
export const useExpertBooking = (id: string, enabled = true) =>
  useQuery({
    queryKey: qk('expert-booking', id),
    queryFn: () => svc.getExpertBooking(id),
    enabled,
  })
export const useSendClinicFollowUp = () =>
  useMutation({
    mutationFn: (v: { eventId: string; note: string; resourceIds: string[] }) =>
      svc.sendClinicFollowUp(v.eventId, v),
  })
export const useAvailabilityPrefs = () =>
  useQuery({ queryKey: qk('availability-prefs'), queryFn: svc.getAvailabilityPrefs })
export const useSaveAvailabilityPrefs = () => useMutation({ mutationFn: svc.saveAvailabilityPrefs })

import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/learning.service'
import * as pts from '@/services/points.service'
import { qk } from './keys'

export const useMyLearning = () =>
  useQuery({ queryKey: qk('my-learning'), queryFn: svc.getMyLearning })
export const useCourses = () => useQuery({ queryKey: qk('courses'), queryFn: svc.listCourses })
export const useCourse = (id: string) =>
  useQuery({ queryKey: qk('course', id), queryFn: () => svc.getCourse(id) })
export const useCompleteLesson = () =>
  useMutation({
    mutationFn: (v: { courseId: string; lessonId: string }) =>
      svc.completeLesson(v.courseId, v.lessonId),
  })
export const useSaveReflection = () =>
  useMutation({
    mutationFn: (v: { courseId: string; lessonId: string; text: string }) =>
      svc.saveReflection(v.courseId, v.lessonId, v.text),
  })
export const useSubmitQuiz = () =>
  useMutation({
    mutationFn: (v: { courseId: string; lessonId: string; answers: Record<string, number> }) =>
      svc.submitQuiz(v.courseId, v.lessonId, v.answers),
  })
export const useTeamReadiness = (companyId?: string) =>
  useQuery({
    queryKey: qk('team-readiness', companyId),
    queryFn: () => svc.getTeamReadiness(companyId as string),
    enabled: Boolean(companyId),
  })

export const useMyPoints = () => useQuery({ queryKey: qk('points'), queryFn: pts.getMyPoints })
export const useLeaderboard = (companyId?: string) =>
  useQuery({ queryKey: qk('leaderboard', companyId), queryFn: () => pts.getLeaderboard(companyId) })
export const useAdjustPoints = () =>
  useMutation({
    mutationFn: (v: { userId: string; amount: number; reason: string }) =>
      pts.adjustPoints(v.userId, v.amount, v.reason),
  })

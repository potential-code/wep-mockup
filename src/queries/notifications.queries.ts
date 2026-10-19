import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/notifications.service'
import * as search from '@/services/search.service'
import { qk } from './keys'

export const useNotifications = (enabled = true) =>
  useQuery({ queryKey: qk('notifications'), queryFn: svc.listNotifications, enabled })
export const useMarkRead = () => useMutation({ mutationFn: svc.markRead })
export const useMarkAllRead = () => useMutation({ mutationFn: svc.markAllRead })
export const usePreferences = () =>
  useQuery({ queryKey: qk('notification-prefs'), queryFn: svc.getPreferences })
export const useSetPreference = () =>
  useMutation({
    mutationFn: (v: { category: string; enabled: boolean }) =>
      svc.setPreference(v.category, v.enabled),
  })
export { PREFERENCE_CATEGORIES } from '@/services/notifications.service'

export const useSearch = (q: string) =>
  useQuery({
    queryKey: qk('search', q),
    queryFn: () => search.search(q),
    enabled: q.trim().length >= 2,
    staleTime: 5_000,
  })
export type { SearchResult } from '@/services/search.service'

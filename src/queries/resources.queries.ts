import type { Resource } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/resources.service'
import { qk } from './keys'

export const usePublicResources = () =>
  useQuery({ queryKey: qk('public-resources'), queryFn: svc.listPublicResources })
export const useResources = () =>
  useQuery({ queryKey: qk('resources'), queryFn: svc.listResources })
export const useResource = (id: string) =>
  useQuery({ queryKey: qk('resource', id), queryFn: () => svc.getResource(id) })
export const useToggleSavedResource = () => useMutation({ mutationFn: svc.toggleSaved })
export const useAttachResource = () =>
  useMutation({
    mutationFn: (v: { resourceId: string; actionId: string }) =>
      svc.attachToAction(v.resourceId, v.actionId),
  })
export const useUpsertResource = () =>
  useMutation({ mutationFn: (r: Resource) => svc.upsertResource(r) })

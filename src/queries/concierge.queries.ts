import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/concierge.service'
import { qk } from './keys'

export const useAiSuggestions = () =>
  useQuery({ queryKey: qk('ai-suggestions'), queryFn: svc.getSuggestions })
export const useConversations = () =>
  useQuery({ queryKey: qk('conversations'), queryFn: svc.listConversations })
export const useConversation = (id?: string) =>
  useQuery({
    queryKey: qk('conversation', id),
    queryFn: () => svc.getConversation(id as string),
    enabled: Boolean(id),
  })
export const useAsk = () => useMutation({ mutationFn: svc.ask })
export const useDeleteConversation = () => useMutation({ mutationFn: svc.deleteConversation })

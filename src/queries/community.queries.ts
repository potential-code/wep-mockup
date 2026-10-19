import type { CommunitySpace } from '@shared/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as svc from '@/services/community.service'
import * as mkt from '@/services/marketplace.service'
import { qk } from './keys'

export const useThreads = (space: CommunitySpace) =>
  useQuery({ queryKey: qk('threads', space), queryFn: () => svc.listThreads(space), retry: false })
export const useThread = (id: string) =>
  useQuery({ queryKey: qk('thread', id), queryFn: () => svc.getThread(id), retry: false })
export const useCreateThread = () => useMutation({ mutationFn: svc.createThread })
export const useRequestAiReply = () => useMutation({ mutationFn: svc.requestAiReply })
export const useReply = () =>
  useMutation({
    mutationFn: (v: { threadId: string; body: string }) => svc.reply(v.threadId, v.body),
  })
export const useReact = () =>
  useMutation({
    mutationFn: (v: { threadId: string; replyId?: string }) => svc.react(v.threadId, v.replyId),
  })
export const useToggleBookmark = () => useMutation({ mutationFn: svc.toggleBookmark })
export const useToggleFollow = () => useMutation({ mutationFn: svc.toggleFollow })
export const useReportContent = () =>
  useMutation({
    mutationFn: (v: { threadId: string; replyId?: string }) =>
      svc.reportContent(v.threadId, v.replyId),
  })
export const useModerate = () =>
  useMutation({
    mutationFn: (v: {
      threadId: string
      action: 'hide' | 'restore' | 'pin' | 'unpin'
      replyId?: string
    }) => svc.moderate(v.threadId, v.action, v.replyId),
  })
export const usePostAnnouncement = () => useMutation({ mutationFn: svc.postAnnouncement })
export const useModerationQueue = () =>
  useQuery({ queryKey: qk('moderation'), queryFn: svc.moderationQueue })
export { CHANNELS } from '@/services/community.service'

export const usePublishedListings = () =>
  useQuery({ queryKey: qk('listings'), queryFn: mkt.listPublished })
export const usePublicListings = () =>
  useQuery({ queryKey: qk('public-listings'), queryFn: mkt.listPublicPreview })
export const useMyListings = () => useQuery({ queryKey: qk('my-listings'), queryFn: mkt.listMine })
export const useListing = (id: string) =>
  useQuery({ queryKey: qk('listing', id), queryFn: () => mkt.getListing(id) })
export const useTrackOutbound = () => useMutation({ mutationFn: mkt.trackOutboundClick })
export const useSaveListing = () =>
  useMutation({
    mutationFn: (v: { input: mkt.ListingInput; id?: string; submit: boolean }) =>
      mkt.saveListing(v.input, { id: v.id, submit: v.submit }),
  })
export const useWithdrawListing = () => useMutation({ mutationFn: mkt.withdrawListing })
export const useListingQueue = () =>
  useQuery({ queryKey: qk('listing-queue'), queryFn: mkt.reviewQueue })
export const useAllListings = () =>
  useQuery({ queryKey: qk('all-listings'), queryFn: mkt.listAllListings })
export const useStartListingReview = () => useMutation({ mutationFn: mkt.startListingReview })
export const useReviewListing = () =>
  useMutation({
    mutationFn: (v: {
      id: string
      decision: 'approve' | 'request_changes' | 'reject' | 'archive'
      note?: string
      publicVisible?: boolean
    }) => mkt.reviewListing(v.id, v.decision, v.note, v.publicVisible),
  })
export type { ListingInput } from '@/services/marketplace.service'

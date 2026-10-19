import { useMutation, useQuery } from '@tanstack/react-query'
import * as auth from '@/services/auth.service'
import { qk } from './keys'

export const useSession = () =>
  useQuery({ queryKey: qk('session'), queryFn: auth.getSession, staleTime: Infinity })

export const useSignInAs = () => useMutation({ mutationFn: auth.signInAs })
export const useSignInWithEmail = () =>
  useMutation({ mutationFn: auth.signInWithEmail, onError: () => {} })
export const useSignOut = () => useMutation({ mutationFn: auth.signOut })
export const useResetDemo = () => useMutation({ mutationFn: auth.resetDemoData })
export const useRequestPasswordReset = () => useMutation({ mutationFn: auth.requestPasswordReset })
export const useInvitation = (token: string) =>
  useQuery({
    queryKey: qk('invitation', token),
    queryFn: () => auth.getInvitation(token),
    retry: false,
  })
export const useAcceptInvitation = (token: string) =>
  useMutation({
    mutationFn: (p: Parameters<typeof auth.acceptInvitation>[1]) => auth.acceptInvitation(token, p),
    onError: () => {},
  })
export const useUpdateMyProfile = () => useMutation({ mutationFn: auth.updateMyProfile })

export { DEMO_PERSONAS } from '@/services/auth.service'

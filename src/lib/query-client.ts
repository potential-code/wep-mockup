import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const ROOT_KEY = 'weps'

/**
 * Every mutation invalidates the whole demo cache: the mock API is fast and all dashboards stay
 * consistent across roles. Errors surface as toasts unless a mutation handles them itself.
 */
export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false },
  },
  mutationCache: new MutationCache({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ROOT_KEY] }),
    onError: (error, _v, _c, mutation) => {
      if (!mutation.options.onError) toast.error(error.message)
    },
  }),
})

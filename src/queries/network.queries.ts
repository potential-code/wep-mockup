import { useQuery } from '@tanstack/react-query'
import * as svc from '@/services/network.service'
import { qk } from './keys'

export const useGlobalNetwork = () =>
  useQuery({ queryKey: qk('global-network'), queryFn: svc.getGlobalNetwork, staleTime: Infinity })

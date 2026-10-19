import { ROOT_KEY } from '@/lib/query-client'

/** Query keys, namespaced under one root so mutations can invalidate everything. */
export const qk = (...parts: (string | number | object | undefined)[]) =>
  [ROOT_KEY, ...parts] as const

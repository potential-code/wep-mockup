import { SUPPRESS_BELOW } from './filters'

export const SUPPRESSED_LABEL = `<${SUPPRESS_BELOW} suppressed`

/** True when a user-level group is too small to show. 0 is not sensitive. */
export const isSmall = (n: number, on: boolean) => on && n > 0 && n < SUPPRESS_BELOW

/** Table / text value: the count, or a "<5 suppressed" label. */
export const cell = (n: number, on: boolean): string | number =>
  isSmall(n, on) ? SUPPRESSED_LABEL : n

/** Chart value: suppressed groups plot as 0 and are explained in the table alternative. */
export const chartVal = (n: number, on: boolean) => (isSmall(n, on) ? 0 : n)

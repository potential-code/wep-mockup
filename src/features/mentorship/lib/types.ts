import type { MentorProfile } from '@shared/types'

/** Row returned by the mentor directory query. */
export interface MentorRow {
  profile: MentorProfile
  name: string
  title: string
  avatar?: string
  timezone: string
  nextSlot?: string
  reasons: string[]
  score: number
}

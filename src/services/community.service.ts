// Community discussions and Signatory Circle (brief §18). Group threads only: there are no
// private one-to-one chats. The AI participant answers general questions from approved
// knowledge and never brings private company data into a shared space.

import { can, fullName } from '@shared/permissions'
import type { CommunitySpace, Thread, ThreadReply } from '@shared/types'
import {
  ApiError,
  commit,
  companyOf,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireUser,
} from './api'
import { award } from './points.service'

export const CHANNELS = [
  'General Questions',
  'HR and Workplace',
  'Procurement',
  'Learning and Clinics',
  'Reporting',
] as const

function assertSpace(space: CommunitySpace) {
  const user = requireUser()
  const company = companyOf(user)
  const cap = space === 'signatory_circle' ? 'community.signatory_circle' : 'community.discussions'
  if (!can(user, cap, company)) {
    throw new ApiError(
      space === 'signatory_circle'
        ? 'The Signatory Circle is open to members of approved signatory companies.'
        : 'Community access requires an approved account.',
      'forbidden',
    )
  }
  return user
}

const author = (id: string) => {
  if (id === 'ai')
    return {
      name: 'WEPs Assistant',
      avatar: undefined,
      company: 'AI · approved WEPs knowledge',
      isAi: true,
      role: 'ai',
    }
  const u = db.users.find((x) => x.id === id)
  const company = db.companies.find((c) => c.id === u?.companyId)
  return {
    name: u ? fullName(u) : 'Member',
    avatar: u?.avatar,
    company:
      u?.role === 'mentor'
        ? 'Mentor / Trainer'
        : u?.role === 'global_admin'
          ? 'UN Women'
          : (company?.name ?? ''),
    isAi: false,
    role: u?.role ?? 'employee',
  }
}

const view = (t: Thread, userId: string, isAdmin: boolean) => ({
  thread: { ...t, replies: t.replies.filter((r) => isAdmin || r.status !== 'hidden') },
  author: author(t.authorId),
  replyAuthors: Object.fromEntries(t.replies.map((r) => [r.authorId, author(r.authorId)])),
  bookmarked: t.bookmarkedBy.includes(userId),
  following: t.followedBy.includes(userId),
})

export async function listThreads(space: CommunitySpace) {
  await delay()
  const user = assertSpace(space)
  const isAdmin = user.role === 'global_admin'
  return out(
    db.threads
      .filter((t) => t.space === space && (isAdmin || t.status !== 'hidden'))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
      .map((t) => view(t, user.id, isAdmin)),
  )
}

export async function getThread(threadId: string) {
  await delay()
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  const user = assertSpace(t.space)
  const isAdmin = user.role === 'global_admin'
  if (t.status === 'hidden' && !isAdmin)
    throw new ApiError('This post was hidden by a moderator.', 'not_found')
  return out(view(t, user.id, isAdmin))
}

/** Suggested AI answer for general questions; avoids company-private topics. */
function aiAnswerFor(t: Thread): ThreadReply | null {
  const text = `${t.title} ${t.body}`.toLowerCase()
  const looksLikeQuestion =
    t.title.trim().endsWith('?') || /\b(how|what|which|where|can|should|does)\b/.test(text)
  if (!looksLikeQuestion) return null
  const pick = /procure|supplier|tender/.test(text)
    ? {
        body: 'Good question. A practical first step is a baseline: ask your top suppliers by spend to self-declare ownership, then verify the largest ones. The Gender-responsive Procurement Toolbox has templates for the survey and tender criteria, and the Procurement path covers how to widen access without excluding anyone.',
        sources: [
          {
            label: 'Gender-responsive Procurement Toolbox',
            to: '/portal/resources/res-procurement-toolbox',
          },
          {
            label: 'Gender-responsive Procurement course',
            to: '/portal/learn/crs-gender-responsive-procurement',
          },
        ],
      }
    : /report|indicator|kpi|evidence/.test(text)
      ? {
          body: 'For annual reporting, keep each indicator’s unit, coverage and period consistent year to year, and leave missing values blank with an explanation rather than entering zero. The WEPs Transparency and Accountability Roadmap sets out a maturity pathway you can use to decide what to report first.',
          sources: [
            {
              label: 'WEPs Transparency and Accountability Roadmap',
              to: '/portal/resources/res-transparency-roadmap',
            },
          ],
        }
      : /recruit|hiring|shortlist|interview/.test(text)
        ? {
            body: 'Structured, criteria-based shortlisting and interviews are the most reliable way to reduce bias. Start with one role family, agree the criteria before you see CVs, and track the share of women at each stage. The Inclusive Recruitment path walks through this step by step.',
            sources: [
              {
                label: 'Inclusive Recruitment course',
                to: '/portal/learn/crs-inclusive-recruitment',
              },
            ],
          }
        : {
            body: 'Thanks for asking. The WEPs Gender Action Plan Template is a good starting point for turning a question like this into a concrete action with an owner, target and evidence. Other members may share their experience below.',
            sources: [
              {
                label: 'WEPs Gender Action Plan Template',
                to: '/portal/resources/res-gender-action-plan',
              },
            ],
          }
  return {
    id: newId('rp'),
    authorId: 'ai',
    body: pick.body,
    sources: pick.sources,
    createdAt: now(),
    reactions: 0,
    status: 'visible',
  }
}

export async function createThread(input: {
  space: CommunitySpace
  channel: string
  title: string
  body: string
  attachment?: string
}) {
  await delay(400)
  const user = assertSpace(input.space)
  if (input.title.trim().length < 8) throw new ApiError('Please give your post a clear title.')
  const t: Thread = {
    id: newId('th'),
    space: input.space,
    channel: input.channel,
    title: input.title.trim(),
    body: input.body.trim(),
    authorId: user.id,
    createdAt: now(),
    replies: [],
    reactions: 0,
    bookmarkedBy: [],
    followedBy: [user.id],
    pinned: false,
    isAnnouncement: false,
    status: 'visible',
    attachment: input.attachment,
    tags: [],
  }
  db.threads.unshift(t)
  award(user.id, 'community_contribution', `community:thread:${t.id}`, 'Community post', {
    sourceLink: `/portal/community/thread/${t.id}`,
  })
  commit()
  return out(t)
}

/** Simulates the assistant replying shortly after a question is posted. */
export async function requestAiReply(threadId: string) {
  await delay(1600)
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  if (t.replies.some((r) => r.authorId === 'ai')) return null
  const reply = aiAnswerFor(t)
  if (!reply) return null
  t.replies.push(reply)
  notify({
    userId: t.authorId,
    category: 'community',
    title: 'New reply to your post',
    body: 'The WEPs Assistant replied with suggested resources.',
    link: `/portal/community/thread/${t.id}`,
    critical: false,
  })
  commit()
  return out(reply)
}

export async function reply(threadId: string, body: string) {
  await delay(300)
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  const user = assertSpace(t.space)
  if (!body.trim()) throw new ApiError('Write a reply first.')
  const r: ThreadReply = {
    id: newId('rp'),
    authorId: user.id,
    body: body.trim(),
    createdAt: now(),
    reactions: 0,
    status: 'visible',
  }
  t.replies.push(r)
  award(user.id, 'community_contribution', `community:reply:${r.id}`, 'Helpful community reply', {
    sourceLink: `/portal/community/thread/${t.id}`,
  })
  for (const id of t.followedBy) {
    if (id !== user.id)
      notify({
        userId: id,
        category: 'community',
        title: 'New reply',
        body: `${fullName(user)} replied to “${t.title}”.`,
        link: `/portal/community/thread/${t.id}`,
        critical: false,
      })
  }
  commit()
  return out(r)
}

export async function react(threadId: string, replyId?: string) {
  await delay(80)
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  assertSpace(t.space)
  if (replyId) {
    const r = t.replies.find((x) => x.id === replyId)
    if (r) r.reactions++
  } else t.reactions++
  commit()
}

export async function toggleBookmark(threadId: string) {
  await delay(80)
  const user = requireUser()
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  t.bookmarkedBy = t.bookmarkedBy.includes(user.id)
    ? t.bookmarkedBy.filter((x) => x !== user.id)
    : [...t.bookmarkedBy, user.id]
  commit()
}

export async function toggleFollow(threadId: string) {
  await delay(80)
  const user = requireUser()
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  t.followedBy = t.followedBy.includes(user.id)
    ? t.followedBy.filter((x) => x !== user.id)
    : [...t.followedBy, user.id]
  commit()
}

export async function reportContent(threadId: string, replyId?: string) {
  await delay(200)
  requireUser()
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  if (replyId) {
    const r = t.replies.find((x) => x.id === replyId)
    if (r) r.status = 'flagged'
  } else t.status = 'flagged'
  notify({
    userId: 'u-admin',
    category: 'community',
    title: 'Content reported',
    body: `“${t.title}” was reported for review.`,
    link: '/admin/manage/community',
    critical: false,
  })
  commit()
}

/** Moderation queue actions: hide, restore, pin. */
export async function moderate(
  threadId: string,
  action: 'hide' | 'restore' | 'pin' | 'unpin',
  replyId?: string,
) {
  await delay(200)
  const user = requireUser()
  if (user.role !== 'global_admin') throw new ApiError('Only moderators can do that.', 'forbidden')
  const t = findOr404(db.threads, (x) => x.id === threadId, 'Thread')
  const target = replyId ? t.replies.find((r) => r.id === replyId) : t
  if (!target) return
  if (action === 'hide') target.status = 'hidden'
  if (action === 'restore') target.status = 'visible'
  if (action === 'pin') t.pinned = true
  if (action === 'unpin') t.pinned = false
  commit()
}

export async function postAnnouncement(input: {
  space: CommunitySpace
  channel: string
  title: string
  body: string
}) {
  await delay(300)
  const user = requireUser()
  if (user.role !== 'global_admin')
    throw new ApiError('Only UN Women can post announcements.', 'forbidden')
  const t = await createThread(input)
  const stored = db.threads.find((x) => x.id === t.id)
  if (stored) Object.assign(stored, { pinned: true, isAnnouncement: true })
  commit()
  return out(stored)
}

export async function moderationQueue() {
  await delay()
  const user = requireUser()
  if (user.role !== 'global_admin') throw new ApiError('Moderators only.', 'forbidden')
  return out(
    db.threads
      .filter((t) => t.status !== 'visible' || t.replies.some((r) => r.status !== 'visible'))
      .map((t) => view(t, user.id, true)),
  )
}

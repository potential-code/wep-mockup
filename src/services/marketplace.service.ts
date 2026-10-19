// Products and services marketplace (brief §19). Approval is publication permission, not an
// endorsement. Purchases happen on the provider's site; no sales or revenue are reported.

import type { Listing, ListingStatus } from '@shared/types'
import {
  ApiError,
  audit,
  commit,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'

const decorate = (l: Listing) => {
  const company = db.companies.find((c) => c.id === l.companyId)
  return {
    listing: l,
    companyName: company?.name ?? '',
    companyLogo: company?.logo,
    companyCountry: company?.country,
  }
}

export async function listPublished() {
  await delay()
  requireCapability('marketplace.browse')
  return out(db.listings.filter((l) => l.status === 'published').map(decorate))
}

export async function listPublicPreview() {
  await delay()
  return out(db.listings.filter((l) => l.status === 'published' && l.publicVisible).map(decorate))
}

export async function listMine() {
  await delay()
  const user = requireCapability('marketplace.manage')
  return out(db.listings.filter((l) => l.companyId === user.companyId).map(decorate))
}

export async function getListing(listingId: string) {
  await delay()
  const user = requireUser()
  const l = findOr404(db.listings, (x) => x.id === listingId, 'Listing')
  const own = l.companyId === user.companyId
  if (l.status !== 'published' && !own && user.role !== 'global_admin')
    throw new ApiError('This listing isn’t published.', 'not_found')
  if (l.status === 'published' && !own) {
    l.views++
    commit()
  }
  return out({ ...decorate(l), own })
}

export async function trackOutboundClick(listingId: string) {
  const l = db.listings.find((x) => x.id === listingId)
  if (l) {
    l.outboundClicks++
    commit()
  }
}

export type ListingInput = Pick<
  Listing,
  | 'title'
  | 'type'
  | 'category'
  | 'description'
  | 'value'
  | 'image'
  | 'region'
  | 'price'
  | 'currency'
  | 'quoteNote'
  | 'purchaseUrl'
  | 'documents'
>

export async function saveListing(input: ListingInput, opts: { id?: string; submit: boolean }) {
  await delay(400)
  const user = requireCapability('marketplace.manage')
  if (
    opts.submit &&
    (!input.title.trim() || !input.description.trim() || !input.purchaseUrl.trim())
  ) {
    throw new ApiError('Title, description and purchase link are required to submit.')
  }
  let l = opts.id
    ? db.listings.find((x) => x.id === opts.id && x.companyId === user.companyId)
    : undefined
  if (l?.status === 'published') {
    // Material edit: keep the approved version live until the revision is approved.
    l.pendingRevision = {
      title: input.title,
      description: input.description,
      price: input.price,
      quoteNote: input.quoteNote,
    }
    l.history.push({ at: now(), label: 'Revision submitted for review' })
  } else if (l) {
    Object.assign(l, input)
    if (opts.submit) {
      l.status = l.status === 'changes_requested' ? 'resubmitted' : 'submitted'
      l.history.push({
        at: now(),
        label: l.status === 'resubmitted' ? 'Resubmitted' : 'Submitted for review',
      })
    }
  } else {
    l = {
      ...input,
      id: newId('lst'),
      companyId: user.companyId as string,
      status: opts.submit ? 'submitted' : 'draft',
      submittedById: user.id,
      publicVisible: false,
      views: 0,
      outboundClicks: 0,
      createdAt: now(),
      history: [{ at: now(), label: opts.submit ? 'Submitted for review' : 'Draft created' }],
    }
    db.listings.unshift(l)
  }
  if (opts.submit) {
    notify({
      userId: 'u-admin',
      category: 'community',
      title: 'Listing awaiting review',
      body: input.title,
      link: '/admin/manage/community',
      critical: false,
    })
  }
  commit()
  return out(l)
}

export async function withdrawListing(listingId: string) {
  await delay(250)
  const user = requireCapability('marketplace.manage')
  const l = findOr404(
    db.listings,
    (x) => x.id === listingId && x.companyId === user.companyId,
    'Listing',
  )
  l.status = 'withdrawn'
  l.history.push({ at: now(), label: 'Withdrawn by company' })
  commit()
}

/* ---------------------------------------------------------------- admin review -- */

export async function reviewQueue() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.listings
      .filter(
        (l) => ['submitted', 'under_review', 'resubmitted'].includes(l.status) || l.pendingRevision,
      )
      .map(decorate),
  )
}

export async function listAllListings() {
  await delay()
  requireCapability('admin.reporting')
  return out(db.listings.map(decorate))
}

export async function reviewListing(
  listingId: string,
  decision: 'approve' | 'request_changes' | 'reject' | 'archive',
  note?: string,
  publicVisible?: boolean,
) {
  await delay(400)
  requireCapability('admin.manage')
  const l = findOr404(db.listings, (x) => x.id === listingId, 'Listing')
  if ((decision === 'request_changes' || decision === 'reject') && !note?.trim())
    throw new ApiError('Give a reason so the company knows what to change.')
  const next: Record<typeof decision, ListingStatus> = {
    approve: 'published',
    request_changes: 'changes_requested',
    reject: 'rejected',
    archive: 'archived',
  }
  if (decision === 'approve' && l.pendingRevision) {
    Object.assign(l, l.pendingRevision)
    l.pendingRevision = undefined
  }
  l.status = next[decision]
  l.reviewerNote = note
  if (decision === 'approve') {
    l.publishedAt = l.publishedAt ?? now()
    if (publicVisible !== undefined) l.publicVisible = publicVisible
  }
  l.history.push({
    at: now(),
    label: {
      approve: 'Approved and published',
      request_changes: 'Changes requested',
      reject: 'Rejected',
      archive: 'Archived',
    }[decision],
    note,
  })
  notify({
    userId: l.submittedById,
    category: 'community',
    title:
      decision === 'approve'
        ? 'Your listing is published'
        : decision === 'request_changes'
          ? 'Changes requested on your listing'
          : `Listing ${next[decision]}`,
    body: note || l.title,
    link: '/portal/community/marketplace/mine',
    critical: false,
  })
  audit(`Listing ${next[decision]}`, l.title, note)
  commit()
  return out(l)
}

export async function startListingReview(listingId: string) {
  await delay(150)
  requireCapability('admin.manage')
  const l = findOr404(db.listings, (x) => x.id === listingId, 'Listing')
  if (l.status === 'submitted' || l.status === 'resubmitted') {
    l.status = 'under_review'
    l.history.push({ at: now(), label: 'Review started' })
    commit()
  }
  return out(l)
}

import type { Listing } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { formatCurrency } from '@/lib/format'

export const priceLabel = (l: Pick<Listing, 'price' | 'currency' | 'quoteNote'>) =>
  l.price ? `From ${formatCurrency(l.price, l.currency ?? 'USD')}` : 'Price on quotation'

export interface ListingCardData {
  listing: Pick<
    Listing,
    | 'id'
    | 'title'
    | 'type'
    | 'category'
    | 'image'
    | 'region'
    | 'price'
    | 'currency'
    | 'quoteNote'
    | 'description'
  >
  companyName: string
  companyLogo?: string
}

export function ListingCard({ data, to = true }: { data: ListingCardData; to?: boolean }) {
  const { listing: l } = data
  const body = (
    <>
      <div className="relative">
        {l.image ? (
          <img src={l.image} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
        ) : (
          <div className="aspect-[16/10] bg-secondary" />
        )}
        <StatusBadge
          tone={l.type === 'product' ? 'gold' : 'info'}
          icon={null}
          className="absolute start-3 top-3 bg-card/95"
        >
          {l.type === 'product' ? 'Product' : 'Service'}
        </StatusBadge>
      </div>
      <div className="grid flex-1 content-start gap-2 p-4">
        <p className="text-muted-foreground text-xs">{l.category}</p>
        <h3 className="font-heading font-semibold text-base text-navy leading-snug">
          {l.title || 'Untitled listing'}
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {l.description || 'Your description will appear here.'}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <CompanyLogo
            name={data.companyName}
            src={data.companyLogo}
            className="size-7 rounded-md"
          />
          <span className="truncate font-medium text-navy">{data.companyName}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden />
            {l.region || 'Region not set'}
          </span>
          <span className="font-semibold text-navy">{priceLabel(l)}</span>
        </div>
      </div>
    </>
  )
  const cls =
    'flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring'
  return (
    <motion.div whileHover={to ? { y: -3 } : undefined} className="h-full">
      {to ? (
        <Link
          to="/portal/community/marketplace/$listingId"
          params={{ listingId: l.id }}
          className={cls}
        >
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </motion.div>
  )
}

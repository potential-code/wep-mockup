import { PRINCIPLES } from '@shared/reference'
import type { Company } from '@shared/types'
import { MapPin, Quote } from 'lucide-react'
import { motion } from 'motion/react'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { formatDate } from '@/lib/format'

export type DirectoryCompany = Pick<
  Company,
  | 'id'
  | 'name'
  | 'logo'
  | 'country'
  | 'region'
  | 'sector'
  | 'memberSince'
  | 'ceoCommitment'
  | 'priorityPrinciples'
  | 'summary'
>

export function CompanyCard({ company: c }: { company: DirectoryCompany }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-4">
        <CompanyLogo name={c.name} src={c.logo} className="size-14 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-lg text-navy leading-tight">{c.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden /> {c.country} · {c.sector}
          </p>
        </div>
      </div>
      {c.ceoCommitment ? (
        <blockquote className="relative rounded-xl bg-blue-50/70 p-4 text-navy text-sm leading-relaxed">
          <Quote className="mb-1 size-4 text-blue" aria-hidden />
          <p className="line-clamp-4">{c.ceoCommitment}</p>
          <footer className="mt-2 text-muted-foreground text-xs">CEO commitment</footer>
        </blockquote>
      ) : (
        <p className="line-clamp-3 text-muted-foreground text-sm">{c.summary}</p>
      )}
      <div className="mt-auto grid gap-3">
        <ul className="flex flex-wrap gap-1.5" aria-label="Priority principles">
          {c.priorityPrinciples.map((id) => {
            const p = PRINCIPLES.find((x) => x.id === id)
            return (
              <li
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium text-navy text-xs"
              >
                <img src={p?.icon} alt="" className="size-4 rounded-full" />P{id} · {p?.short}
              </li>
            )
          })}
        </ul>
        <p className="border-t pt-3 text-muted-foreground text-xs">
          WEPs signatory since {formatDate(c.memberSince, { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </motion.article>
  )
}

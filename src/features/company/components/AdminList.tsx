import { fullName } from '@shared/permissions'
import { ALL_PERMISSIONS, departmentLabel } from '@shared/reference'
import { ShieldCheck, UserCog } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { TeamMember } from '@/queries/company.queries'
import { permissionLabel } from './PermissionToggles'

/** Everyone holding administrator rights, with exactly which rights, visible to the CEO. */
export function AdminList({
  ceo,
  admins,
  onEdit,
  onRevoke,
}: {
  ceo?: TeamMember
  admins: TeamMember[]
  onEdit: (m: TeamMember) => void
  onRevoke: (m: TeamMember) => void
}) {
  return (
    <SectionCard title="Who has which rights" description="Only you can change this list.">
      <ul className="grid gap-3">
        {ceo ? (
          <li className="flex flex-wrap items-center gap-3 rounded-xl border bg-coral-50/50 p-3.5">
            <UserAvatar name={fullName(ceo)} src={ceo.avatar} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-navy text-sm">
                {fullName(ceo)} <span className="text-muted-foreground">(you)</span>
              </p>
              <p className="text-muted-foreground text-xs">
                CEO · all {ALL_PERMISSIONS.length} rights on a single account
              </p>
            </div>
            <StatusBadge tone="coral" icon={ShieldCheck}>
              Full access
            </StatusBadge>
          </li>
        ) : null}
        {admins.length === 0 ? (
          <li className="rounded-xl border border-dashed p-5 text-center text-muted-foreground text-sm">
            No administrators yet. Choose a colleague above to delegate day-to-day coordination.
          </li>
        ) : null}
        {admins.map((a) => (
          <li key={a.id} className="grid gap-3 rounded-xl border bg-card p-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <UserAvatar name={fullName(a)} src={a.avatar} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy text-sm">{fullName(a)}</p>
                <p className="text-muted-foreground text-xs">
                  {a.title} · {departmentLabel(a.department)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(a)}>
                <UserCog aria-hidden /> Edit rights
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onRevoke(a)}>
                Remove admin rights
              </Button>
            </div>
            <ul className="flex flex-wrap gap-1.5" aria-label={`Rights held by ${fullName(a)}`}>
              {a.permissions.map((p) => (
                <li key={p}>
                  <StatusBadge
                    tone={
                      p === 'submit_reports' || p === 'purchase_certifications'
                        ? 'coral'
                        : 'neutral'
                    }
                    icon={null}
                  >
                    {permissionLabel(p)}
                  </StatusBadge>
                </li>
              ))}
              {a.permissions.length === 0 ? (
                <li className="text-muted-foreground text-xs">No rights granted</li>
              ) : null}
            </ul>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

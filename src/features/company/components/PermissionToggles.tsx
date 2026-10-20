import { PERMISSIONS } from '@shared/reference'
import type { CompanyPermission } from '@shared/types'
import { ShieldAlert } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Switch } from '@/components/ui/switch'

/** Individual permission switches. Sensitive rights are explicit and flagged. */
export function PermissionToggles({
  value,
  onChange,
  idPrefix = 'perm',
}: {
  value: CompanyPermission[]
  onChange: (next: CompanyPermission[]) => void
  idPrefix?: string
}) {
  const toggle = (id: CompanyPermission, on: boolean) =>
    onChange(on ? [...value, id] : value.filter((p) => p !== id))
  return (
    <ul className="grid gap-2">
      {PERMISSIONS.map((p) => (
        <li
          key={p.id}
          className="flex items-start justify-between gap-4 rounded-xl border bg-card p-3.5"
        >
          <div className="min-w-0">
            <label htmlFor={`${idPrefix}-${p.id}`} className="font-medium text-navy text-sm">
              {p.label}
            </label>
            <p className="text-muted-foreground text-xs">{p.description}</p>
            {p.sensitive ? (
              <StatusBadge tone="coral" icon={ShieldAlert} className="mt-1.5">
                Sensitive · explicit grant
              </StatusBadge>
            ) : null}
          </div>
          <Switch
            id={`${idPrefix}-${p.id}`}
            checked={value.includes(p.id)}
            onCheckedChange={(on) => toggle(p.id, on)}
          />
        </li>
      ))}
    </ul>
  )
}

export const permissionLabel = (id: CompanyPermission) =>
  PERMISSIONS.find((p) => p.id === id)?.label ?? id

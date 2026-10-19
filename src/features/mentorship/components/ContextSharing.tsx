import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export interface ShareState {
  role: boolean
  company: boolean
  department: boolean
  action: boolean
}

const ROWS: { key: keyof ShareState; label: string; hint: string }[] = [
  { key: 'role', label: 'Your name and job title', hint: 'Helps your expert tailor examples.' },
  { key: 'company', label: 'Your company', hint: 'So they can look at sector context.' },
  { key: 'department', label: 'Your department', hint: 'For example Procurement or HR.' },
  { key: 'action', label: 'The linked company action', hint: 'Only the action title is shared.' },
]

/** Toggles for what the expert can see. Experts only ever receive what is switched on. */
export function ContextSharing({
  value,
  onChange,
  hasAction,
}: {
  value: ShareState
  onChange: (v: ShareState) => void
  hasAction: boolean
}) {
  return (
    <ul className="grid divide-y rounded-xl border">
      {ROWS.map((r) => {
        const disabled = r.key === 'action' && !hasAction
        const id = `share-${r.key}`
        return (
          <li key={r.key} className="flex items-center justify-between gap-4 p-4">
            <div className="grid gap-0.5">
              <Label htmlFor={id} className="font-medium text-navy">
                {r.label}
              </Label>
              <p className="text-muted-foreground text-sm">
                {disabled ? 'No action linked in the previous step.' : r.hint}
              </p>
            </div>
            <Switch
              id={id}
              checked={value[r.key] && !disabled}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ ...value, [r.key]: checked })}
            />
          </li>
        )
      })}
    </ul>
  )
}

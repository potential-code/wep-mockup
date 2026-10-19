import { type ReactNode, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/** Label + control. The label wraps the control so it is associated without ids. */
export function Field({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string
  required?: boolean
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control is passed as children and nested
    <label className={cn('grid gap-1.5 text-sm', className)}>
      <span className="font-medium text-navy">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}
    </label>
  )
}

/** Dialog that requires a written reason before confirming (suspend, revoke, adjust ...). */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
  destructive,
  label = 'Reason',
  placeholder = 'Explain the decision. This is recorded in the audit log.',
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel: string
  onConfirm: (reason: string) => void
  pending?: boolean
  destructive?: boolean
  label?: string
  placeholder?: string
  children?: ReactNode
}) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const invalid = touched && !reason.trim()
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason('')
          setTouched(false)
        }
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-3">
          {children}
          <Field label={label} required>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={placeholder}
              aria-invalid={invalid}
              rows={3}
            />
            {invalid ? (
              <span role="alert" className="text-danger text-xs">
                A reason is required.
              </span>
            ) : null}
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={pending}
            onClick={() => {
              setTouched(true)
              if (reason.trim()) onConfirm(reason.trim())
            }}
          >
            {pending ? 'Saving…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Simple definition row for detail panels. */
export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-navy text-sm">{children}</dd>
    </div>
  )
}

/** Compact sticky-ish bar for editor actions. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex flex-wrap items-center justify-end gap-2 border-t bg-card/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {children}
    </div>
  )
}

export const toIsoLocal = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
export const fromIsoLocal = (v: string) => new Date(`${v}:00.000Z`).toISOString()

/** Switch with a visible label and description, correctly associated. */
export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  label: string
  description?: ReactNode
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border bg-surface/50 p-4',
        className,
      )}
    >
      <div className="grid gap-0.5 text-sm">
        <label htmlFor={id} className="font-medium text-navy">
          {label}
        </label>
        {description ? <span className="text-muted-foreground">{description}</span> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

/** Checkbox with a bordered label row. */
export function CheckRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: ReactNode
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        disabled={disabled}
      />
      <label htmlFor={id} className="flex-1 py-2">
        {label}
      </label>
    </div>
  )
}

/** Minimal CSV serialiser for demo exports. */
export function toCsvText(headers: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}

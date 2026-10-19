import type { ReactNode } from 'react'
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FieldShell {
  label: string
  help?: string
  error?: string
  required?: boolean
  className?: string
}

export function Field({
  id,
  label,
  help,
  error,
  required,
  className,
  children,
}: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={cn('grid content-start gap-1.5', className)}>
      <Label htmlFor={id} className="text-navy">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Label>
      {children}
      {help && !error ? (
        <p id={`${id}-help`} className="text-muted-foreground text-xs">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({
  label,
  help,
  error,
  required,
  className,
  value,
  onChange,
  ...rest
}: FieldShell & {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: 'numeric' | 'email' | 'tel' | 'url'
  suffix?: string
}) {
  const id = useId()
  const { suffix, ...input } = rest
  return (
    <Field
      id={id}
      label={label}
      help={help}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : help ? `${id}-help` : undefined}
          className={cn('h-10 bg-card', suffix && 'pe-9')}
          {...input}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 end-3 grid place-items-center text-muted-foreground text-sm">
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  )
}

export function TextAreaField({
  label,
  help,
  error,
  required,
  className,
  value,
  onChange,
  rows = 3,
}: FieldShell & { value: string; onChange: (v: string) => void; rows?: number }) {
  const id = useId()
  return (
    <Field
      id={id}
      label={label}
      help={help}
      error={error}
      required={required}
      className={className}
    >
      <Textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className="bg-card"
      />
    </Field>
  )
}

export type Option = string | { value: string; label: string }

export function SelectField({
  label,
  help,
  error,
  required,
  className,
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: FieldShell & {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
}) {
  const id = useId()
  return (
    <Field
      id={id}
      label={label}
      help={help}
      error={error}
      required={required}
      className={className}
    >
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-10 w-full bg-card" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value
            return (
              <SelectItem key={v} value={v}>
                {typeof o === 'string' ? o : o.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function ChoiceField({
  label,
  help,
  error,
  required,
  className,
  value,
  onChange,
  options,
}: FieldShell & {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const id = useId()
  return (
    <fieldset className={cn('grid content-start gap-1.5', className)}>
      <legend className="mb-1.5 font-medium text-navy text-sm">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </legend>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Label
            key={o.value}
            htmlFor={`${id}-${o.value}`}
            className={cn(
              'flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border bg-card px-3.5 py-2 font-normal text-sm transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
              value === o.value ? 'border-blue bg-blue-50 text-navy' : 'hover:border-blue/50',
            )}
          >
            <RadioGroupItem id={`${id}-${o.value}`} value={o.value} />
            {o.label}
          </Label>
        ))}
      </RadioGroup>
      {help && !error ? <p className="text-muted-foreground text-xs">{help}</p> : null}
      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

export const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export function FieldGroup({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-4">
      {title ? (
        <div>
          <h3 className="font-heading font-semibold text-navy">{title}</h3>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

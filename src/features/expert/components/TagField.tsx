import { X } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Chip input: Enter or comma adds a value, the chip button removes it. */
export function TagField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string
  label: string
  value: string[]
  onChange: (v: string[]) => void
  hint?: string
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const t = draft.trim().replace(/,$/, '')
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <ul className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <li
            key={v}
            className="flex items-center gap-1 rounded-full bg-blue-50 py-0.5 ps-3 pe-1 text-blue-600 text-sm"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(value.filter((x) => x !== v))}
              className="grid size-6 place-items-center rounded-full hover:bg-blue-100"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <Input
        id={id}
        value={draft}
        placeholder="Type and press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          }
        }}
      />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  placeholder?: string
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="-translate-y-1/2 pointer-events-none absolute start-3 top-1/2 size-4 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder ?? label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-card ps-9"
      />
    </div>
  )
}

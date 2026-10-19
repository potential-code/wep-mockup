import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useResources } from '@/queries/resources.queries'

/** Pick approved library resources to share. Only published resources are offered. */
export function ResourcePicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (ids: string[]) => void
}) {
  const resources = useResources()
  const items = (resources.data?.resources ?? []).filter((r) => r.status === 'published')
  if (resources.isLoading) return <p className="text-muted-foreground text-sm">Loading library…</p>
  return (
    <ScrollArea className="h-44 rounded-lg border">
      <ul className="grid gap-1 p-3">
        {items.map((r) => (
          <li key={r.id} className="flex items-start gap-2">
            <Checkbox
              id={`res-${r.id}`}
              checked={value.includes(r.id)}
              onCheckedChange={(c) =>
                onChange(c ? [...value, r.id] : value.filter((x) => x !== r.id))
              }
            />
            <Label htmlFor={`res-${r.id}`} className="font-normal text-sm leading-snug">
              {r.title}
              <span className="ms-1 text-muted-foreground text-xs">· {r.publisher}</span>
            </Label>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

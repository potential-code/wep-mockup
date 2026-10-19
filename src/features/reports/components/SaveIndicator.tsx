import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { SaveState } from './useAutosave'

export function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <output
      className="inline-flex min-h-5 items-center gap-1.5 text-muted-foreground text-xs"
      aria-live="polite"
    >
      {state === 'saving' ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
        </>
      ) : state === 'saved' ? (
        <>
          <CheckCircle2 className="size-3.5 text-success" aria-hidden /> Saved
        </>
      ) : state === 'dirty' ? (
        'Unsaved changes…'
      ) : state === 'error' ? (
        <>
          <AlertCircle className="size-3.5 text-danger" aria-hidden /> Could not save
        </>
      ) : null}
    </output>
  )
}

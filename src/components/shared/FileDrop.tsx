import { FileCheck2, FileWarning, UploadCloud, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type UploadResult = { fileName: string; sizeKb: number }
export type UploadStatus = 'valid' | 'wrong_type' | 'too_large' | 'missing'

const MESSAGES: Record<Exclude<UploadStatus, 'valid'>, string> = {
  wrong_type: 'That file type isn’t accepted.',
  too_large: 'That file is too large.',
  missing: 'This document is required.',
}

/**
 * Simulated upload: picks a real local file (never sent anywhere) or a sample file, then shows
 * valid / wrong type / too large / missing states via `validate`.
 */
export function FileDrop({
  label,
  hint,
  accept,
  value,
  onChange,
  validate,
  sampleName,
  required,
  showMissing,
}: {
  label: string
  hint?: string
  accept?: string
  value?: UploadResult | null
  onChange: (file: UploadResult | null) => void
  validate?: (file: UploadResult) => UploadStatus
  sampleName?: string
  required?: boolean
  showMissing?: boolean
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<UploadStatus | null>(null)
  const [drag, setDrag] = useState(false)

  const take = (f: UploadResult) => {
    const status = validate ? validate(f) : 'valid'
    if (status !== 'valid') {
      setError(status)
      onChange(null)
      return
    }
    setError(null)
    onChange(f)
  }
  const fromFile = (file?: File) =>
    file && take({ fileName: file.name, sizeKb: Math.round(file.size / 1024) })
  const status: UploadStatus | null = value
    ? 'valid'
    : (error ?? (showMissing && required ? 'missing' : null))

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="font-medium text-navy text-sm">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft/60 p-3">
          <FileCheck2 className="size-5 text-success" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-navy text-sm">{value.fileName}</p>
            <p className="text-muted-foreground text-xs">
              {value.sizeKb.toLocaleString()} KB · uploaded (demo)
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onChange(null)}
            aria-label={`Remove ${value.fileName}`}
          >
            <X />
          </Button>
        </div>
      ) : (
        // biome-ignore lint/a11y/noStaticElementInteractions: drop zone; the file button inside is the keyboard path
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            fromFile(e.dataTransfer.files[0])
          }}
          className={cn(
            'grid place-items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors',
            drag
              ? 'border-blue bg-blue-50'
              : status && status !== 'valid'
                ? 'border-danger/50 bg-danger-soft/40'
                : 'border-input bg-surface/50',
          )}
        >
          {status && status !== 'valid' ? (
            <FileWarning className="size-6 text-danger" aria-hidden />
          ) : (
            <UploadCloud className="size-6 text-blue" aria-hidden />
          )}
          <p className="text-sm">
            <button
              type="button"
              className="font-semibold text-blue underline-offset-2 hover:underline"
              onClick={() => input.current?.click()}
            >
              Choose a file
            </button>{' '}
            or drag it here
          </p>
          {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
          {sampleName ? (
            <button
              type="button"
              className="text-muted-foreground text-xs underline underline-offset-2 hover:text-navy"
              onClick={() => take({ fileName: sampleName, sizeKb: 640 })}
            >
              Use sample file
            </button>
          ) : null}
          <input
            ref={input}
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => fromFile(e.target.files?.[0])}
          />
        </div>
      )}
      {status && status !== 'valid' ? (
        <p role="alert" className="text-danger text-xs">
          {MESSAGES[status]}
        </p>
      ) : null}
    </div>
  )
}

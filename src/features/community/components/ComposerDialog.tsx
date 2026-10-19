import type { CommunitySpace } from '@shared/types'
import { Eye, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FileDrop, type UploadResult } from '@/components/shared/FileDrop'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CHANNELS, useCreateThread } from '@/queries/community.queries'
import { AUDIENCE } from './community-shared'

export function ComposerDialog({
  open,
  onOpenChange,
  space,
  defaultChannel,
  onPosted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  space: CommunitySpace
  defaultChannel?: string
  onPosted: (thread: { id: string; title: string }) => void
}) {
  const create = useCreateThread()
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState<string>(defaultChannel ?? CHANNELS[0])
  const [body, setBody] = useState('')
  const [file, setFile] = useState<UploadResult | null>(null)
  const [touched, setTouched] = useState(false)
  const titleError = touched && title.trim().length < 8
  const bodyError = touched && body.trim().length < 10

  const publish = async () => {
    setTouched(true)
    if (title.trim().length < 8 || body.trim().length < 10) return
    const t = await create.mutateAsync({ space, channel, title, body, attachment: file?.fileName })
    toast.success('Posted')
    onOpenChange(false)
    onPosted({ id: t.id, title: t.title })
    setTitle('')
    setBody('')
    setFile(null)
    setTouched(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
          <DialogDescription>
            Ask a question or share what is working. Posts are group-visible; there are no private
            messages.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How do we baseline supplier ownership data?"
              aria-invalid={titleError}
            />
            {titleError ? (
              <p className="text-danger text-xs" role="alert">
                Give your post a clear title (at least 8 characters).
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="post-channel">Topic</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="post-channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="post-body">Details</Label>
            <Textarea
              id="post-body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-invalid={bodyError}
              placeholder="Share context without confidential company data."
            />
            {bodyError ? (
              <p className="text-danger text-xs" role="alert">
                Add a few details so others can help.
              </p>
            ) : null}
          </div>
          <FileDrop
            label="Attachment (optional)"
            hint="PDF or image, up to 5 MB"
            accept=".pdf,.png,.jpg,.jpeg"
            value={file}
            onChange={setFile}
            sampleName="reporting-notes.pdf"
          />
          <p className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 font-medium text-navy text-sm">
            <Eye className="size-4 shrink-0 text-blue" aria-hidden /> Audience: {AUDIENCE[space]}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={create.isPending}>
            Cancel
          </Button>
          <Button onClick={publish} disabled={create.isPending}>
            {create.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Publishing…
              </>
            ) : (
              'Publish post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

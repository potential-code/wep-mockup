import { useState } from 'react'
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
import { useInviteCompany } from '@/queries/applications.queries'
import { EmailPreview, type EmailPreviewData } from './EmailPreview'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteCompanyDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const invite = useInviteCompany()
  const [companyName, setCompanyName] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [email, setEmail] = useState('')
  const [tried, setTried] = useState(false)
  const [preview, setPreview] = useState<EmailPreviewData | null>(null)

  const reset = (o: boolean) => {
    onOpenChange(o)
    if (!o) {
      setCompanyName('')
      setCeoName('')
      setEmail('')
      setTried(false)
      setPreview(null)
    }
  }
  const valid = companyName.trim() && ceoName.trim() && EMAIL.test(email)

  const send = async () => {
    setTried(true)
    if (!valid) return
    const res = await invite.mutateAsync({ companyName, ceoName, email })
    setPreview(res.emailPreview)
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite a company</DialogTitle>
          <DialogDescription>
            Send the CEO a link to start an application. Invited companies go through the same
            review as everyone else.
          </DialogDescription>
        </DialogHeader>
        {preview ? (
          <div className="grid gap-3">
            <p className="font-medium text-sm text-success">Invitation sent (simulated).</p>
            <EmailPreview email={preview} />
            <DialogFooter>
              <Button onClick={() => reset(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            {(
              [
                ['Company name', companyName, setCompanyName, 'invite-company', 'text'],
                ['CEO name', ceoName, setCeoName, 'invite-ceo', 'text'],
                ['CEO email', email, setEmail, 'invite-email', 'email'],
              ] as const
            ).map(([label, value, setter, id, type]) => {
              const bad = tried && (id === 'invite-email' ? !EMAIL.test(value) : !value.trim())
              return (
                <div key={id} className="grid gap-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    aria-invalid={bad}
                    className="h-10"
                  />
                  {bad ? (
                    <p role="alert" className="text-danger text-xs">
                      {id === 'invite-email'
                        ? 'Enter a valid email address'
                        : 'This field is required'}
                    </p>
                  ) : null}
                </div>
              )
            })}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => reset(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? 'Sending…' : 'Send invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

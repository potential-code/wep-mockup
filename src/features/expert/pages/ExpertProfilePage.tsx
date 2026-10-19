import type { MentorFormat, MentorProfile } from '@shared/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useExpertDashboard, useUpdateExpertProfile } from '@/queries/mentorship.queries'
import { TagField } from '../components/TagField'

const FORMATS: { value: MentorFormat; label: string }[] = [
  { value: 'one_to_one', label: 'One-to-one sessions' },
  { value: 'group', label: 'Group clinics and webinars' },
]

export function ExpertProfilePage() {
  const dash = useExpertDashboard()
  const save = useUpdateExpertProfile()
  const profile = dash.data?.profile
  const [form, setForm] = useState<MentorProfile>()

  useEffect(() => {
    if (profile && !form) setForm(profile)
  }, [profile, form])

  if (dash.isLoading) return <PageSkeleton />
  if (dash.isError || !profile || !form)
    return (
      <ErrorState
        message={dash.error?.message ?? 'No expert profile found.'}
        onRetry={() => dash.refetch()}
      />
    )

  const set = <K extends keyof MentorProfile>(k: K, v: MentorProfile[K]) =>
    setForm({ ...form, [k]: v })
  const valid = form.bio.trim().length >= 40 && form.expertise.length > 0 && form.formats.length > 0

  const submit = async () => {
    await save.mutateAsync({
      headline: form.headline,
      bio: form.bio,
      expertise: form.expertise,
      languages: form.languages,
      sectors: form.sectors,
      formats: form.formats,
      sessionMinutes: form.sessionMinutes,
    })
    toast.success('Profile saved. Changes are awaiting UN Women approval.')
  }

  return (
    <div>
      <PageHeader
        title="Expert profile"
        description="This is what participants see in the mentor directory."
        actions={
          profile.pendingApproval ? (
            <StatusBadge tone="warning">Awaiting UN Women approval</StatusBadge>
          ) : (
            <StatusBadge tone="success">Published</StatusBadge>
          )
        }
      />
      <form
        className="grid max-w-3xl gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <SectionCard title="Biography">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="headline">Headline</Label>
              <input
                id="headline"
                value={form.headline}
                onChange={(e) => set('headline', e.target.value)}
                className="h-10 rounded-lg border bg-card px-3 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                rows={6}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
              <p className="text-muted-foreground text-xs">At least 40 characters.</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Expertise">
          <div className="grid gap-4">
            <TagField
              id="expertise"
              label="Support themes"
              value={form.expertise}
              onChange={(v) => set('expertise', v)}
            />
            <TagField
              id="languages"
              label="Languages"
              value={form.languages}
              onChange={(v) => set('languages', v)}
            />
            <TagField
              id="sectors"
              label="Sectors"
              value={form.sectors}
              onChange={(v) => set('sectors', v)}
            />
          </div>
        </SectionCard>
        <SectionCard title="Delivery">
          <div className="grid gap-4">
            <fieldset className="grid gap-2">
              <legend className="mb-1 font-medium text-sm">Delivery formats</legend>
              {FORMATS.map((f) => (
                <div key={f.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`fmt-${f.value}`}
                    checked={form.formats.includes(f.value)}
                    onCheckedChange={(c) =>
                      set(
                        'formats',
                        c ? [...form.formats, f.value] : form.formats.filter((x) => x !== f.value),
                      )
                    }
                  />
                  <Label htmlFor={`fmt-${f.value}`} className="font-normal">
                    {f.label}
                  </Label>
                </div>
              ))}
            </fieldset>
            <div className="grid max-w-xs gap-1.5">
              <Label htmlFor="minutes">Session length</Label>
              <Select
                value={String(form.sessionMinutes)}
                onValueChange={(v) => set('sessionMinutes', Number(v))}
              >
                <SelectTrigger id="minutes" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[30, 45, 60].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>
        <div className="sticky bottom-0 flex items-center gap-3 border-t bg-surface/95 py-3 backdrop-blur">
          <Button type="submit" disabled={!valid || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save and submit for approval'}
          </Button>
          {!valid ? (
            <p className="text-muted-foreground text-sm">
              Add a longer biography, at least one theme and one format.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}

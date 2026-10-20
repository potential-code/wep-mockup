import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Info, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { FileDrop } from '@/components/shared/FileDrop'
import { PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
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
import { images } from '@/config/images'
import { useCurrentUser } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { type ListingInput, useMyListings, useSaveListing } from '@/queries/community.queries'
import { ListingCard } from '../components/ListingCard'

const CATEGORIES = [
  'HR and recruitment services',
  'Leadership development',
  'Employee benefits',
  'Food and hospitality',
  'Textiles and apparel',
  'Procurement technology',
  'Health and safety training',
  'Supplier development',
  'Relocation services',
]
const REGIONS = [
  'Africa',
  'Arab States',
  'Asia and the Pacific',
  'Europe and Central Asia',
  'Latin America and the Caribbean',
  'Global',
]
const IMAGES = Object.values(images.marketplace)

const EMPTY: ListingInput = {
  title: '',
  type: 'service',
  category: CATEGORIES[0] ?? '',
  description: '',
  value: '',
  image: IMAGES[0]?.src ?? '',
  region: REGIONS[2] ?? 'Global',
  price: undefined,
  currency: 'USD',
  quoteNote: '',
  purchaseUrl: '',
  documents: [],
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      {error ? (
        <p className="text-danger text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function SubmitListingPage() {
  const { id } = useSearch({ strict: false }) as { id?: string }
  const navigate = useNavigate()
  const { company } = useCurrentUser()
  const mine = useMyListings()
  const save = useSaveListing()
  const existing = id ? mine.data?.find((d) => d.listing.id === id)?.listing : undefined
  const [form, setForm] = useState<ListingInput>(EMPTY)
  const [seeded, setSeeded] = useState(!id)
  const [mode, setMode] = useState<'price' | 'quote'>('quote')
  const [tried, setTried] = useState(false)
  const set = <K extends keyof ListingInput>(k: K, v: ListingInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (existing && !seeded) {
      const {
        title,
        type,
        category,
        description,
        value,
        image,
        region,
        price,
        currency,
        quoteNote,
        purchaseUrl,
        documents,
      } = existing
      setForm({
        title,
        type,
        category,
        description,
        value,
        image,
        region,
        price,
        currency,
        quoteNote,
        purchaseUrl,
        documents,
      })
      setMode(price ? 'price' : 'quote')
      setSeeded(true)
    }
  }, [existing, seeded])

  if (!seeded && mine.isLoading) return <PageSkeleton />
  const live = existing?.status === 'published'
  const errors = {
    title: form.title.trim().length < 5 ? 'Add a clear title.' : '',
    description:
      form.description.trim().length < 20
        ? 'Describe the offer in at least a sentence or two.'
        : '',
    purchaseUrl: /^https?:\/\/\S+\.\S+/.test(form.purchaseUrl.trim())
      ? ''
      : 'Enter the full provider link, starting with https://',
    price: mode === 'price' && !form.price ? 'Enter a starting price or switch to quotation.' : '',
  }
  const invalid = Object.values(errors).some(Boolean)
  const submitIt = async (submit: boolean) => {
    setTried(true)
    if (submit && invalid) return
    if (!submit && !form.title.trim()) return
    const input: ListingInput = {
      ...form,
      price: mode === 'price' ? form.price : undefined,
      quoteNote: form.quoteNote?.trim() || undefined,
    }
    await save.mutateAsync({ input, id: existing?.id, submit })
    toast.success(submit ? 'Submitted for review' : 'Draft saved')
    navigate({ to: '/portal/community/marketplace/mine' })
  }
  const err = (k: keyof typeof errors) => (tried ? errors[k] : '')

  return (
    <div className="grid gap-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Community', to: '/portal/community' },
          { label: 'Products and Services', to: '/portal/community/marketplace' },
          { label: existing ? 'Edit listing' : 'Submit' },
        ]}
        title={existing ? 'Edit listing' : 'Submit a product or service'}
        description="UN Women reviews every listing before it is published. Approval is publication permission, not endorsement."
      />
      {live ? (
        <p className="flex items-start gap-2 rounded-xl border border-coral/40 bg-coral-50 p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-coral-700" aria-hidden />
          This listing is published. Your changes create a revision for review: the current version
          stays live until approved.
        </p>
      ) : null}
      {existing?.reviewerNote && existing.status === 'changes_requested' ? (
        <p className="rounded-xl bg-danger-soft p-3 text-sm">
          <strong>Reviewer feedback: </strong>
          {existing.reviewerNote}
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-5">
        <form
          className="grid gap-5 lg:col-span-3"
          onSubmit={(e) => {
            e.preventDefault()
            submitIt(true)
          }}
          noValidate
        >
          <SectionCard title="Listing details" bodyClassName="grid gap-4">
            <Field id="l-title" label="Title" error={err('title')}>
              <Input
                id="l-title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="l-type" label="Type">
                <Select
                  value={form.type}
                  onValueChange={(v) => set('type', v as ListingInput['type'])}
                >
                  <SelectTrigger id="l-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="l-cat" label="Category">
                <Select value={form.category} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger id="l-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field id="l-company" label="Company" hint="Fixed to your signatory company.">
              <Input id="l-company" value={company?.name ?? ''} readOnly disabled />
            </Field>
            <Field id="l-desc" label="Description" error={err('description')}>
              <Textarea
                id="l-desc"
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
            <Field
              id="l-value"
              label="Proposed value"
              hint="What outcome or benefit can buyers expect, and what supports it?"
            >
              <Textarea
                id="l-value"
                rows={2}
                value={form.value}
                onChange={(e) => set('value', e.target.value)}
              />
            </Field>
          </SectionCard>
          <SectionCard title="Image" bodyClassName="grid gap-3">
            <fieldset className="grid grid-cols-3 gap-2">
              <legend className="sr-only">Listing image</legend>
              {IMAGES.map((im) => (
                <button
                  key={im.src}
                  type="button"
                  aria-pressed={form.image === im.src}
                  aria-label={im.alt}
                  onClick={() => set('image', im.src)}
                  className={cn(
                    'overflow-hidden rounded-xl border-2 transition',
                    form.image === im.src
                      ? 'border-blue ring-2 ring-blue/30'
                      : 'border-transparent opacity-80 hover:opacity-100',
                  )}
                >
                  <img
                    src={im.src}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </fieldset>
            <FileDrop
              label="Or upload your own image (demo)"
              accept=".png,.jpg,.jpeg,.webp"
              sampleName="provider-photo.jpg"
              value={null}
              onChange={(f) =>
                f &&
                toast.success(
                  `${f.fileName} attached (demo). The chosen image above is used in this mockup.`,
                )
              }
            />
          </SectionCard>
          <SectionCard title="Coverage, price and purchase link" bodyClassName="grid gap-4">
            <Field id="l-region" label="Delivery region">
              <Select value={form.region} onValueChange={(v) => set('region', v)}>
                <SelectTrigger id="l-region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <fieldset className="grid gap-2">
              <legend className="mb-1 font-medium text-sm">Pricing basis</legend>
              <div className="flex gap-2">
                {(['quote', 'price'] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={mode === m ? 'default' : 'outline'}
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                  >
                    {m === 'quote' ? 'On quotation' : 'Starting price'}
                  </Button>
                ))}
              </div>
            </fieldset>
            {mode === 'price' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="l-price" label="Starting price" error={err('price')}>
                  <Input
                    id="l-price"
                    type="number"
                    min={0}
                    value={form.price ?? ''}
                    onChange={(e) =>
                      set('price', e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </Field>
                <Field id="l-cur" label="Currency">
                  <Input
                    id="l-cur"
                    value={form.currency ?? ''}
                    maxLength={3}
                    onChange={(e) => set('currency', e.target.value.toUpperCase())}
                  />
                </Field>
              </div>
            ) : null}
            <Field
              id="l-note"
              label={mode === 'quote' ? 'Quotation note' : 'Price note (optional)'}
            >
              <Input
                id="l-note"
                value={form.quoteNote ?? ''}
                onChange={(e) => set('quoteNote', e.target.value)}
                placeholder="e.g. Price per participant; bulk pricing available"
              />
            </Field>
            <Field
              id="l-url"
              label="Provider purchase URL"
              error={err('purchaseUrl')}
              hint="Buyers complete the purchase on your own site."
            >
              <Input
                id="l-url"
                type="url"
                value={form.purchaseUrl}
                onChange={(e) => set('purchaseUrl', e.target.value)}
                placeholder="https://"
              />
            </Field>
          </SectionCard>
          <SectionCard title="Supporting documents" bodyClassName="grid gap-3">
            {form.documents.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {form.documents.map((d) => (
                  <li
                    key={d}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {d}
                    <button
                      type="button"
                      aria-label={`Remove ${d}`}
                      onClick={() =>
                        set(
                          'documents',
                          form.documents.filter((x) => x !== d),
                        )
                      }
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <FileDrop
              label="Add a document"
              hint="PDF, up to 5 MB"
              accept=".pdf"
              sampleName="service-brochure.pdf"
              value={null}
              onChange={(f) => f && set('documents', [...form.documents, f.fileName])}
            />
          </SectionCard>
          <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 border-t bg-surface/95 py-3 backdrop-blur">
            <Button asChild variant="ghost">
              <Link to="/portal/community/marketplace/mine">Cancel</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={save.isPending}
              onClick={() => submitIt(false)}
            >
              Save draft
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Saving…
                </>
              ) : live ? (
                'Submit revision for review'
              ) : (
                'Submit for review'
              )}
            </Button>
          </div>
        </form>
        <aside className="grid gap-3 lg:sticky lg:top-4 lg:col-span-2" aria-label="Preview">
          <h2 className="font-heading font-medium text-navy">Preview</h2>
          <ListingCard
            to={false}
            data={{
              listing: { ...form, id: 'preview', price: mode === 'price' ? form.price : undefined },
              companyName: company?.name ?? 'Your company',
              companyLogo: company?.logo,
            }}
          />
          <p className="text-muted-foreground text-xs">
            This is how your listing appears in Products and Services once published.
          </p>
        </aside>
      </div>
    </div>
  )
}

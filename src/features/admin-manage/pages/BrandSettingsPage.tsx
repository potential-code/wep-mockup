import { Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettings } from '@/queries/admin.queries'
import { Field } from '../components/common'

const LOGOS = [
  { src: '/brand/unwomen.png', name: 'UN Women', dark: false },
  { src: '/brand/ungc.png', name: 'UN Global Compact', dark: false },
  { src: '/brand/weps-logo-white.png', name: 'WEPs lockup (white)', dark: true },
]
const TOKENS = [
  { name: 'Navy', hex: '#153B55', use: 'Text and dark sections' },
  { name: 'Blue', hex: '#167CB3', use: 'Primary actions' },
  { name: 'Surface', hex: '#F4F7FA', use: 'Page background' },
  { name: 'Gold', hex: '#D6A44A', use: 'Small warm accents' },
]
const LANGUAGES = [
  { name: 'English', active: true },
  { name: 'French', active: false },
  { name: 'Spanish', active: false },
  { name: 'Arabic', active: false },
]

export function BrandSettingsPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const [links, setLinks] = useState({
    help: 'mailto:weps-support@example.org',
    privacy: 'https://example.org/privacy',
    terms: 'https://example.org/terms',
  })

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isLoading || !data) return <PageSkeleton />

  return (
    <div>
      <PageHeader
        title="Brand and General Settings"
        description="Approved brand assets, theme, languages, support links and integrations."
      />
      <div className="grid gap-6">
        <SectionCard
          title="Approved logos"
          description="Official marks cannot be edited, recoloured or replaced in the portal."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {LOGOS.map((l) => (
              <figure key={l.src} className="grid gap-2">
                <div
                  className={`grid h-28 place-items-center rounded-xl border p-4 ${l.dark ? 'bg-navy' : 'bg-white'}`}
                >
                  <img
                    src={l.src}
                    alt={`${l.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-navy">{l.name}</span>
                  <StatusBadge tone="locked" icon={Lock}>
                    Locked
                  </StatusBadge>
                </figcaption>
              </figure>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Theme tokens"
          description="Read-only. Provisional, verify with UN Women before launch."
        >
          <DemoLabel className="mb-3">Provisional</DemoLabel>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TOKENS.map((t) => (
              <li key={t.name} className="overflow-hidden rounded-xl border">
                <div
                  className="h-16"
                  style={{ backgroundColor: t.hex }}
                  role="img"
                  aria-label={`${t.name} swatch ${t.hex}`}
                />
                <div className="p-3 text-sm">
                  <p className="font-medium text-navy">
                    {t.name} <span className="font-normal text-muted-foreground">{t.hex}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">{t.use}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Languages">
            <ul className="grid gap-2">
              {LANGUAGES.map((l) => (
                <li
                  key={l.name}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span className="font-medium text-navy">{l.name}</span>
                  {l.active ? (
                    <StatusBadge tone="success">Active</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Planned</StatusBadge>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted-foreground text-xs">
              Only English is live in this mockup.
            </p>
          </SectionCard>

          <SectionCard title="Support links">
            <div className="grid gap-3">
              <Field label="Help and support">
                <Input
                  value={links.help}
                  onChange={(e) => setLinks((l) => ({ ...l, help: e.target.value }))}
                />
              </Field>
              <Field label="Privacy notice">
                <Input
                  value={links.privacy}
                  onChange={(e) => setLinks((l) => ({ ...l, privacy: e.target.value }))}
                />
              </Field>
              <Field label="Terms of use">
                <Input
                  value={links.terms}
                  onChange={(e) => setLinks((l) => ({ ...l, terms: e.target.value }))}
                />
              </Field>
              <Button
                className="justify-self-start"
                onClick={() => toast.success('Support links saved (demo)')}
              >
                Save links
              </Button>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Integrations"
          description="Status and purpose only. No keys or credentials are stored in the portal mockup."
        >
          <ul className="grid gap-2">
            {data.integrations.map((i) => (
              <li
                key={i.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-navy">{i.name}</p>
                  <p className="text-muted-foreground">{i.purpose}</p>
                </div>
                {i.status === 'simulated' ? (
                  <StatusBadge tone="info">Simulated</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Not configured</StatusBadge>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}

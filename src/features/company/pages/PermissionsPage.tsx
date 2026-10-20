import { fullName } from '@shared/permissions'
import { DEFAULT_ADMIN_PERMISSIONS, departmentLabel, PERMISSIONS } from '@shared/reference'
import type { CompanyPermission } from '@shared/types'
import { useSearch } from '@tanstack/react-router'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/use-session'
import {
  type TeamMember,
  useAssignAdministrator,
  useTeam,
  useUpdatePermissions,
} from '@/queries/company.queries'
import { AdminList } from '../components/AdminList'
import { FormField } from '../components/FormField'
import { InviteDialog } from '../components/InviteDialog'
import { PermissionToggles, permissionLabel } from '../components/PermissionToggles'
import { TeamTabs } from '../components/TeamTabs'

export function PermissionsPage() {
  const { company } = useCurrentUser()
  const team = useTeam(company?.id)
  const preselect = (useSearch({ strict: false }) as { user?: string }).user
  const assign = useAssignAdministrator()
  const update = useUpdatePermissions()
  const [selected, setSelected] = useState<string>('')
  const [perms, setPerms] = useState<CompanyPermission[]>(DEFAULT_ADMIN_PERMISSIONS)
  const [confirming, setConfirming] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [revoking, setRevoking] = useState<TeamMember | null>(null)

  const members = team.data ?? []
  const candidates = members.filter(
    (m) => m.role !== 'ceo' && m.invitationStatus === 'accepted' && !m.suspended,
  )
  const admins = members.filter((m) => m.role === 'company_admin' && !m.suspended)
  const ceo = members.find((m) => m.role === 'ceo')
  const target = members.find((m) => m.id === selected)

  const choose = (id: string) => {
    setSelected(id)
    const m = members.find((x) => x.id === id)
    setPerms(m?.role === 'company_admin' ? m.permissions : DEFAULT_ADMIN_PERMISSIONS)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: preselect once when the team has loaded
  useEffect(() => {
    if (preselect && team.data && !selected) choose(preselect)
  }, [preselect, team.data])

  if (team.isLoading) return <PageSkeleton />
  if (team.isError)
    return <ErrorState message="The team couldn’t load." onRetry={() => team.refetch()} />

  const sensitive = perms.filter((p) => PERMISSIONS.find((x) => x.id === p)?.sensitive)
  const grant = () => {
    if (!target) return
    const done = () => {
      toast.success(`${fullName(target)} now holds ${perms.length} company rights`)
      setConfirming(false)
      setSelected('')
      setPerms(DEFAULT_ADMIN_PERMISSIONS)
    }
    if (target.role === 'company_admin')
      update.mutate({ userId: target.id, permissions: perms }, { onSuccess: done })
    else assign.mutate({ userId: target.id, permissions: perms }, { onSuccess: done })
  }

  return (
    <div className="grid gap-1">
      <TeamTabs active="permissions" />
      <PageHeader
        title="Permissions and delegation"
        description="Choose what each company administrator can do."
        actions={
          <Button variant="outline" onClick={() => setInviting(true)}>
            <UserPlus aria-hidden /> Invite a new administrator
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="grid content-start gap-6 lg:col-span-3">
          <SectionCard
            title="Delegate to a colleague"
            description="New administrators start with operational rights only."
          >
            <div className="grid gap-5">
              <FormField id="perm-user" label="Colleague">
                <Select value={selected} onValueChange={choose}>
                  <SelectTrigger id="perm-user" className="w-full">
                    <SelectValue placeholder="Choose an active colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {fullName(m)} · {departmentLabel(m.department)}
                        {m.role === 'company_admin' ? ' (administrator)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div
                className={target ? '' : 'pointer-events-none opacity-50'}
                aria-disabled={!target}
              >
                <p className="mb-2 font-medium text-navy text-sm">Permissions</p>
                <PermissionToggles value={perms} onChange={setPerms} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                  {perms.length} of {PERMISSIONS.length} rights selected
                </p>
                <Button
                  disabled={!target || perms.length === 0}
                  onClick={() => setConfirming(true)}
                >
                  <ShieldCheck aria-hidden /> Review and grant
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
        <div className="lg:col-span-2">
          <AdminList
            ceo={ceo}
            admins={admins}
            onEdit={(m) => {
              choose(m.id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onRevoke={setRevoking}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Grant rights to ${target ? fullName(target) : ''}?`}
        confirmLabel="Grant permissions"
        pending={assign.isPending || update.isPending}
        onConfirm={grant}
        description={
          <div className="grid gap-3 text-sm">
            <p>{target ? fullName(target) : 'This colleague'} will be able to:</p>
            <ul className="list-disc ps-5">
              {perms.map((p) => (
                <li key={p}>{permissionLabel(p)}</li>
              ))}
            </ul>
            {sensitive.length ? (
              <p className="rounded-lg bg-coral-50 p-3 text-coral-700">
                Includes sensitive rights: {sensitive.map(permissionLabel).join(', ')}. These act on
                the company’s behalf with UN Women or involve payment.
              </p>
            ) : null}
            <p>They are notified immediately. You can change this at any time.</p>
          </div>
        }
      />
      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(o) => !o && setRevoking(null)}
        title={`Remove ${revoking ? fullName(revoking) : ''}’s administrator rights?`}
        description="They stay on the team as an employee. Past work and evidence are kept."
        confirmLabel="Remove rights"
        destructive
        pending={update.isPending}
        onConfirm={() =>
          revoking &&
          update.mutate(
            { userId: revoking.id, permissions: [] },
            {
              onSuccess: () => {
                toast.success('Administrator rights removed')
                setRevoking(null)
              },
            },
          )
        }
      />
      <InviteDialog open={inviting} onOpenChange={setInviting} adminByDefault />
    </div>
  )
}

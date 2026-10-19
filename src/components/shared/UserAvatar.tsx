import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string
  className?: string
}) {
  const initials = name
    .replace(/^Dr\s+/, '')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return (
    <Avatar className={cn('size-9', className)}>
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback className="bg-blue-50 font-semibold text-blue text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function CompanyLogo({
  name,
  src,
  className,
}: {
  name: string
  src?: string
  className?: string
}) {
  return src ? (
    <img
      src={src}
      alt={`${name} logo`}
      className={cn('size-12 rounded-xl border bg-white object-contain p-1', className)}
    />
  ) : (
    <span
      className={cn(
        'grid size-12 place-items-center rounded-xl bg-secondary font-heading font-bold text-navy',
        className,
      )}
      aria-hidden
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

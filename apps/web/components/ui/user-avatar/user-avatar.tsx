'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, userDisplayName, userInitials, type UserAvatarUser } from '@/lib/utils'

const userAvatarVariants = cva(
  'border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_10%,#ffffff)] text-primary after:rounded-[var(--radius)]',
  {
    variants: {
      size: {
        sm: 'size-9 text-xs',
        default: 'size-11 text-sm',
        lg: 'size-12 text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type { UserAvatarUser }

export type UserAvatarProps = {
  user: UserAvatarUser
  className?: string
  /** Accessible label; defaults from name/email. */
  label?: string
} & VariantProps<typeof userAvatarVariants>

/**
 * Reusable profile avatar — image when present, initials fallback otherwise.
 * Use after successful sign-in / sign-up wherever a user face is needed.
 */
export function UserAvatar({ user, size = 'default', className, label }: UserAvatarProps) {
  const initials = userInitials(user)
  const title = label ?? userDisplayName(user)
  const image = user.image?.trim() || undefined

  return (
    <Avatar
      data-slot="user-avatar"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      className={cn(
        'rounded-[var(--radius)] after:rounded-[var(--radius)]',
        userAvatarVariants({ size }),
        className,
      )}
      aria-label={title}
    >
      {image ? (
        <AvatarImage
          src={image}
          alt=""
          className="rounded-[var(--radius)]"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          'rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--accent)_12%,#ffffff)] font-semibold tracking-[0.04em] text-primary',
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

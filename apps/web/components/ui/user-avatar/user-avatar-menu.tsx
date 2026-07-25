'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { Coins, LogOut } from 'lucide-react'
import { WEB_ACCOUNT_CREDITS } from '@customarc/shared/constants'
import { authClient } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/ui/user-avatar/user-avatar'
import { cn, userDisplayName, type UserAvatarUser } from '@/lib/utils'

export type UserAvatarMenuProps = {
  user: UserAvatarUser
  className?: string
  /** Called after sign-out succeeds. */
  onSignedOut?: () => void
}

/**
 * Header-ready avatar with account menu (credits + sign out).
 * Renders only when a signed-in `user` is passed.
 */
export function UserAvatarMenu({ user, className, onSignedOut }: UserAvatarMenuProps) {
  const router = useRouter()
  const label = userDisplayName(user)

  async function signOut() {
    await authClient.signOut()
    onSignedOut?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${label}`}
        className={cn(
          'inline-flex shrink-0 rounded-[var(--radius)] outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/50',
          className,
        )}
      >
        <UserAvatar user={user} size="default" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[120] min-w-52 rounded-[var(--radius)] border-[var(--border-strong)] bg-[rgba(255,252,253,0.97)] p-1 shadow-[0_8px_22px_rgba(196,92,106,0.08)] backdrop-blur-[16px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <span className="block truncate text-sm font-semibold text-foreground">{label}</span>
            {user.email ? (
              <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => router.push(WEB_ACCOUNT_CREDITS as Route)}
          >
            <Coins data-icon="inline-start" />
            Credits
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-2"
            onClick={() => void signOut()}
          >
            <LogOut data-icon="inline-start" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

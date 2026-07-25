import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type UserAvatarUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

/** Initials from display name, else email local-part. */
export function userInitials(user: UserAvatarUser): string {
  const name = user.name?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  const local = user.email?.split('@')[0]?.trim()
  if (local) return local.slice(0, 2).toUpperCase()
  return '?'
}

export function userDisplayName(user: UserAvatarUser): string {
  return user.name?.trim() || user.email?.trim() || 'Account'
}

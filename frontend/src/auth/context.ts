import { createContext, useContext } from 'react'
import type { Profile } from '@/types/db'

export interface SessionValue {
  /** null when nobody is logged in (a visitor). */
  profile: Profile | null
  signIn: (profileId: string) => void
  signOut: () => void
}

export const SessionContext = createContext<SessionValue | null>(null)

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}

/** Where a profile belongs by default. Used after login and by the guards. */
export function homePathFor(profile: Profile | null): string {
  if (!profile) return '/'
  if (profile.role === 'mentor') return '/admin/applications'
  if (profile.status === 'active') return '/learn'
  return '/status'
}

/**
 * MOCK auth. The session is just "which profile id is logged in", kept in
 * localStorage. Replace with Supabase auth; the useSession() shape can stay.
 */
import { useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { SessionContext } from '@/auth/context'
import { getState, subscribe } from '@/data/store'

const SESSION_KEY = 'sti-demo-session'

function readSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function writeSession(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage unavailable: the session lasts for this tab only.
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(readSession)

  // Re-reads on every store change, so a status change by the mentor shows up at once.
  // Updates are immutable, so the snapshot is stable until this profile changes.
  const profile = useSyncExternalStore(subscribe, () =>
    userId ? (getState().profiles.find((p) => p.id === userId) ?? null) : null,
  )

  const signIn = useCallback((id: string) => {
    writeSession(id)
    setUserId(id)
  }, [])

  const signOut = useCallback(() => {
    writeSession(null)
    setUserId(null)
  }, [])

  const value = useMemo(() => ({ profile, signIn, signOut }), [profile, signIn, signOut])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

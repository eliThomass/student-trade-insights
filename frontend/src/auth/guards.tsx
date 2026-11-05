/**
 * Route guards from the blueprint's guard rules. In the real build these run
 * in middleware and RLS is the actual security boundary; in the mockup they
 * are the only check.
 */
import { Navigate, Outlet, useLocation } from 'react-router'
import { homePathFor, useSession } from '@/auth/context'

function useLoginRedirect() {
  const location = useLocation()
  return `/login?next=${encodeURIComponent(location.pathname + location.search)}`
}

/** Student pages: only `active` students. Everyone else is sent where they belong. */
export function RequireActiveStudent() {
  const { profile } = useSession()
  const login = useLoginRedirect()
  if (!profile) return <Navigate to={login} replace />
  if (profile.role === 'mentor') return <Navigate to={homePathFor(profile)} replace />
  if (profile.status !== 'active') return <Navigate to="/status" replace />
  return <Outlet />
}

/** /admin/*: mentor only. */
export function RequireMentor() {
  const { profile } = useSession()
  const login = useLoginRedirect()
  if (!profile) return <Navigate to={login} replace />
  if (profile.role !== 'mentor') return <Navigate to={homePathFor(profile)} replace />
  return <Outlet />
}

/** /status: logged-in students who aren't active yet. */
export function RequirePendingStudent() {
  const { profile } = useSession()
  const login = useLoginRedirect()
  if (!profile) return <Navigate to={login} replace />
  if (profile.role === 'mentor' || profile.status === 'active') return <Navigate to={homePathFor(profile)} replace />
  return <Outlet />
}

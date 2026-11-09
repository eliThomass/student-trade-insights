import type { ComponentType, ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { useSession } from '@/auth/context'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

export interface ShellNavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  /** Small count shown next to the label, e.g. pending applications. */
  count?: number
}

interface AppShellProps {
  nav: ShellNavItem[]
  /** Label under the logo, e.g. "Mentor". */
  area?: string
  /** Rendered in the top bar, e.g. the library search. */
  topBar?: ReactNode
  homeTo: string
}

/** Sidebar shell for the student portal and the mentor admin. On mobile the sidebar becomes a bottom tab bar. */
export function AppShell({ nav, area, topBar, homeTo }: AppShellProps) {
  const { profile, signOut } = useSession()
  const navigate = useNavigate()

  const logOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-paper md:grid md:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-line bg-mist md:flex">
        <div className="px-5 pt-5 pb-6">
          <Logo to={homeTo} />
          {area && <p className="mt-1.5 ml-[38px] inline-block rounded bg-mentor-soft px-1.5 py-0.5 text-xs font-semibold text-mentor">{area}</p>}
        </div>
        <nav aria-label="Sections" className="flex flex-col gap-0.5 px-3">
          {nav.map(({ to, label, icon: Icon, count }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-raised text-ink ring-1 ring-line' : 'text-slate hover:bg-raised/60 hover:text-ink',
                )
              }
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              {count ? <span className="tabular rounded-full bg-hold-soft px-1.5 text-xs text-hold">{count}</span> : null}
            </NavLink>
          ))}
        </nav>
        {profile && (
          <div className="mt-auto flex items-center gap-3 border-t border-line px-5 py-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent" aria-hidden>
              {initials(profile.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{profile.name}</p>
              <p className="truncate text-xs text-slate">{profile.email}</p>
            </div>
            <button type="button" onClick={logOut} className="rounded-md p-1.5 text-slate hover:bg-raised hover:text-ink" aria-label="Log out" title="Log out">
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className={cn('sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-8', !topBar && 'md:hidden')}>
          <div className="md:hidden">
            <Logo to={homeTo} />
          </div>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 md:ml-0 md:justify-start">{topBar}</div>
          <button type="button" onClick={logOut} className="rounded-md p-2 text-slate hover:bg-raised hover:text-ink md:hidden" aria-label="Log out">
            <LogOut className="size-4" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pt-8 pb-28 sm:px-8 md:pb-16">
          <Outlet />
        </main>
      </div>

      <nav aria-label="Sections" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {nav.map(({ to, label, icon: Icon, count }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn('relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold', isActive ? 'text-accent' : 'text-slate')}
          >
            <Icon className="size-5" />
            {label}
            {count ? <span className="tabular absolute top-1.5 left-1/2 ml-2 rounded-full bg-hold px-1 text-[10px] text-on-fill">{count}</span> : null}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

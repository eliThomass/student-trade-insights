import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { homePathFor, useSession } from '@/auth/context'
import { Logo } from '@/components/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { site } from '@/config/site'

const sectionLinks = [
  { href: '/#approach', label: 'Approach' },
  { href: '/#included', label: "What's included" },
  { href: '/#results', label: 'Results' },
  { href: '/#faq', label: 'FAQ' },
]

export function PublicLayout() {
  const { profile } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMenuOpen(false)
  }

  const account = profile ? (
    <ButtonLink to={homePathFor(profile)} variant="secondary">
      {profile.role === 'mentor' ? 'Mentor dashboard' : profile.status === 'active' ? 'Go to portal' : 'Application status'}
    </ButtonLink>
  ) : (
    <>
      <NavLink to="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-slate hover:text-ink">
        Log in
      </NavLink>
      <ButtonLink to="/apply">Apply for mentorship</ButtonLink>
    </>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {sectionLinks.map((l) => (
              <a key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-semibold text-slate hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">{account}</div>
          <button
            type="button"
            className="-mr-2 rounded-md p-2 text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {menuOpen && (
          <div id="mobile-menu" className="border-t border-line bg-paper px-4 pt-2 pb-5 lg:hidden">
            <nav aria-label="Main" className="flex flex-col">
              {sectionLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="border-b border-line py-3 font-semibold text-ink">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-2">{account}</div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-mist">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-3 text-sm text-slate">
                One-on-one mentorship in {site.markets} trading, by application only.
              </p>
            </div>
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
              <Link to="/apply" className="text-slate hover:text-ink">Apply</Link>
              <a href={site.social.youtube} className="text-slate hover:text-ink">YouTube</a>
              <Link to="/login" className="text-slate hover:text-ink">Student login</Link>
              <a href={site.social.x} className="text-slate hover:text-ink">X</a>
              <a href={`mailto:${site.contactEmail}`} className="text-slate hover:text-ink">Contact</a>
              <a href={site.social.discord} className="text-slate hover:text-ink">Discord</a>
            </nav>
          </div>
          <div className="mt-10 border-t border-line pt-6">
            <h2 className="text-xs font-semibold text-ink">Risk disclaimer</h2>
            <div className="mt-2 max-w-[90ch] space-y-2 text-xs leading-relaxed text-slate">
              {site.disclaimer.full.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate">© 2026 {site.brandName}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

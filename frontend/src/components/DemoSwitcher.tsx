/**
 * DEMO ONLY. Lets the viewer switch between demo accounts and reset the mock
 * data. Remove when real auth replaces the mock session.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Check, ChevronUp, RotateCcw, UserRound } from 'lucide-react'
import { homePathFor, useSession } from '@/auth/context'
import { personas } from '@/auth/personas'
import { useToast } from '@/components/ui/toast-context'
import { getDemoSettings, getProfile, resetDemoData, setSimulateRankingFailure } from '@/data/api'
import { getVersion, subscribe } from '@/data/store'
import { cn } from '@/lib/cn'

export function DemoSwitcher() {
  const { profile, signIn, signOut } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  useSyncExternalStore(subscribe, getVersion)
  const settings = getDemoSettings()

  const inAppShell = /^\/(learn|resources|sessions|admin)/.test(location.pathname)
  const current = personas.find((p) => p.profileId === (profile?.id ?? null))
  const currentLabel = current?.label ?? profile?.name ?? 'Visitor'

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const choose = async (profileId: string | null) => {
    setOpen(false)
    if (!profileId) {
      signOut()
      navigate('/')
      return
    }
    signIn(profileId)
    navigate(homePathFor(await getProfile(profileId)))
  }

  return (
    <div
      ref={panel}
      className={cn('fixed left-4 z-40 sm:left-6', inAppShell ? 'bottom-[76px] md:bottom-6 md:left-[256px]' : 'bottom-4 sm:bottom-6')}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {open && (
        <div role="dialog" aria-label="Demo controls" className="mb-2 w-72 rounded-lg border border-line bg-paper p-2 shadow-xl">
          <p className="px-2 pt-1 pb-2 text-xs text-slate">Mockup demo. View the site as:</p>
          {personas.map((p) => {
            const active = p === current
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => choose(p.profileId)}
                className={cn('flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-mist', active && 'bg-accent-soft hover:bg-accent-soft')}
              >
                <Check className={cn('mt-0.5 size-4 shrink-0', active ? 'text-accent' : 'invisible')} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-ink">{p.label}</span>
                  <span className="block text-xs text-slate">{p.description}</span>
                </span>
              </button>
            )
          })}
          <div className="mt-2 space-y-1 border-t border-line pt-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-ink hover:bg-mist">
              <input
                type="checkbox"
                checked={settings.simulateRankingFailure}
                onChange={(e) => setSimulateRankingFailure(e.target.checked)}
                className="size-4 accent-accent"
              />
              Simulate AI ranking failure
            </label>
            <button
              type="button"
              onClick={() => {
                resetDemoData()
                setOpen(false)
                toast({ title: 'Demo data reset', detail: 'Applications, students and content are back to the starting state.', tone: 'info' })
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-ink hover:bg-mist"
            >
              <RotateCcw className="size-4 text-slate" aria-hidden />
              Reset demo data
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-ink/10 bg-ink py-2 pr-3 pl-2.5 text-xs font-semibold text-white shadow-lg hover:bg-ink/90"
      >
        <UserRound className="size-4" aria-hidden />
        <span>
          Demo: viewing as <span className="text-white/75">{currentLabel}</span>
        </span>
        <ChevronUp className={cn('size-3.5 transition-transform', !open && 'rotate-180')} aria-hidden />
      </button>
    </div>
  )
}

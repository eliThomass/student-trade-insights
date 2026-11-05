import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { homePathFor, useSession } from '@/auth/context'
import { personas } from '@/auth/personas'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toast-context'
import { findProfileByEmail, getProfile } from '@/data/api'

export default function Login() {
  const { profile, signIn } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (profile && !pending) return <Navigate to={homePathFor(profile)} replace />

  const next = params.get('next')
  const goTo = (p: Awaited<ReturnType<typeof getProfile>>) => {
    const home = homePathFor(p)
    // Only follow ?next= when it's an internal path the user can reach.
    navigate(next && next.startsWith('/') && !next.startsWith('//') && (home !== '/status' || next === '/status') ? next : home, { replace: true })
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const found = await findProfileByEmail(email)
    if (!found || password.length === 0) {
      setPending(false)
      setError('That email and password don’t match an account. Check for typos, or reset your password.')
      return
    }
    signIn(found.id)
    goTo(found)
  }

  const onReset = (e: FormEvent) => {
    e.preventDefault()
    toast({ title: 'Reset link sent', detail: `Email sent to ${email}: “Reset your password”`, tone: 'info' })
    setMode('login')
  }

  const loginAs = async (id: string) => {
    setPending(true)
    signIn(id)
    goTo(await getProfile(id))
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-20">
      <div className="max-w-md">
        {mode === 'login' ? (
          <>
            <h1 className="text-3xl font-bold">Log in</h1>
            <p className="mt-3 text-slate">
              For students and applicants. New here? <Link to="/apply" className="font-semibold text-accent hover:text-accent-strong">Apply for mentorship</Link>.
            </p>
            <form onSubmit={onLogin} className="mt-8 space-y-5" noValidate>
              <Field label="Email">
                {(a11y) => <Input {...a11y} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
              </Field>
              <Field label="Password">
                {(a11y) => <Input {...a11y} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
              </Field>
              {error && (
                <p role="alert" className="text-sm font-medium text-down">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <Button type="submit" pending={pending}>
                  Log in
                </Button>
                <button type="button" onClick={() => setMode('reset')} className="text-sm font-semibold text-accent hover:text-accent-strong">
                  Forgot your password?
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Reset your password</h1>
            <p className="mt-3 text-slate">Enter the email you applied with and we’ll send you a link to set a new password.</p>
            <form onSubmit={onReset} className="mt-8 space-y-5">
              <Field label="Email">
                {(a11y) => <Input {...a11y} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
              </Field>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit">Send reset link</Button>
                <button type="button" onClick={() => setMode('login')} className="text-sm font-semibold text-slate hover:text-ink">
                  Back to log in
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <section aria-labelledby="demo-accounts" className="rounded-xl border border-dashed border-line p-6 lg:self-start">
        <h2 id="demo-accounts" className="font-bold">
          Demo accounts
        </h2>
        <p className="mt-1 text-sm text-slate">
          This mockup has no real accounts. Any seeded email works with any password, or pick one here.
        </p>
        <ul className="mt-5 divide-y divide-line">
          {personas
            .filter((p) => p.profileId)
            .map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-slate">{p.description}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => loginAs(p.profileId!)}>
                  Log in as {p.label.toLowerCase()}
                </Button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}

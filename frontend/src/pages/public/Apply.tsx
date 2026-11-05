import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { homePathFor, useSession } from '@/auth/context'
import { ApplySteps } from '@/components/ApplySteps'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toast-context'
import { applicationQuestions, type ApplicationQuestion } from '@/config/application'
import { site } from '@/config/site'
import { submitApplication } from '@/data/api'

type Values = Record<string, string>
type Errors = Record<string, string>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (!EMAIL.test(values.email ?? '')) errors.email = 'Enter an email address like name@example.com.'
  if ((values.password ?? '').length < 8) errors.password = 'Use at least 8 characters.'
  for (const q of applicationQuestions) {
    const v = (values[q.id] ?? '').trim()
    if (q.required && !v) errors[q.id] = q.kind === 'choice' ? 'Choose an option.' : 'Answer this question.'
    else if (v && q.minLength && v.length < q.minLength) errors[q.id] = `Add a little more detail (at least ${q.minLength} characters).`
  }
  return errors
}

/** DEMO ONLY: a believable application so the mentor can click through quickly. */
const sampleAnswers: Values = {
  name: 'Alex Rivera',
  location: 'Columbus, OH',
  experience: 'Under 1 year',
  markets: 'Futures',
  hours: '5–10 hours',
  goal: 'Trade one setup on MES with a written plan and a fixed risk per trade, and journal every trade so I can review my process each weekend.',
  struggle: 'I take trades in the first few minutes of the open without a plan, and I move my stop when a trade goes against me.',
  feedback: 'My shift manager told me I rushed closing tasks. I asked her to show me the checklist she used, followed it every night for a month, and now I train new staff on it.',
  why_now: 'I have been learning from free videos for a year and keep making the same mistakes.',
}

function Question({ q, value, error, onChange }: { q: ApplicationQuestion; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <Field label={q.label} help={q.help} error={error} optional={!q.required}>
      {(a11y) =>
        q.kind === 'choice' ? (
          <Select {...a11y} name={q.id} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choose one</option>
            {q.options!.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        ) : q.kind === 'long' ? (
          <div>
            <Textarea {...a11y} name={q.id} value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
            {q.minLength && (
              <p className={`tabular mt-1 text-right text-xs ${value.trim().length >= q.minLength ? 'text-up' : 'text-slate'}`}>
                {value.trim().length} / {q.minLength} characters minimum
              </p>
            )}
          </div>
        ) : (
          <Input {...a11y} name={q.id} value={value} onChange={(e) => onChange(e.target.value)} />
        )
      }
    </Field>
  )
}

export default function Apply() {
  const { profile, signIn } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (profile && !pending) return <Navigate to={homePathFor(profile)} replace />

  const set = (id: string) => (v: string) => {
    setValues((prev) => ({ ...prev, [id]: v }))
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const found = validate(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    setPending(true)
    try {
      const answers = Object.fromEntries(applicationQuestions.map((q) => [q.id, (values[q.id] ?? '').trim()]))
      const result = await submitApplication({ email: values.email!, answers })
      signIn(result.profile.id)
      toast({
        title: 'Application submitted',
        detail: `Email sent to ${result.emails[0]!.to}: “${result.emails[0]!.subject}”`,
      })
      navigate('/status')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'The application could not be submitted. Try again.')
      setPending(false)
    }
  }

  const accountFields = (
    <>
      <Field label="Email" error={errors.email} help="We send your decision here.">
        {(a11y) => <Input {...a11y} name="email" type="email" autoComplete="email" value={values.email ?? ''} onChange={(e) => set('email')(e.target.value)} />}
      </Field>
      <Field label="Password" error={errors.password} help="At least 8 characters. You’ll use it to check your status and, once accepted, to log in.">
        {(a11y) => (
          <Input {...a11y} name="password" type="password" autoComplete="new-password" value={values.password ?? ''} onChange={(e) => set('password')(e.target.value)} />
        )}
      </Field>
    </>
  )

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="text-2xl font-bold sm:text-3xl">Apply for mentorship</h1>
          <p className="mt-3 text-slate">
            {site.mentorName} reads every application himself. Honest, specific answers help more than polished ones.
          </p>
          <div className="mt-8 hidden lg:block">
            <ApplySteps current={0} />
          </div>
        </aside>

        <form onSubmit={onSubmit} noValidate className="max-w-2xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-line px-4 py-3 text-sm">
            <span className="text-slate">Demo mockup: skip the typing.</span>
            <Button size="sm" variant="secondary" onClick={() => setValues((v) => ({ ...sampleAnswers, email: v.email || `alex.rivera.${Date.now() % 10000}@example.com`, password: v.password || 'demo-password' }))}>
              Fill with sample answers
            </Button>
          </div>

          <section aria-labelledby="account-heading">
            <h2 id="account-heading" className="text-lg font-bold">
              Your account
            </h2>
            <div className="mt-5 space-y-6">{accountFields}</div>
          </section>

          <section aria-labelledby="application-heading" className="mt-12 border-t border-line pt-10">
            <h2 id="application-heading" className="text-lg font-bold">
              Your application
            </h2>
            <div className="mt-5 space-y-7">
              {applicationQuestions.map((q) => (
                <Question key={q.id} q={q} value={values[q.id] ?? ''} error={errors[q.id]} onChange={set(q.id)} />
              ))}
            </div>
          </section>

          <div className="mt-10 border-t border-line pt-8">
            {submitError && (
              <p role="alert" className="mb-4 rounded-md bg-down-soft px-4 py-3 text-sm font-medium text-down">
                {submitError}
              </p>
            )}
            {Object.values(errors).some(Boolean) && (
              <p role="alert" className="mb-4 text-sm font-medium text-down">
                Some answers need attention. They’re marked above.
              </p>
            )}
            <Button type="submit" size="lg" pending={pending}>
              {pending ? 'Submitting application' : 'Submit application'}
            </Button>
            <p className="mt-3 text-sm text-slate">You’ll hear back within {site.responseTime}.</p>
          </div>
        </form>
      </div>
    </div>
  )
}

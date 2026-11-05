import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Ban, Check, Clock, RefreshCw } from 'lucide-react'
import { Badge, DecisionBadge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState, Loading } from '@/components/ui/misc'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { useToast } from '@/components/ui/toast-context'
import { applicationQuestions } from '@/config/application'
import { decideApplication, getApplication, rerunRanking } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { formatDate } from '@/lib/format'
import type { Decision } from '@/types/db'

type Choice = Exclude<Decision, 'pending'>

export default function ApplicationDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [pending, setPending] = useState<Choice | 'rerun' | null>(null)
  const { data: app, loading } = useQuery(`application:${id}`, () => getApplication(id!))

  if (loading && !app) return <Loading />
  if (!app) {
    return (
      <EmptyState title="Application not found" action={<ButtonLink to="/admin/applications" variant="secondary">Back to applications</ButtonLink>}>
        It may have been removed, or the link is wrong.
      </EmptyState>
    )
  }

  const decide = async (choice: Choice) => {
    setPending(choice)
    try {
      const email = await decideApplication(app.id, choice)
      const verb = { approved: 'Approved', waitlisted: 'Waitlisted', rejected: 'Rejected' }[choice]
      toast({ title: `${verb} ${app.profile.name}`, detail: `Email sent to ${email.to}: “${email.subject}”` })
    } finally {
      setPending(null)
    }
  }

  const rerun = async () => {
    setPending('rerun')
    try {
      const next = await rerunRanking(app.id)
      toast({ title: 'Ranking updated', detail: `AI fit score: ${next.ai_score}` })
    } catch {
      toast({ title: 'Ranking failed again', detail: 'The application is saved. Try again in a few minutes.', tone: 'error' })
    } finally {
      setPending(null)
    }
  }

  return (
    <>
      <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Applications
      </Link>
      <header className="mt-6 mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{app.profile.name}</h1>
          <p className="mt-1 text-slate">
            {app.profile.email}, applied {formatDate(app.created_at)}
          </p>
        </div>
        <DecisionBadge decision={app.decision} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="answers" className="order-2 lg:order-1">
          <h2 id="answers" className="sr-only">
            Answers
          </h2>
          <dl className="space-y-7">
            {applicationQuestions.map((q) => (
              <div key={q.id}>
                <dt className="text-sm font-semibold text-slate">{q.label}</dt>
                <dd className="mt-1.5 max-w-[68ch] leading-relaxed text-ink">{app.answers[q.id] || <span className="text-slate">No answer</span>}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="ai-fit" className="rounded-xl border border-line p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="ai-fit" className="font-bold">
                AI fit
              </h2>
              <ScoreBar score={app.ai_score} />
            </div>
            {app.ai_score === null ? (
              <div className="mt-4">
                <p className="text-sm text-slate">The ranking didn’t run when this application was submitted. The answers are all saved.</p>
                <Button className="mt-4" variant="secondary" size="sm" pending={pending === 'rerun'} onClick={rerun} icon={<RefreshCw className="size-3.5" />}>
                  Re-run ranking
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-relaxed text-ink">{app.ai_summary}</p>
                {!!app.ai_strengths?.length && (
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold text-up">Strengths</h3>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-ink marker:text-up">
                      {app.ai_strengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-5">
                  <h3 className="text-xs font-semibold text-down">Red flags</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {app.ai_flags?.length ? app.ai_flags.map((f) => <Badge key={f} tone="down">{f}</Badge>) : <span className="text-sm text-slate">None found</span>}
                  </div>
                </div>
              </>
            )}
            <p className="mt-5 border-t border-line pt-4 text-xs text-slate">
              Scored only on your criteria and the answers. Name, email and location are never sent to the AI.
            </p>
          </section>

          <section aria-labelledby="decision" className="rounded-xl border border-line p-5">
            <h2 id="decision" className="font-bold">
              Decision
            </h2>
            <p className="mt-1 text-sm text-slate">Each choice emails the applicant right away.</p>
            <div className="mt-4 grid gap-2">
              <Button variant="approve" pending={pending === 'approved'} disabled={!!pending || app.decision === 'approved'} onClick={() => decide('approved')} icon={<Check className="size-4" />}>
                {app.decision === 'approved' ? 'Approved' : 'Approve'}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" pending={pending === 'waitlisted'} disabled={!!pending || app.decision === 'waitlisted'} onClick={() => decide('waitlisted')} icon={<Clock className="size-4" />}>
                  {app.decision === 'waitlisted' ? 'Waitlisted' : 'Waitlist'}
                </Button>
                <Button variant="danger" pending={pending === 'rejected'} disabled={!!pending || app.decision === 'rejected'} onClick={() => decide('rejected')} icon={<Ban className="size-4" />}>
                  {app.decision === 'rejected' ? 'Rejected' : 'Reject'}
                </Button>
              </div>
            </div>
            {app.decision === 'approved' && (
              <p className="mt-4 rounded-md bg-accent-soft px-3 py-2.5 text-sm text-ink">
                Next: once {app.profile.name.split(' ')[0]} pays,{' '}
                <Link to={`/admin/students/${app.user_id}`} className="font-semibold text-accent hover:text-accent-strong">
                  set them to active
                </Link>
                .
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}

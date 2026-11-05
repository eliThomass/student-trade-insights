import { useSession } from '@/auth/context'
import { ApplySteps } from '@/components/ApplySteps'
import { StatusBadge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/misc'
import { site } from '@/config/site'
import { getApplicationForUser } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { formatDate } from '@/lib/format'
import type { ProfileStatus } from '@/types/db'

const copy: Record<Exclude<ProfileStatus, 'active'>, { title: string; body: string; step: 0 | 1 | 2 }> = {
  applicant: {
    title: 'Application received',
    body: `${site.mentorName} reads every application himself. You’ll get an email with a decision within ${site.responseTime}.`,
    step: 1,
  },
  waitlisted: {
    title: 'You’re on the waitlist',
    body: 'There isn’t a spot for you right now, but you keep your place. We’ll email you when one opens, and you don’t need to apply again.',
    step: 1,
  },
  rejected: {
    title: 'Not accepted this time',
    body: 'Thank you for applying. The program isn’t the right fit at the moment, usually because of time available or goals. You’re welcome to apply again in the future.',
    step: 1,
  },
  approved: {
    title: 'You’re accepted',
    body: `The last step is payment. Once ${site.mentorName} confirms it, your portal unlocks and you’ll book your first call.`,
    step: 2,
  },
  inactive: {
    title: 'Your membership is paused',
    body: `Your portal is locked while your membership is inactive. Contact ${site.mentorName} at ${site.contactEmail} to restart.`,
    step: 2,
  },
}

export default function Status() {
  const { profile } = useSession()
  const { data: application, loading } = useQuery(`application-for:${profile!.id}`, () => getApplicationForUser(profile!.id))
  if (!profile || profile.status === 'active') return null
  const c = copy[profile.status]

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_280px] lg:gap-20">
        <div className="max-w-2xl">
          <StatusBadge status={profile.status} />
          <h1 className="mt-4 text-3xl font-bold">{c.title}</h1>
          <p className="mt-4 text-lg text-slate">{c.body}</p>

          {profile.status === 'approved' && (
            <div className="mt-8 rounded-xl border border-accent/25 bg-accent-soft p-6">
              <h2 className="font-bold text-ink">How to pay</h2>
              <p className="mt-1 text-sm text-slate">
                Send payment by either method below and include your email ({profile.email}) in the note.
              </p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-paper p-4">
                  <dt className="text-sm text-slate">Venmo</dt>
                  <dd className="mt-1 font-semibold">{site.payment.venmo}</dd>
                </div>
                <div className="rounded-lg bg-paper p-4">
                  <dt className="text-sm text-slate">PayPal</dt>
                  <dd className="mt-1 font-semibold break-all">{site.payment.paypal}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-slate">
                Payment is confirmed by hand, usually within a day. This page updates as soon as it is.
              </p>
            </div>
          )}

          <div className="mt-10 border-t border-line pt-6 text-sm text-slate">
            {loading ? (
              <Loading />
            ) : application ? (
              <p>
                Application submitted {formatDate(application.created_at)} as {profile.email}.
              </p>
            ) : (
              <p>Signed in as {profile.email}.</p>
            )}
          </div>
        </div>
        <aside className="lg:pt-10">
          <ApplySteps current={c.step} />
        </aside>
      </div>
    </div>
  )
}

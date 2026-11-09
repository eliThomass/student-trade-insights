import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { Tabs } from '@/components/ui/Tabs'
import { listApplications } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { formatShortDate } from '@/lib/format'
import type { Decision } from '@/types/db'

const tabs: { value: Decision; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const emptyCopy: Record<Decision, string> = {
  pending: 'No applications waiting. New ones appear here, ranked, as soon as they’re submitted.',
  waitlisted: 'Nobody is on the waitlist.',
  approved: 'No approved applications yet.',
  rejected: 'No rejected applications.',
}

export default function Applications() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as Decision | null) ?? 'pending'
  const [query, setQuery] = useState('')
  const { data } = useQuery('admin-applications', listApplications)

  if (!data) return <Loading />
  const q = query.trim().toLowerCase()
  const rows = data.filter((a) => a.decision === status && (!q || a.profile.name.toLowerCase().includes(q) || a.profile.email.toLowerCase().includes(q)))
  const unranked = data.filter((a) => a.decision === 'pending' && a.ai_score === null).length

  return (
    <>
      <PageHeader title="Applications" description="Sorted by AI fit score. The score only sorts and summarizes; every decision is yours." />

      {unranked > 0 && status === 'pending' && (
        <p className="mb-6 flex items-start gap-2.5 rounded-lg bg-hold-soft px-4 py-3 text-sm text-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-hold" aria-hidden />
          {unranked === 1 ? '1 application isn’t ranked yet' : `${unranked} applications aren’t ranked yet`} because the AI ranking failed. They’re at the bottom of the
          list. Open one to re-run the ranking.
        </p>
      )}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Tabs<Decision>
          label="Filter by status"
          value={status}
          onChange={(v) => setParams(v === 'pending' ? {} : { status: v })}
          items={tabs.map((t) => ({ ...t, count: data.filter((a) => a.decision === t.value).length }))}
          className="sm:flex-1"
        />
        <div className="relative sm:mb-2 sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate" aria-hidden />
          <label htmlFor="app-search" className="sr-only">
            Search by name or email
          </label>
          <input
            id="app-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="h-9 w-full rounded-md border border-line pr-3 pl-9 text-sm placeholder:text-slate/80 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState title={q ? `No ${status} applications match “${query}”` : 'Nothing here'}>{q ? 'Check the spelling, or search by email.' : emptyCopy[status]}</EmptyState>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line text-sm text-slate">
                  <th scope="col" className="py-2.5 pr-4 font-semibold">AI fit</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Applicant</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Hours a week</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Flags</th>
                  <th scope="col" className="py-2.5 text-right font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => (
                  <tr key={a.id} className="group relative hover:bg-raised">
                    <td className="py-4 pr-4 pl-1">
                      <ScoreBar score={a.ai_score} />
                    </td>
                    <td className="py-4 pr-4">
                      <Link to={`/admin/applications/${a.id}`} className="font-semibold text-ink after:absolute after:inset-0 group-hover:text-accent">
                        {a.profile.name}
                      </Link>
                      <p className="text-sm text-slate">{a.answers.experience}</p>
                    </td>
                    <td className="py-4 pr-4 text-sm text-ink">{a.answers.hours}</td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {a.ai_flags?.length ? a.ai_flags.map((f) => <Badge key={f} tone="down">{f}</Badge>) : <span className="text-sm text-slate">None</span>}
                      </div>
                    </td>
                    <td className="tabular py-4 pr-1 text-right text-sm text-slate">{formatShortDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-line rounded-xl border border-line md:hidden">
              {rows.map((a) => (
                <li key={a.id}>
                  <Link to={`/admin/applications/${a.id}`} className="block px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{a.profile.name}</span>
                      <ScoreBar score={a.ai_score} />
                    </div>
                    <p className="mt-1 text-sm text-slate">
                      {a.answers.hours} a week, applied {formatShortDate(a.created_at)}
                    </p>
                    {!!a.ai_flags?.length && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {a.ai_flags.map((f) => (
                          <Badge key={f} tone="down">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}

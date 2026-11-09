import { useState } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc'
import { Tabs } from '@/components/ui/Tabs'
import { listStudents } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { formatShortDate } from '@/lib/format'
import type { ProfileStatus } from '@/types/db'

type Filter = 'active' | 'approved' | 'inactive' | 'all'

/** Applicants, waitlisted and rejected people live in the applications inbox, so "All" means members. */
const memberStatuses: ProfileStatus[] = ['active', 'approved', 'inactive']

export default function Students() {
  const [filter, setFilter] = useState<Filter>('active')
  const { data } = useQuery('admin-students', listStudents)
  if (!data) return <Loading />

  const members = data.filter((s) => memberStatuses.includes(s.status))
  const rows = filter === 'all' ? members : members.filter((s) => s.status === filter)
  const count = (st: ProfileStatus) => members.filter((s) => s.status === st).length

  return (
    <>
      <PageHeader title="Students" description="Everyone accepted into the program. Set a student to active once they’ve paid." />
      <Tabs<Filter>
        label="Filter by status"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'active', label: 'Active', count: count('active') },
          { value: 'approved', label: 'Awaiting payment', count: count('approved') },
          { value: 'inactive', label: 'Inactive', count: count('inactive') },
          { value: 'all', label: 'All', count: members.length },
        ]}
      />
      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState title="No students here">
            {filter === 'approved' ? 'Approved applicants show up here until you confirm their payment.' : 'Students appear here once they’re approved.'}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {rows.map((s) => (
              <li key={s.id}>
                <Link to={`/admin/students/${s.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 hover:bg-raised sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:px-5">
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{s.name}</span>
                    <span className="block truncate text-sm text-slate">{s.email}</span>
                  </span>
                  <span className="justify-self-end sm:justify-self-start">
                    <StatusBadge status={s.status} />
                  </span>
                  <span className="tabular text-sm text-slate">
                    {s.last_session ? `Last session ${formatShortDate(s.last_session)}` : 'No sessions yet'}
                  </span>
                  <span className="tabular text-sm text-slate sm:text-right">{s.completed_modules} modules done</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

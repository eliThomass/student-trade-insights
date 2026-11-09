import { useState } from 'react'
import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { useSession } from '@/auth/context'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc'
import { Tabs } from '@/components/ui/Tabs'
import { libraryTiers, tierOf, type TierName } from '@/config/library'
import { getCompletedModules, listModules } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { cn } from '@/lib/cn'
import { readingMinutes } from '@/lib/lesson'
import type { Module } from '@/types/db'

type Filter = 'all' | TierName

function ModuleRow({ m, position, done, next }: { m: Module; position: number; done: boolean; next: boolean }) {
  const extraTags = m.tags.filter((t) => !tierOf([t]) && t !== 'Start here')
  return (
    <li>
      <Link
        to={`/learn/${m.slug}`}
        className={cn('group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-raised sm:px-5', next && 'bg-accent-soft/50 hover:bg-accent-soft')}
      >
        <span
          className={cn(
            'tabular grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold',
            done ? 'bg-up text-on-fill' : next ? 'border-2 border-accent text-accent' : 'border border-line text-slate',
          )}
        >
          {done ? <Check className="size-4" aria-label="Completed" /> : position}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink group-hover:text-accent">{m.title}</span>
          <span className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-slate">
            <span>{readingMinutes(m)} min</span>
            {extraTags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </span>
        </span>
        {next && <span className="hidden text-sm font-semibold text-accent sm:block">Up next</span>}
      </Link>
    </li>
  )
}

export default function Learn() {
  const { profile } = useSession()
  const [filter, setFilter] = useState<Filter>('all')
  const { data } = useQuery(`learn:${profile!.id}`, async () => {
    const [modules, completed] = await Promise.all([listModules(), getCompletedModules(profile!.id)])
    return { modules, completed: new Set(completed) }
  })

  if (!data) return <Loading />
  const { modules, completed } = data
  if (modules.length === 0) {
    return (
      <>
        <PageHeader title="Learn" />
        <EmptyState title="No lessons published yet">Your mentor is adding the first modules. Check back after your first call.</EmptyState>
      </>
    )
  }

  const position = new Map(modules.map((m, i) => [m.id, i + 1]))
  const next = modules.find((m) => !completed.has(m.id))
  const doneCount = modules.filter((m) => completed.has(m.id)).length
  const tiers = libraryTiers.filter((t) => filter === 'all' || t.name === filter)

  return (
    <>
      <PageHeader title="Learn" description="Work through the library in order. Each module builds on the one before it." />

      {/* The single "Start here" path */}
      <section aria-labelledby="up-next" className="mb-10 rounded-xl border border-line p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <p id="up-next" className="text-sm font-semibold text-accent">
              {doneCount === 0 ? 'Start here' : next ? 'Up next' : 'Library complete'}
            </p>
            <h2 className="mt-1 text-xl font-bold">{next ? next.title : 'You’ve finished every published module'}</h2>
            <p className="mt-1 text-sm text-slate">
              {next ? `Module ${position.get(next.id)} of ${modules.length}, ${tierOf(next.tags) ?? 'Library'}` : 'New modules will appear here as they’re published.'}
            </p>
          </div>
          {next && (
            <ButtonLink to={`/learn/${next.slug}`}>{doneCount === 0 ? 'Start the first lesson' : 'Continue'}</ButtonLink>
          )}
        </div>
        <div className="mt-6">
          <div className="flex gap-1" aria-hidden>
            {modules.map((m) => (
              <span key={m.id} className={cn('h-1.5 flex-1 rounded-full', completed.has(m.id) ? 'bg-up' : m === next ? 'bg-accent' : 'bg-line')} />
            ))}
          </div>
          <p className="tabular mt-2 text-sm text-slate">
            {doneCount} of {modules.length} modules complete
          </p>
        </div>
      </section>

      <Tabs<Filter>
        label="Filter by tier"
        value={filter}
        onChange={setFilter}
        items={[{ value: 'all', label: 'All' }, ...libraryTiers.map((t) => ({ value: t.name, label: t.name }))]}
      />

      <div className="mt-8 space-y-10">
        {tiers.map((tier) => {
          const items = modules.filter((m) => tierOf(m.tags) === tier.name)
          if (items.length === 0) return null
          return (
            <section key={tier.name} aria-labelledby={`tier-${tier.name}`}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={`tier-${tier.name}`} className="text-lg font-bold">
                  {tier.name}
                </h3>
                <p className="tabular text-sm text-slate">
                  {items.filter((m) => completed.has(m.id)).length} / {items.length} complete
                </p>
              </div>
              <p className="mb-4 max-w-[68ch] text-sm text-slate">{tier.description}</p>
              <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {items.map((m) => (
                  <ModuleRow key={m.id} m={m} position={position.get(m.id)!} done={completed.has(m.id)} next={m === next} />
                ))}
              </ol>
            </section>
          )
        })}
      </div>
    </>
  )
}

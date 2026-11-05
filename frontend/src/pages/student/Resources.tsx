import { useState } from 'react'
import { ResourceList } from '@/components/library/ResourceList'
import { Button } from '@/components/ui/Button'
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc'
import { Tabs } from '@/components/ui/Tabs'
import { listModules, listResources } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { cn } from '@/lib/cn'
import type { ResourceType } from '@/types/db'

type TypeFilter = 'all' | ResourceType

export default function Resources() {
  const [type, setType] = useState<TypeFilter>('all')
  const [tag, setTag] = useState<string | null>(null)
  const { data } = useQuery('student-resources', async () => {
    const [resources, modules] = await Promise.all([listResources(), listModules()])
    // Only resources attached to published modules (or to none) are visible to students.
    const published = new Set(modules.map((m) => m.id))
    return { resources: resources.filter((r) => r.module_id === null || published.has(r.module_id)), modules }
  })

  if (!data) return <Loading />
  const tags = [...new Set(data.resources.flatMap((r) => r.tags))].sort()
  const shown = data.resources.filter((r) => (type === 'all' || r.type === type) && (!tag || r.tags.includes(tag)))
  const count = (t: ResourceType) => data.resources.filter((r) => r.type === t).length

  return (
    <>
      <PageHeader title="Resources" description="Checklists, PDFs, links and indicators from every module in one place." />
      <Tabs<TypeFilter>
        label="Filter by type"
        value={type}
        onChange={setType}
        items={[
          { value: 'all', label: 'All', count: data.resources.length },
          { value: 'pdf', label: 'PDFs', count: count('pdf') },
          { value: 'link', label: 'Links', count: count('link') },
          { value: 'indicator', label: 'Indicators', count: count('indicator') },
        ]}
      />
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              tag === t ? 'border-accent bg-accent text-white' : 'border-line text-slate hover:border-slate/40 hover:text-ink',
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {shown.length > 0 ? (
          <ResourceList resources={shown} modules={data.modules} />
        ) : (
          <EmptyState
            title="No resources match these filters"
            action={
              <Button variant="secondary" onClick={() => { setType('all'); setTag(null) }}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </>
  )
}

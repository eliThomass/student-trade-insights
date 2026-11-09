import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { ModuleEditor } from '@/components/admin/ModuleEditor'
import { ResourceEditor } from '@/components/admin/ResourceEditor'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/toast-context'
import { tierOf } from '@/config/library'
import { deleteModule, deleteResource, listModules, listResources, moveModule, saveModule } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { resourceTypeLabel } from '@/lib/labels'
import type { Module, Resource } from '@/types/db'

type TabValue = 'modules' | 'resources'
type Deleting = { kind: 'module'; item: Module } | { kind: 'resource'; item: Resource }

const iconButton = 'rounded-md p-2 text-slate hover:bg-raised hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent'

export default function Content() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as TabValue | null) ?? 'modules'
  const [editingModule, setEditingModule] = useState<Module | null | 'new'>(null)
  const [editingResource, setEditingResource] = useState<Resource | null | 'new'>(null)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const { data } = useQuery('admin-content', async () => {
    const [modules, resources] = await Promise.all([listModules({ includeUnpublished: true }), listResources()])
    return { modules, resources }
  })

  if (!data) return <Loading />
  const { modules, resources } = data

  const togglePublished = async (m: Module) => {
    await saveModule({ ...m, published: !m.published })
    toast({ title: m.published ? 'Module unpublished' : 'Module published', detail: m.published ? 'Hidden from students.' : 'Students can see it now.' })
  }

  const confirmDelete = async () => {
    if (!deleting) return
    if (deleting.kind === 'module') await deleteModule(deleting.item.id)
    else await deleteResource(deleting.item.id)
    toast({ title: deleting.kind === 'module' ? 'Module deleted' : 'Resource deleted' })
    setDeleting(null)
  }

  return (
    <>
      <PageHeader
        title="Content"
        description="Modules show to students in this order. Unpublished modules stay hidden."
        actions={
          tab === 'modules' ? (
            <Button icon={<Plus className="size-4" />} onClick={() => setEditingModule('new')}>
              New module
            </Button>
          ) : (
            <Button icon={<Plus className="size-4" />} onClick={() => setEditingResource('new')}>
              New resource
            </Button>
          )
        }
      />
      <Tabs<TabValue>
        label="Content type"
        value={tab}
        onChange={(v) => setParams(v === 'modules' ? {} : { tab: v })}
        items={[
          { value: 'modules', label: 'Modules', count: modules.length },
          { value: 'resources', label: 'Resources', count: resources.length },
        ]}
      />

      <div className="mt-6">
        {tab === 'modules' ? (
          modules.length === 0 ? (
            <EmptyState title="No modules yet" action={<Button onClick={() => setEditingModule('new')}>New module</Button>}>
              Create the first module, then add resources to it.
            </EmptyState>
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {modules.map((m, i) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-5">
                  <span className="tabular w-6 shrink-0 text-sm font-bold text-slate">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{m.title}</p>
                    <p className="mt-0.5 text-sm text-slate">
                      {tierOf(m.tags) ?? 'No tier'}, {resources.filter((r) => r.module_id === m.id).length} resources
                    </p>
                  </div>
                  <Badge tone={m.published ? 'up' : 'neutral'}>{m.published ? 'Published' : 'Draft'}</Badge>
                  <div className="flex items-center">
                    <Button size="sm" variant="ghost" onClick={() => togglePublished(m)}>
                      {m.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <button type="button" className={iconButton} disabled={i === 0} onClick={() => moveModule(m.id, 'up')} aria-label={`Move ${m.title} up`}>
                      <ArrowUp className="size-4" />
                    </button>
                    <button type="button" className={iconButton} disabled={i === modules.length - 1} onClick={() => moveModule(m.id, 'down')} aria-label={`Move ${m.title} down`}>
                      <ArrowDown className="size-4" />
                    </button>
                    <button type="button" className={iconButton} onClick={() => setEditingModule(m)} aria-label={`Edit ${m.title}`}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" className={`${iconButton} hover:bg-down-soft hover:text-down`} onClick={() => setDeleting({ kind: 'module', item: m })} aria-label={`Delete ${m.title}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )
        ) : resources.length === 0 ? (
          <EmptyState title="No resources yet" action={<Button onClick={() => setEditingResource('new')}>New resource</Button>}>
            Add PDFs, links and indicators, and attach them to modules.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {resources.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{r.title}</p>
                  <p className="mt-0.5 truncate text-sm text-slate">
                    {resourceTypeLabel[r.type]}, {modules.find((m) => m.id === r.module_id)?.title ?? 'not attached to a module'}
                    {r.tags.length > 0 && `, tagged ${r.tags.join(', ')}`}
                  </p>
                </div>
                <button type="button" className={iconButton} onClick={() => setEditingResource(r)} aria-label={`Edit ${r.title}`}>
                  <Pencil className="size-4" />
                </button>
                <button type="button" className={`${iconButton} hover:bg-down-soft hover:text-down`} onClick={() => setDeleting({ kind: 'resource', item: r })} aria-label={`Delete ${r.title}`}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingModule && <ModuleEditor module={editingModule === 'new' ? null : editingModule} onClose={() => setEditingModule(null)} />}
      {editingResource && <ResourceEditor resource={editingResource === 'new' ? null : editingResource} modules={modules} onClose={() => setEditingResource(null)} />}
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={deleting?.kind === 'module' ? 'Delete this module?' : 'Delete this resource?'}
        description={
          deleting?.kind === 'module'
            ? `“${deleting.item.title}” will be removed for every student. Its resources stay, unattached. This can’t be undone.`
            : deleting
              ? `“${deleting.item.title}” will be removed for every student. This can’t be undone.`
              : undefined
        }
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              {deleting?.kind === 'module' ? 'Delete module' : 'Delete resource'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate">Unpublishing hides it without deleting it, if you might want it back.</p>
      </Dialog>
    </>
  )
}

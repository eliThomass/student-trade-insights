import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toast-context'
import { saveResource } from '@/data/api'
import { resourceTypeLabel } from '@/lib/labels'
import type { Module, Resource, ResourceType } from '@/types/db'

export function ResourceEditor({ resource, modules, onClose }: { resource: Resource | null; modules: Module[]; onClose: () => void }) {
  const toast = useToast()
  const isNew = !resource
  const [title, setTitle] = useState(resource?.title ?? '')
  const [type, setType] = useState<ResourceType>(resource?.type ?? 'pdf')
  const [url, setUrl] = useState(resource?.url ?? '')
  const [moduleId, setModuleId] = useState(resource?.module_id ?? '')
  const [tags, setTags] = useState(resource?.tags.join(', ') ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Give the resource a name.'
    if (!url.trim()) errs.url = type === 'pdf' ? 'Choose a file.' : 'Add a link.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    await saveResource({
      id: resource?.id,
      title: title.trim(),
      type,
      url: url.trim(),
      module_id: moduleId || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    toast({ title: isNew ? 'Resource added' : 'Resource saved' })
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={isNew ? 'New resource' : 'Edit resource'}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="resource-form" pending={saving}>
            {isNew ? 'Add resource' : 'Save resource'}
          </Button>
        </>
      }
    >
      <form id="resource-form" onSubmit={submit} noValidate className="space-y-5">
        <Field label="Name" error={errors.title}>
          {(a) => <Input {...a} value={title} onChange={(e) => setTitle(e.target.value)} />}
        </Field>
        <Field label="Type">
          {(a) => (
            <Select {...a} value={type} onChange={(e) => setType(e.target.value as ResourceType)}>
              {(Object.keys(resourceTypeLabel) as ResourceType[]).map((t) => (
                <option key={t} value={t}>
                  {resourceTypeLabel[t]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {type === 'pdf' ? (
          <Field label="File" help="Mockup only: the file isn’t uploaded. The real build stores PDFs in a private bucket." error={errors.url}>
            {(a) => <Input {...a} type="file" accept="application/pdf" onChange={(e) => setUrl(e.target.files?.[0] ? `#${e.target.files[0].name}` : '')} className="pt-2" />}
          </Field>
        ) : (
          <Field label="Link" error={errors.url}>
            {(a) => <Input {...a} type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />}
          </Field>
        )}
        <Field label="Module" optional>
          {(a) => (
            <Select {...a} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
              <option value="">Not attached to a module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Tags" help="Separate with commas." optional>
          {(a) => <Input {...a} value={tags} onChange={(e) => setTags(e.target.value)} />}
        </Field>
      </form>
    </Dialog>
  )
}

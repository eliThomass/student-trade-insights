import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea, controlClass } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toast-context'
import { tierNames, tierOf } from '@/config/library'
import { saveModule } from '@/data/api'
import { cn } from '@/lib/cn'
import { slugify } from '@/lib/lesson'
import type { LessonBlock, Module } from '@/types/db'

type BlockType = LessonBlock['type']

const blockLabels: Record<BlockType, string> = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  list: 'Bulleted list',
  image: 'Image',
  video: 'Video',
  callout: 'Callout',
}

function emptyBlock(type: BlockType): LessonBlock {
  switch (type) {
    case 'heading':
    case 'paragraph':
      return { type, text: '' }
    case 'list':
      return { type, items: [''] }
    case 'image':
      return { type, src: '', alt: '' }
    case 'video':
      return { type, url: '', title: '' }
    case 'callout':
      return { type, tone: 'note', text: '' }
  }
}

/** Edits one block's fields. Rich text editing (Tiptap) replaces this in the real build. */
function BlockFields({ block, onChange }: { block: LessonBlock; onChange: (b: LessonBlock) => void }) {
  const small = cn(controlClass, 'h-9')
  switch (block.type) {
    case 'heading':
      return <input aria-label="Heading text" className={small} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
    case 'paragraph':
      return <Textarea aria-label="Paragraph text" rows={3} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
    case 'callout':
      return (
        <div className="space-y-2">
          <select aria-label="Callout style" className={cn(small, 'w-40')} value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as 'note' | 'warning' })}>
            <option value="note">Note</option>
            <option value="warning">Warning</option>
          </select>
          <Textarea aria-label="Callout text" rows={2} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
        </div>
      )
    case 'list':
      return (
        <Textarea
          aria-label="List items, one per line"
          rows={3}
          placeholder="One item per line"
          value={block.items.join('\n')}
          onChange={(e) => onChange({ ...block, items: e.target.value.split('\n') })}
        />
      )
    case 'image':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input aria-label="Image URL" placeholder="Image URL" className={small} value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} />
          <input aria-label="Image description" placeholder="Describe the image" className={small} value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
        </div>
      )
    case 'video':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input aria-label="Video title" placeholder="Video title" className={small} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <input aria-label="YouTube or Vimeo link" placeholder="YouTube or Vimeo link" className={small} value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} />
        </div>
      )
  }
}

export function ModuleEditor({ module, onClose }: { module: Module | null; onClose: () => void }) {
  const toast = useToast()
  const isNew = !module
  const [title, setTitle] = useState(module?.title ?? '')
  const [slug, setSlug] = useState(module?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [tier, setTier] = useState<string>(tierOf(module?.tags ?? []) ?? tierNames[0]!)
  const [tags, setTags] = useState((module?.tags ?? []).filter((t) => !tierOf([t])).join(', '))
  const [published, setPublished] = useState(module?.published ?? false)
  const [blocks, setBlocks] = useState<LessonBlock[]>(module?.body ?? [{ type: 'paragraph', text: '' }])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const effectiveSlug = slugTouched ? slug : slugify(title)

  const move = (i: number, d: -1 | 1) =>
    setBlocks((bs) => {
      const next = [...bs]
      const [b] = next.splice(i, 1)
      next.splice(i + d, 0, b!)
      return next
    })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setError('Give the module a title.')
    if (!effectiveSlug) return setError('Give the module a web address.')
    setError(null)
    setSaving(true)
    try {
      const body = blocks.map((b) => (b.type === 'list' ? { ...b, items: b.items.map((s) => s.trim()).filter(Boolean) } : b))
      const extra = tags.split(',').map((t) => t.trim()).filter(Boolean)
      await saveModule({ id: module?.id, title: title.trim(), slug: effectiveSlug, tags: [tier, ...extra], published, body })
      toast({ title: isNew ? 'Module created' : 'Module saved', detail: published ? 'Students can see it now.' : 'It stays hidden from students until you publish it.' })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The module could not be saved.')
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      width="lg"
      title={isNew ? 'New module' : 'Edit module'}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="module-form" pending={saving}>
            {isNew ? 'Create module' : 'Save module'}
          </Button>
        </>
      }
    >
      <form id="module-form" onSubmit={submit} noValidate className="space-y-5">
        <Field label="Title">{(a) => <Input {...a} value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
        <Field label="Web address" help={`Shown as /learn/${effectiveSlug || 'module-name'}`}>
          {(a) => (
            <Input
              {...a}
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
            />
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tier">
            {(a) => (
              <Select {...a} value={tier} onChange={(e) => setTier(e.target.value)}>
                {tierNames.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Tags" help="Separate with commas.">
            {(a) => <Input {...a} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Futures, Risk" />}
          </Field>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="size-4 accent-accent" />
          Published (visible to active students)
        </label>

        <fieldset className="border-t border-line pt-5">
          <legend className="sr-only">Lesson content</legend>
          <p className="text-sm font-semibold">Lesson content</p>
          <ol className="mt-3 space-y-3">
            {blocks.map((b, i) => (
              <li key={i} className="rounded-lg border border-line p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate">{blockLabels[b.type]}</span>
                  <span className="flex">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 text-slate hover:bg-raised disabled:opacity-30" aria-label="Move block up">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button type="button" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 text-slate hover:bg-raised disabled:opacity-30" aria-label="Move block down">
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))} className="rounded p-1.5 text-slate hover:bg-down-soft hover:text-down" aria-label="Remove block">
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </div>
                <BlockFields block={b} onChange={(nb) => setBlocks((bs) => bs.map((x, j) => (j === i ? nb : x)))} />
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(blockLabels) as BlockType[]).map((t) => (
              <Button key={t} size="sm" variant="secondary" onClick={() => setBlocks((bs) => [...bs, emptyBlock(t)])}>
                Add {blockLabels[t].toLowerCase()}
              </Button>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm font-medium text-down">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  )
}

import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useSession } from '@/auth/context'
import { LessonBody } from '@/components/library/LessonBody'
import { ResourceList } from '@/components/library/ResourceList'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState, Loading } from '@/components/ui/misc'
import { useToast } from '@/components/ui/toast-context'
import { tierOf } from '@/config/library'
import { getCompletedModules, listModules, listResources, setModuleComplete } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { readingMinutes } from '@/lib/lesson'

export default function ModulePage() {
  const { slug } = useParams()
  const { profile } = useSession()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const { data } = useQuery(`module:${slug}:${profile!.id}`, async () => {
    const [modules, resources, completed] = await Promise.all([listModules(), listResources(), getCompletedModules(profile!.id)])
    return { modules, resources, completed: new Set(completed) }
  })

  if (!data) return <Loading />
  const index = data.modules.findIndex((m) => m.slug === slug)
  const module = data.modules[index]
  if (!module) {
    return (
      <EmptyState title="This lesson isn’t available" action={<ButtonLink to="/learn" variant="secondary">Back to the library</ButtonLink>}>
        It may have been unpublished or renamed.
      </EmptyState>
    )
  }

  const prev = data.modules[index - 1]
  const next = data.modules[index + 1]
  const done = data.completed.has(module.id)
  const resources = data.resources.filter((r) => r.module_id === module.id)

  const toggle = async () => {
    setSaving(true)
    await setModuleComplete(profile!.id, module.id, !done)
    setSaving(false)
    toast(done ? { title: 'Marked as not complete', tone: 'info' } : { title: 'Marked as complete', detail: next ? `Up next: ${next.title}` : 'That was the last published module.' })
  }

  return (
    <article>
      <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Library
      </Link>
      <header className="mt-6 mb-10 max-w-[68ch]">
        <p className="text-sm text-slate">
          {tierOf(module.tags) ?? 'Library'}, module {index + 1} of {data.modules.length}, {readingMinutes(module)} min
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{module.title}</h1>
      </header>

      <LessonBody blocks={module.body} />

      {resources.length > 0 && (
        <section aria-labelledby="lesson-resources" className="mt-14 max-w-[68ch]">
          <h2 id="lesson-resources" className="mb-4 text-lg font-bold">
            Resources for this lesson
          </h2>
          <ResourceList resources={resources} />
        </section>
      )}

      <footer className="mt-14 max-w-[68ch] border-t border-line pt-8">
        <Button variant={done ? 'secondary' : 'approve'} pending={saving} onClick={toggle} icon={done ? <Check className="size-4" /> : undefined}>
          {done ? 'Completed' : 'Mark as complete'}
        </Button>
        <nav aria-label="Lessons" className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={`/learn/${prev.slug}`} className="rounded-lg border border-line p-4 hover:bg-raised">
              <span className="flex items-center gap-1.5 text-sm text-slate">
                <ArrowLeft className="size-3.5" aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-semibold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/learn/${next.slug}`} className="rounded-lg border border-line p-4 text-right hover:bg-raised">
              <span className="flex items-center justify-end gap-1.5 text-sm text-slate">
                Next <ArrowRight className="size-3.5" aria-hidden />
              </span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      </footer>
    </article>
  )
}

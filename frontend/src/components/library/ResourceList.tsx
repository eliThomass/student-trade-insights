import { Link } from 'react-router'
import { ChartLine, ExternalLink, FileText, Link2 } from 'lucide-react'
import { resourceTypeLabel } from '@/lib/labels'
import type { Module, Resource, ResourceType } from '@/types/db'

const icons: Record<ResourceType, typeof FileText> = { pdf: FileText, link: Link2, indicator: ChartLine }

/**
 * Resource rows. PDFs will be served through signed URLs from a private
 * Supabase bucket in the real build; here they are placeholder links.
 */
export function ResourceList({ resources, modules }: { resources: Resource[]; modules?: Module[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {resources.map((r) => {
        const Icon = icons[r.type]
        const module = modules?.find((m) => m.id === r.module_id)
        return (
          <li key={r.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-slate">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <a href={r.url} target="_blank" rel="noreferrer" className="font-semibold text-ink hover:text-accent">
                {r.title}
              </a>
              <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-slate">
                <span>{resourceTypeLabel[r.type]}</span>
                {module && (
                  <Link to={`/learn/${module.slug}`} className="hover:text-ink hover:underline">
                    {module.title}
                  </Link>
                )}
                {r.tags.map((t) => (
                  <span key={t} className="text-slate/80">
                    #{t.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                ))}
              </p>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" className="rounded-md p-2 text-slate hover:bg-raised hover:text-ink" aria-label={`Open ${r.title}`}>
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { FileText, Search } from 'lucide-react'
import { searchLibrary } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { resourceTypeLabel } from '@/lib/labels'

/** Top-bar search across module titles, lesson text and resource names. */
export function LibrarySearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(false)
    setQuery('')
  }

  const q = query.trim()
  const { data } = useQuery(`search:${q}`, () => searchLibrary(q))

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const total = (data?.modules.length ?? 0) + (data?.resources.length ?? 0)

  return (
    <div ref={wrapper} className="relative w-full max-w-md" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <label className="sr-only" htmlFor="library-search">
        Search lessons and resources
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate" aria-hidden />
      <input
        id="library-search"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search lessons and resources"
        autoComplete="off"
        className="h-10 w-full rounded-md border border-line bg-mist pr-3 pl-9 text-base text-ink placeholder:text-slate/80 focus:border-accent focus:bg-paper focus:outline-none sm:text-sm"
      />
      {open && q && data && (
        <div className="absolute inset-x-0 top-12 z-40 max-h-[70vh] overflow-y-auto rounded-lg border border-line bg-paper p-2 shadow-xl">
          {total === 0 ? (
            <p className="px-3 py-4 text-sm text-slate">Nothing matches “{q}”. Try a broader word, like “risk” or “options”.</p>
          ) : (
            <>
              {data.modules.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate">Lessons</p>
                  {data.modules.map(({ module, snippet }) => (
                    <Link key={module.id} to={`/learn/${module.slug}`} className="block rounded-md px-3 py-2 hover:bg-mist">
                      <span className="text-sm font-semibold text-ink">{module.title}</span>
                      {snippet && <span className="mt-0.5 line-clamp-2 block text-xs text-slate">{snippet}</span>}
                    </Link>
                  ))}
                </div>
              )}
              {data.resources.length > 0 && (
                <div className="mt-1">
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate">Resources</p>
                  {data.resources.map((r) => (
                    <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-mist">
                      <FileText className="size-4 text-slate" aria-hidden />
                      <span className="flex-1 text-sm font-semibold text-ink">{r.title}</span>
                      <span className="text-xs text-slate">{resourceTypeLabel[r.type]}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

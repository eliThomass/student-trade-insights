import type { ReactNode } from 'react'
import { PlayCircle } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { SessionNote } from '@/types/db'

/** One session note. Shared with the mentor's student page. */
export function SessionNoteCard({ note, actions }: { note: SessionNote; actions?: ReactNode }) {
  return (
    <article className="rounded-xl border border-line p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{formatDate(note.session_date)}</h2>
        <div className="flex items-center gap-2">
          {note.recording_url && (
            <a href={note.recording_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-accent hover:bg-accent-soft">
              <PlayCircle className="size-4" aria-hidden /> Recording
            </a>
          )}
          {actions}
        </div>
      </header>
      <dl className="mt-4 grid gap-5 md:grid-cols-2 md:gap-8">
        <div>
          <dt className="text-sm font-semibold text-slate">Takeaways</dt>
          <dd className="mt-1.5 leading-relaxed text-ink">{note.takeaways}</dd>
        </div>
        <div className="md:border-l md:border-line md:pl-8">
          <dt className="text-sm font-semibold text-mentor">What to work on</dt>
          <dd className="mt-1.5 leading-relaxed text-ink">{note.homework}</dd>
        </div>
      </dl>
    </article>
  )
}

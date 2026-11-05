import { useSession } from '@/auth/context'
import { EmptyState, Loading, PageHeader } from '@/components/ui/misc'
import { site } from '@/config/site'
import { listSessionNotes } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { SessionNoteCard } from '@/components/SessionNoteCard'

export default function Sessions() {
  const { profile } = useSession()
  const { data: notes } = useQuery(`notes:${profile!.id}`, () => listSessionNotes(profile!.id))

  return (
    <>
      <PageHeader title="Sessions" description="Notes from your calls, newest first." />
      {!notes ? (
        <Loading />
      ) : notes.length === 0 ? (
        <EmptyState title="No session notes yet">
          {site.mentorFirstName} adds a note after each call: what you covered, what to work on, and the recording.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {notes.map((n) => (
            <SessionNoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </>
  )
}

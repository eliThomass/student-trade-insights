import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { SessionNoteCard } from '@/components/SessionNoteCard'
import { StatusBadge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { EmptyState, Loading } from '@/components/ui/misc'
import { useToast } from '@/components/ui/toast-context'
import { deleteSessionNote, getProfile, listSessionNotes, saveSessionNote, setProfileStatus } from '@/data/api'
import { useQuery } from '@/data/useQuery'
import { formatDate, todayISO } from '@/lib/format'
import { statusLabel } from '@/lib/labels'
import { PROFILE_STATUSES, type ProfileStatus, type SessionNote } from '@/types/db'

type Draft = Omit<SessionNote, 'id' | 'student_id' | 'recording_url'> & { id?: string; recording_url: string }

function NoteDialog({ draft, onClose, studentId }: { draft: Draft; onClose: () => void; studentId: string }) {
  const toast = useToast()
  const [values, setValues] = useState(draft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const isNew = !draft.id

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!values.session_date) errs.session_date = 'Pick the date of the call.'
    if (!values.takeaways.trim()) errs.takeaways = 'Add at least one takeaway.'
    if (!values.homework.trim()) errs.homework = 'Add what they should work on.'
    if (values.recording_url && !/^https?:\/\//.test(values.recording_url)) errs.recording_url = 'Use a full link starting with https://'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    await saveSessionNote({ ...values, student_id: studentId, recording_url: values.recording_url.trim() || null })
    toast({ title: isNew ? 'Session note added' : 'Session note saved', detail: 'The student can see it on their Sessions page.' })
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={isNew ? 'Add session note' : 'Edit session note'}
      width="lg"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="note-form" pending={saving}>
            {isNew ? 'Add session note' : 'Save session note'}
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Session date" error={errors.session_date}>
          {(a) => <Input {...a} type="date" value={values.session_date} onChange={(e) => setValues({ ...values, session_date: e.target.value })} className="max-w-48" />}
        </Field>
        <Field label="Takeaways" help="What you covered and what you noticed." error={errors.takeaways}>
          {(a) => <Textarea {...a} rows={4} value={values.takeaways} onChange={(e) => setValues({ ...values, takeaways: e.target.value })} />}
        </Field>
        <Field label="What to work on" help="Homework before the next call." error={errors.homework}>
          {(a) => <Textarea {...a} rows={3} value={values.homework} onChange={(e) => setValues({ ...values, homework: e.target.value })} />}
        </Field>
        <Field label="Recording link" optional error={errors.recording_url}>
          {(a) => <Input {...a} type="url" placeholder="https://" value={values.recording_url} onChange={(e) => setValues({ ...values, recording_url: e.target.value })} />}
        </Field>
      </form>
    </Dialog>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [toDelete, setToDelete] = useState<SessionNote | null>(null)
  const [busy, setBusy] = useState(false)
  const { data, loading } = useQuery(`student:${id}`, async () => {
    const [profile, notes] = await Promise.all([getProfile(id!), listSessionNotes(id!)])
    return { profile, notes }
  })

  if (loading && !data) return <Loading />
  const profile = data?.profile
  if (!profile || profile.role !== 'student') {
    return (
      <EmptyState title="Student not found" action={<ButtonLink to="/admin/students" variant="secondary">Back to students</ButtonLink>}>
        The link may be wrong.
      </EmptyState>
    )
  }
  const notes = data.notes

  const changeStatus = async (status: ProfileStatus) => {
    setBusy(true)
    const email = await setProfileStatus(profile.id, status)
    setBusy(false)
    toast({ title: `Status set to ${statusLabel[status].toLowerCase()}`, detail: email ? `Email sent to ${email.to}: “${email.subject}”` : undefined })
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setBusy(true)
    await deleteSessionNote(toDelete.id)
    setBusy(false)
    setToDelete(null)
    toast({ title: 'Session note deleted' })
  }

  return (
    <>
      <Link to="/admin/students" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Students
      </Link>

      <header className="mt-6 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{profile.name}</h1>
          <p className="mt-1 text-slate">
            {profile.email}, {profile.time_zone.replace('_', ' ')}, joined {formatDate(profile.created_at)}
          </p>
        </div>
        <StatusBadge status={profile.status} />
      </header>

      <section aria-labelledby="status-heading" className="mb-12 rounded-xl border border-line p-5 sm:p-6">
        <h2 id="status-heading" className="font-bold">
          Status
        </h2>
        {profile.status === 'approved' ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate">Approved and waiting on payment by Venmo or PayPal. Activating unlocks their portal and emails them.</p>
            <Button variant="approve" pending={busy} onClick={() => changeStatus('active')}>
              Mark as paid and activate
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate">Only active students can open the library and their session notes.</p>
        )}
        <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
          <Field label="Set status to" className="w-64">
            {(a) => (
              <Select {...a} value={profile.status} disabled={busy} onChange={(e) => changeStatus(e.target.value as ProfileStatus)}>
                {PROFILE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </section>

      <section aria-labelledby="notes-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="notes-heading" className="text-lg font-bold">
            Session notes
          </h2>
          <Button icon={<Plus className="size-4" />} onClick={() => setDraft({ session_date: todayISO(), takeaways: '', homework: '', recording_url: '' })}>
            Add session note
          </Button>
        </div>
        {notes.length === 0 ? (
          <EmptyState title="No session notes yet">Add one after each call. {profile.name.split(' ')[0]} sees it on their Sessions page, newest first.</EmptyState>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => (
              <SessionNoteCard
                key={n.id}
                note={n}
                actions={
                  <>
                    <button type="button" onClick={() => setDraft({ ...n, recording_url: n.recording_url ?? '' })} className="rounded-md p-2 text-slate hover:bg-raised hover:text-ink" aria-label={`Edit note from ${formatDate(n.session_date)}`}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" onClick={() => setToDelete(n)} className="rounded-md p-2 text-slate hover:bg-down-soft hover:text-down" aria-label={`Delete note from ${formatDate(n.session_date)}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      {draft && <NoteDialog draft={draft} studentId={profile.id} onClose={() => setDraft(null)} />}
      <Dialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this session note?"
        description={toDelete ? `The note from ${formatDate(toDelete.session_date)} will be removed for you and the student. This can’t be undone.` : undefined}
        actions={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" pending={busy} onClick={confirmDelete}>
              Delete session note
            </Button>
          </>
        }
      >
        {toDelete && <p className="line-clamp-3 text-sm text-slate">{toDelete.takeaways}</p>}
      </Dialog>
    </>
  )
}

/**
 * The data API pages use. Every function is async so the mock can be swapped
 * for Supabase queries with the same signatures.
 *
 * Access control: in the real build, Supabase RLS enforces who can read and
 * write each row. This mock trusts its callers; route guards are the only
 * check in the demo.
 */
import { site } from '@/config/site'
import { heuristicRank, RankingError } from '@/data/ranking'
import { delay, getState, resetState, update } from '@/data/store'
import type {
  Application,
  ApplicationAnswers,
  Decision,
  Module,
  Profile,
  ProfileStatus,
  Resource,
  SessionNote,
} from '@/types/db'

/** An email the real build would send through Resend. The demo shows it as a toast. */
export interface SimulatedEmail {
  to: string
  subject: string
}

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
const now = () => new Date().toISOString()

// ---------- Profiles ----------

export async function getProfile(id: string): Promise<Profile | null> {
  return getState().profiles.find((p) => p.id === id) ?? null
}

export async function findProfileByEmail(email: string): Promise<Profile | null> {
  const e = email.trim().toLowerCase()
  return getState().profiles.find((p) => p.email.toLowerCase() === e) ?? null
}

export interface StudentRow extends Profile {
  last_session: string | null
  completed_modules: number
}

/** Everyone with a student role, with their last session date. */
export async function listStudents(): Promise<StudentRow[]> {
  const s = getState()
  return s.profiles
    .filter((p) => p.role === 'student')
    .map((p) => {
      const dates = s.session_notes.filter((n) => n.student_id === p.id).map((n) => n.session_date)
      return {
        ...p,
        last_session: dates.sort().at(-1) ?? null,
        completed_modules: s.progress[p.id]?.length ?? 0,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Mentor-only in the real build (RLS: only the mentor can change role or status). */
export async function setProfileStatus(id: string, status: ProfileStatus): Promise<SimulatedEmail | null> {
  await delay()
  const profile = getState().profiles.find((p) => p.id === id)
  if (!profile) throw new Error('Student not found')
  update((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === id ? { ...p, status } : p)) }))
  return status === 'active' && profile.status !== 'active'
    ? { to: profile.email, subject: `You're in: your ${site.brandName} portal is unlocked` }
    : null
}

// ---------- Applications ----------

export interface ApplicationRow extends Application {
  profile: Profile
}

function withProfile(a: Application): ApplicationRow {
  const profile = getState().profiles.find((p) => p.id === a.user_id)
  if (!profile) throw new Error(`Application ${a.id} has no profile`)
  return { ...a, profile }
}

/** Sorted by AI score, highest first. Unranked applications go last. */
export async function listApplications(): Promise<ApplicationRow[]> {
  return getState()
    .applications.map(withProfile)
    .sort((a, b) => (b.ai_score ?? -1) - (a.ai_score ?? -1) || b.created_at.localeCompare(a.created_at))
}

export async function getApplication(id: string): Promise<ApplicationRow | null> {
  const a = getState().applications.find((x) => x.id === id)
  return a ? withProfile(a) : null
}

export async function getApplicationForUser(userId: string): Promise<Application | null> {
  return getState().applications.find((a) => a.user_id === userId) ?? null
}

/** MOCK of the server-side ranking call, including the failure fallback. */
async function runRanking(answers: ApplicationAnswers) {
  await delay(700)
  if (getState().settings.simulateRankingFailure) throw new RankingError('Ranking service unavailable')
  return heuristicRank(answers)
}

export interface SubmitResult {
  profile: Profile
  application: Application
  rankingFailed: boolean
  emails: SimulatedEmail[]
}

export async function submitApplication(input: {
  email: string
  answers: ApplicationAnswers
}): Promise<SubmitResult> {
  await delay()
  if (await findProfileByEmail(input.email)) {
    throw new Error('An account with this email already exists. Log in to see your application status.')
  }
  const profile: Profile = {
    id: newId('u'),
    name: input.answers.name ?? '',
    email: input.email.trim(),
    role: 'student',
    status: 'applicant',
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    created_at: now(),
  }
  let application: Application = {
    id: newId('app'),
    user_id: profile.id,
    answers: input.answers,
    ai_score: null,
    ai_summary: null,
    ai_strengths: null,
    ai_flags: null,
    decision: 'pending',
    decided_at: null,
    created_at: now(),
  }
  let rankingFailed = false
  try {
    const r = await runRanking(input.answers)
    application = { ...application, ai_score: r.score, ai_summary: r.summary, ai_strengths: r.strengths, ai_flags: r.flags }
  } catch {
    rankingFailed = true // Saved without a score; the mentor can re-run it.
  }
  update((s) => ({ ...s, profiles: [...s.profiles, profile], applications: [...s.applications, application] }))
  return {
    profile,
    application,
    rankingFailed,
    emails: [{ to: site.mentorName, subject: `New application from ${profile.name}` }],
  }
}

export async function rerunRanking(applicationId: string): Promise<Application> {
  const a = getState().applications.find((x) => x.id === applicationId)
  if (!a) throw new Error('Application not found')
  const r = await runRanking(a.answers)
  const next: Application = { ...a, ai_score: r.score, ai_summary: r.summary, ai_strengths: r.strengths, ai_flags: r.flags }
  update((s) => ({ ...s, applications: s.applications.map((x) => (x.id === a.id ? next : x)) }))
  return next
}

const decisionStatus: Record<Exclude<Decision, 'pending'>, ProfileStatus> = {
  approved: 'approved',
  waitlisted: 'waitlisted',
  rejected: 'rejected',
}

const decisionSubject: Record<Exclude<Decision, 'pending'>, string> = {
  approved: `You're approved. Next step: payment by Venmo or PayPal`,
  waitlisted: `You're on the waitlist for ${site.brandName}`,
  rejected: `An update on your ${site.brandName} application`,
}

/** One-click decision. Sets the application decision and the profile status, and emails the applicant. */
export async function decideApplication(
  applicationId: string,
  decision: Exclude<Decision, 'pending'>,
): Promise<SimulatedEmail> {
  await delay()
  const a = getState().applications.find((x) => x.id === applicationId)
  if (!a) throw new Error('Application not found')
  const profile = getState().profiles.find((p) => p.id === a.user_id)!
  update((s) => ({
    ...s,
    applications: s.applications.map((x) => (x.id === a.id ? { ...x, decision, decided_at: now() } : x)),
    profiles: s.profiles.map((p) => (p.id === a.user_id ? { ...p, status: decisionStatus[decision] } : p)),
  }))
  return { to: profile.email, subject: decisionSubject[decision] }
}

// ---------- Modules and resources ----------

export async function listModules(opts: { includeUnpublished?: boolean } = {}): Promise<Module[]> {
  return getState()
    .modules.filter((m) => opts.includeUnpublished || m.published)
    .sort((a, b) => a.order - b.order)
}

export async function getModuleBySlug(slug: string): Promise<Module | null> {
  return getState().modules.find((m) => m.slug === slug) ?? null
}

export async function saveModule(module: Omit<Module, 'id' | 'order'> & { id?: string }): Promise<Module> {
  await delay()
  const s = getState()
  const clash = s.modules.find((m) => m.slug === module.slug && m.id !== module.id)
  if (clash) throw new Error(`Another module already uses the address "${module.slug}". Change the title or address.`)
  const existing = module.id ? s.modules.find((m) => m.id === module.id) : undefined
  const saved: Module = existing
    ? { ...existing, ...module, id: existing.id, order: existing.order }
    : { ...module, id: newId('m'), order: Math.max(0, ...s.modules.map((m) => m.order)) + 1 }
  update((st) => ({
    ...st,
    modules: existing ? st.modules.map((m) => (m.id === saved.id ? saved : m)) : [...st.modules, saved],
  }))
  return saved
}

export async function deleteModule(id: string): Promise<void> {
  await delay()
  update((s) => ({
    ...s,
    modules: s.modules.filter((m) => m.id !== id),
    resources: s.resources.map((r) => (r.module_id === id ? { ...r, module_id: null } : r)),
  }))
}

/** Swaps a module with its neighbour in the mentor's order. */
export async function moveModule(id: string, direction: 'up' | 'down'): Promise<void> {
  const sorted = [...getState().modules].sort((a, b) => a.order - b.order)
  const i = sorted.findIndex((m) => m.id === id)
  const j = direction === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= sorted.length) return
  const a = sorted[i]
  const b = sorted[j]
  update((s) => ({
    ...s,
    modules: s.modules.map((m) => (m.id === a.id ? { ...m, order: b.order } : m.id === b.id ? { ...m, order: a.order } : m)),
  }))
}

export async function listResources(): Promise<Resource[]> {
  return [...getState().resources].sort((a, b) => a.title.localeCompare(b.title))
}

export async function saveResource(resource: Omit<Resource, 'id'> & { id?: string }): Promise<Resource> {
  await delay()
  const saved: Resource = { ...resource, id: resource.id ?? newId('r') }
  update((s) => ({
    ...s,
    resources: resource.id ? s.resources.map((r) => (r.id === saved.id ? saved : r)) : [...s.resources, saved],
  }))
  return saved
}

export async function deleteResource(id: string): Promise<void> {
  await delay()
  update((s) => ({ ...s, resources: s.resources.filter((r) => r.id !== id) }))
}

export interface SearchResults {
  modules: { module: Module; snippet: string | null }[]
  resources: Resource[]
}

function blockText(m: Module) {
  return m.body
    .map((b) => (b.type === 'list' ? b.items.join(' ') : 'text' in b ? b.text : b.type === 'video' ? b.title : b.alt))
    .join(' ')
}

/** Searches published module titles, lesson text and resource names. */
export async function searchLibrary(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase()
  if (!q) return { modules: [], resources: [] }
  const s = getState()
  const published = s.modules.filter((m) => m.published)
  const modules = published
    .map((module) => {
      const text = blockText(module)
      const idx = text.toLowerCase().indexOf(q)
      const titleHit = module.title.toLowerCase().includes(q)
      if (!titleHit && idx < 0) return null
      const snippet = idx < 0 ? null : `${idx > 40 ? '…' : ''}${text.slice(Math.max(0, idx - 40), idx + q.length + 60).trim()}…`
      return { module, snippet }
    })
    .filter((x): x is { module: Module; snippet: string | null } => x !== null)
    .sort((a, b) => a.module.order - b.module.order)
  const publishedIds = new Set(published.map((m) => m.id))
  const resources = s.resources.filter(
    (r) => (r.module_id === null || publishedIds.has(r.module_id)) &&
      (r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))),
  )
  return { modules, resources }
}

// ---------- Progress (mock-only, see DbState.progress) ----------

export async function getCompletedModules(studentId: string): Promise<string[]> {
  return getState().progress[studentId] ?? []
}

export async function setModuleComplete(studentId: string, moduleId: string, done: boolean): Promise<void> {
  update((s) => {
    const current = new Set(s.progress[studentId] ?? [])
    if (done) current.add(moduleId)
    else current.delete(moduleId)
    return { ...s, progress: { ...s.progress, [studentId]: [...current] } }
  })
}

// ---------- Session notes ----------

/** Newest first. */
export async function listSessionNotes(studentId: string): Promise<SessionNote[]> {
  return getState()
    .session_notes.filter((n) => n.student_id === studentId)
    .sort((a, b) => b.session_date.localeCompare(a.session_date))
}

export async function saveSessionNote(note: Omit<SessionNote, 'id'> & { id?: string }): Promise<SessionNote> {
  await delay()
  const saved: SessionNote = { ...note, id: note.id ?? newId('n') }
  update((s) => ({
    ...s,
    session_notes: note.id ? s.session_notes.map((n) => (n.id === saved.id ? saved : n)) : [...s.session_notes, saved],
  }))
  return saved
}

export async function deleteSessionNote(id: string): Promise<void> {
  await delay()
  update((s) => ({ ...s, session_notes: s.session_notes.filter((n) => n.id !== id) }))
}

// ---------- Demo controls ----------

export function getDemoSettings() {
  return getState().settings
}

export function setSimulateRankingFailure(on: boolean) {
  update((s) => ({ ...s, settings: { ...s.settings, simulateRankingFailure: on } }))
}

export function resetDemoData() {
  resetState()
}

/**
 * MOCK database: an in-memory copy of the five tables, persisted to
 * localStorage so demo actions survive a reload. Only src/data/ and
 * src/auth/ import this file; pages go through src/data/api.ts.
 */
import { heuristicRank } from '@/data/ranking'
import { seedModules, seedResources } from '@/mocks/library'
import { activeStudents, mentor, seedApplications } from '@/mocks/people'
import { seedSessionNotes } from '@/mocks/sessionNotes'
import type { Application, Module, Profile, Resource, SessionNote } from '@/types/db'

export interface DbState {
  schema: 2
  profiles: Profile[]
  applications: Application[]
  modules: Module[]
  resources: Resource[]
  session_notes: SessionNote[]
  /**
   * Mock-only: completed module ids per student. Phase 1's five tables have
   * nowhere to store lesson progress, so the real build needs a
   * `module_progress (student_id, module_id, completed_at)` table.
   */
  progress: Record<string, string[]>
  settings: { simulateRankingFailure: boolean }
}

const STORAGE_KEY = 'sti-demo-db'

function buildSeed(): DbState {
  const applications: Application[] = seedApplications.map((s, i) => {
    const ranked = s.unranked ? null : heuristicRank(s.answers)
    return {
      id: `app-${String(i + 1).padStart(2, '0')}`,
      user_id: s.profile.id,
      answers: s.answers,
      ai_score: ranked?.score ?? null,
      ai_summary: ranked?.summary ?? null,
      ai_strengths: ranked?.strengths ?? null,
      ai_flags: ranked?.flags ?? null,
      decision: s.decision,
      decided_at: s.decided_at ?? null,
      created_at: s.submitted,
    }
  })
  const progress: Record<string, string[]> = {}
  activeStudents.forEach((p, i) => {
    const done = [10, 4, 6, 3, 8, 2, 5, 1, 7, 2, 3, 0][i] ?? 0
    progress[p.id] = seedModules.filter((m) => m.published).slice(0, done).map((m) => m.id)
  })
  progress['u-s01'] = ['m-01', 'm-02', 'm-03', 'm-04', 'm-05', 'm-06', 'm-07', 'm-08']
  return {
    schema: 2,
    profiles: [mentor, ...activeStudents, ...seedApplications.map((s) => s.profile)],
    applications,
    modules: seedModules,
    resources: seedResources,
    session_notes: seedSessionNotes,
    progress,
    settings: { simulateRankingFailure: false },
  }
}

function load(): DbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DbState
      if (parsed.schema === 2) return parsed
    }
  } catch {
    // Private mode or corrupted JSON: fall back to the seed.
  }
  return buildSeed()
}

let state: DbState = load()
let version = 0
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable: the demo still works for this tab.
  }
}

export function getState(): DbState {
  return state
}

/** Applies an immutable update, persists it and notifies subscribers. */
export function update(fn: (draft: DbState) => DbState) {
  state = fn(state)
  version += 1
  persist()
  listeners.forEach((l) => l())
}

export function resetState() {
  update(() => buildSeed())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getVersion() {
  return version
}

/** Simulated network latency, so pending states show up in the UI. */
export function delay(ms = 250) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

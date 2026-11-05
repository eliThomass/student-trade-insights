/**
 * Row types for the five Phase 1 tables in phase1-build-blueprint.md.
 * Field names and enum values match the future Supabase schema exactly,
 * so keep them snake_case and don't rename them.
 */

export type Role = 'student' | 'mentor'

export type ProfileStatus =
  | 'applicant'
  | 'approved'
  | 'active'
  | 'waitlisted'
  | 'rejected'
  | 'inactive'

export const PROFILE_STATUSES: ProfileStatus[] = [
  'applicant',
  'approved',
  'active',
  'waitlisted',
  'rejected',
  'inactive',
]

export type Decision = 'pending' | 'approved' | 'waitlisted' | 'rejected'

export type ResourceType = 'pdf' | 'link' | 'indicator'

/** ISO 8601 timestamp, e.g. "2026-11-03T15:20:00Z". */
export type Timestamp = string
/** Calendar date, e.g. "2026-11-03". */
export type DateString = string

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  status: ProfileStatus
  time_zone: string
  created_at: Timestamp
}

/** Answers keyed by question id from src/config/application.ts. */
export type ApplicationAnswers = Record<string, string>

export interface Application {
  id: string
  user_id: string
  answers: ApplicationAnswers
  /** 0–100, or null when the ranking call failed and needs a re-run. */
  ai_score: number | null
  ai_summary: string | null
  ai_strengths: string[] | null
  ai_flags: string[] | null
  decision: Decision
  decided_at: Timestamp | null
  /** Not in the blueprint's field list; the real table gets it from a default `created_at`. */
  created_at: Timestamp
}

/** Lesson body: a small typed block list (maps onto Tiptap JSON later). */
export type LessonBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; url: string; title: string }
  | { type: 'callout'; tone: 'note' | 'warning'; text: string }

export interface Module {
  id: string
  title: string
  slug: string
  order: number
  body: LessonBlock[]
  tags: string[]
  published: boolean
}

export interface Resource {
  id: string
  module_id: string | null
  title: string
  type: ResourceType
  url: string
  tags: string[]
}

export interface SessionNote {
  id: string
  student_id: string
  session_date: DateString
  takeaways: string
  homework: string
  recording_url: string | null
}

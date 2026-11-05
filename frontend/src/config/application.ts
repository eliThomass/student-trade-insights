/**
 * Application form and the mentor's scoring criteria. The apply form renders
 * from this config, and the ranking reads the criteria from it, so the mentor
 * can change questions without code changes to the form.
 *
 * PLACEHOLDER: questions are drafts until the mentor sends his own.
 */

export type QuestionKind = 'short' | 'long' | 'choice'

export interface ApplicationQuestion {
  id: string
  label: string
  help?: string
  kind: QuestionKind
  required: boolean
  /** For `choice` questions. */
  options?: string[]
  /** For `long` questions: minimum characters, to discourage one-word answers. */
  minLength?: number
}

/**
 * Personal fields. These are collected but never sent to the AI ranking
 * (the blueprint forbids scoring on name, age, location or writing style).
 */
export const personalQuestionIds = ['name', 'location'] as const

export const applicationQuestions: ApplicationQuestion[] = [
  { id: 'name', label: 'Your name', kind: 'short', required: true },
  {
    id: 'location',
    label: 'Where are you based?',
    help: 'City or time zone, so sessions can be scheduled at a sensible hour.',
    kind: 'short',
    required: true,
  },
  {
    id: 'experience',
    label: 'How long have you been trading?',
    kind: 'choice',
    required: true,
    options: ['Not yet, I am just starting', 'Under 1 year', '1–3 years', 'More than 3 years'],
  },
  {
    id: 'markets',
    label: 'What do you trade, or want to trade?',
    kind: 'choice',
    required: true,
    options: ['Futures', 'Options', 'Both', 'Not sure yet'],
  },
  {
    id: 'hours',
    label: 'How many hours a week can you put into this?',
    help: 'Include study, chart time and reviewing your trades.',
    kind: 'choice',
    required: true,
    options: ['Under 3 hours', '3–5 hours', '5–10 hours', '10–15 hours', 'More than 15 hours'],
  },
  {
    id: 'goal',
    label: 'What do you want to be able to do in 6 months?',
    help: 'Be specific. "Make money" is not a goal we can plan around.',
    kind: 'long',
    required: true,
    minLength: 60,
  },
  {
    id: 'struggle',
    label: 'What is the biggest problem in your trading right now?',
    kind: 'long',
    required: true,
    minLength: 60,
  },
  {
    id: 'feedback',
    label: 'Tell us about a time someone corrected you. What did you do with it?',
    help: 'Sports, work, school, anything.',
    kind: 'long',
    required: true,
    minLength: 60,
  },
  {
    id: 'why_now',
    label: 'Why do you want a mentor now?',
    kind: 'long',
    required: false,
  },
]

/** What the mentor looks for. The ranking scores only against these. */
export const scoringCriteria = [
  { id: 'discipline', label: 'Discipline', description: 'Follows a plan, manages risk, does the boring work.' },
  { id: 'willingness', label: 'Willingness to learn', description: 'Open to starting from fundamentals.' },
  { id: 'time', label: 'Weekly time commitment', description: 'At least 5 hours a week of focused work.' },
  { id: 'goals', label: 'Realistic goals', description: 'Process goals, not fast-money goals.' },
  { id: 'coachability', label: 'Coachability', description: 'Takes correction and acts on it.' },
] as const

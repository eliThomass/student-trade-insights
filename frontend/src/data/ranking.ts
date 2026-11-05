/**
 * MOCK of the server-side AI fit ranking (blueprint, "AI Fit Ranking").
 *
 * The real version is a server function that calls Claude with the answers
 * and the mentor's criteria. This stand-in is a deterministic heuristic so the
 * demo behaves sensibly. Rules it shares with the real one:
 * - personal fields (name, location) are stripped before scoring
 * - output is validated against the schema before it is saved
 * - it only sorts and summarizes; it never approves or rejects
 */
import { personalQuestionIds, scoringCriteria } from '@/config/application'
import type { ApplicationAnswers } from '@/types/db'

export interface RankingResult {
  score: number
  summary: string
  strengths: string[]
  flags: string[]
}

export class RankingError extends Error {}

/** Validates an unknown value (e.g. a model's JSON) against the ranking schema. */
export function parseRanking(value: unknown): RankingResult {
  if (typeof value !== 'object' || value === null) throw new RankingError('Ranking is not an object')
  const v = value as Record<string, unknown>
  const isStringArray = (x: unknown): x is string[] =>
    Array.isArray(x) && x.every((s) => typeof s === 'string')
  if (typeof v.score !== 'number' || !Number.isInteger(v.score) || v.score < 0 || v.score > 100)
    throw new RankingError('score must be an integer from 0 to 100')
  if (typeof v.summary !== 'string' || v.summary.trim() === '')
    throw new RankingError('summary must be a non-empty string')
  if (!isStringArray(v.strengths)) throw new RankingError('strengths must be a string array')
  if (!isStringArray(v.flags)) throw new RankingError('flags must be a string array')
  return { score: v.score, summary: v.summary, strengths: v.strengths, flags: v.flags }
}

/** Removes fields the model must never see. */
export function stripPersonal(answers: ApplicationAnswers): ApplicationAnswers {
  const copy = { ...answers }
  for (const id of personalQuestionIds) delete copy[id]
  return copy
}

const FAST_MONEY = /\b(rich|quit my job|fast|quick(ly)?|lambo|financial freedom|\$\s?\d|\d+k|per day|a day|double my|millionaire)\b/i
const PROCESS_WORDS = /\b(journal|plan|process|risk|consistent|consisten(cy|t)|review|patience|rules?|stop loss|discipline|backtest)\b/gi

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Deterministic heuristic that mimics the model's output shape. */
export function heuristicRank(rawAnswers: ApplicationAnswers): RankingResult {
  const a = stripPersonal(rawAnswers)
  const goal = a.goal ?? ''
  const struggle = a.struggle ?? ''
  const feedback = a.feedback ?? ''
  const hours = a.hours ?? ''

  const timeScore: Record<string, number> = {
    'Under 3 hours': 20,
    '3–5 hours': 50,
    '5–10 hours': 78,
    '10–15 hours': 92,
    'More than 15 hours': 95,
  }
  const processHits = (goal + ' ' + struggle).match(PROCESS_WORDS)?.length ?? 0
  const fastMoney = FAST_MONEY.test(goal) || FAST_MONEY.test(a.why_now ?? '')

  const criteria = {
    discipline: 45 + Math.min(processHits, 5) * 10,
    willingness: 55 + (a.experience === 'Not yet, I am just starting' || a.experience === 'Under 1 year' ? 15 : 5) + Math.min(struggle.length / 12, 25),
    time: timeScore[hours] ?? 50,
    goals: fastMoney ? 25 : 60 + Math.min(goal.length / 8, 30),
    coachability: 35 + Math.min(feedback.length / 4, 55),
  }
  const score = clamp(
    Object.values(criteria).reduce((sum, n) => sum + clamp(n), 0) / scoringCriteria.length,
  )

  const label = (id: keyof typeof criteria) => scoringCriteria.find((c) => c.id === id)!.label.toLowerCase()
  const strengths: string[] = []
  const flags: string[] = []
  if (clamp(criteria.time) >= 78) strengths.push(`${hours.toLowerCase()} a week available`)
  if (processHits >= 2) strengths.push('talks about process and risk, not just profit')
  if (feedback.length >= 160) strengths.push('gave a concrete example of acting on feedback')
  if (struggle.length >= 120) strengths.push('knows what is going wrong in their trading')
  if (hours === 'Under 3 hours') flags.push('under 3 hrs/week')
  else if (hours === '3–5 hours') flags.push('under 5 hrs/week')
  if (fastMoney) flags.push('expects fast money')
  if (feedback.length < 80) flags.push('thin answer on taking feedback')

  const weakest = (Object.keys(criteria) as (keyof typeof criteria)[]).sort(
    (x, y) => criteria[x] - criteria[y],
  )[0]
  const summary =
    score >= 75
      ? `Strong fit on the stated criteria. ${strengths.length ? `Stands out for: ${strengths.slice(0, 2).join('; ')}.` : ''} Weakest area is ${label(weakest)}.`
      : score >= 55
        ? `Mixed fit. Shows some ${label('willingness')}, but ${label(weakest)} is a concern. Worth a closer read before deciding.`
        : `Weak fit on the stated criteria, mainly ${label(weakest)}. ${flags.length ? `Flags: ${flags.join(', ')}.` : ''}`

  return parseRanking({ score, summary: summary.replace(/\s+/g, ' ').trim(), strengths, flags })
}

/**
 * Seed people and applications. All names and emails are fictional.
 * Applications store answers only; AI fields are filled by running the mock
 * ranking at seed time (see src/data/seed.ts), except the one marked unranked.
 */
import type { ApplicationAnswers, Decision, Profile, ProfileStatus } from '@/types/db'

export const MENTOR_ID = 'u-mentor'

export const mentor: Profile = {
  id: MENTOR_ID,
  name: '[Mentor Name]',
  email: 'mentor@placeholder.example',
  role: 'mentor',
  status: 'active',
  time_zone: 'America/New_York',
  created_at: '2026-09-01T14:00:00Z',
}

const student = (
  id: string,
  name: string,
  status: ProfileStatus,
  created_at: string,
  time_zone = 'America/New_York',
): Profile => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
  role: 'student',
  status,
  time_zone,
  created_at,
})

/** Current students, invited directly as `active` (they skip the application). */
export const activeStudents: Profile[] = [
  student('u-s01', 'Jordan Ellis', 'active', '2026-09-08T16:00:00Z'),
  student('u-s02', 'Priya Raman', 'active', '2026-09-08T16:05:00Z', 'America/Chicago'),
  student('u-s03', 'Marcus Webb', 'active', '2026-09-08T16:10:00Z'),
  student('u-s04', 'Sofia Alvarez', 'active', '2026-09-09T13:00:00Z', 'America/Los_Angeles'),
  student('u-s05', 'Daniel Okafor', 'active', '2026-09-09T13:20:00Z', 'Europe/London'),
  student('u-s06', 'Hannah Kim', 'active', '2026-09-10T18:00:00Z', 'America/Chicago'),
  student('u-s07', 'Tyler Brooks', 'active', '2026-09-12T15:30:00Z'),
  student('u-s08', 'Aisha Mensah', 'active', '2026-09-15T12:00:00Z'),
  student('u-s09', 'Luca Romano', 'active', '2026-09-20T17:45:00Z', 'Europe/Rome'),
  student('u-s10', 'Grace Turner', 'active', '2026-10-01T14:10:00Z', 'America/Denver'),
  student('u-s11', 'Ben Carter', 'inactive', '2026-09-08T16:20:00Z'),
  student('u-s12', 'Mei Chen', 'active', '2026-10-12T19:00:00Z', 'America/Los_Angeles'),
]

interface SeedApplication {
  profile: Profile
  decision: Decision
  submitted: string
  decided_at?: string
  /** Seeded without a score so the "Re-run ranking" fallback can be shown. */
  unranked?: boolean
  answers: ApplicationAnswers
}

const app = (
  id: string,
  name: string,
  status: ProfileStatus,
  decision: Decision,
  submitted: string,
  answers: ApplicationAnswers,
  extra: Partial<SeedApplication> = {},
): SeedApplication => ({
  profile: student(id, name, status, submitted),
  decision,
  submitted,
  answers: { name, ...answers },
  ...extra,
})

export const seedApplications: SeedApplication[] = [
  app('u-a01', 'Ryan Patel', 'applicant', 'pending', '2026-11-04T21:12:00Z', {
    location: 'Austin, TX',
    experience: '1–3 years',
    markets: 'Futures',
    hours: '10–15 hours',
    goal: 'Trade one NQ setup with a written plan, stick to a fixed risk per trade, and journal every trade so I can review my process each weekend. I want to pass a prop firm evaluation without breaking my own rules.',
    struggle: 'I overtrade after a loss. I know my setup but I take B and C setups when I am down on the day, and my risk management falls apart after 11am.',
    feedback: 'My wrestling coach told me my stance was wrong for two seasons. I filmed every practice for a month, compared it to his notes, and rebuilt it. Lost a few matches while changing it, then won the district title.',
    why_now: 'I have been self taught for two years and keep hitting the same wall.',
  }),
  app('u-a02', 'Chloe Martin', 'applicant', 'pending', '2026-11-04T15:40:00Z', {
    location: 'Toronto',
    experience: 'Under 1 year',
    markets: 'Options',
    hours: '5–10 hours',
    goal: 'Understand how options are priced well enough to pick a strategy on purpose instead of buying weekly calls. I want to have a written plan and a journal habit by spring.',
    struggle: 'I buy short dated calls because they are cheap and then watch theta eat them. I do not really understand the Greeks.',
    feedback: 'A manager at my internship rewrote my whole report. I asked her to walk me through why, took notes, and used her structure for every report after that.',
  }),
  app('u-a03', 'Jake Morrison', 'applicant', 'pending', '2026-11-03T23:05:00Z', {
    location: 'Phoenix, AZ',
    experience: 'Under 1 year',
    markets: 'Both',
    hours: '3–5 hours',
    goal: 'Make $500 a day so I can quit my job by summer.',
    struggle: 'Losing money.',
    feedback: 'Not really, I usually figure things out on my own.',
    why_now: 'I saw your results and want to get rich fast like that.',
  }),
  app('u-a04', 'Nadia Hussain', 'applicant', 'pending', '2026-11-03T18:22:00Z', {
    location: 'Chicago, IL',
    experience: 'More than 3 years',
    markets: 'Futures',
    hours: 'More than 15 hours',
    goal: 'Go from break-even to consistent. I have a plan and rules already; I need someone to review my trades and tell me where my process is leaking.',
    struggle: 'I am break-even over 400 journaled trades. My entries are fine, my exits are the problem. I cut winners early and my risk to reward ends up under 1.',
    feedback: 'In my first job a senior engineer tore apart my code review. I asked for a 30 minute call, rewrote the module with his notes, and he later became my mentor there.',
  }, { unranked: true }),
  app('u-a05', 'Owen Fitzgerald', 'applicant', 'pending', '2026-11-02T20:10:00Z', {
    location: 'Dublin',
    experience: '1–3 years',
    markets: 'Futures',
    hours: '5–10 hours',
    goal: 'Have a repeatable morning routine and one model I trust, with risk rules I do not break.',
    struggle: 'I do not have a plan. Every day I look for something different.',
    feedback: 'My football coach moved me from striker to defense. I hated it, but I did the extra drills he asked for and it became my best position.',
  }),
  app('u-a06', 'Isabella Rossi', 'applicant', 'pending', '2026-11-02T14:00:00Z', {
    location: 'Miami, FL',
    experience: 'Not yet, I am just starting',
    markets: 'Not sure yet',
    hours: '5–10 hours',
    goal: 'Learn the basics properly before risking real money. Paper trade with a plan for three months and review every trade.',
    struggle: 'I have not started yet and there is too much conflicting information on YouTube.',
    feedback: 'My piano teacher told me I rush every piece. I practiced with a metronome every day for a year.',
  }),
  app('u-a07', 'Kevin Liu', 'applicant', 'pending', '2026-11-01T22:30:00Z', {
    location: 'Seattle, WA',
    experience: '1–3 years',
    markets: 'Options',
    hours: 'Under 3 hours',
    goal: 'Double my account this year with options.',
    struggle: 'Timing entries.',
    feedback: 'I take feedback well.',
  }),
  app('u-a08', 'Samira Haddad', 'applicant', 'pending', '2026-10-31T16:45:00Z', {
    location: 'Houston, TX',
    experience: '1–3 years',
    markets: 'Both',
    hours: '10–15 hours',
    goal: 'Build a written trading plan for ES with clear risk rules, then trade it consistently for 60 sessions and review the journal every Friday.',
    struggle: 'I move my stop loss. I know I should not, I have a rule against it, and I still do it about once a week. That one trade wipes out the week.',
    feedback: 'In nursing school a clinical instructor said my charting was sloppy. I made myself a checklist from her comments and used it on every shift until it was automatic.',
  }),
  app('u-a09', 'Ethan Moore', 'waitlisted', 'waitlisted', '2026-10-28T19:00:00Z', {
    location: 'Denver, CO',
    experience: 'Under 1 year',
    markets: 'Futures',
    hours: '3–5 hours',
    goal: 'Learn a process I can follow around my work schedule and keep a journal of every trade.',
    struggle: 'I only have the first hour of the session before work and I rush entries.',
    feedback: 'At work my lead told me my emails were too long. I started writing three bullet points max and she noticed.',
  }, { decided_at: '2026-10-30T13:00:00Z' }),
  app('u-a10', 'Lily Nguyen', 'waitlisted', 'waitlisted', '2026-10-27T15:15:00Z', {
    location: 'San Jose, CA',
    experience: '1–3 years',
    markets: 'Options',
    hours: '5–10 hours',
    goal: 'Trade defined risk options strategies with a plan and know why I picked each one.',
    struggle: 'I sell premium without understanding the risk and got hurt on a gap.',
    feedback: 'A teammate told me I talk over people in meetings. I started writing my point down and waiting.',
  }, { decided_at: '2026-10-29T15:00:00Z' }),
  app('u-a11', 'Chris Dalton', 'rejected', 'rejected', '2026-10-25T23:40:00Z', {
    location: 'Las Vegas, NV',
    experience: 'More than 3 years',
    markets: 'Futures',
    hours: 'Under 3 hours',
    goal: 'Quick 10k a month, I just need the secret entry.',
    struggle: 'Nothing really, I just need signals.',
    feedback: 'n/a',
  }, { decided_at: '2026-10-27T12:00:00Z' }),
  app('u-a12', 'Zoe Bennett', 'approved', 'approved', '2026-10-30T17:20:00Z', {
    location: 'Portland, OR',
    experience: 'Under 1 year',
    markets: 'Futures',
    hours: '10–15 hours',
    goal: 'Have a written plan, one model and a journal I review weekly, and trade it on sim for 3 months before going live.',
    struggle: 'I jump between strategies every week and never give one enough trades to know if it works.',
    feedback: 'My climbing coach told me I muscle every route. I spent a season on technique only, no hard grades, and my climbing changed completely.',
  }, { decided_at: '2026-11-01T14:30:00Z' }),
  app('u-a13', 'Marcus Reid', 'applicant', 'pending', '2026-10-30T12:05:00Z', {
    location: 'Atlanta, GA',
    experience: 'Not yet, I am just starting',
    markets: 'Futures',
    hours: '5–10 hours',
    goal: 'Understand futures well enough to trade a small account with a stop on every trade.',
    struggle: 'I do not know where to start and I am worried about losing money fast.',
    feedback: 'My manager at the restaurant showed me a faster way to run the line. I was slow at first but stuck with it.',
  }),
]

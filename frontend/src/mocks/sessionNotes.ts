/** Seed session notes. PLACEHOLDER: the mentor's note template is still to come. */
import type { SessionNote } from '@/types/db'

const handwritten: SessionNote[] = [
  {
    id: 'n-001',
    student_id: 'u-s01',
    session_date: '2026-11-03',
    takeaways: 'Your entries on the opening range model are clean now: 9 of 10 journaled trades waited for the reclaim. The leak is exits. You closed 4 winners at 1R when the plan said the other side of the range.',
    homework: 'Set the target order the moment you enter, then take your hands off the keyboard. Journal whether you touched it. Read Liquidity: where the stops sit before Thursday.',
    recording_url: 'https://example.com/recordings/jordan-2026-11-03',
  },
  {
    id: 'n-002',
    student_id: 'u-s01',
    session_date: '2026-10-27',
    takeaways: 'Daily loss limit held all week. That is the win. You are still taking trades in the first 5 minutes before the range forms.',
    homework: 'No trades before 9:45 ET this week. Mark the five pre-market levels every day and post a screenshot in your journal.',
    recording_url: null,
  },
  {
    id: 'n-003',
    student_id: 'u-s01',
    session_date: '2026-10-20',
    takeaways: 'Went through position sizing from the stop. You were sizing from the account balance. Moved you to 2 MES contracts max while we rebuild.',
    homework: 'Finish Risk first and the journal module. Log 10 sim trades in R, not dollars.',
    recording_url: 'https://example.com/recordings/jordan-2026-10-20',
  },
  {
    id: 'n-004',
    student_id: 'u-s01',
    session_date: '2026-10-13',
    takeaways: 'First call. Goals: one model, a written plan, pass a prop evaluation by spring without breaking rules.',
    homework: 'Start with How this program works. Send me your current rules, even if it is three lines.',
    recording_url: null,
  },
]

const takeaways = [
  'Reviewed last week’s journal. Plan followed on most trades; the misses were all after a loss.',
  'Walked through key levels on three of your charts. You are marking too many lines. Five levels, no more.',
  'Talked through options sizing. Your spreads are fine; the naked weeklies have to go.',
  'Structure reads are improving. You called the break on Tuesday before it happened.',
  'Went over the daily loss limit. You hit it twice and kept trading once. That is the whole conversation this week.',
]
const homework = [
  'Journal every trade in R. Bring your best and worst trade next call.',
  'Mark the five pre-market levels every day and screenshot them.',
  'Re-read Defined-risk options and paper trade two debit spreads.',
  'Trade sim only until the plan is followed on 10 trades in a row.',
  'Write your rules on one card and keep it next to your screen.',
]

const others = ['u-s02', 'u-s03', 'u-s04', 'u-s05', 'u-s06', 'u-s07', 'u-s08', 'u-s09', 'u-s10', 'u-s11']
const generated: SessionNote[] = others.flatMap((student_id, i) => {
  const count = 2 + (i % 3)
  return Array.from({ length: count }, (_, k) => {
    const day = new Date(Date.UTC(2026, 10, 4 - i - k * 7))
    return {
      id: `n-${student_id}-${k}`,
      student_id,
      session_date: day.toISOString().slice(0, 10),
      takeaways: takeaways[(i + k) % takeaways.length],
      homework: homework[(i + k * 2) % homework.length],
      recording_url: k % 2 === 0 ? `https://example.com/recordings/${student_id}-${k}` : null,
    }
  })
})

// u-s11 (inactive) gets older notes only; u-s12 (newest student) has none yet.
export const seedSessionNotes: SessionNote[] = [...handwritten, ...generated]

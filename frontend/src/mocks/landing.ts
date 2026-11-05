/**
 * Landing page copy that needs the mentor's real version.
 * PLACEHOLDER: results and case studies must be replaced with real, dated
 * proof the mentor can back up (blueprint, "Content rules").
 */
import { site } from '@/config/site'

export const results = [
  { date: '2026-10-28', who: 'Jordan E.', result: 'Passed a 50K futures evaluation without breaking a rule' },
  { date: '2026-10-21', who: 'Priya R.', result: 'First green month after six months of break-even' },
  { date: '2026-10-14', who: 'Daniel O.', result: 'Followed the plan on 25 trades in a row' },
  { date: '2026-10-09', who: 'Sofia A.', result: 'Cut average loss from 1.8R to 1R' },
  { date: '2026-09-30', who: 'Marcus W.', result: 'Moved from weekly calls to defined-risk spreads' },
  { date: '2026-09-24', who: 'Hannah K.', result: 'Journaled 100 trades in her first month' },
]

export const caseStudies = [
  {
    name: 'Jordan E.',
    period: 'Sep to Nov 2026',
    before: 'Self-taught for two years. Overtraded after losses and sized from the account balance.',
    after: 'Trades one model with a fixed risk per trade. Passed a funded futures evaluation in October.',
    quote: 'The notes after each call were the difference. I always knew exactly what to work on that week.',
  },
  {
    name: 'Priya R.',
    period: 'Sep to Nov 2026',
    before: 'Bought cheap weekly calls and watched theta take them to zero.',
    after: 'Trades debit spreads on the same setups, sized so a full loss is one unit of risk.',
    quote: 'I stopped guessing which option to buy. Now I can explain every trade before I take it.',
  },
  {
    name: 'Daniel O.',
    period: 'Sep to Oct 2026',
    before: 'Knew his setup but broke his rules about once a week.',
    after: 'A daily loss limit he hasn’t broken in seven weeks, and a journal reviewed every Friday.',
    quote: 'He reads your journal. You can’t hide a bad week, which is exactly why it works.',
  },
]

export const faqs = [
  {
    q: 'Who is this for?',
    a: `People who want to trade ${site.markets} with a plan and are willing to do the work between calls. Complete beginners are welcome if they have the time. If you are looking for signals to copy, this isn’t it.`,
  },
  {
    q: 'How much does it cost?',
    a: 'PLACEHOLDER: pricing to come from the mentor. Payment is by Venmo or PayPal after you are accepted, and your portal unlocks once it is confirmed.',
  },
  {
    q: 'How much time do I need?',
    a: 'Plan for at least 5 hours a week: one module, your trades, and your journal. Applicants with less time usually get waitlisted until their schedule opens up.',
  },
  {
    q: 'Do I need a funded account?',
    a: 'No. Many students start on a simulator and only go live once they have followed their plan on a run of trades.',
  },
  {
    q: 'Do you give trade signals or alerts?',
    a: 'No. You learn to find and manage your own trades. Calls are spent reviewing your decisions, not telling you what to buy.',
  },
  {
    q: 'What happens if I’m waitlisted?',
    a: 'You keep your place, and you’ll get an email when a spot opens. You don’t need to apply again.',
  },
]

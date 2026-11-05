import { Check } from 'lucide-react'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'

const steps = [
  { title: 'Apply', text: 'About 10 minutes.' },
  { title: 'Get a decision', text: `Within ${site.responseTime}.` },
  { title: 'Start', text: 'Pay, and your portal unlocks.' },
]

/** The 3-step application sequence with the current step marked. */
export function ApplySteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const done = i < current
        const here = i === current
        return (
          <li key={s.title} className="relative flex gap-4 pb-7 last:pb-0">
            {i < steps.length - 1 && (
              <span className={cn('absolute top-9 bottom-1 left-[17px] border-l border-dashed', done ? 'border-accent' : 'border-line')} aria-hidden />
            )}
            <span
              className={cn(
                'tabular grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold',
                done ? 'border-accent bg-accent text-white' : here ? 'border-accent text-accent' : 'border-line text-slate',
              )}
            >
              {done ? <Check className="size-4" aria-label="Done" /> : i + 1}
            </span>
            <div className="pt-1.5">
              <p className={cn('font-semibold', here || done ? 'text-ink' : 'text-slate')}>
                {s.title}
                {here && <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent">You are here</span>}
              </p>
              <p className="mt-0.5 text-sm text-slate">{s.text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { PlaceholderTag } from '@/components/ui/misc'
import { site } from '@/config/site'
import { formatShortDate } from '@/lib/format'
import { results } from '@/mocks/landing'

function ResultList({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={`flex shrink-0 gap-3 pr-3 ${hidden ? 'motion-reduce:hidden' : ''}`} aria-hidden={hidden || undefined}>
      {results.map((r) => (
        <li key={r.date + r.who} className="w-72 shrink-0 rounded-lg border border-line bg-paper px-4 py-3">
          <p className="text-xs text-slate">
            {formatShortDate(r.date)}, {r.who}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{r.result}</p>
        </li>
      ))}
    </ul>
  )
}

/** Dated student results, slowly scrolling, with the disclaimer beside them. Pausable. */
export function ResultsMarquee() {
  const [paused, setPaused] = useState(false)
  return (
    <section id="results" aria-labelledby="results-title" className="scroll-mt-20 border-y border-line bg-mist py-6">
      <div className="mx-auto mb-4 flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 sm:px-6">
        <h2 id="results-title" className="flex items-center gap-2 text-sm font-semibold text-ink">
          Recent student results <PlaceholderTag>Sample results</PlaceholderTag>
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate">{site.disclaimer.short}</p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-md p-1.5 text-slate hover:bg-paper hover:text-ink motion-reduce:hidden"
            aria-label={paused ? 'Play results' : 'Pause results'}
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>
      </div>
      <div className="marquee overflow-hidden motion-reduce:overflow-x-auto" data-paused={paused}>
        <div className="marquee-track flex w-max">
          <ResultList />
          <ResultList hidden />
        </div>
      </div>
    </section>
  )
}

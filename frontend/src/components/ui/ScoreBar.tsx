import { cn } from '@/lib/cn'

/** AI fit score as a number plus a 10-segment bar. null means not ranked yet. */
export function ScoreBar({ score, className }: { score: number | null; className?: string }) {
  if (score === null) {
    return <span className={cn('text-sm font-medium text-hold', className)}>Not ranked</span>
  }
  const filled = Math.round(score / 10)
  const color = score >= 75 ? 'bg-up' : score >= 55 ? 'bg-info' : 'bg-slate/50'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label={`AI fit score ${score} out of 100`}>
      <span className="tabular w-7 text-right text-base font-bold text-ink">{score}</span>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={cn('h-3 w-1.5 rounded-[1px]', i < filled ? color : 'bg-line')} />
        ))}
      </span>
    </span>
  )
}

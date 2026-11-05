import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * One FAQ question. The answer eases open by animating the grid row from
 * 0fr to 1fr (works in every browser), and stays instant under reduced motion.
 */
export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div>
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-ink"
        >
          {question}
          <ChevronDown className={cn('size-4 shrink-0 text-slate transition-transform duration-300', open && 'rotate-180')} aria-hidden />
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="max-w-[62ch] pb-5 text-slate">{children}</div>
        </div>
      </div>
    </div>
  )
}

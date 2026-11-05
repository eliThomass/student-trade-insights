import { cn } from '@/lib/cn'

export interface TabItem<T extends string> {
  value: T
  label: string
  count?: number
}

/** Segmented filter. Renders as a tab list of buttons. */
export function Tabs<T extends string>({ items, value, onChange, label, className }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-1 overflow-x-auto border-b border-line', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
              active ? 'border-accent text-ink' : 'border-transparent text-slate hover:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn('tabular rounded-full px-1.5 text-xs', active ? 'bg-accent-soft text-accent' : 'bg-mist text-slate')}>{item.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

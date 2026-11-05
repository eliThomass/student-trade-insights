import type { ReactNode } from 'react'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'

/** Page title row with optional actions on the right. */
export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-8">
      {back && <div className="mb-3">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-[68ch] text-slate">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/** An empty screen is an invitation to act: say what goes here and how it gets filled. */
export function EmptyState({ title, children, action, className }: { title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-dashed border-line px-6 py-12 text-center', className)}>
      <p className="font-semibold text-ink">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-[52ch] text-sm text-slate">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="space-y-3 py-2" aria-label={label}>
      <div className="h-5 w-1/3 animate-pulse rounded bg-mist" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-mist" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-mist" />
    </div>
  )
}

/** Risk disclaimer placed next to any results or claims. */
export function Disclaimer({ className }: { className?: string }) {
  return <p className={cn('text-xs text-slate', className)}>{site.disclaimer.short}</p>
}

/** Visible marker for content that still needs the mentor's real version. */
export function PlaceholderTag({ children = 'Placeholder' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-dashed border-hold/50 bg-hold-soft px-1.5 py-px text-[11px] font-semibold text-hold">
      {children}
    </span>
  )
}

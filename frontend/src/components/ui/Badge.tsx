import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { decisionLabel, decisionTone, statusLabel, statusTone } from '@/lib/labels'
import { toneClass, type Tone } from '@/components/ui/tone'
import type { Decision, ProfileStatus } from '@/types/db'

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', toneClass[tone], className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProfileStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
}

export function DecisionBadge({ decision }: { decision: Decision }) {
  return <Badge tone={decisionTone[decision]}>{decisionLabel[decision]}</Badge>
}

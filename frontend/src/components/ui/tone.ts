export type Tone = 'neutral' | 'accent' | 'up' | 'down' | 'hold'

export const toneClass: Record<Tone, string> = {
  neutral: 'bg-mist text-slate',
  accent: 'bg-accent-soft text-accent',
  up: 'bg-up-soft text-up',
  down: 'bg-down-soft text-down',
  hold: 'bg-hold-soft text-hold',
}

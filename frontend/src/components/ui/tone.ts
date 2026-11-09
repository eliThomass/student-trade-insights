export type Tone = 'neutral' | 'accent' | 'up' | 'down' | 'hold' | 'info' | 'mentor'

export const toneClass: Record<Tone, string> = {
  neutral: 'bg-raised text-slate',
  accent: 'bg-accent-soft text-accent',
  up: 'bg-up-soft text-up',
  down: 'bg-down-soft text-down',
  hold: 'bg-hold-soft text-hold',
  info: 'bg-info-soft text-info',
  mentor: 'bg-mentor-soft text-mentor',
}

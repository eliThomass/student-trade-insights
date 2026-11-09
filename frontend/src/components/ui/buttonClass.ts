import { cn } from '@/lib/cn'

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'approve'
export type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-fill hover:bg-accent-strong',
  secondary: 'border border-line bg-mist text-ink hover:border-slate/40 hover:bg-raised',
  ghost: 'text-slate hover:bg-raised hover:text-ink',
  danger: 'border border-down/40 bg-transparent text-down hover:bg-down-soft',
  approve: 'bg-up text-on-fill hover:bg-accent-strong',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

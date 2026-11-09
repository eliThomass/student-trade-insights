import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const controlClass =
  'block w-full rounded-md border border-line bg-raised px-3 text-base text-ink placeholder:text-slate transition-colors hover:border-slate/40 focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 aria-invalid:border-down sm:text-sm'

interface FieldShellProps {
  label: ReactNode
  help?: ReactNode
  error?: string
  optional?: boolean
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
  className?: string
}

/** Label, help text and error message wired to one control by id. */
export function Field({ label, help, error, optional, children, className }: FieldShellProps) {
  const id = useId()
  const helpId = help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate">(optional)</span>}
      </label>
      {help && (
        <p id={helpId} className="mt-1 text-sm text-slate">
          {help}
        </p>
      )}
      <div className="mt-2">{children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}</div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-down">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, 'h-10', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, 'min-h-28 py-2 leading-relaxed', className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, 'h-10 pr-8', className)} {...rest}>
      {children}
    </select>
  )
}

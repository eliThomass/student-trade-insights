import { createContext, useContext } from 'react'

export interface ToastInput {
  title: string
  /** Second line, e.g. the simulated email that was sent. */
  detail?: string
  tone?: 'success' | 'error' | 'info'
}

export const ToastContext = createContext<((t: ToastInput) => void) | null>(null)

export function useToast() {
  const push = useContext(ToastContext)
  if (!push) throw new Error('useToast must be used inside <ToastProvider>')
  return push
}

import { useCallback, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, Mail, X } from 'lucide-react'
import { ToastContext, type ToastInput } from '@/components/ui/toast-context'

interface Toast extends ToastInput {
  id: number
}

let nextId = 1

/** Bottom-right confirmations. Each toast confirms the action by the same name as its button. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (t: ToastInput) => {
      const id = nextId++
      setToasts((ts) => [...ts.slice(-2), { ...t, id }])
      setTimeout(() => dismiss(id), t.tone === 'error' ? 8000 : 5000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6 sm:left-auto">
        {toasts.map((t) => {
          const Icon = t.tone === 'error' ? CircleAlert : t.tone === 'info' ? Info : CircleCheck
          return (
            <div key={t.id} className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-raised p-4 shadow-lg shadow-black/30">
              <Icon className={`mt-0.5 size-5 shrink-0 ${t.tone === 'error' ? 'text-down' : t.tone === 'info' ? 'text-info' : 'text-up'}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.detail && (
                  <p className="mt-0.5 flex items-start gap-1.5 text-sm text-slate">
                    {t.detail.startsWith('Email') && <Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden />}
                    <span>{t.detail}</span>
                  </p>
                )}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="-m-1 rounded p-1 text-slate hover:text-ink" aria-label="Dismiss">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

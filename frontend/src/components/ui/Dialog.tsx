import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Footer actions, right-aligned. */
  actions?: ReactNode
  width?: 'md' | 'lg'
}

/** Modal built on the native <dialog> element (focus trap and Escape for free). */
export function Dialog({ open, onClose, title, description, children, actions, width = 'md' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className={`dialog m-auto w-[calc(100%-2rem)] rounded-xl border border-line bg-mist p-0 text-ink shadow-2xl backdrop:bg-black/60 ${width === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              <h2 id="dialog-title" className="text-lg font-bold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-slate">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="-mr-2 rounded-md p-2 text-slate hover:bg-raised hover:text-ink" aria-label="Close">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {actions && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{actions}</div>}
        </div>
      )}
    </dialog>
  )
}

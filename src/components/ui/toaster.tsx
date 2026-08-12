import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface Toast {
  id: string
  title: string
  description?: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

let toastStore: ToastStore = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
}

export function setupToastStore(store: ToastStore) {
  toastStore = store
}

export function toast(toast: Omit<Toast, 'id'>) {
  toastStore.addToast(toast)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastStore.addToast = (toast) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { ...toast, id }
      setToasts((prev) => [...prev, newToast])
      
      setTimeout(() => {
        toastStore.removeToast(id)
      }, toast.duration || 5000)
    }

    toastStore.removeToast = (id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'p-4 rounded-lg border shadow-lg animate-slide-in',
            'bg-background border-border',
            {
              'border-emerald-500/50': t.type === 'success',
              'border-amber-500/50': t.type === 'warning',
              'border-red-500/50': t.type === 'error',
              'border-blue-500/50': t.type === 'info',
            }
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm">{t.title}</h4>
              {t.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => toastStore.removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}

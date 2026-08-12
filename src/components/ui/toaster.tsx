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

let toastStoreInstance: ToastStore | null = null

export function setupToastStore(store: ToastStore) {
  toastStoreInstance = store
}

export function toast(toastData: Omit<Toast, 'id'>) {
  if (toastStoreInstance) {
    toastStoreInstance.addToast(toastData)
  } else {
    console.warn('Toast store not initialized')
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    if (!toastStoreInstance) {
      toastStoreInstance = {
        toasts: [],
        addToast: (toastData) => {
          const id = Math.random().toString(36).substring(2, 9)
          const newToast = { ...toastData, id }
          setToasts((prev) => [...prev, newToast])
          
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
          }, toastData.duration || 5000)
        },
        removeToast: (id) => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        },
      }
    }
  }, [])

  if (!isMounted || toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'p-4 rounded-lg border shadow-lg animate-slide-in min-w-[300px]',
            'bg-background border-border',
            {
              'border-emerald-500/50 bg-emerald-500/10': t.type === 'success',
              'border-amber-500/50 bg-amber-500/10': t.type === 'warning',
              'border-red-500/50 bg-red-500/10': t.type === 'error',
              'border-blue-500/50 bg-blue-500/10': t.type === 'info',
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
              onClick={() => {
                if (toastStoreInstance) {
                  toastStoreInstance.removeToast(t.id)
                }
              }}
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

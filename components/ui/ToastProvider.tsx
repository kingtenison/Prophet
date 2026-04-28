'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(t => (
        <div
          key={t.id}
          className="p-4 rounded-xl shadow-elevated border animate-slide-up"
          style={{
            backgroundColor: getColor(t.type).bg,
            borderColor: getColor(t.type).border,
            color: getColor(t.type).text,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getIcon(t.type)}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t.title}</p>
              {t.message && <p className="mt-1 text-sm opacity-90">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function getColor(type: string) {
  switch (type) {
    case 'success': return { bg: '#ecfdf5', border: '#10b981', text: '#065f46' }
    case 'error': return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
    case 'warning': return { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }
    default: return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' }
  }
}

function getIcon(type: string) {
  const className = "w-5 h-5"
  switch (type) {
    case 'success': return <CheckCircle className={className} />
    case 'error': return <XCircle className={className} />
    case 'warning': return <AlertTriangle className={className} />
    default: return <Info className={className} />
  }
}

import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

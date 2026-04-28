import * as React from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastProps {
  type?: ToastType
  title: string
  message?: string
  onClose?: () => void
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
}

const styles: Record<ToastType, string> = {
  info: 'bg-[#0a0b0f] border-primary-500/40 text-[#f0f2f8]',
  success: 'bg-[#0a0b0f] border-emerald-500/40 text-[#f0f2f8]',
  warning: 'bg-[#0a0b0f] border-amber-500/40 text-[#f0f2f8]',
  error: 'bg-[#0a0b0f] border-rose-500/40 text-[#f0f2f8]'
}

const iconStyles: Record<ToastType, string> = {
  info: 'text-primary-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-rose-500'
}

export function Toast({ type = 'info', title, message, onClose }: ToastProps) {
  const Icon = icons[type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-soft animate-slide-up',
        styles[type]
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconStyles[type])} />
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
         {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

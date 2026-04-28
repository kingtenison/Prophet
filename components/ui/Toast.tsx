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
  info:    'bg-[#111] border-[#2563EB]/40 text-white',
  success: 'bg-[#111] border-emerald-500/40 text-white',
  warning: 'bg-[#111] border-amber-500/40 text-white',
  error:   'bg-[#111] border-rose-500/40 text-white'
}

const iconStyles: Record<ToastType, string> = {
  info:    'text-[#2563EB]',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error:   'text-rose-400'
}

export function Toast({ type = 'info', title, message, onClose }: ToastProps) {
  const Icon = icons[type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up',
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

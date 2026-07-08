'use client'

import { Dialog } from './Dialog'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const colors = {
    danger: { icon: 'text-rose-500', bg: 'bg-rose-500/10', btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
    warning: { icon: 'text-amber-500', bg: 'bg-amber-500/10', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
  }

  const c = colors[variant]

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`inline-flex p-3 rounded-full ${c.bg} mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${c.icon}`} />
        </div>
        <h3 className="text-lg font-display font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50">{message}</p>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} className="flex-1" disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} loading={loading} className={`flex-1 ${c.btn}`}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}

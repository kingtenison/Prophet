import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Dialog({ open, onClose, title, description, children, footer, size = 'md' }: DialogProps) {
  if (!open) return null

  const sizes = {
    sm:  'max-w-sm',
    md:  'max-w-lg',
    lg:  'max-w-2xl',
    xl:  'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog - glassmorphism */}
      <div
        className={cn(
          'relative w-full bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl',
          'animate-scale-in',
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with subtle gradient border */}
        {(title || description) && (
          <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <h2 className="text-xl font-display font-semibold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-white/50">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors rounded-lg"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

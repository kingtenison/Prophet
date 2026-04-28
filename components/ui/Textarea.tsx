import * as React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || `textarea-${generatedId.replace(/:/g, '-')}`

    return (
      <div className="w-full">
          {label && (
            <label htmlFor={inputId} className="block text-sm font-medium text-white/60 mb-1.5">
              {label}
            </label>
          )}
          <textarea
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3.5 py-2.5 text-sm border rounded-xl transition-all duration-200 resize-none',
              'bg-[#111] border-white/8 text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.25)] focus:border-[#2563EB]',
              'hover:border-white/15',
              error && 'border-rose-500 focus:ring-rose-500/25 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
        </div>
    )
  }
)
Textarea.displayName = 'Textarea'

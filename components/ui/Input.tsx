import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, containerClassName, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || `input-${generatedId.replace(/:/g, '-')}`

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-primary)] mb-2 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/40 pointer-events-none transition-colors focus-within:text-[#2563EB]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'transition-all duration-200 outline-none',
              'px-4 py-3 min-h-[48px]',
              'focus:border-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.25)] focus:ring-offset-0',
              'hover:border-white/15',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500/25 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-primary)]/40">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }

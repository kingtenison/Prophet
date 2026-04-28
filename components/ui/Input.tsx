import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#8b91a7] mb-2 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4b5162] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[#16191f] border border-white/[0.08] rounded-xl text-[0.9rem] text-[#f0f2f8]',
              'placeholder:text-[#4b5162] transition-all duration-200 outline-none',
              'px-4 py-3',
              icon && 'pl-10',
              'focus:border-[#4f8ef7] focus:ring-2 focus:ring-[#4f8ef7]/15',
              'hover:border-white/[0.14]',
              error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/15',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-[#4b5162]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

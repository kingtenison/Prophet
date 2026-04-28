import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  containerClassName?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, containerClassName, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || `select-${generatedId.replace(/:/g, '-')}`

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-white mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-3 text-sm rounded-lg border transition-all duration-200 min-h-[48px] cursor-pointer appearance-none',
            'bg-[#111] border-white/10 text-white',
            'focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.25)] focus:border-[#2563EB]',
            'hover:border-white/15',
            error && 'border-rose-500 focus:ring-rose-500/25 focus:border-rose-500',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#111]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">⚠ {error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

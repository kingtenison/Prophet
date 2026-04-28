import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || `select-${generatedId.replace(/:/g, '-')}`

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[#8b91a7] mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm border rounded-xl transition-all duration-200',
            'bg-[#111318] border-white/[0.08] text-[#f0f2f8]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'hover:border-white/[0.14]',
            error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

interface Option<T = string> {
  value: T
  label: string
  disabled?: boolean
}

interface MultiSelectProps<T extends string> {
  label?: string
  value: T[]
  options: Option<T>[]
  onChange: (value: T[]) => void
  error?: string
}

export function MultiSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  error
}: MultiSelectProps<T>) {
  const toggleOption = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#8b91a7] mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            onClick={() => toggleOption(opt.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-all duration-200',
              value.includes(opt.value)
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-[#111318] border-white/[0.08] text-[#f0f2f8] hover:border-white/[0.14]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  )
}

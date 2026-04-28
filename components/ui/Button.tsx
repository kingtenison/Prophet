import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center font-semibold transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b0f]',
      'disabled:opacity-40 disabled:pointer-events-none select-none',
    ].join(' ')

    const variants: Record<string, string> = {
      primary: [
        'bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc]',
        'text-white shadow-[0_4px_24px_rgba(79,142,247,0.30)]',
        'hover:shadow-[0_6px_32px_rgba(79,142,247,0.45)] hover:-translate-y-px',
        'active:translate-y-0 active:shadow-none',
        'focus-visible:ring-[#4f8ef7]',
      ].join(' '),

      secondary: [
        'bg-white/[0.06] border border-white/[0.10] text-[#d1d5db]',
        'hover:bg-white/[0.10] hover:border-white/[0.18] hover:text-white',
        'active:bg-white/[0.08]',
        'focus-visible:ring-white/30',
      ].join(' '),

      outline: [
        'bg-transparent border border-[#4f8ef7]/50 text-[#4f8ef7]',
        'hover:bg-[#4f8ef7]/10 hover:border-[#4f8ef7]',
        'focus-visible:ring-[#4f8ef7]',
      ].join(' '),

      ghost: [
        'bg-transparent text-[#8b91a7]',
        'hover:bg-white/[0.06] hover:text-white',
        'focus-visible:ring-white/20',
      ].join(' '),

      danger: [
        'bg-gradient-to-r from-rose-600 to-rose-500 text-white',
        'shadow-[0_4px_20px_rgba(251,113,133,0.25)]',
        'hover:shadow-[0_6px_28px_rgba(251,113,133,0.40)] hover:-translate-y-px',
        'focus-visible:ring-rose-500',
      ].join(' '),

      success: [
        'bg-gradient-to-r from-emerald-600 to-teal-500 text-white',
        'shadow-[0_4px_20px_rgba(52,211,153,0.25)]',
        'hover:shadow-[0_6px_28px_rgba(52,211,153,0.40)] hover:-translate-y-px',
        'focus-visible:ring-emerald-500',
      ].join(' '),
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-[15px] rounded-xl gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }

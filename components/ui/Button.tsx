import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center font-medium transition-all duration-300 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      'disabled:opacity-50 disabled:pointer-events-none',
      'relative overflow-hidden',
      'active:scale-[0.98]',
    ]

    const variants = {
      primary: [
        'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-black',
        'hover:from-[#60A5FA] hover:to-[#2563EB]',
        'shadow-lg shadow-[rgba(37,99,235,0.25)]',
        'hover:shadow-[0_0_40px_rgba(223,255,0,0.4)]',
        'font-display font-semibold tracking-wide',
      ].join(' '),

      secondary: [
        'bg-transparent text-white/90',
        'border border-white/10 hover:border-[#2563EB]/50',
        'hover:text-[#2563EB] hover:bg-[rgba(37,99,235,0.06)]',
        'active:bg-[rgba(37,99,235,0.1)]',
      ].join(' '),

      outline: [
        'bg-transparent text-[#2563EB]',
        'border border-[#2563EB]/40',
        'hover:border-[#2563EB] hover:bg-[rgba(37,99,235,0.12)]',
        'hover:shadow-[0_0_24px_rgba(37,99,235,0.2)]',
      ].join(' '),

      ghost: [
        'bg-transparent text-white/70',
        'hover:text-white hover:bg-white/[0.04]',
      ].join(' '),
    }

    const sizes = {
      sm: 'px-3.5 py-2 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-7 py-3.5 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Processing...
          </div>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

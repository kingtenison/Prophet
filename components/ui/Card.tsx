import * as React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hoverable?: boolean
    elevated?: boolean
    raised?: boolean  // backwards compatibility alias for elevated
    accent?: boolean
  }
>(({ className, hoverable = true, elevated = false, raised = false, accent = false, ...props }, ref) => {
  const isElevated = elevated || raised
  return (
    <div
      ref={ref}
      className={cn(
        'bg-[#111] border border-white/8 rounded-xl',
        hoverable && [
          'transition-all duration-300',
          'hover:border-[rgba(37,99,235,0.35)]',
          'hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(37,99,235,0.08)_inset]',
          'hover:-translate-y-1',
          accent && 'hover:shadow-[0_0_40px_rgba(223,255,0,0.1),0_20px_60px_rgba(0,0,0,0.5)] hover:border-[rgba(223,255,0,0.3)]'
        ],
        isElevated && 'shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
        accent && 'border-[rgba(223,255,0,0.15)]',
        className
      )}
      {...props}
    />
  )
})

Card.displayName = 'Card'

export const ResponsiveCard = ({
  children,
  className,
  padding = 'normal',
  radius = 'normal',
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  padding?: 'small' | 'normal' | 'large'
  radius?: 'small' | 'normal' | 'large'
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'accent'
}) => {
  const paddingMap = { small: 'p-3', normal: 'p-4', large: 'p-6' }
  const radiusMap = { small: 'rounded-lg', normal: 'rounded-xl', large: 'rounded-2xl' }
  const variantMap = {
    default:   'bg-[#111] border border-white/8',
    elevated:  'bg-[#111] border border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
    outline:   'bg-transparent border-2 border-[#2563EB]/30 text-white',
    ghost:     'bg-transparent border-none',
    accent:    'bg-[rgba(223,255,0,0.04)] border border-[rgba(223,255,0,0.2)] text-white',
  }

  return (
    <div
      className={cn(variantMap[variant], paddingMap[padding], radiusMap[radius], 'transition-all duration-250', className)}
      {...props}
    >
      {children}
    </div>
  )
}

ResponsiveCard.displayName = 'ResponsiveCard'

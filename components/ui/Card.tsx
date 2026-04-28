import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  raised?: boolean
  outline?: boolean
  glow?: boolean
  gradient?: boolean
}

export const Card = ({
  className,
  hoverable = false,
  raised = false,
  outline = false,
  glow = false,
  gradient = false,
  children,
  ...props
}: CardProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111318]',
      raised && 'shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
      outline && 'border-dashed border-white/[0.14]',
      hoverable && [
        'transition-all duration-250 cursor-pointer',
        'hover:border-white/[0.14] hover:-translate-y-1',
        'hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)]',
      ].join(' '),
      glow && 'hover:shadow-[0_0_40px_rgba(79,142,247,0.20)]',
      gradient && 'bg-gradient-to-br from-[#111318] to-[#0d1020]',
      className
    )}
    {...props}
  >
    {children}
  </div>
)
Card.displayName = 'Card'

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4 border-b border-white/[0.07]', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-display font-bold text-[#f0f2f8] tracking-tight', className)} {...props}>
    {children}
  </h3>
)

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-3 border-t border-white/[0.07] bg-white/[0.02]', className)} {...props}>
    {children}
  </div>
)

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
  variant?: 'default' | 'elevated' | 'outline' | 'ghost'
}) => {
  const paddingMap = { small: 'p-4', normal: 'p-6', large: 'p-8' }
  const radiusMap  = { small: 'rounded-lg', normal: 'rounded-xl', large: 'rounded-2xl' }
  const variantMap = {
    default:  'bg-[#111318] border border-white/[0.07]',
    elevated: 'bg-[#111318] border border-white/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
    outline:  'bg-transparent border-2 border-white/[0.14]',
    ghost:    'bg-transparent border-none',
  }

  return (
    <div className={cn(variantMap[variant], paddingMap[padding], radiusMap[radius], 'transition-all duration-250', className)} {...props}>
      {children}
    </div>
  )
}
ResponsiveCard.displayName = 'ResponsiveCard'
import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    secondary: 'bg-primary-50 text-primary-700 border-primary-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-lg',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'blue' | 'indigo'
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants: Record<string, string> = {
    default:   'bg-white/[0.08] text-[#d1d5db] border border-white/[0.10]',
    secondary: 'bg-white/[0.05] text-[#8b91a7] border border-white/[0.07]',
    success:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    danger:    'bg-rose-500/15 text-rose-400 border border-rose-500/20',
    warning:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    info:      'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
    blue:      'bg-[rgba(79,142,247,0.14)] text-[#4f8ef7] border border-[rgba(79,142,247,0.20)]',
    indigo:    'bg-[rgba(124,92,252,0.14)] text-[#7c5cfc] border border-[rgba(124,92,252,0.20)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

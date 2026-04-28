import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'accent' | 'lime'
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants: Record<string, string> = {
    default:   'bg-white/8 text-white/70 border border-white/10',
    secondary: 'bg-white/5 text-white/40 border border-white/5',
    success:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    danger:    'bg-rose-500/15 text-rose-400 border border-rose-500/20',
    warning:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    info:      'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
    accent:    'bg-[rgba(37,99,235,0.14)] text-[#2563EB] border border-[rgba(37,99,235,0.2)]',
    lime:      'bg-[rgba(223,255,0,0.14)] text-[#60A5FA] border border-[rgba(223,255,0,0.2)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

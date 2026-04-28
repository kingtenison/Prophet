import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'text', width, height, style, ...props }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-white/5'

  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  const customStyle: React.CSSProperties = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...style,
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={customStyle}
      {...props}
    />
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5">
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton width="30%" height={16} />
      <Skeleton width="20%" height={16} />
      <Skeleton width="15%" height={16} />
      <Skeleton width={60} height={28} />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-80 bg-[#111] rounded-2xl animate-pulse border border-white/5" />
  )
}

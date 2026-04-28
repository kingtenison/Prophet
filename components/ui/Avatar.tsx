import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }

  // Generate consistent gradient based on name
  const gradientId = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hues = [138, 144, 155, 160] // Electric blue palette
  const hue = hues[gradientId % hues.length]

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden ring-2 ring-white/10',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 75%, 65%) 0%, hsl(${hue + 20}, 70%, 50%) 100%)`
          }}
        >
          <span className="font-semibold text-white">{initials}</span>
        </div>
      )}
    </div>
  )
}

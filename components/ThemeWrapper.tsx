'use client'

import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const primaryColor = useThemeStore((state) => state.primaryColor)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply primary color to CSS variable
    document.documentElement.style.setProperty('--primary-color', primaryColor)
    
    // Generate variants
    const hex = primaryColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Set RGB as space-separated for Tailwind support
    document.documentElement.style.setProperty('--primary-color-rgb', `${r} ${g} ${b}`)
    
    // Lighten (roughly)
    const lr = Math.min(255, r + 40)
    const lg = Math.min(255, g + 40)
    const lb = Math.min(255, b + 40)
    document.documentElement.style.setProperty('--primary-color-light', `rgb(${lr}, ${lg}, ${lb})`)

    // Darken (roughly)
    const dr = Math.max(0, r - 40)
    const dg = Math.max(0, g - 40)
    const db = Math.max(0, b - 40)
    document.documentElement.style.setProperty('--primary-color-dark', `rgb(${dr}, ${dg}, ${db})`)
  }, [primaryColor])

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return <>{children}</>
}

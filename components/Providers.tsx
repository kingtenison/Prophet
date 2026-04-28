'use client'

import * as React from 'react'
import { ToastProvider } from '@/components/ui/ToastProvider'

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export default function Providers({ children, ...props }: { children: React.ReactNode, [key: string]: any }) {
  const [theme, setThemeState] = React.useState('light')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') || 'light'
    setThemeState(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.documentElement.style.colorScheme = savedTheme
  }, [])

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    document.documentElement.style.colorScheme = newTheme
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeContext.Provider>
  )
}
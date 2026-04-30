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

export default function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState('dark')

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setThemeState(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    document.documentElement.style.colorScheme = savedTheme
  }, [])

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.style.colorScheme = newTheme
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeContext.Provider>
  )
}
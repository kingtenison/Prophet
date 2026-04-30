'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { ToastProvider } from '@/components/ui/ToastProvider'

export function useTheme() {
  const { theme, setTheme } = useNextTheme()
  return { theme: theme || 'dark', setTheme: (t: string) => setTheme(t) }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="data-theme" 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </NextThemesProvider>
  )
}
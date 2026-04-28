'use client'

import * as React from 'react'
import { ThemeProvider } from 'next-themes'

export default function Providers({ children, ...props }: any) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>
}

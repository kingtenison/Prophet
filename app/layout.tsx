import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'
import ThemeWrapper from '@/components/ThemeWrapper'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'PROPHET — AI Market Intelligence Platform',
  description: 'Upload your data, run competitor audits, create beautiful charts, and share interactive dashboards — all in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.variable} ${syne.variable} font-sans antialiased`}>
        <Providers>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  )
}

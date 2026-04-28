import * as React from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-elevated border border-secondary-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-secondary-900">{title}</h1>
          {subtitle && <p className="mt-2 text-secondary-600">{subtitle}</p>}
        </div>

        {children}
      </div>

      <p className="mt-6 text-center text-xs text-secondary-500">
        By continuing, you agree to our{' '}
        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
      </p>
    </div>
  )
}

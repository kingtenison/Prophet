import * as React from 'react'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Glow orbs behind card */}
      <div className="relative">
        <div className="absolute -inset-40 -z-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#4f8ef7] opacity-[0.07] blur-[80px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#7c5cfc] opacity-[0.07] blur-[80px]" />
        </div>

        <div className="relative bg-[#111318] border border-white/[0.08] rounded-2xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo mark */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] shadow-[0_4px_24px_rgba(79,142,247,0.40)] mb-5">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[#8b91a7]">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-[#4b5162]">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#4f8ef7] hover:underline">Terms</a>
        {' '}and{' '}
        <a href="#" className="text-[#4f8ef7] hover:underline">Privacy Policy</a>.
      </p>
    </div>
  )
}

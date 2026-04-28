import * as React from 'react'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  className?: string
  subtitle?: string
}

export function AuthCard({ children, title, className, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        {/* Atmospheric glow effects */}
        <div className="absolute -inset-40 -z-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#2563EB]/15 blur-[80px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[rgba(223,255,0,0.1)] blur-[80px]" />
        </div>

        <div className="relative bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(37,99,235,0.08)_inset]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] shadow-[0_4px_24px_rgba(37,99,235,0.3)] mb-5">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-white/50 text-sm md:text-base">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-white/40">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#2563EB] hover:text-[#60A5FA] transition-colors">Terms</a>
        {' '}and{' '}
        <a href="#" className="text-[#2563EB] hover:text-[#60A5FA] transition-colors">Privacy Policy</a>.
      </p>
    </div>
  )
}

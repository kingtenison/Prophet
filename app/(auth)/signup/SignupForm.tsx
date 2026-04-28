'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthCard } from '@/components/auth/AuthCard'
import { AlertCircle, User, Mail, Lock } from 'lucide-react'

export function SignupForm({
  action,
}: {
  action: (prevState: { error?: string }, formData: FormData) => Promise<{ error?: string }>
}) {
  const [state, formAction] = useActionState(action, {})

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background with electric blue gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2563EB] opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#1D4ED8] opacity-[0.05] blur-[120px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="w-full animate-slide-up">
        <AuthCard
          title="Create your account"
          subtitle="Start your market intelligence journey"
        >
          <form action={formAction} className="space-y-4">
            <Input
              name="name"
              label="Full name"
              placeholder="Your name"
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              icon={<Lock className="w-4 h-4" />}
              required
              minLength={8}
              hint="Minimum 8 characters"
            />

            {state.error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#2563EB] hover:text-[#60A5FA] transition-colors">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  )
}

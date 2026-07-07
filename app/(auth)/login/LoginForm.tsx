'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthCard } from '@/components/auth/AuthCard'
import { AlertCircle, Mail, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm({
  action,
}: {
  action: (prevState: { error?: string }, formData: FormData) => Promise<{ error?: string }>
}) {
  const [state, formAction] = useActionState(action, {})
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    setSocialLoading(null)
  }

  const [resetEmail, setResetEmail] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleForgotPassword = async () => {
    if (!resetEmail) return
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (!error) {
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2563EB] opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#1D4ED8] opacity-[0.05] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="w-full animate-slide-up">
        <AuthCard
          title="Welcome back"
          subtitle="Sign in to your PROPHET workspace"
        >
          <form action={formAction} className="space-y-4">
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
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {state.error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 text-white/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-white/20 bg-[#111] text-[#2563EB] focus:ring-[rgba(37,99,235,0.25)] focus:ring-offset-0"
                />
                Remember me
              </label>
              <button type="button" onClick={() => setShowResetDialog(true)} className="text-[#2563EB] hover:text-[#60A5FA] transition-colors font-medium bg-transparent border-none cursor-pointer">
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#111] text-xs text-white/40">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                provider: 'google' as const,
                label: 'Google',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                ),
              },
              {
                provider: 'github' as const,
                label: 'GitHub',
                icon: (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
              },
            ].map(s => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSocialLogin(s.provider)}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm font-medium text-white/70 hover:bg-white/8 hover:border-white/20 transition-all disabled:opacity-50"
              >
                {socialLoading === s.provider ? <Loader2 className="w-4 h-4 animate-spin" /> : s.icon}
                {s.label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-white/40">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#2563EB] hover:text-[#60A5FA] transition-colors">
              Sign up free
            </Link>
          </p>
        </AuthCard>
      </div>

      {/* Forgot Password Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-display font-bold text-white mb-2">Reset Password</h3>
            <p className="text-sm text-white/50 mb-6">Enter your email and we&apos;ll send you a recovery link.</p>
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">Check your email</p>
                <p className="text-sm text-white/50 mt-1">Recovery link sent if the account exists.</p>
                <button
                  type="button"
                  onClick={() => { setShowResetDialog(false); setResetSent(false); setResetEmail('') }}
                  className="mt-6 text-sm text-[#2563EB] hover:text-[#60A5FA] transition-colors"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowResetDialog(false); setResetEmail('') }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button onClick={handleForgotPassword} className="flex-1">
                    Send Reset Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

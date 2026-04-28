'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthCard } from '@/components/auth/AuthCard'
import { AlertCircle } from 'lucide-react'

export function SignupForm({
  action,
}: {
  action: (prevState: { error?: string }, formData: FormData) => Promise<{ error?: string }>
}) {
  const [state, formAction] = useActionState(action, {})

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6 gradient-mesh">
      <AuthCard
        title="Create your account"
        subtitle="Start uploading and visualising data in minutes"
      >
        <form action={formAction} className="space-y-5">
          <Input
            name="name"
            label="Full name"
            placeholder="Your name"
            required
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            required
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            hint="Minimum 8 characters"
          />

          {state.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}

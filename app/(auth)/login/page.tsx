import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'Sign in — Power BI Lite',
}

async function signInAction(prevState: { error?: string }, formData: FormData) {
  'use server'
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Signin error:', error.message)
    return { error: error.message }
  }

  redirect('/dashboard')
  return {}
}

export default function LoginPage() {
  return <LoginForm action={signInAction} />
}

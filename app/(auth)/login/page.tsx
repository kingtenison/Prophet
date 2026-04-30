import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sign in — Power BI Lite',
}

async function signInAction(prevState: { error?: string }, formData: FormData) {
  'use server'
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Signin error:', error.message)
      return { error: error.message }
    }

    redirect('/dashboard')
  } catch (err: any) {
    // redirect() throws a NEXT_REDIRECT error — re-throw it so Next.js handles it
    if (err?.digest?.includes('NEXT_REDIRECT')) {
      throw err
    }
    console.error('Login server action crashed:', err)
    return { error: `Server error: ${err?.message || String(err)}` }
  }
  return {}
}

export default function LoginPage() {
  return <LoginForm action={signInAction} />
}

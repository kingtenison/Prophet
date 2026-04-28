import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'Create account — Power BI Lite',
}

async function signUpAction(prevState: { error?: string }, formData: FormData) {
  'use server'
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    return { error: error.message }
  }

  redirect('/dashboard')
  return {}
}

export default function SignupPage() {
  return <SignupForm action={signUpAction} />
}

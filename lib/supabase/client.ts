import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Optional: expose for external script injection
if (typeof window !== 'undefined') {
  ;(window as any).SUPABASE_CLIENT = createClient()
}

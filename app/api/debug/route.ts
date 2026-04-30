import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    
    return NextResponse.json({
      ok: true,
      hasUser: !!data?.user,
      userEmail: data?.user?.email || null,
      authError: error?.message || null,
      nodeVersion: process.version,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 5),
    }, { status: 500 })
  }
}

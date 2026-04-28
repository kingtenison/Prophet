import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function proxy(request: NextRequest) {
  const requestedUrl = request.nextUrl.clone()
  const pathname = requestedUrl.pathname

  // Public routes (auth pages, landing, public dashboard view)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
  ]

  // Public dashboard view: /dashboards/[id]/view
  const isPublicDashboard = /^\/dashboards\/[^/]+\/view$/.test(pathname)

  // Check if route is protected
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/datasets') ||
    pathname.startsWith('/charts') ||
    (pathname.startsWith('/dashboards') && !isPublicDashboard)

  // Skip auth check for public routes
  if (!isProtectedRoute || publicRoutes.includes(pathname) || isPublicDashboard) {
    return NextResponse.next()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    requestedUrl.pathname = '/login'
    return NextResponse.redirect(requestedUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}

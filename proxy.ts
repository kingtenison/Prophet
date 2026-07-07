import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const requestedUrl = request.nextUrl.clone()
  const pathname = requestedUrl.pathname

  // Public routes (auth pages, landing, public dashboard view)
  const publicRoutes = ['/', '/login', '/signup']
  const isPublicDashboard = /^\/dashboards\/[^/]+\/view$/.test(pathname)

  // Check if route is protected
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/datasets') ||
    pathname.startsWith('/charts') ||
    pathname.startsWith('/market') ||
    pathname.startsWith('/settings') ||
    (pathname.startsWith('/dashboards') && !isPublicDashboard)

  // Skip auth check for public routes if you want, but refresh is good.
  // Let's do it safely.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    console.error('Middleware auth error:', e)
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !user && !publicRoutes.includes(pathname) && !isPublicDashboard) {
    requestedUrl.pathname = '/login'
    return NextResponse.redirect(requestedUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
